import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  checkUniversityDataProfilesMarkdown,
  listUniversityDataProfiles,
  renderUniversityDataProfilesMarkdown,
  updateUniversityDataProfilesMarkdown,
} from "./data-profile-registry.mjs";

const markdownModeFlags = [
  "--markdown",
  "--update-markdown",
  "--check-markdown",
];
const supportedFlags = new Set(["--json", ...markdownModeFlags]);

const run = () => {
  const args = new Set(process.argv.slice(2));
  const unknownArgs = [...args].filter((arg) => !supportedFlags.has(arg));
  const requestedMarkdownModes = markdownModeFlags.filter((flag) =>
    args.has(flag),
  );

  try {
    if (unknownArgs.length > 0) {
      throw new Error(
        `Unknown university data profile option(s): ${unknownArgs.join(", ")}`,
      );
    }
    if (args.has("--json") && requestedMarkdownModes.length > 0) {
      throw new Error("Use either --json or one markdown mode, not both.");
    }
    if (requestedMarkdownModes.length > 1) {
      throw new Error(
        `Use exactly one university data profile markdown mode, got: ${requestedMarkdownModes.join(", ")}`,
      );
    }

    const profiles = listUniversityDataProfiles();

    if (args.has("--json")) {
      console.log(JSON.stringify(profiles, null, 2));
      process.exit(0);
    }
    if (args.has("--markdown")) {
      process.stdout.write(renderUniversityDataProfilesMarkdown());
      process.exit(0);
    }
    if (args.has("--update-markdown")) {
      updateUniversityDataProfilesMarkdown();
      console.log(
        "[data-profiles] Updated packages/use-cases/university/data/data-profiles.md.",
      );
      process.exit(0);
    }
    if (args.has("--check-markdown")) {
      checkUniversityDataProfilesMarkdown();
      console.log("[data-profiles] Verified generated data profile markdown.");
      process.exit(0);
    }

    for (const profile of profiles) {
      console.log(
        [
          profile.profileId,
          `students=${profile.studentCount}`,
          `batchSize=${profile.batchSize}`,
          `companies=${profile.expectedCompanyCount}`,
          `outputDir=${profile.outputDir}`,
        ].join("\t"),
      );
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  run();
}
