import {
  JUBJUB_SUBGROUP_ORDER,
  modJubjubSubgroupOrder,
  type SchemaRef,
} from "@midnight-ntwrk/midnight-did-credentials";
import { Contract } from "@midnight-ntwrk/midnight-did-credentials/contract";

declare const schema: SchemaRef;

const reduced: bigint = modJubjubSubgroupOrder(JUBJUB_SUBGROUP_ORDER + 1n);
const contractConstructor: typeof Contract = Contract;

export { contractConstructor, reduced, schema };
