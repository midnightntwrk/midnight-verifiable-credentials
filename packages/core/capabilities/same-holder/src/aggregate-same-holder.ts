import {
  type AggregateChildSetV1,
  aggregateDecisionDomainV1,
  type AggregateSameHolderBindingV1,
  asBytes32,
  createAggregateSameHolderBindingV1,
  hashAggregateChildSetV1,
  hashAggregateSameHolderBindingV1,
  zeroBytes32V1,
} from "@midnight-ntwrk/midnight-did-credentials";

import {
  type BlindedSecretHolderBinding,
  pureCircuits,
} from "./managed/same-holder/contract/index.js";

const same = (left: Uint8Array, right: Uint8Array): boolean =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

/**
 * Simulator/runtime bridge for a bounded private same-holder proof statement.
 * Production aggregate authority still requires an injected proof-receipt
 * verifier. The returned receipt digest commits the exact blinded bindings and
 * aggregate child set; private witness material is never copied into it.
 */
export const proveBlindedAggregateSameHolderBindingV1 = (input: {
  readonly verifierContractDigest: Uint8Array;
  readonly verifierChallengeHash: Uint8Array;
  readonly holderSecret: Uint8Array;
  readonly bindings: readonly BlindedSecretHolderBinding[];
  readonly openings: readonly Uint8Array[];
  readonly blindingFactors: readonly Uint8Array[];
  readonly childSetDigest: Uint8Array;
  readonly childDigests: readonly Uint8Array[];
}): AggregateSameHolderBindingV1 => {
  const count = input.bindings.length;
  if (
    (count !== 2 && count !== 3) ||
    input.openings.length !== count ||
    input.blindingFactors.length !== count ||
    input.childDigests.length !== count
  ) {
    throw new TypeError(
      "Aggregate same-holder proof requires aligned pair/triple inputs",
    );
  }

  if (count === 2) {
    pureCircuits.assertSameBlindedSecretHolderBindingWitnesses(
      input.bindings[0],
      input.bindings[1],
      input.verifierChallengeHash,
      input.holderSecret,
      input.openings[0],
      input.blindingFactors[0],
      input.openings[1],
      input.blindingFactors[1],
    );
  } else {
    pureCircuits.assertSameBlindedSecretHolderBindingWitnesses3(
      input.bindings[0],
      input.bindings[1],
      input.bindings[2],
      input.verifierChallengeHash,
      input.holderSecret,
      input.openings[0],
      input.blindingFactors[0],
      input.openings[1],
      input.blindingFactors[1],
      input.openings[2],
      input.blindingFactors[2],
    );
  }

  const holderBindingDigests = input.bindings.map((binding) =>
    pureCircuits.blindedSecretHolderBindingDigestV1(binding),
  );
  const childSet: AggregateChildSetV1 = {
    domain: aggregateDecisionDomainV1("childSet"),
    version: 1n,
    childCount: BigInt(count),
    firstChildDigest: asBytes32(input.childDigests[0]),
    secondChildDigest: asBytes32(input.childDigests[1]),
    thirdChildDigest:
      count === 3 ? asBytes32(input.childDigests[2]) : zeroBytes32V1(),
  };
  const childSetDigest = hashAggregateChildSetV1(childSet);
  if (!same(childSetDigest, input.childSetDigest)) {
    throw new TypeError(
      "Aggregate same-holder proof receipt must bind the exact aggregate child set",
    );
  }

  const provisional = createAggregateSameHolderBindingV1({
    verifierContractDigest: input.verifierContractDigest,
    challengeDigest: input.verifierChallengeHash,
    childSetDigest,
    holderBindingDigests,
    proofDigest: zeroBytes32V1(),
  });
  return createAggregateSameHolderBindingV1({
    verifierContractDigest: input.verifierContractDigest,
    challengeDigest: input.verifierChallengeHash,
    childSetDigest,
    holderBindingDigests,
    // The digest commits the exact public statement proven by this Compact
    // call. A deployment verifier authenticates the corresponding proof
    // receipt before aggregate authority is admitted.
    proofDigest: hashAggregateSameHolderBindingV1(provisional),
  });
};
