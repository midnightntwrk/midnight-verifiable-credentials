import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "../..");
const scaffold = path.join(root, "tooling/scripts/scaffold-vc-family.mjs");
const corePackageSource = path.join(root, "packages/core/primitives/credentials/src");
const corePackageRelativeInclude =
  "../node_modules/@midnight-ntwrk/midnight-did-credentials/dist/credentials";
const compactAvailable =
  spawnSync("compact", ["compile", "--version"], { stdio: "ignore" }).status === 0;
const claimModes = ["public", "commitment", "mixed"];
const holderModes = ["explicit", "hidden"];

const installCorePackageFixture = (target) => {
  const packagePath = path.join(
    target,
    "node_modules/@midnight-ntwrk/midnight-did-credentials",
  );
  mkdirSync(packagePath, { recursive: true });
  cpSync(corePackageSource, path.join(packagePath, "dist"), { recursive: true });
};

test("scaffold help and documentation advertise exactly the compiled mode matrix", () => {
  const help = execFileSync(process.execPath, [scaffold, "--help"], {
    cwd: root,
    encoding: "utf8",
  });
  const template = readFileSync(
    path.join(root, "docs/templates/family-scaffold-template.md"),
    "utf8",
  );
  const claimModeList = claimModes.join("|");
  const holderModeList = holderModes.join("|");

  assert.match(help, new RegExp(`--claim-mode ${claimModeList}`, "u"));
  assert.match(help, new RegExp(`--holder ${holderModeList}`, "u"));
  assert.equal(
    template.includes(`Supported claim modes: \`--claim-mode ${claimModeList}\`.`),
    true,
  );
  assert.equal(
    template.includes(`Supported holder modes: \`--holder ${holderModeList}\`.`),
    true,
  );
});

test("scaffolded Compact packages use the artifact-first helper and omit its manifest from dist", () => {
  const target = path.join(root, "packages/prototypes/credential-families", `scaffold-${randomUUID().slice(0, 8)}`);
  const relativeTarget = path.relative(root, target);
  try {
    execFileSync(process.execPath, [scaffold, "--slug", "artifact-test", "--out", relativeTarget], { cwd: root, encoding: "utf8" });
    const packageJson = JSON.parse(readFileSync(path.join(target, "package.json"), "utf8"));

    assert.match(
      packageJson.scripts.compact,
      /node \.\.\/\.\.\/\.\.\/\.\.\/tooling\/scripts\/ensure-compact-artifacts\.mjs --manifest src\/managed\/\.compact-artifact\.json --source-root src --output src\/managed\/artifact-test-credential --recipe-input scripts\/strip-managed-sourcemaps\.mjs -- sh -c "compact compile[\s\S]*strip-managed-sourcemaps\.mjs"/u,
    );
    assert.match(packageJson.scripts.build, /rm -f \.\/dist\/managed\/\.compact-artifact\.json/u);
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
});

test(
  "every supported claim and holder mode compiles from a clean consumer package surface",
  { skip: !compactAvailable },
  () => {
    const stagingRoot = path.join(
      root,
      "tmp",
      `scaffold-staging-${randomUUID().slice(0, 8)}`,
    );
    const consumerRoot = mkdtempSync(path.join(tmpdir(), "vc-scaffold-consumer-"));

    assert.equal(path.relative(root, consumerRoot).startsWith(".."), true);

    try {
      for (const claimMode of claimModes) {
        for (const holder of holderModes) {
          const slug = `test-${claimMode.slice(0, 3)}-${holder.slice(0, 3)}`;
          const stagingTarget = path.join(stagingRoot, slug);
          const target = path.join(consumerRoot, slug);
          execFileSync(
            process.execPath,
            [
              scaffold,
              "--slug",
              slug,
              "--out",
              path.relative(root, stagingTarget),
              "--claim-mode",
              claimMode,
              "--holder",
              holder,
            ],
            { cwd: root, encoding: "utf8" },
          );
          cpSync(stagingTarget, target, { recursive: true });
          installCorePackageFixture(target);

          const compactRoot = path.join("src", `${slug}-credential.compact`);
          const compactSource = readFileSync(path.join(target, compactRoot), "utf8");
          assert.match(
            compactSource,
            new RegExp(`include "${corePackageRelativeInclude}";`, "u"),
          );
          assert.doesNotMatch(
            compactSource,
            /packages\/core\/primitives\/credentials|\.\.\/\.\.\/core\/primitives/u,
          );

          execFileSync(
            "compact",
            ["compile", compactRoot, path.join("src", "managed", slug)],
            { cwd: target, encoding: "utf8", stdio: "pipe" },
          );
        }
      }

      const negativeSlug = "test-pub-exp";
      const negativeTarget = path.join(consumerRoot, negativeSlug);
      rmSync(path.join(negativeTarget, "node_modules"), {
        recursive: true,
        force: true,
      });
      assert.throws(() =>
        execFileSync(
          "compact",
          [
            "compile",
            path.join("src", `${negativeSlug}-credential.compact`),
            path.join("src", "managed-negative", negativeSlug),
          ],
          { cwd: negativeTarget, encoding: "utf8", stdio: "pipe" },
        ),
      );
    } finally {
      rmSync(stagingRoot, { recursive: true, force: true });
      rmSync(consumerRoot, { recursive: true, force: true });
    }
  },
);
