import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertArtifactBytes,
  assertBuildManifestIntegrity,
} from "@midnight-ntwrk/credential-proofs";
import {
  classifyArtifact,
  createBuildManifestFromOutput,
  filterUnexpectedChanges,
} from "./write-build-manifest.mjs";

const packageJson = {
  name: "@midnight-ntwrk/test-compact",
  midnight: {
    compactCompilerVersion: "0.30.0",
    compactRuntimeVersion: "0.15.0",
    buildManifest: {
      productId: "test-product",
      schemaId: "test:schema:v1",
      contractId: "test-contract",
      circuits: [
        {
          id: "test-circuit",
          version: "1.0.0",
          parameters: { entrypoint: "test.compact" },
          artifactPathPrefix: "managed/test/",
        },
      ],
    },
  },
};

const createOutput = async () => {
  const root = await mkdtemp(join(tmpdir(), "compact-build-manifest-"));
  await mkdir(join(root, "managed/test"), { recursive: true });
  await mkdir(join(root, "metadata"), { recursive: true });
  await writeFile(join(root, "managed/test/index.js"), "export const test = true;\n");
  await writeFile(join(root, "managed/test/index.d.ts"), "export declare const test: boolean;\n");
  await writeFile(join(root, "metadata/build.json"), '{"version":1}\n');
  return { root, expectedPaths: ["managed/test/index.d.ts", "managed/test/index.js", "metadata/build.json"] };
};

describe("write-build-manifest", () => {
  it("creates a deterministic artifact-level manifest and verifies it", async () => {
    const first = await createOutput();
    const second = await createOutput();
    const options = {
      packageJson,
      sourceCommit: "0123456789abcdef0123456789abcdef01234567",
      compilerVersion: "0.30.0",
      runtimeVersion: "0.15.0",
      expectedPaths: first.expectedPaths,
      enforceCleanTree: false,
    };
    const firstManifest = await createBuildManifestFromOutput({ outputRoot: first.root, ...options });
    const secondManifest = await createBuildManifestFromOutput({ outputRoot: second.root, ...options });
    expect(firstManifest).toEqual(secondManifest);
    await assertBuildManifestIntegrity(firstManifest);
    const artifact = firstManifest.artifacts.find(({ path }) => path === "managed/test/index.js");
    expect(artifact).toBeDefined();
    await assertArtifactBytes(artifact, new Uint8Array(await readFile(join(first.root, artifact.path))));
  });

  it("fails closed for missing and extra generated outputs", async () => {
    const { root, expectedPaths } = await createOutput();
    await expect(createBuildManifestFromOutput({
      outputRoot: root,
      packageJson,
      sourceCommit: "0123456789abcdef0123456789abcdef01234567",
      compilerVersion: "0.30.0",
      runtimeVersion: "0.15.0",
      expectedPaths: expectedPaths.filter((path) => path !== "metadata/build.json"),
      enforceCleanTree: false,
    })).rejects.toThrow(/extra: metadata\/build\.json/u);

    const missing = await createOutput();
    await writeFile(join(missing.root, "metadata/build.json"), "");
    await expect(createBuildManifestFromOutput({
      outputRoot: missing.root,
      packageJson,
      sourceCommit: "0123456789abcdef0123456789abcdef01234567",
      compilerVersion: "0.30.0",
      runtimeVersion: "0.15.0",
      expectedPaths: ["managed/test/index.js", "managed/test/index.d.ts", "metadata/missing.json"],
      enforceCleanTree: false,
    })).rejects.toThrow(/missing: metadata\/missing\.json/u);
  });

  it("classifies canonical key and ZKIR artifacts", () => {
    expect(classifyArtifact("keys/credentials.prover")).toEqual(["prover-key", "application/octet-stream"]);
    expect(classifyArtifact("keys/credentials.verifier")).toEqual(["verifier-key", "application/octet-stream"]);
    expect(classifyArtifact("zkir/credentials.bzkir")).toEqual(["circuit", "application/octet-stream"]);
  });

  it("keeps clean-tree attestation true only through the test-only bypass", async () => {
    const { root, expectedPaths } = await createOutput();
    const manifest = await createBuildManifestFromOutput({
      outputRoot: root,
      packageJson,
      sourceCommit: "0123456789abcdef0123456789abcdef01234567",
      compilerVersion: "0.30.0",
      runtimeVersion: "0.15.0",
      expectedPaths,
      enforceCleanTree: false,
    });
    expect(manifest.cleanTree).toBe(true);
  });

  it("ignores generated source outputs but rejects other untracked files", () => {
    expect(filterUnexpectedChanges("?? packages/core/compact/src/managed/generated.js", "packages/core/compact/src/managed")).toEqual([]);
    expect(filterUnexpectedChanges("?? packages/core/compact/src/managed/generated.js\n?? unrelated.tmp", "packages/core/compact/src/managed")).toEqual(["?? unrelated.tmp"]);
    expect(filterUnexpectedChanges(" M packages/core/compact/src/managed/generated.js", "packages/core/compact/src/managed")).toEqual([" M packages/core/compact/src/managed/generated.js"]);
  });

  it("rejects absent required build inputs", async () => {
    const { root, expectedPaths } = await createOutput();
    await expect(createBuildManifestFromOutput({
      outputRoot: root,
      packageJson: { name: packageJson.name, midnight: {} },
      sourceCommit: "0123456789abcdef0123456789abcdef01234567",
      compilerVersion: "0.30.0",
      runtimeVersion: "0.15.0",
      expectedPaths,
      enforceCleanTree: false,
    })).rejects.toThrow(/buildManifest configuration is required/u);
  });
});
