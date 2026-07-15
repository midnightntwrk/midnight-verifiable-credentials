import {
  JUBJUB_SUBGROUP_ORDER,
  modJubjubSubgroupOrder,
} from "@midnight-ntwrk/midnight-did-credentials/jubjub";

export const reduced: bigint = modJubjubSubgroupOrder(
  JUBJUB_SUBGROUP_ORDER + 1n,
);
