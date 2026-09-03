import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { packageTarballName } from "./package-tarball-name.mjs";

test("clean-consumer tarball names follow package manifest versions", () => {
  assert.equal(
    packageTarballName({
      name: "@midnight-ntwrk/credential-exchange",
      version: "2.3.4",
    }),
    "midnight-ntwrk-credential-exchange-2.3.4.tgz",
  );
});

test("the clean consumer does not pack the internal exchange workspace", () => {
  const source = readFileSync(
    new URL("./test-family-neutral-exchange-consumer.mjs", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(
    source,
    /\[\s*"--dir",\s*"packages\/components\/orchestration\/exchange",\s*"pack",/u,
  );
});
