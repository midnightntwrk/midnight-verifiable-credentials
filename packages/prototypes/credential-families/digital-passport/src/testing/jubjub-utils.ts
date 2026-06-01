/**
 * Jubjub curve utilities shared between fixture builders and tests.
 *
 * @internal
 */

/** Order of the Jubjub subgroup used for scalar reduction. */
export const JUBJUB_SUBGROUP_ORDER =
  6554484396890773809930967563523245729705921265872317281365359162392183254199n;

/** Reduce a bigint modulo {@link JUBJUB_SUBGROUP_ORDER}. */
export const mod = (value: bigint): bigint => {
  const reduced = value % JUBJUB_SUBGROUP_ORDER;
  return reduced >= 0n ? reduced : reduced + JUBJUB_SUBGROUP_ORDER;
};
