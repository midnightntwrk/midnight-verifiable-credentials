import { describe, expect, it } from "vitest";

import {
  type AggregateDecisionProfileV1,
  assertAggregateDecisionProfileV1,
} from "../index.js";

const profile = (): AggregateDecisionProfileV1 => ({
  formatVersion: 1,
  id: "aggregate.fixture",
  version: "1.0.0",
  childCount: { minimum: 2, maximum: 3 },
  requiredAuthority: "ledger-local",
  sameHolder: {
    mode: "required",
    capability: { id: "same-holder-v1", version: "1.0.0" },
  },
  mutation: {
    location: "ledger",
    nullifier: "contract-derived",
    consumption: "atomic",
  },
});

describe("aggregate decision profile v1", () => {
  it("accepts the bounded pair/triple authoritative profile", () => {
    expect(assertAggregateDecisionProfileV1(profile())).toBeUndefined();
  });

  it.each([
    ["unbounded child minimum", (value: AggregateDecisionProfileV1) => {
      (value.childCount as { minimum: number }).minimum = 1;
    }],
    ["unbounded child maximum", (value: AggregateDecisionProfileV1) => {
      (value.childCount as { maximum: number }).maximum = 4;
    }],
    ["mixed authority", (value: AggregateDecisionProfileV1) => {
      (value as { requiredAuthority: string }).requiredAuthority = "mixed";
    }],
    ["required same-holder without capability", (value: AggregateDecisionProfileV1) => {
      (value as { sameHolder: unknown }).sameHolder = { mode: "required" };
    }],
    ["non-atomic ledger mutation", (value: AggregateDecisionProfileV1) => {
      (value.mutation as { consumption: string }).consumption = "separate";
    }],
    ["local mutation", (value: AggregateDecisionProfileV1) => {
      (value.mutation as { location: string }).location = "none";
    }],
  ] as const)("rejects %s", (_label, mutate) => {
    const candidate = profile();
    mutate(candidate);
    expect(() => assertAggregateDecisionProfileV1(candidate)).toThrow();
  });

  it("accepts an authoritative read-only ledger profile", () => {
    const candidate: AggregateDecisionProfileV1 = {
      ...profile(),
      mutation: {
        location: "none",
        nullifier: "none",
        consumption: "none",
      },
    };
    expect(assertAggregateDecisionProfileV1(candidate)).toBeUndefined();
  });

  it("accepts an explicit no-same-holder, no-side-effect local-process profile", () => {
    const candidate: AggregateDecisionProfileV1 = {
      ...profile(),
      requiredAuthority: "local-process",
      sameHolder: { mode: "not-required" },
      mutation: {
        location: "none",
        nullifier: "none",
        consumption: "none",
      },
    };
    expect(assertAggregateDecisionProfileV1(candidate)).toBeUndefined();
  });
});
