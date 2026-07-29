import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const integrationDir = join(packageRoot, "src", "test", "integration");

const testFiles = readdirSync(integrationDir)
  .filter((name) => name.endsWith(".integration.test.ts"))
  .sort();

if (testFiles.length === 0) {
  console.error("[integration] No protocol integration tests found");
  process.exit(1);
}

for (const testFile of testFiles) {
  const relativePath = join("src", "test", "integration", testFile);
  console.error(`[integration] ${relativePath}`);

  const result = spawnSync(
    process.platform === "win32" ? "pnpm.cmd" : "pnpm",
    [
      "exec",
      "vitest",
      "run",
      "--config",
      "vitest.integration.config.ts",
      relativePath,
    ],
    {
      cwd: packageRoot,
      stdio: "inherit",
      env: process.env,
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
