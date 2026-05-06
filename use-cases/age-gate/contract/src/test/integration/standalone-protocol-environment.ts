// Re-export from the shared standalone-environment package.
// This file exists for backward compatibility with existing imports.
export {
  containerRuntimeAvailable,
  type ProtocolDidProfile,
  provisionDidProfile,
  StandaloneEnvironment as StandaloneProtocolEnvironment,
  verifierChallengeForProfile,
} from "@midnight-ntwrk/midnight-did-standalone-environment";
