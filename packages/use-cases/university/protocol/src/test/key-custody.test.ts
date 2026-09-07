import type { UniversityDiplomaSignerOptions } from "@midnight-ntwrk/midnight-did-credentials-university-diploma/testing";
import { describe, expect, it, vi } from "vitest";

import {
  DeterministicUniversityPartyRuntime,
  IsolatedUniversitySigningProvider,
  loadUniversityFixtureData,
  type UniversitySigningProvider,
} from "../testing.js";

type CustodyFaultPoint = "register" | "replace" | "remove";

class AfterMutationFailingSigningProvider implements UniversitySigningProvider {
  readonly delegate = new IsolatedUniversitySigningProvider();
  faultPoint: CustodyFaultPoint | undefined;

  register(partyId: string, signer: UniversityDiplomaSignerOptions): void {
    this.delegate.register(partyId, signer);
    if (this.faultPoint === "register") throw new Error("register failed");
  }

  replace(partyId: string, signer: UniversityDiplomaSignerOptions): void {
    this.delegate.replace(partyId, signer);
    if (this.faultPoint === "replace") throw new Error("replace failed");
  }

  remove(partyId: string): boolean {
    const removed = this.delegate.remove(partyId);
    if (this.faultPoint === "remove") throw new Error("remove failed");
    return removed;
  }

  resolveSigner(
    partyId: string,
    identity: Parameters<UniversitySigningProvider["resolveSigner"]>[1],
  ): UniversityDiplomaSignerOptions {
    return this.delegate.resolveSigner(partyId, identity);
  }

  describe() {
    return { providerId: "test-failing-custody", isolated: true } as const;
  }
}

const party = {
  partyId: "party-lifecycle",
  didUrl: "did:midnight:party-lifecycle",
  methodId: "#key-1",
  role: "verifier",
  source: "deterministic-fixture",
} as const;
const signer = {
  label: party.didUrl,
  methodId: party.methodId,
  secretKey: 123n,
};

describe("University isolated key custody", () => {
  it("keeps signing keys out of application party records and serialization", () => {
    const runtime = new DeterministicUniversityPartyRuntime();
    const fixture = loadUniversityFixtureData();
    const issuer = runtime.issuerProfileForUniversity(fixture.university);
    const holder = runtime.studentProfileForStudent(fixture.students[0]!);

    expect(issuer).not.toHaveProperty("secretKey");
    expect(holder).not.toHaveProperty("secretKey");
    expect(runtime.listParties()).not.toHaveProperty("0.secretKey");
    expect(JSON.stringify({ issuer, holder, parties: runtime.listParties() })).not.toMatch(
      /secretKey|privateKey|signingKey/i,
    );

    expect(runtime.signerOptionsFor(issuer)).toMatchObject({
      label: issuer.didUrl,
      methodId: issuer.methodId,
    });
    expect(runtime.signerOptionsFor(issuer).secretKey).toBeTypeOf("bigint");
  });

  it("delegates signing material access through the stable provider and propagates custody faults", () => {
    const resolveSigner = vi.fn(() => {
      throw new Error("custody unavailable");
    });
    const provider: UniversitySigningProvider = {
      register: vi.fn(),
      replace: vi.fn(),
      remove: vi.fn(() => true),
      resolveSigner,
      describe: () => ({ providerId: "test-custody", isolated: true }),
    };
    const runtime = new DeterministicUniversityPartyRuntime([], provider);
    const fixture = loadUniversityFixtureData();
    const issuer = runtime.issuerProfileForUniversity(fixture.university);

    expect(() => runtime.signerOptionsFor(issuer)).toThrow("custody unavailable");
    expect(resolveSigner).toHaveBeenCalledWith(issuer.partyId, {
      didUrl: issuer.didUrl,
      methodId: issuer.methodId,
    });
  });

  it("keeps custody synchronized across create, update, delete, and recreate", () => {
    const runtime = new DeterministicUniversityPartyRuntime();
    runtime.createParty(party, signer);

    const updated = runtime.updateParty(
      party.partyId,
      { didUrl: "did:midnight:party-lifecycle-rotated", methodId: "#key-2" },
      {
        label: "did:midnight:party-lifecycle-rotated",
        methodId: "#key-2",
        secretKey: 456n,
      },
    );
    expect(runtime.signerOptionsFor(updated)).toMatchObject({
      label: updated.didUrl,
      methodId: updated.methodId,
      secretKey: 456n,
    });

    expect(runtime.deleteParty(party.partyId)).toBe(true);
    expect(runtime.readParty(party.partyId)).toBeUndefined();
    expect(() => runtime.signerOptionsFor(updated)).toThrow(/unavailable/);
    expect(runtime.createParty(party, signer)).toEqual(party);
    expect(runtime.signerOptionsFor(party).secretKey).toBe(123n);
  });

  it("rolls party and custody state back when custody mutations fail", () => {
    const provider = new AfterMutationFailingSigningProvider();
    const runtime = new DeterministicUniversityPartyRuntime([], provider);

    provider.faultPoint = "register";
    expect(() => runtime.createParty(party, signer)).toThrow("register failed");
    expect(runtime.readParty(party.partyId)).toBeUndefined();
    expect(() => provider.resolveSigner(party.partyId, party)).toThrow(
      /unavailable/,
    );

    provider.faultPoint = undefined;
    runtime.createParty(party, signer);
    provider.faultPoint = "replace";
    expect(() =>
      runtime.updateParty(
        party.partyId,
        { methodId: "#key-2" },
        { ...signer, methodId: "#key-2", secretKey: 456n },
      ),
    ).toThrow("replace failed");
    expect(runtime.readParty(party.partyId)).toEqual(party);
    expect(runtime.signerOptionsFor(party)).toEqual(signer);

    provider.faultPoint = "remove";
    expect(() => runtime.deleteParty(party.partyId)).toThrow("remove failed");
    expect(runtime.readParty(party.partyId)).toEqual(party);
    expect(runtime.signerOptionsFor(party)).toEqual(signer);
  });

  it("never exposes registered key material from the default provider descriptor", () => {
    const provider = new IsolatedUniversitySigningProvider();
    provider.register("issuer", {
      label: "did:midnight:issuer",
      methodId: "#key-1",
      secretKey: 123n,
    });

    expect(provider.describe()).toEqual({
      providerId: "university.isolated-signing.v1",
      isolated: true,
    });
    expect(JSON.stringify(provider.describe())).not.toContain("123");
  });
});
