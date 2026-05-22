import {
  buildUniversityDataArtifactsForProfile,
  checkUniversityDataArtifacts,
  checkUniversityDataProfileLifecycle,
  checkUniversityDataProfilesMarkdown,
  listUniversityDataProfiles,
  readUniversityDataArtifacts,
  resolveUniversityDataProfile,
} from "./data-profile-registry.mjs";

let mismatches = 0;
for (const profile of listUniversityDataProfiles()) {
  const resolved = resolveUniversityDataProfile(profile.profileId);
  const artifacts = buildUniversityDataArtifactsForProfile(resolved);
  mismatches += checkUniversityDataArtifacts(
    resolved.absoluteOutputDir,
    artifacts,
  );
  const committedArtifacts = readUniversityDataArtifacts(
    resolved.absoluteOutputDir,
  );
  mismatches += checkUniversityDataProfileLifecycle(
    resolved,
    committedArtifacts,
  );
}
try {
  checkUniversityDataProfilesMarkdown();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  mismatches += 1;
}

if (mismatches > 0) {
  process.exit(1);
}
