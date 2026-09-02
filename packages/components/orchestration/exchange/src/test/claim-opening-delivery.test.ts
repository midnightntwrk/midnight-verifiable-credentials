import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  type CanonicalMessage,
  type CredentialIssuanceResult,
  HolderAgent,
  type HolderClaimOpeningDelivery,
  type HolderCredentialRecord,
  type HolderCredentialStore,
  type InjectedCredentialFamilyAdapter,
  IssuerAgent,
  VerifierAgent,
} from "../index.js";

const text = new TextEncoder();
const decode = new TextDecoder();
const recipientId = "did:example:alice#holder";

const claims = {
  legalName: { value: "Alice Example", opening: "opening:legal-name" },
  birthDate: { value: "2000-01-01", opening: "opening:birth-date" },
  country: { value: "CA", opening: "opening:country" },
} as const;

type ClaimId = keyof typeof claims;
type OpeningPayload = Partial<
  Record<ClaimId, { readonly value: string; readonly opening: string }>
>;

const commit = (value: string, opening: string): string =>
  createHash("sha256").update(`${value}\u0000${opening}`).digest("hex");

const commitments = Object.fromEntries(
  Object.entries(claims).map(([id, claim]) => [id, commit(claim.value, claim.opening)]),
) as Record<ClaimId, string>;

const message = <TKind extends CanonicalMessage["kind"]>(
  kind: TKind,
  payload: string,
): CanonicalMessage<TKind> => ({
  familyId: "fixture.committed-claims",
  familyVersion: "1.0.0",
  schemaId: "fixture.committed-claims:schema",
  schemaVersion: "1.0.0",
  kind,
  mediaType: "application/vnd.midnight.fixture+bytes",
  payload: text.encode(payload),
});

const parseOpeningPayload = (payload: Uint8Array): OpeningPayload =>
  JSON.parse(decode.decode(payload)) as OpeningPayload;

const adapter = (): InjectedCredentialFamilyAdapter => ({
  family: {
    id: "fixture.committed-claims",
    version: "1.0.0",
    schema: { id: "fixture.committed-claims:schema", version: "1.0.0" },
  },
  issuance: {
    createOffer: () => message("issuance-offer", "offer"),
    createRequest: (_offer, input) =>
      message("issuance-request", String(input ?? "request")),
    issue: () => message("credential", JSON.stringify({ commitments })),
    accept: (credential) => credential,
    claimOpenings: {
      createDelivery: ({ holder }) => ({
        formatVersion: 1,
        recipientId: holder.recipientId,
        claimIds: holder.claimIds,
        payload: text.encode(
          JSON.stringify(
            Object.fromEntries(
              holder.claimIds.map((claimId) => [
                claimId,
                claims[claimId as ClaimId],
              ]),
            ),
          ),
        ),
      }),
      validateDelivery: ({ credential, delivery }) => {
        const credentialBody = JSON.parse(decode.decode(credential.payload)) as {
          readonly commitments: Record<string, string>;
        };
        const delivered = parseOpeningPayload(delivery.payload);
        expect(Object.keys(delivered)).toEqual([...delivery.claimIds]);
        for (const claimId of delivery.claimIds) {
          const opening = delivered[claimId as ClaimId];
          if (!opening) throw new Error(`Missing opening for ${claimId}`);
          if (
            commit(opening.value, opening.opening) !==
            credentialBody.commitments[claimId]
          ) {
            throw new Error(`Claim opening does not match commitment for ${claimId}`);
          }
        }
      },
      select: ({ delivery, claimIds }) => {
        const delivered = parseOpeningPayload(delivery.payload);
        return {
          claimIds,
          payload: text.encode(
            JSON.stringify(
              Object.fromEntries(
                claimIds.map((claimId) => [claimId, delivered[claimId as ClaimId]]),
              ),
            ),
          ),
        };
      },
    },
  },
  presentation: {
    createRequest: () => message("presentation-request", "challenge"),
    present: (credential, request) =>
      message(
        "presentation",
        `${decode.decode(credential.payload)}|${decode.decode(request.payload)}`,
      ),
  },
  verification: {
    verify: (presentation) => ({
      valid: decode.decode(presentation.payload).endsWith("|challenge"),
      canonicalPresentation: presentation,
    }),
  },
});

const cloneRecord = (record: HolderCredentialRecord): HolderCredentialRecord => ({
  ...record,
  issuanceRequest: {
    ...record.issuanceRequest,
    payload: record.issuanceRequest.payload.slice(),
  },
  credential: { ...record.credential, payload: record.credential.payload.slice() },
  claimOpenings: {
    ...record.claimOpenings,
    claimIds: [...record.claimOpenings.claimIds],
    payload: record.claimOpenings.payload.slice(),
  },
});

class MemoryCredentialStore implements HolderCredentialStore {
  record?: HolderCredentialRecord;
  saveCalls = 0;

  load(): HolderCredentialRecord | undefined {
    return this.record === undefined ? undefined : cloneRecord(this.record);
  }

  save(record: HolderCredentialRecord): void {
    this.saveCalls += 1;
    this.record = cloneRecord(record);
  }
}

