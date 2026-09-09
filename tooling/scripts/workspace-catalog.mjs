#!/usr/bin/env node
import { stderr, stdout } from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const supportedPackages = [
  {
    path: "packages/core/model",
    consumerFixture: "tooling/fixtures/credential-model-consumer",
    consumerChecks: ["node", "typescript", "browser"],
  },
  {
    path: "packages/core/compact",
    consumerFixture: "tooling/fixtures/credential-compact-consumer",
    consumerChecks: ["node", "typescript"],
  },
];

export const supportedWorkspacePaths = supportedPackages.map(
  ({ path: packagePath }) => packagePath,
);

const printLines = (lines) => stdout.write(`${lines.join("\n")}\n`);
const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  const [command] = process.argv.slice(2);
  try {
    switch (command) {
      case "--packable-paths":
      case "--publishable-paths":
        printLines(supportedWorkspacePaths);
        break;
      default:
        stderr.write(
          "Usage: workspace-catalog.mjs --packable-paths | --publishable-paths\n",
        );
        process.exit(command === undefined ? 0 : 1);
    }
  } catch (error) {
    stderr.write(`[workspace-catalog] ${error.message}\n`);
    process.exit(1);
  }
}
