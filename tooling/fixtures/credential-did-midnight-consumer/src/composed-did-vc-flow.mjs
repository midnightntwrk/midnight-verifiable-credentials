import { createHash } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  createMidnightDIDHolderBinding,
  resolveMidnightDIDMethodBinding,
  signMidnightDIDCredentialProof,
  signMidnightDIDPresentationProof,
} from "@midnight-ntwrk/credential-did-midnight";
import { defineCredentialFamily } from "@midnight-ntwrk/credential-model";

const [compiledOutput] = process.argv.slice(2);
if (compiledOutput === undefined) {
  throw new Error("Expected the compiled composed-flow output directory");
}
const { pureCircuits } = await import(
  pathToFileURL(path.join(compiledOutput, "contract/index.js")).href
);

const bytes = (value) =>
  Uint8Array.from({ length: 32 }, () => value);
const digest = (value) =>
  Uint8Array.from(createHash("sha256").update(value, "utf8").digest());
const encodeCoordinate = (value) =>
  Buffer.from(value.toString(16).padStart(64, "0"), "hex").toString(
    "base64url",
  );
const clone = (value) => structuredClone(value);
const expectReject = (id, expectedMessage, invoke) => {
  try {
    invoke();
  } catch (error) {
    if (String(error).includes(expectedMessage)) return;
    throw new Error(
      `${id} rejected for the wrong reason: ${String(error)}`,
      { cause: error },
    );
  }
  throw new Error(`${id} was accepted`);
};

const actors = {
  issuer: {
    addressByte: 0x11,
    fragment: "#issuer-key",
    secret: 3n,
    publicKey: {
      x: 8976934280167817951893283006885971257354735267084857365287645009060806900685n,
      y: 32390198301931076333580527807646215534390721674374179703346145430428257692101n,
    },
  },
  holder: {
    addressByte: 0x22,
    fragment: "#holder-key",
    secret: 5n,
    publicKey: {
      x: 46037580203438066765405229507649644425780970512522822336637661968249826130047n,
      y: 26189429486186784039799689203850934078756791903368248146476421754146336352630n,
    },
  },
  attacker: {
    addressByte: 0x33,
    fragment: "#attacker-key",
    secret: 7n,
    publicKey: {
      x: 47805549206756120863994733988949966563868680443409072344285414365387721651928n,
      y: 10883866336127360287053583923937114185802477515052223349661086820822299756070n,
    },
  },
};

const didFor = (actor) =>
  `did:midnight:testnet:${actor.addressByte.toString(16).padStart(2, "0").repeat(32)}`;
const resolverFor = (actor) => {
  const did = didFor(actor);
  const method = {
    id: actor.fragment,
    type: "JsonWebKey",
    controller: did,
    publicKeyJwk: {
      kty: "EC",
      crv: "Jubjub",
      x: encodeCoordinate(actor.publicKey.x),
      y: encodeCoordinate(actor.publicKey.y),
    },
  };
  return {
    did,
    resolver: {
      resolveResult: async () => ({
        didDocument: {
          id: did,
          verificationMethod: [method],
          assertionMethod: [actor.fragment],
          authentication: [actor.fragment],
        },
        didDocumentMetadata: { versionId: "1" },
      }),
    },
  };
};
const resolveActor = async (actor, relationship) => {
  const { did, resolver } = resolverFor(actor);
  return resolveMidnightDIDMethodBinding({
    resolver,
    did,
    verificationMethodId: actor.fragment,
    relationship,
  });
};

const issuerMethod = await resolveActor(actors.issuer, "assertionMethod");
const issuerAuthenticationMethod = await resolveActor(
  actors.issuer,
  "authentication",
);
const holderMethod = await resolveActor(actors.holder, "authentication");
const attackerMethod = await resolveActor(actors.attacker, "authentication");
const holderBinding = createMidnightDIDHolderBinding(holderMethod);
const attackerBinding = createMidnightDIDHolderBinding(attackerMethod);

const family = defineCredentialFamily({
  id: "example.synthetic-assurance",
  version: "1.0.0",
  name: "Synthetic assurance credential",
  schema: {
    id: "urn:example:synthetic-assurance",
    version: "1.0.0",
    credentialTypes: [
      "VerifiableCredential",
      "SyntheticAssuranceCredential",
    ],
    claims: [
      {
        id: "subjectId",
        path: ["credentialSubject", "id"],
        disclosure: "committed",
        required: true,
        valueType: "bytes32",
      },
      {
        id: "assuranceLevel",
        path: ["credentialSubject", "assuranceLevel"],
        disclosure: "public",
        required: true,
        valueType: "uint16",
      },
    ],
  },
});
const schema = {
  packageId: digest(`${family.id}@${family.version}`),
  schemaId: digest(`${family.schema.id}@${family.schema.version}`),
  majorVersion: 1n,
  minorVersion: 0n,
};
const claims = {
  subjectId: digest("subject:alice"),
  assuranceLevel: 3n,
};
const credential = {
  version: 1n,
  schema,
  issuerVerificationMethodRef: issuerMethod.verificationMethodRef,
  holderBinding: holderBinding.explicitBinding,
  statusBinding: {},
  issuedAt: 100n,
  hasExpiration: true,
  expiresAt: 200n,
  claims,
  claimCommitments: {},
  claimRoot: pureCircuits.syntheticClaimRoot(claims),
};
const credentialRoot = pureCircuits.credentialBodyRoot(credential);
const issuerProof = signMidnightDIDCredentialProof({
  methodBinding: issuerMethod,
  secretScalar: actors.issuer.secret,
  bodyRoot: credentialRoot,
  createdAt: 101n,
  challengeHash: digest("issuance:challenge"),
});
const presentation = {
  version: 1n,
  schema,
  credentialClaimRoot: credential.claimRoot,
  issuerVerificationMethodRef: credential.issuerVerificationMethodRef,
  holderBinding: holderBinding.explicitBinding,
  disclosed: { assuranceLevel: claims.assuranceLevel },
};
const presentationRoot = pureCircuits.presentationBodyRoot(presentation);
const presentationProof = signMidnightDIDPresentationProof({
  methodBinding: holderMethod,
  secretScalar: actors.holder.secret,
  bodyRoot: presentationRoot,
  createdAt: 102n,
  challengeHash: digest("presentation:challenge"),
});

