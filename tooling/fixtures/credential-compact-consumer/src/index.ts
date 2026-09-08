import {
  JUBJUB_SUBGROUP_ORDER,
  pureCircuits,
} from "@midnight-ntwrk/credential-compact";

export const evidence = {
  subgroupOrder: JUBJUB_SUBGROUP_ORDER,
  hasCredentialCircuits: typeof pureCircuits === "object",
};
