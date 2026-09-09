import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  AuthorizationState,
  pureCircuits,
  SignerRole,
  VerificationRelationship,
} from "../../packages/core/compact/src/managed/credentials/contract/index.js";

const root = resolve(import.meta.dirname, "../..");
const readJson = (path) =>
  JSON.parse(readFileSync(resolve(root, path), "utf8"));
const fromHex = (value) => Uint8Array.from(Buffer.from(value, "hex"));
const toHex = (value) => Buffer.from(value).toString("hex");
const zeroBytes32 = () => new Uint8Array(32);
const point = (value) => ({ x: BigInt(value.x), y: BigInt(value.y) });
const subgroupOrder =
  6554484396890773809930967563523245729705921265872317281365359162392183254199n;
const mod = (value) => {
  const reduced = value % subgroupOrder;
  return reduced >= 0n ? reduced : reduced + subgroupOrder;
};

test("matches deterministic outputs from generated Compact circuits", () => {
  const fixture = readJson("conformance/vectors/compact-generated.json");
  for (const vector of fixture.vectors) {
    const circuit = pureCircuits[vector.circuit];
    assert.equal(typeof circuit, "function", vector.circuit);
    assert.equal(toHex(circuit()), vector.expectedHex, vector.id);
  }
});

test("validates positive and negative schema references in Compact", () => {
  const fixture = readJson("conformance/vectors/schema-reference.json");
  const base = fixture.positive[0];
  const makeSchemaRef = (value) => ({
    packageId: fromHex(value.packageIdHex),
    schemaId: fromHex(value.schemaIdHex),
    majorVersion: BigInt(value.majorVersion),
    minorVersion: BigInt(value.minorVersion),
  });

  for (const vector of fixture.positive) {
    assert.deepEqual(pureCircuits.assertValidSchemaRef(makeSchemaRef(vector)), []);
  }
  for (const vector of fixture.negative) {
    const candidate = { ...base, [vector.replace]: vector.value };
    assert.throws(
      () => pureCircuits.assertValidSchemaRef(makeSchemaRef(candidate)),
      (error) => String(error).includes(vector.errorIncludes),
      vector.id,
    );
  }
});

test("validates positive and negative explicit holder bindings in Compact", () => {
  const fixture = readJson("conformance/vectors/holder-binding.json");
  const base = fixture.positive[0];
  const makeBinding = (value) => ({
    holderVerificationMethodRef: {
      controllerAddress: { bytes: fromHex(value.controllerAddressHex) },
      methodId: fromHex(value.methodIdHex),
    },
  });

  for (const vector of fixture.positive) {
    assert.deepEqual(
      pureCircuits.assertValidExplicitHolderBinding(makeBinding(vector)),
      [],
    );
  }
  for (const vector of fixture.negative) {
    const candidate = { ...base, [vector.replace]: vector.value };
    const invalidBinding = makeBinding(candidate);
    assert.throws(
      () => pureCircuits.assertValidExplicitHolderBinding(invalidBinding),
      (error) => String(error).includes(vector.errorIncludes),
      vector.id,
    );
    assert.throws(
      () =>
        pureCircuits.assertMatchingExplicitHolderBindings(
          invalidBinding,
          invalidBinding,
        ),
      (error) => String(error).includes(vector.errorIncludes),
      `${vector.id}-matching`,
    );
  }
});