const verify = (
  candidateCredential = credential,
  candidateIssuerProof = issuerProof,
  candidateIssuerMethod = issuerMethod,
  candidatePresentation = presentation,
  candidatePresentationProof = presentationProof,
  candidateHolderBinding = holderBinding,
) =>
  pureCircuits.assertComposedDIDBackedFlow(
    candidateCredential,
    candidateIssuerProof,
    candidateIssuerMethod,
    candidatePresentation,
    candidatePresentationProof,
    candidateHolderBinding,
  );

verify();

const changedClaims = clone(credential);
changedClaims.claims.assuranceLevel += 1n;
expectReject("claim-substitution", "Credential claim root mismatch", () =>
  verify(changedClaims),
);

const changedDisclosure = clone(presentation);
changedDisclosure.disclosed.assuranceLevel = 99n;
const changedDisclosureProof = signMidnightDIDPresentationProof({
  methodBinding: holderMethod,
  secretScalar: actors.holder.secret,
  bodyRoot: pureCircuits.presentationBodyRoot(changedDisclosure),
  createdAt: 103n,
  challengeHash: digest("presentation:changed-disclosure"),
});
expectReject(
  "disclosure-substitution",
  "Presentation assurance level does not match credential claim",
  () =>
    verify(
      credential,
      issuerProof,
      issuerMethod,
      changedDisclosure,
      changedDisclosureProof,
    ),
);

const changedBody = clone(credential);
changedBody.issuedAt += 1n;
expectReject("body-substitution", "Signature verification failed", () =>
  verify(changedBody),
);

const changedIssuer = clone(credential);
changedIssuer.issuerVerificationMethodRef = holderMethod.verificationMethodRef;
expectReject(
  "issuer-substitution",
  "Issuer proof controller address does not match issuer verification method",
  () => verify(changedIssuer),
);

const attackerPresentation = clone(presentation);
attackerPresentation.holderBinding = attackerBinding.explicitBinding;
const attackerPresentationProof = signMidnightDIDPresentationProof({
  methodBinding: attackerMethod,
  secretScalar: actors.attacker.secret,
  bodyRoot: pureCircuits.presentationBodyRoot(attackerPresentation),
  createdAt: 104n,
  challengeHash: digest("presentation:attacker"),
});
expectReject(
  "holder-substitution",
  "Presentation holder controller does not match credential holder binding",
  () =>
    verify(
      credential,
      issuerProof,
      issuerMethod,
      attackerPresentation,
      attackerPresentationProof,
      attackerBinding,
    ),
);

const changedMethod = clone(issuerMethod);
changedMethod.verificationMethodRef.methodId = bytes(0x44);
expectReject(
  "method-substitution",
  "Proof signer method does not match Midnight DID binding",
  () => verify(credential, issuerProof, changedMethod),
);

const changedKey = clone(issuerMethod);
changedKey.publicKey = holderMethod.publicKey;
expectReject("key-substitution", "Jubjub points do not match", () =>
  verify(credential, issuerProof, changedKey),
);

const changedRelationship = clone(issuerMethod);
changedRelationship.verificationRelationship =
  holderMethod.verificationRelationship;
expectReject(
  "relationship-substitution",
  "requires assertionMethod",
  () => verify(credential, issuerProof, changedRelationship),
);

const wrongContextProof = signMidnightDIDPresentationProof({
  methodBinding: issuerAuthenticationMethod,
  secretScalar: actors.issuer.secret,
  bodyRoot: credentialRoot,
  createdAt: issuerProof.createdAt,
  challengeHash: issuerProof.challengeHash,
});
expectReject("context-substitution", "Signature verification failed", () =>
  verify(credential, wrongContextProof),
);

const changedSignature = clone(issuerProof);
changedSignature.signature.s += 1n;
expectReject("signature-substitution", "Signature verification failed", () =>
  verify(credential, changedSignature),
);

console.log(
  "Composed packed-package DID-backed VC/VP flow passed all substitutions.",
);
