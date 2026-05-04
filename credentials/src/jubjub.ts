export const JUBJUB_SUBGROUP_ORDER =
  6554484396890773809930967563523245729705921265872317281365359162392183254199n;

export const modJubjubSubgroupOrder = (value: bigint): bigint => {
  const reduced = value % JUBJUB_SUBGROUP_ORDER;
  return reduced >= 0n ? reduced : reduced + JUBJUB_SUBGROUP_ORDER;
};