test("validates and binds positive and negative signer authorizations", () => {
  const vectors = readJson("conformance/vectors/signer-authorization.json");
  const fixture = vectors.fixture;
  const schema = {
    packageId: fromHex(fixture.schema.packageIdHex),
    schemaId: fromHex(fixture.schema.schemaIdHex),
    majorVersion: BigInt(fixture.schema.majorVersion),
    minorVersion: BigInt(fixture.schema.minorVersion),
  };
  const issuer = {
    verificationMethodRef: {
      controllerAddress: {
        bytes: fromHex(fixture.issuer.controllerAddressHex),
      },
      methodId: fromHex(fixture.issuer.methodIdHex),
    },
    publicKey: point(fixture.issuer.publicKey),
  };
  const verifier = {
    verificationMethodRef: {
      controllerAddress: {
        bytes: fromHex(fixture.verifier.controllerAddressHex),
      },
      methodId: fromHex(fixture.verifier.methodIdHex),
    },
    publicKey: point(fixture.verifier.publicKey),
  };
  const authoritySecretKey = BigInt(fixture.authority.secretKey);
  const authority = {
    verificationMethodRef: {
      controllerAddress: {
        bytes: fromHex(fixture.authority.controllerAddressHex),
      },
      methodId: fromHex(fixture.authority.methodIdHex),
    },
    publicKey: point(fixture.authority.publicKey),
  };
  const alternateController = {
    bytes: fromHex("dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd"),
  };
  const alternateMethod = fromHex(
    "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  );
  const alternateKey = {
    x: 23070401747513437877291923283632658528562096145511423991139305139681046329094n,
    y: 4618804908354153307723645468004365607556001212646932439019416955377127509460n,
  };
  const identityPoint = { x: 0n, y: 1n };
  const proofNonceScalar = BigInt(fixture.proofNonceScalar);
  const proofNoncePoint = point(fixture.proofNoncePoint);
  const credentialBodyRoot = fromHex(
    "abababababababababababababababababababababababababababababababab",
  );
  const issuerScope = pureCircuits.issuerScopeCommitment(schema);
  const verifierScope = fromHex(fixture.verifier.scopeCommitmentHex);
  for (const actor of [fixture.issuer, fixture.verifier, fixture.authority]) {
    assert.equal(
      createHash("sha256").update(actor.didMethodId, "utf8").digest("hex"),
      actor.methodIdHex,
      `${actor.didMethodId}-commitment`,
    );
  }

  const makeDescriptor = (role, relationship, state = "active") => {
    const signer = role === "issuer" ? issuer : verifier;
    return {
      version: 1n,
      authorizationId: fromHex(fixture.authorizationIdHex),
      decisionSequence: BigInt(fixture.decisionSequence),
      state: AuthorizationState[state],
      role: SignerRole[role],
      signerVerificationMethodRef: signer.verificationMethodRef,
      signerPublicKey: signer.publicKey,
      didStateVersion: BigInt(fixture.didStateVersion),
      verificationRelationship: VerificationRelationship[relationship],
      scopeCommitment: role === "issuer" ? issuerScope : verifierScope,
      policyCommitment: fromHex(fixture.policyCommitmentHex),
    };
  };
  const signProof = (signer, secretKey, bodyRoot, challengeCircuit) => {
    const unsigned = {
      signerVerificationMethodRef: signer.verificationMethodRef,
      createdAt: BigInt(fixture.decisionSequence),
      challengeHash: fromHex(fixture.challengeHashHex),
      publicKey: signer.publicKey,
      signature: { r: proofNoncePoint, s: 0n },
    };
    const challenge = challengeCircuit(bodyRoot, unsigned);
    return {
      ...unsigned,
      signature: {
        r: proofNoncePoint,
        s: mod(proofNonceScalar + challenge * secretKey),
      },
    };
  };
  const makeSignerProof = (role) => {
    const signer = role === "issuer" ? issuer : verifier;
    const secretKey = BigInt(fixture[role].secretKey);
    return role === "issuer"
      ? signProof(
          signer,
          secretKey,
          credentialBodyRoot,
          pureCircuits.issuanceProofChallenge,
        )
      : signProof(
          signer,
          secretKey,
          verifierScope,
          pureCircuits.verifierRequestProofChallenge,
        );
  };
  const signAuthorization = (descriptor) => {
    const unsigned = {
      signerVerificationMethodRef: authority.verificationMethodRef,
      createdAt: descriptor.decisionSequence,
      challengeHash: fromHex(fixture.challengeHashHex),
      publicKey: authority.publicKey,
      signature: { r: proofNoncePoint, s: 0n },
    };
    const challenge = pureCircuits.signerAuthorizationProofChallenge(
      pureCircuits.authorizedSignerDescriptorRoot(descriptor),
      unsigned,
    );
    return {
      ...unsigned,
      signature: {
        r: proofNoncePoint,
        s: mod(proofNonceScalar + challenge * authoritySecretKey),
      },
    };
  };

  for (const vector of vectors.positive) {
    const descriptor = makeDescriptor(
      vector.role,
      vector.relationship,
      vector.state,
    );
    const proof = makeSignerProof(vector.role);
    assert.deepEqual(
      pureCircuits.assertValidAuthorizedSignerDescriptor(descriptor),
      [],
      vector.id,
    );
    if (vector.operation === "issuer") {
      assert.deepEqual(
        pureCircuits.assertAuthorizedIssuerProof(
          credentialBodyRoot,
          schema,
          proof,
          descriptor,
        ),
        [],
        vector.id,
      );
    } else if (vector.operation === "verifier") {
      assert.deepEqual(
        pureCircuits.assertAuthorizedVerifierProof(
          verifierScope,
          proof,
          descriptor,
        ),
        [],
        vector.id,
      );
    } else {
      assert.deepEqual(
        pureCircuits.assertValidSignerAuthorizationProof(
          descriptor,
          signAuthorization(descriptor),
          authority,
        ),
        [],
        vector.id,
      );
    }
  }

  for (const vector of vectors.updates) {
    const previous = {
      ...makeDescriptor("issuer", "assertionMethod", vector.previousState),
      decisionSequence: BigInt(vector.previousSequence),
      didStateVersion: BigInt(vector.previousDidStateVersion),
    };
    const next = {
      ...makeDescriptor("issuer", "assertionMethod", vector.nextState),
      decisionSequence: BigInt(vector.nextSequence),
      didStateVersion: BigInt(vector.nextDidStateVersion),
    };
    assert.deepEqual(
      pureCircuits.assertValidSignerAuthorizationUpdate(previous, next),
      [],
      vector.id,
    );
  }

  for (const vector of vectors.negative) {
    let descriptor = makeDescriptor("issuer", "assertionMethod");
    let proof = makeSignerProof("issuer");
    let requestScope = verifierScope;
    let previousDescriptor = {
      ...descriptor,
      decisionSequence: descriptor.decisionSequence - 1n,
    };
    let nextDescriptor = descriptor;

    switch (vector.mutation) {
      case "unsupported-version":
        descriptor = { ...descriptor, version: 2n };
        break;
      case "empty-authorization-id":
        descriptor = { ...descriptor, authorizationId: zeroBytes32() };
        break;
      case "zero-decision-sequence":
        descriptor = { ...descriptor, decisionSequence: 0n };
        break;
      case "zero-did-state-version":
        descriptor = { ...descriptor, didStateVersion: 0n };
        break;
      case "empty-controller-address":
        descriptor = {
          ...descriptor,
          signerVerificationMethodRef: {
            ...descriptor.signerVerificationMethodRef,
            controllerAddress: { bytes: zeroBytes32() },
          },
        };
        break;
      case "empty-method-id":
        descriptor = {
          ...descriptor,
          signerVerificationMethodRef: {
            ...descriptor.signerVerificationMethodRef,
            methodId: zeroBytes32(),
          },
        };
        break;
      case "identity-signer-key":
        descriptor = { ...descriptor, signerPublicKey: identityPoint };
        break;
      case "empty-scope":
        descriptor = { ...descriptor, scopeCommitment: zeroBytes32() };
        break;
      case "empty-policy":
        descriptor = { ...descriptor, policyCommitment: zeroBytes32() };
        break;
      case "issuer-authentication-relationship":
        descriptor = {
          ...descriptor,
          verificationRelationship: VerificationRelationship.authentication,
        };
        break;
      case "verifier-assertion-relationship":
        descriptor = makeDescriptor("verifier", "assertionMethod");
        break;
      case "verifier-role-for-issuer":
        descriptor = makeDescriptor("verifier", "authentication");
        proof = makeSignerProof("verifier");
        break;
      case "empty-verifier-request-scope":
        descriptor = makeDescriptor("verifier", "authentication");
        proof = makeSignerProof("verifier");
        requestScope = zeroBytes32();
        break;
      case "suspended":
        descriptor = { ...descriptor, state: AuthorizationState.suspended };
        break;
      case "revoked":
        descriptor = { ...descriptor, state: AuthorizationState.revoked };
        break;
      case "proof-controller":
        proof = {
          ...proof,
          signerVerificationMethodRef: {
            ...proof.signerVerificationMethodRef,
            controllerAddress: alternateController,
          },
        };
        break;
      case "proof-method":
        proof = {
          ...proof,
          signerVerificationMethodRef: {
            ...proof.signerVerificationMethodRef,
            methodId: alternateMethod,
          },
        };
        break;
      case "proof-key":
        proof = { ...proof, publicKey: alternateKey };
        break;
      case "issuer-signature":
        proof = {
          ...proof,
          signature: { ...proof.signature, s: proof.signature.s + 1n },
        };
        break;
      case "issuer-scope":
        descriptor = { ...descriptor, scopeCommitment: verifierScope };
        break;
      case "issuer-role":
        requestScope = descriptor.scopeCommitment;
        break;
      case "verifier-scope":
        descriptor = makeDescriptor("verifier", "authentication");
        proof = makeSignerProof("verifier");
        requestScope = issuerScope;
        break;
      case "verifier-signature":
        descriptor = makeDescriptor("verifier", "authentication");
        proof = makeSignerProof("verifier");
        proof = {
          ...proof,
          signature: { ...proof.signature, s: proof.signature.s + 1n },
        };
        break;
      case "update-id":
        nextDescriptor = {
          ...nextDescriptor,
          authorizationId: alternateMethod,
        };
        break;
      case "update-sequence":
        nextDescriptor = {
          ...nextDescriptor,
          decisionSequence: previousDescriptor.decisionSequence,
        };
        break;
      case "update-did-version":
        previousDescriptor = { ...previousDescriptor, didStateVersion: 10n };
        nextDescriptor = { ...nextDescriptor, didStateVersion: 9n };
        break;
      case "proof-sequence":
      case "authority-controller":
      case "authority-method":
      case "authority-key":
      case "identity-authority-key":
      case "authority-challenge":
      case "signed-policy":
        break;
      default:
        assert.fail(`unknown signer authorization mutation ${vector.mutation}`);
    }

    const invoke = () => {
      if (vector.operation === "validate") {
        return pureCircuits.assertValidAuthorizedSignerDescriptor(descriptor);
      }
      if (vector.operation === "issuer") {
        return pureCircuits.assertAuthorizedIssuerProof(
          credentialBodyRoot,
          schema,
          proof,
          descriptor,
        );
      }
      if (vector.operation === "verifier") {
        return pureCircuits.assertAuthorizedVerifierProof(
          requestScope,
          proof,
          descriptor,
        );
      }
      if (vector.operation === "update") {
        return pureCircuits.assertValidSignerAuthorizationUpdate(
          previousDescriptor,
          nextDescriptor,
        );
      }

      let authorizationProof = signAuthorization(descriptor);
      if (vector.mutation === "proof-sequence") {
        authorizationProof = {
          ...authorizationProof,
          createdAt: authorizationProof.createdAt + 1n,
        };
      } else if (vector.mutation === "authority-controller") {
        authorizationProof = {
          ...authorizationProof,
          signerVerificationMethodRef: {
            ...authorizationProof.signerVerificationMethodRef,
            controllerAddress: alternateController,
          },
        };
      } else if (vector.mutation === "authority-method") {
        authorizationProof = {
          ...authorizationProof,
          signerVerificationMethodRef: {
            ...authorizationProof.signerVerificationMethodRef,
            methodId: alternateMethod,
          },
        };
      } else if (vector.mutation === "authority-key") {
        authorizationProof = { ...authorizationProof, publicKey: alternateKey };
      } else if (vector.mutation === "identity-authority-key") {
        return pureCircuits.assertValidSignerAuthorizationProof(
          descriptor,
          authorizationProof,
          { ...authority, publicKey: identityPoint },
        );
      } else if (vector.mutation === "authority-challenge") {
        authorizationProof = {
          ...authorizationProof,
          challengeHash: alternateMethod,
        };
      } else if (vector.mutation === "signed-policy") {
        authorizationProof = signAuthorization(descriptor);
        descriptor = {
          ...descriptor,
          policyCommitment: fromHex(
            "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          ),
        };
      }
      return pureCircuits.assertValidSignerAuthorizationProof(
        descriptor,
        authorizationProof,
        authority,
      );
    };

    assert.throws(
      invoke,
      (error) => String(error).includes(vector.errorIncludes),
      vector.id,
    );
  }
});