const issueFor = (
  holder: HolderAgent,
  issuer: IssuerAgent,
  claimIds: readonly string[],
): {
  readonly request: ReturnType<HolderAgent["createIssuanceRequestWithClaimOpenings"]>;
  readonly result: CredentialIssuanceResult;
} => {
  const request = holder.createIssuanceRequestWithClaimOpenings(
    issuer.createOffer(),
    claimIds,
  );
  return { request, result: issuer.issueWithClaimOpenings(request) };
};

const changeDelivery = (
  result: CredentialIssuanceResult,
  delivery: Partial<HolderClaimOpeningDelivery>,
): CredentialIssuanceResult => ({
  ...result,
  claimOpenings: { ...result.claimOpenings, ...delivery },
});

describe("holder-only claim-opening delivery", () => {
  it("delivers only requested openings and preserves canonical credential bytes", () => {
    const family = adapter();
    const store = new MemoryCredentialStore();
    const holder = new HolderAgent(family, { recipientId, credentialStore: store });
    const issuer = new IssuerAgent(family);
    const { request, result } = issueFor(holder, issuer, ["legalName", "birthDate"]);
    const originalCredentialBytes = result.credential.payload.slice();

    const receipt = holder.acceptIssuanceResult(result, request);
    const recovered = parseOpeningPayload(
      holder.recoverClaimOpenings(["birthDate"]).payload,
    );

    expect(parseOpeningPayload(result.claimOpenings.payload)).toEqual({
      legalName: claims.legalName,
      birthDate: claims.birthDate,
    });
    expect(recovered).toEqual({ birthDate: claims.birthDate });
    expect(result.credential.payload).toEqual(originalCredentialBytes);
    expect(store.record?.credential.payload).toEqual(originalCredentialBytes);
    expect(receipt).toMatchInlineSnapshot(`
      {
        "deliveredClaimCount": 2,
        "familyId": "fixture.committed-claims",
        "familyVersion": "1.0.0",
        "formatVersion": 1,
        "schemaId": "fixture.committed-claims:schema",
        "schemaVersion": "1.0.0",
      }
    `);
    expect(JSON.stringify(receipt)).not.toContain("Alice Example");
    expect(JSON.stringify(receipt)).not.toContain("opening:");
    expect(JSON.stringify(result.claimOpenings)).not.toContain("opening:country");
  });

  it("rejects an issuance result correlated to a different canonical request", () => {
    const family = adapter();
    const store = new MemoryCredentialStore();
    const holder = new HolderAgent(family, { recipientId, credentialStore: store });
    const issuer = new IssuerAgent(family);
    const firstRequest = holder.createIssuanceRequestWithClaimOpenings(
      issuer.createOffer(),
      ["legalName"],
      "request:first",
    );
    const secondRequest = holder.createIssuanceRequestWithClaimOpenings(
      issuer.createOffer(),
      ["legalName"],
      "request:second",
    );
    const firstResult = issuer.issueWithClaimOpenings(firstRequest);

    expect(() => holder.acceptIssuanceResult(firstResult, secondRequest)).toThrow(
      /canonical issuance request/i,
    );
    expect(store.saveCalls).toBe(0);
  });

  it("isolates canonical bytes from mutating family callbacks", () => {
    const family = adapter();
    const createDelivery = family.issuance.claimOpenings!.createDelivery;
    const mutatingFamily: InjectedCredentialFamilyAdapter = {
      ...family,
      issuance: {
        ...family.issuance,
        claimOpenings: {
          ...family.issuance.claimOpenings!,
          createDelivery: (input) => {
            input.credential.payload.fill(0);
            return createDelivery(input);
          },
        },
      },
    };
    const holder = new HolderAgent(mutatingFamily, { recipientId });
    const issuer = new IssuerAgent(mutatingFamily);
    const { result } = issueFor(holder, issuer, ["legalName"]);

    expect(decode.decode(result.credential.payload)).toBe(
      JSON.stringify({ commitments }),
    );
  });

  it("rejects acceptance callbacks that mutate canonical credential bytes", () => {
    const family = adapter();
    const store = new MemoryCredentialStore();
    const mutatingFamily: InjectedCredentialFamilyAdapter = {
      ...family,
      issuance: {
        ...family.issuance,
        accept: (credential) => {
          credential.payload.fill(0);
          return credential;
        },
      },
    };
    const holder = new HolderAgent(mutatingFamily, {
      recipientId,
      credentialStore: store,
    });
    const issuer = new IssuerAgent(mutatingFamily);
    const { request, result } = issueFor(holder, issuer, ["legalName"]);

    expect(() => holder.acceptIssuanceResult(result, request)).toThrow(
      /preserve canonical credential bytes/i,
    );
    expect(store.saveCalls).toBe(0);
  });

  it("fails closed for altered, missing, or wrong-recipient deliveries before storage", () => {
    const mutations: readonly [string, (result: CredentialIssuanceResult) => CredentialIssuanceResult][] = [
      [
        "altered opening",
        (result) => {
          const payload = parseOpeningPayload(result.claimOpenings.payload);
          return changeDelivery(result, {
            payload: text.encode(
              JSON.stringify({
                ...payload,
                legalName: { ...payload.legalName!, opening: "attacker-opening" },
              }),
            ),
          });
        },
      ],
      [
        "missing opening",
        (result) =>
          changeDelivery(result, {
            payload: text.encode(JSON.stringify({ legalName: claims.legalName })),
          }),
      ],
      [
        "missing delivery",
        (result) => ({ ...result, claimOpenings: undefined }) as unknown as CredentialIssuanceResult,
      ],
      [
        "wrong recipient",
        (result) => changeDelivery(result, { recipientId: "did:example:mallory" }),
      ],
    ];

    for (const [label, mutate] of mutations) {
      const family = adapter();
      const store = new MemoryCredentialStore();
      const holder = new HolderAgent(family, { recipientId, credentialStore: store });
      const issuer = new IssuerAgent(family);
      const { request, result } = issueFor(holder, issuer, ["legalName", "birthDate"]);

      expect(() => holder.acceptIssuanceResult(mutate(result), request), label).toThrow();
      expect(store.saveCalls, label).toBe(0);
    }
  });

  it("rejects a delivery that omits or adds a requested claim identifier", () => {
    const family = adapter();
    const store = new MemoryCredentialStore();
    const holder = new HolderAgent(family, { recipientId, credentialStore: store });
    const issuer = new IssuerAgent(family);
    const { request, result } = issueFor(holder, issuer, ["legalName", "birthDate"]);

    expect(() =>
      holder.acceptIssuanceResult(
        changeDelivery(result, { claimIds: ["legalName"] }),
        request,
      ),
    ).toThrow(/requested claim/i);
    expect(() =>
      holder.acceptIssuanceResult(
        changeDelivery(result, {
          claimIds: ["legalName", "birthDate", "country"],
        }),
        request,
      ),
    ).toThrow(/requested claim/i);
    expect(store.saveCalls).toBe(0);
  });

  it("revalidates persisted openings after restart and presents no holder-only material", () => {
    const family = adapter();
    const store = new MemoryCredentialStore();
    const firstHolder = new HolderAgent(family, {
      recipientId,
      credentialStore: store,
    });
    const issuer = new IssuerAgent(family);
    const { request, result } = issueFor(firstHolder, issuer, [
      "legalName",
      "birthDate",
    ]);
    firstHolder.acceptIssuanceResult(result, request);

    const restartedHolder = new HolderAgent(family, {
      recipientId,
      credentialStore: store,
    });
    const restoreReceipt = restartedHolder.restoreCredential();
    const recovered = parseOpeningPayload(
      restartedHolder.recoverClaimOpenings(["legalName"]).payload,
    );
    const verifier = new VerifierAgent(family);
    const presentationRequest = verifier.createPresentationRequest();
    const presentation = restartedHolder.createPresentation(presentationRequest);

    expect(recovered).toEqual({ legalName: claims.legalName });
    expect(verifier.verify(presentation, presentationRequest).valid).toBe(true);
    expect(JSON.stringify(restoreReceipt)).not.toContain("opening:");
    const presentationText = decode.decode(presentation.payload);
    const [credentialPayload, challenge] = presentationText.split("|");
    const publicPayload = JSON.parse(credentialPayload!) as Record<string, unknown>;
    expect({
      challenge,
      credentialKeys: Object.keys(publicPayload),
      containsOpening: presentationText.includes("opening:"),
      containsRawName: presentationText.includes("Alice Example"),
    }).toMatchInlineSnapshot(`
      {
        "challenge": "challenge",
        "containsOpening": false,
        "containsRawName": false,
        "credentialKeys": [
          "commitments",
        ],
      }
    `);
    expect(presentationText).not.toContain("Alice Example");
    expect(decode.decode(presentation.payload)).not.toContain("opening:");
  });

  it("clears stale opening material when legacy acceptance replaces the credential", () => {
    const family = adapter();
    const holder = new HolderAgent(family, { recipientId });
    const issuer = new IssuerAgent(family);
    const { request, result } = issueFor(holder, issuer, ["legalName"]);
    holder.acceptIssuanceResult(result, request);

    holder.acceptCredential(message("credential", "replacement-credential"));

    expect(() => holder.recoverClaimOpenings(["legalName"])).toThrow(
      /no validated claim openings/i,
    );
  });

  it("fails closed when persisted holder material is altered before restart", () => {
    const family = adapter();
    const store = new MemoryCredentialStore();
    const holder = new HolderAgent(family, { recipientId, credentialStore: store });
    const issuer = new IssuerAgent(family);
    const { request, result } = issueFor(holder, issuer, ["legalName"]);
    holder.acceptIssuanceResult(result, request);
    store.record = {
      ...store.record!,
      claimOpenings: {
        ...store.record!.claimOpenings,
        recipientId: "did:example:mallory",
      },
    };

    const restartedHolder = new HolderAgent(family, {
      recipientId,
      credentialStore: store,
    });
    expect(() => restartedHolder.restoreCredential()).toThrow(/recipient/i);
  });
});
