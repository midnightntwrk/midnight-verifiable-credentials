import process from "node:process";

import { listUniversityDataProfiles } from "./data-profile-registry.mjs";

const profiles = listUniversityDataProfiles();

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(profiles, null, 2));
  process.exit(0);
}

for (const profile of profiles) {
  console.log(`${profile.profileId}\tstudents=${profile.studentCount}\tbatchSize=${profile.batchSize}\toutputDir=${profile.outputDir}`);
}
