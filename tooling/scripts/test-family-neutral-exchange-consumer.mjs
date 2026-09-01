#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const temporaryRoot = mkdtempSync(
  path.join(os.tmpdir(), "credential-exchange-consumer-"),
);
const tarballRoot = path.join(temporaryRoot, "tarballs");
const consumerRoot = path.join(temporaryRoot, "consumer");
mkdirSync(tarballRoot, { recursive: true });
mkdirSync(path.join(consumerRoot, "src"), { recursive: true });

const run = (command, args, cwd = repoRoot) => {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: "pipe",
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed\n${result.stdout}\n${result.stderr}`,
    );
  }
  return result.stdout;
};

try {
  run("pnpm", ["--dir", "packages/core/model", "pack", "--pack-destination", tarballRoot]);
  run("pnpm", [
    "--dir",
    "packages/components/orchestration/exchange",
    "pack",
    "--pack-destination",
    tarballRoot,
  ]);

  const modelTarball = path.join(
    tarballRoot,
    "midnight-ntwrk-credential-model-0.1.0.tgz",
  );
  const exchangeTarball = path.join(
    tarballRoot,
    "midnight-ntwrk-credential-exchange-0.1.0.tgz",
  );
  writeFileSync(
    path.join(consumerRoot, "package.json"),
    `${JSON.stringify(
      {
        name: "credential-exchange-clean-consumer",
        private: true,
        type: "module",
        dependencies: {
          "@midnight-ntwrk/credential-model": `file:${modelTarball}`,
          "@midnight-ntwrk/credential-exchange": `file:${exchangeTarball}`,
        },
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    path.join(consumerRoot, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          strict: true,
          outDir: "dist",
        },
        include: ["src"],
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    path.join(consumerRoot, "src/index.ts"),
    `import { HolderAgent, IssuerAgent, VerifierAgent, type InjectedCredentialFamilyAdapter } from "@midnight-ntwrk/credential-exchange";
const bytes = new TextEncoder();
const identity = { familyId: "consumer-family", familyVersion: "1.0.0", schemaId: "consumer-family:schema", schemaVersion: "1.0.0" } as const;
const adapter: InjectedCredentialFamilyAdapter = {
  family: { id: "consumer-family", version: "1.0.0", schema: { id: "consumer-family:schema", version: "1.0.0" } },
  issuance: {
    createOffer: () => ({ ...identity, kind: "issuance-offer", mediaType: "application/example", payload: bytes.encode("offer") }),
    createRequest: () => ({ ...identity, kind: "issuance-request", mediaType: "application/example", payload: bytes.encode("request") }),
    issue: () => ({ ...identity, kind: "credential", mediaType: "application/example", payload: bytes.encode("credential") }),
    accept: (credential) => credential,
  },
  presentation: {
    createRequest: () => ({ ...identity, kind: "presentation-request", mediaType: "application/example", payload: bytes.encode("challenge") }),
    present: () => ({ ...identity, kind: "presentation", mediaType: "application/example", payload: bytes.encode("presentation") }),
  },
  verification: {
    verify: (presentation) => ({ valid: true, canonicalPresentation: presentation }),
  },
};
const issuer = new IssuerAgent(adapter);
const holder = new HolderAgent(adapter);
const verifier = new VerifierAgent(adapter);
const request = holder.createIssuanceRequest(issuer.createOffer());
holder.acceptCredential(issuer.issue(request));
const presentationRequest = verifier.createPresentationRequest();
const result = verifier.verify(holder.createPresentation(presentationRequest), presentationRequest);
if (!result.valid) throw new Error("injected clean-consumer lifecycle failed");
console.log("[credential-exchange-consumer] OK");
`,
  );

  run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], consumerRoot);
  run("pnpm", ["exec", "tsc", "-p", path.join(consumerRoot, "tsconfig.json")]);
  const output = run("node", [path.join(consumerRoot, "dist/index.js")]);
  process.stdout.write(output);
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
