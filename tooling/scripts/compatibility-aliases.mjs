// Compatibility alias catalog shared by cleanup, alias materialization, and DID
// integration reporting. Official aliases are kept as symlinks; removable
// shells are historical generated roots that clean-artifacts may classify.
export const officialCompatibilityAliases = Object.freeze([
  {
    alias: "midnight-did-credentials",
    target: "packages/core/primitives/credentials",
  },
  {
    alias: "midnight-did-credentials-same-holder",
    target: "packages/core/capabilities/same-holder",
  },
  {
    alias: "midnight-did-credentials-birth",
    target: "packages/prototypes/credential-families/birth",
  },
  {
    alias: "midnight-did-credentials-birth-secret",
    target: "packages/prototypes/credential-families/birth-secret",
  },
  {
    alias: "midnight-did-credentials-hello-family",
    target: "packages/prototypes/credential-families/hello-family",
  },
  {
    alias: "midnight-did-credentials-dummy-claims",
    target: "packages/prototypes/credential-families/dummy-claims",
  },
  {
    alias: "midnight-did-credentials-university-diploma",
    target: "packages/prototypes/credential-families/university-diploma",
  },
  {
    alias: "midnight-did-credentials-iso-registry",
    target: "packages/core/primitives/iso-registry",
  },
  {
    alias: "midnight-did-credentials-status-registry",
    target: "packages/registry/status-registry",
  },
  {
    alias: "midnight-did-credentials-openid",
    target: "packages/protocols/openid",
  },
  {
    alias: "midnight-did-credentials-protocol",
    target: "packages/components/orchestration/protocol",
  },
  {
    alias: "midnight-did-credentials-demo-contract",
    target: "packages/use-cases/age-gate/contract",
  },
]);

export const officialCompatibilityAliasNames = new Set(
  officialCompatibilityAliases.map(({ alias }) => alias),
);

export const historicalPackageRootShells = Object.freeze([
  "credentials",
  "credentials-birth",
  "credentials-birth-secret",
  "credentials-demo-contract",
  "credentials-iso-registry",
  "credentials-offchain-did",
  "credentials-openid",
  "credentials-protocol",
  "credentials-same-holder",
  "credentials-status-registry",
  "vc-bdd-scenarios",
]);

export const postMovePackageAreaShells = Object.freeze([
  // These names are intentionally generic; clean-artifacts removes them only
  // when the directory contains disposable generated output.
  // Treat this list as historical post-move residue only. New package roots
  // belong under packages/ instead of top-level directories with these names.
  "components",
  "core",
  "infrastructure",
  // Keep `libs` here even after removal so a regression is cleaned up again.
  "libs",
  "protocols",
  "prototypes",
  "registry",
  "use-cases",
]);

export const removableTopLevelShells = Object.freeze([
  ...historicalPackageRootShells,
  ...postMovePackageAreaShells,
]);
