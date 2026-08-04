import { JUBJUB_SUBGROUP_ORDER } from "@midnight-ntwrk/credential-compact";
import { pureCircuits } from "@midnight-ntwrk/credential-compact/contract";

export const evidence = {
  subgroupOrder: JUBJUB_SUBGROUP_ORDER,
  hasCredentialCircuits: typeof pureCircuits === "object",
};
