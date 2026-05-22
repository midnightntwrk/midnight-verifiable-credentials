import process from "node:process";

import {
  checkUniversityDataProfilesMarkdown,
  listUniversityDataProfiles,
  renderUniversityDataProfilesMarkdown,
  updateUniversityDataProfilesMarkdown,
} from "./data-profile-registry.mjs";

const supportedFlags = new Set([
  "--json",
  "--markdown",
  "--update-markdown",
  "--check-markdown",
]);
const args = new Set(process.argv.slice(2));
const unknownArgs = [...args].filter((arg) => !supportedFlags.has(arg));
const markdownModeFlags = [
  "--markdown",
  "--update-markdown",
  "--check-markdown",
];
const requestedMarkdownModes = markdownModeFlags.filter((flag) =>
  args.has(flag),
);

if (unknownArgs.length > 0) {
  console.error(
    `Unknown university data profile option(s): ${unknownArgs.join(", ")}`,
  );
  process.exit(1);
}
if (args.has("--json") && requestedMarkdownModes.length > 0) {
  console.error("Use either --json or one markdown mode, not both.");
  process.exit(1);
}
if (requestedMarkdownModes.length > 1) {
  console.error(
    `Use exactly one university data profile markdown mode, got: ${requestedMarkdownModes.join(", ")}`,
  );
  process.exit(1);
}

try {
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
