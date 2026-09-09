import { pureCircuits } from "@midnight-ntwrk/credential-compact";

export const evidence = {
  hasCredentialCircuits: typeof pureCircuits === "object",
};
