import { readFile } from "node:fs/promises";
import path from "node:path";

export const findRepoRoot = async (startDir) => {
  let currentDir = startDir;

  while (true) {
    const packageJsonPath = path.join(currentDir, "package.json");
    try {
      const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
      if (Array.isArray(packageJson.workspaces)) {
        return currentDir;
      }
    } catch (error) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") {
        throw error;
      }
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      throw new Error("Could not locate the Midnight VC repository root");
    }
    currentDir = parentDir;
  }
};
