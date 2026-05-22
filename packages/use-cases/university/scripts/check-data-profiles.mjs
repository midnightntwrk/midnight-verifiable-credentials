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
  try {
    const committedArtifacts = readUniversityDataArtifacts(
      resolved.absoluteOutputDir,
    );
    mismatches += checkUniversityDataProfileLifecycle(
      resolved,
      committedArtifacts,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[${resolved.profileId}] ${message}`);
    mismatches += 1;
  }
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
