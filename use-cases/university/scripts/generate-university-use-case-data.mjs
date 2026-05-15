import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  buildUniversityDataArtifactsForProfile,
  checkUniversityDataArtifacts,
  resolveUniversityDataProfile,
  writeUniversityDataArtifacts,
} from "./data-profile-registry.mjs";

const universityRootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const readStringArg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  if (index === -1 || index === process.argv.length - 1) {
    return fallback;
  }
  return process.argv[index + 1];
};

const readIntegerArg = (name) => {
  const index = process.argv.indexOf(name);
  if (index === -1 || index === process.argv.length - 1) {
    return undefined;
  }
  const raw = process.argv[index + 1];
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid value for ${name}: ${raw}`);
  }
  return parsed;
};

const checkMode = process.argv.includes("--check");
const profileId = readStringArg("--profile", "readable-10");
const resolvedProfile = resolveUniversityDataProfile(profileId);
const studentCount = readIntegerArg("--student-count") ?? resolvedProfile.studentCount;
const batchSize = readIntegerArg("--batch-size") ?? resolvedProfile.batchSize;
const hasExplicitOutputDir = process.argv.includes("--output-dir");
const outputDirArg = hasExplicitOutputDir
  ? readStringArg("--output-dir", resolvedProfile.outputDir)
  : resolvedProfile.absoluteOutputDir;
const dataDir = path.isAbsolute(outputDirArg)
  ? outputDirArg
  : path.resolve(universityRootDir, outputDirArg);

const artifacts = buildUniversityDataArtifactsForProfile({
  ...resolvedProfile,
  studentCount,
  batchSize,
});

if (checkMode) {
  const mismatches = checkUniversityDataArtifacts(dataDir, artifacts);
  if (mismatches > 0) {
    process.exit(1);
  }
} else {
  writeUniversityDataArtifacts(dataDir, artifacts);
}
