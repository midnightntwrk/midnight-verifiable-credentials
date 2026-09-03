import assert from "node:assert/strict";
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
