import {
  JUBJUB_SUBGROUP_ORDER,
  modJubjubSubgroupOrder,
} from "@midnight-ntwrk/midnight-did-credentials/jubjub";

if (modJubjubSubgroupOrder(JUBJUB_SUBGROUP_ORDER + 1n) !== 1n) {
  throw new Error("Bundled credentials arithmetic returned an invalid result");
}

console.log("Browser-targeted ESM bundle executed successfully.");
