import { buildUniversityDataArtifactsForProfile, checkUniversityDataArtifacts, listUniversityDataProfiles, resolveUniversityDataProfile } from "./data-profile-registry.mjs";

let mismatches = 0;
for (const profile of listUniversityDataProfiles()) {
  const resolved = resolveUniversityDataProfile(profile.profileId);
  const artifacts = buildUniversityDataArtifactsForProfile(resolved);
  mismatches += checkUniversityDataArtifacts(resolved.absoluteOutputDir, artifacts);
}

if (mismatches > 0) {
  process.exit(1);
}
