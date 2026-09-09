import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

import {
  AuthorizationState,
  pureCircuits,
  SignerRole,
  VerificationRelationship,
} from "../../packages/core/compact/src/managed/credentials/contract/index.js";

const root = resolve(import.meta.dirname, "../..");
const readJson = (path) =>
  JSON.parse(readFileSync(resolve(root, path), "utf8"));
const loadCompactConformance = async (fixtureName) => {
  const cacheRoot = resolve(root, "packages/core/compact/.cache");
  const packageJson = readJson("packages/core/compact/package.json");
  mkdirSync(cacheRoot, { recursive: true });
  const output = mkdtempSync(resolve(cacheRoot, `${fixtureName}-`));
  execFileSync(
    "compact",
    [
      "compile",
      `+${packageJson.midnight.compactCompilerVersion}`,
      "--skip-zk",
      "--compact-path",
      resolve(root, "packages/core/compact/src"),
      resolve(root, `tooling/fixtures/${fixtureName}.compact`),
      output,
    ],
    { stdio: "pipe" },
  );
  const compiled = await import(
    pathToFileURL(resolve(output, "contract/index.js")).href
  );
  return { output, pureCircuits: compiled.pureCircuits };
};
const loadSignerAuthorizationConformance = () =>
  loadCompactConformance("signer-authorization-conformance");
const loadCoreBindingsConformance = () =>
  loadCompactConformance("core-bindings-conformance");
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
  const base = fixture.fixture;
  const alternate = fromHex(
    "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  );
  const makeBinding = (value) => ({
    holderVerificationMethodRef: {
      controllerAddress: { bytes: fromHex(value.controllerAddressHex) },
      methodId: fromHex(value.methodIdHex),
    },
  });
  const baseBinding = makeBinding(base);
  const makeProof = (signerVerificationMethodRef) => ({
    signerVerificationMethodRef,
    createdAt: 0n,
    challengeHash: zeroBytes32(),
    publicKey: { x: 0n, y: 1n },
    signature: { r: { x: 0n, y: 1n }, s: 0n },
  });
  const invoke = (operation, credentialBinding, presentationBinding, proof) => {
    if (operation === "validate") {
      return pureCircuits.assertValidExplicitHolderBinding(credentialBinding);
    }
    if (operation === "match-bindings") {
      return pureCircuits.assertMatchingExplicitHolderBindings(
        credentialBinding,
        presentationBinding,
      );
    }
    if (operation === "match-proof") {
      return pureCircuits.assertProofMatchesExplicitHolderBinding(
        credentialBinding,
        proof,
      );
    }
    assert.fail(`unknown holder-binding operation ${operation}`);
  };

  for (const vector of fixture.positive) {
    assert.deepEqual(
      invoke(
        vector.operation,
        baseBinding,
        baseBinding,
        makeProof(baseBinding.holderVerificationMethodRef),
      ),
      [],
      vector.id,
    );
  }
  for (const vector of fixture.negative) {
    let credentialBinding = baseBinding;
    let presentationBinding = baseBinding;
    let proof = makeProof(baseBinding.holderVerificationMethodRef);
    if (vector.mutation === "empty-controller") {
      credentialBinding = makeBinding({ ...base, controllerAddressHex: "00".repeat(32) });
      if (vector.operation === "match-bindings") {
        presentationBinding = credentialBinding;
      } else if (vector.operation === "match-proof") {
        proof = makeProof(credentialBinding.holderVerificationMethodRef);
      }
    } else if (vector.mutation === "empty-method") {
      credentialBinding = makeBinding({ ...base, methodIdHex: "00".repeat(32) });
      if (vector.operation === "match-bindings") {
        presentationBinding = credentialBinding;
      } else if (vector.operation === "match-proof") {
        proof = makeProof(credentialBinding.holderVerificationMethodRef);
      }
    } else if (vector.mutation === "presentation-controller") {
      presentationBinding = {
        holderVerificationMethodRef: {
          ...baseBinding.holderVerificationMethodRef,
          controllerAddress: { bytes: alternate },
        },
      };
    } else if (vector.mutation === "presentation-method") {
      presentationBinding = {
        holderVerificationMethodRef: {
          ...baseBinding.holderVerificationMethodRef,
          methodId: alternate,
        },
      };
    } else if (vector.mutation === "proof-controller") {
      proof = makeProof({
        ...baseBinding.holderVerificationMethodRef,
        controllerAddress: { bytes: alternate },
      });
    } else if (vector.mutation === "proof-method") {
      proof = makeProof({
        ...baseBinding.holderVerificationMethodRef,
        methodId: alternate,
      });
    } else {
      assert.fail(`unknown holder-binding mutation ${vector.mutation}`);
    }
    assert.throws(
      () =>
        invoke(
          vector.operation,
          credentialBinding,
          presentationBinding,
          proof,
        ),
      (error) => String(error).includes(vector.errorIncludes),
      vector.id,
    );
  }
});

test("validates positive and negative status bindings in Compact", () => {
  const vectors = readJson("conformance/vectors/status-binding.json");
  const fixture = vectors.fixture;
  const makeBinding = () => ({
    registryRef: {
      registryId: fromHex(fixture.registryIdHex),
      authorityVerificationMethodRef: {
        controllerAddress: {
          bytes: fromHex(fixture.authorityControllerAddressHex),
        },
        methodId: fromHex(fixture.authorityMethodIdHex),
      },
    },
    statusHandleCommitment: fromHex(fixture.statusHandleCommitmentHex),
  });
  const invoke = (operation, binding) => {
    if (operation === "validate-registry") {
      return pureCircuits.assertValidStatusRegistryRef(binding.registryRef);
    }
    if (operation === "validate-binding") {
      return pureCircuits.assertValidRegistryBoundStatusBinding(binding);
    }
    if (operation === "derive-root") {
      return pureCircuits.registryBoundStatusBindingRoot(binding);
    }
    assert.fail(`unknown status-binding operation ${operation}`);
  };

  for (const vector of vectors.positive) {
    const result = invoke(vector.operation, makeBinding());
    if (vector.operation === "derive-root") {
      assert.equal(toHex(result), fixture.expectedRootHex, vector.id);
    } else {
      assert.deepEqual(result, []);
    }
  }
  for (const vector of vectors.substitution) {
    const binding = makeBinding();
    if (vector.mutation === "registry") {
      binding.registryRef.registryId = fromHex(vector.valueHex);
    } else if (vector.mutation === "authority-controller") {
      binding.registryRef.authorityVerificationMethodRef.controllerAddress = {
        bytes: fromHex(vector.valueHex),
      };
    } else if (vector.mutation === "authority-method") {
      binding.registryRef.authorityVerificationMethodRef.methodId = fromHex(
        vector.valueHex,
      );
    } else if (vector.mutation === "status-handle") {
      binding.statusHandleCommitment = fromHex(vector.valueHex);
    } else {
      assert.fail(`unknown status-binding substitution ${vector.mutation}`);
    }
    const rootHex = toHex(invoke("derive-root", binding));
    assert.equal(rootHex, vector.expectedRootHex, vector.id);
    assert.notEqual(rootHex, fixture.expectedRootHex, vector.id);
  }
  for (const vector of vectors.negative) {
    const binding = makeBinding();
    if (vector.mutation === "empty-registry") {
      binding.registryRef.registryId = zeroBytes32();
    } else if (vector.mutation === "empty-authority-controller") {
      binding.registryRef.authorityVerificationMethodRef.controllerAddress = {
        bytes: zeroBytes32(),
      };
    } else if (vector.mutation === "empty-authority-method") {
      binding.registryRef.authorityVerificationMethodRef.methodId = zeroBytes32();
    } else if (vector.mutation === "empty-status-handle") {
      binding.statusHandleCommitment = zeroBytes32();
    } else {
      assert.fail(`unknown status-binding mutation ${vector.mutation}`);
    }
    assert.throws(
      () => invoke(vector.operation, binding),
      (error) => String(error).includes(vector.errorIncludes),
      vector.id,
    );
  }
});

test("rejects credential-to-presentation substitutions in Compact", async () => {
  const vectors = readJson("conformance/vectors/credential-presentation.json");
  const fixture = vectors.fixture;
  const alternate = fromHex(
    "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
  );
  const schema = {
    packageId: fromHex(fixture.packageIdHex),
    schemaId: fromHex(fixture.schemaIdHex),
    majorVersion: BigInt(fixture.majorVersion),
    minorVersion: BigInt(fixture.minorVersion),
  };
  const issuerVerificationMethodRef = {
    controllerAddress: {
      bytes: fromHex(fixture.issuerControllerAddressHex),
    },
    methodId: fromHex(fixture.issuerMethodIdHex),
  };
  const holderBinding = {
    holderVerificationMethodRef: {
      controllerAddress: {
        bytes: fromHex(fixture.holderControllerAddressHex),
      },
      methodId: fromHex(fixture.holderMethodIdHex),
    },
  };
  const claimRoot = fromHex(fixture.claimRootHex);
  const credential = {
    version: 1n,
    schema,
    issuerVerificationMethodRef,
    holderBinding,
    statusBinding: {},
    issuedAt: 1n,
    hasExpiration: false,
    expiresAt: 0n,
    claims: {},
    claimCommitments: {},
    claimRoot,
  };
  const makePresentation = () => ({
    version: 1n,
    schema: { ...schema },
    credentialClaimRoot: claimRoot,
    issuerVerificationMethodRef: {
      ...issuerVerificationMethodRef,
      controllerAddress: { ...issuerVerificationMethodRef.controllerAddress },
    },
    holderBinding,
    disclosed: {},
  });
  const conformance = await loadCoreBindingsConformance();
  try {
    for (const vector of vectors.positive) {
      assert.deepEqual(
        conformance.pureCircuits.assertMatchingCredentialPresentation(
          credential,
          makePresentation(),
        ),
        [],
        vector.id,
      );
    }
    for (const vector of vectors.negative) {
      const presentation = makePresentation();
      if (vector.mutation === "schema-package") {
        presentation.schema.packageId = alternate;
      } else if (vector.mutation === "schema-id") {
        presentation.schema.schemaId = alternate;
      } else if (vector.mutation === "schema-major") {
        presentation.schema.majorVersion += 1n;
      } else if (vector.mutation === "schema-minor") {
        presentation.schema.minorVersion += 1n;
      } else if (vector.mutation === "claim-root") {
        presentation.credentialClaimRoot = alternate;
      } else if (vector.mutation === "issuer-controller") {
        presentation.issuerVerificationMethodRef.controllerAddress = {
          bytes: alternate,
        };
      } else if (vector.mutation === "issuer-method") {
        presentation.issuerVerificationMethodRef.methodId = alternate;
      } else {
        assert.fail(`unknown credential-presentation mutation ${vector.mutation}`);
      }
      assert.throws(
        () =>
          conformance.pureCircuits.assertMatchingCredentialPresentation(
            credential,
            presentation,
          ),
        (error) => String(error).includes(vector.errorIncludes),
        vector.id,
      );
    }
  } finally {
    rmSync(conformance.output, { force: true, recursive: true });
  }
});

test("validates and binds positive and negative signer authorizations", async () => {
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
    domainCommitment: fromHex(fixture.authority.domainCommitmentHex),
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
  const offCurvePoint = { x: 1n, y: 1n };
  const orderTwoPoint = {
    x: 0n,
    y: 52435875175126190479447740508185965837690552500527637822603658699938581184512n,
  };
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
      pureCircuits.signerAuthorizationDecisionRoot(
        descriptor,
        authority.domainCommitment,
      ),
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

  const knownAnswers = fixture.knownAnswers;
  const activeIssuerDescriptor = makeDescriptor("issuer", "assertionMethod");
  const issuerProof = makeSignerProof("issuer");
  const verifierProof = makeSignerProof("verifier");
  const authorityProof = signAuthorization(activeIssuerDescriptor);
  assert.equal(toHex(issuerScope), knownAnswers.issuerScopeHex);
  assert.equal(
    toHex(pureCircuits.authorizedSignerDescriptorRoot(activeIssuerDescriptor)),
    knownAnswers.activeIssuerDescriptorRootHex,
  );
  assert.equal(
    toHex(
      pureCircuits.signerAuthorizationDecisionRoot(
        activeIssuerDescriptor,
        authority.domainCommitment,
      ),
    ),
    knownAnswers.activeIssuerDecisionRootHex,
  );
  assert.equal(
    pureCircuits.issuanceProofChallenge(credentialBodyRoot, issuerProof),
    BigInt(knownAnswers.issuerChallenge),
  );
  assert.equal(issuerProof.signature.s, BigInt(knownAnswers.issuerSignatureS));
  assert.equal(
    pureCircuits.verifierRequestProofChallenge(verifierScope, verifierProof),
    BigInt(knownAnswers.verifierChallenge),
  );
  assert.equal(
    verifierProof.signature.s,
    BigInt(knownAnswers.verifierSignatureS),
  );
  assert.equal(
    pureCircuits.signerAuthorizationProofChallenge(
      pureCircuits.signerAuthorizationDecisionRoot(
        activeIssuerDescriptor,
        authority.domainCommitment,
      ),
      authorityProof,
    ),
    BigInt(knownAnswers.authorityChallenge),
  );
  assert.equal(
    authorityProof.signature.s,
    BigInt(knownAnswers.authoritySignatureS),
  );

  const conformance = await loadSignerAuthorizationConformance();
  try {
    const credentialProofVectors = readJson(
      "conformance/vectors/credential-proof.json",
    );
    const credentialFixture = credentialProofVectors.fixture.credential;
    const proofFixture = credentialProofVectors.fixture.proof;
    const credential = {
      version: BigInt(credentialFixture.version),
      schema: {
        packageId: fromHex(credentialFixture.schema.packageIdHex),
        schemaId: fromHex(credentialFixture.schema.schemaIdHex),
        majorVersion: BigInt(credentialFixture.schema.majorVersion),
        minorVersion: BigInt(credentialFixture.schema.minorVersion),
      },
      issuerVerificationMethodRef: {
        controllerAddress: {
          bytes: fromHex(credentialFixture.issuerControllerAddressHex),
        },
        methodId: fromHex(credentialFixture.issuerMethodIdHex),
      },
      holderBinding: {
        holderVerificationMethodRef: {
          controllerAddress: {
            bytes: fromHex(credentialFixture.holderControllerAddressHex),
          },
          methodId: fromHex(credentialFixture.holderMethodIdHex),
        },
      },
      statusBinding: {},
      issuedAt: BigInt(credentialFixture.issuedAt),
      hasExpiration: credentialFixture.hasExpiration,
      expiresAt: BigInt(credentialFixture.expiresAt),
      claims: {},
      claimCommitments: {},
      claimRoot: fromHex(credentialFixture.claimRootHex),
    };
    const bodyRoot = conformance.pureCircuits.credentialBodyRoot(credential);
    assert.equal(
      toHex(bodyRoot),
      credentialProofVectors.fixture.canonicalBodyRootHex,
    );
    const proof = {
      signerVerificationMethodRef: {
        controllerAddress: {
          bytes: fromHex(proofFixture.signerControllerAddressHex),
        },
        methodId: fromHex(proofFixture.signerMethodIdHex),
      },
      createdAt: BigInt(proofFixture.createdAt),
      challengeHash: fromHex(proofFixture.challengeHashHex),
      publicKey: point(proofFixture.publicKey),
      signature: {
        r: point(proofFixture.signature.r),
        s: BigInt(proofFixture.signature.s),
      },
    };
    assert.equal(
      conformance.pureCircuits.issuanceProofChallenge(bodyRoot, proof),
      BigInt(credentialProofVectors.fixture.issuanceChallenge),
    );
    assert.deepEqual(
      conformance.pureCircuits.assertAuthorizedIssuerProof(
        credential,
        proof,
        activeIssuerDescriptor,
      ),
      [],
    );
    for (const vector of credentialProofVectors.positive) {
      assert.deepEqual(
        conformance.pureCircuits.assertValidCredentialProofForBodyRoot(
          credential,
          proof,
          bodyRoot,
        ),
        [],
        vector.id,
      );
    }
    for (const vector of credentialProofVectors.negative) {
      assert.throws(
        () =>
          conformance.pureCircuits.assertValidCredentialProofForBodyRoot(
            credential,
            proof,
            vector.mutation === "body-root"
              ? fromHex(credentialProofVectors.fixture.substitutedBodyRootHex)
              : bodyRoot,
          ),
        (error) => String(error).includes(vector.errorIncludes),
        vector.id,
      );
    }
    assert.throws(
      () =>
        conformance.pureCircuits.assertAuthorizedIssuerProof(
          {
            ...credential,
            schema: { ...schema, schemaId: alternateMethod },
          },
          proof,
          activeIssuerDescriptor,
        ),
      (error) =>
        String(error).includes(
          "Issuer authorization scope does not match schema",
        ),
      "credential schema substitution",
    );
    assert.throws(
      () =>
        conformance.pureCircuits.assertAuthorizedIssuerProof(
          {
            ...credential,
            issuerVerificationMethodRef: {
              ...credential.issuerVerificationMethodRef,
              methodId: alternateMethod,
            },
          },
          proof,
          activeIssuerDescriptor,
        ),
      (error) =>
        String(error).includes(
          "Issuer proof method reference does not match issuer verification method",
        ),
      "credential issuer substitution",
    );
    assert.throws(
      () =>
        conformance.pureCircuits.assertAuthorizedIssuerProof(
          { ...credential, issuedAt: credential.issuedAt + 1n },
          proof,
          activeIssuerDescriptor,
        ),
      (error) => String(error).includes("Signature verification failed"),
      "credential body substitution",
    );
  } finally {
    rmSync(conformance.output, { force: true, recursive: true });
  }

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
        pureCircuits.assertAuthorizedIssuerDescriptor(
          schema,
          proof,
          descriptor,
        ),
        [],
        vector.id,
      );
      assert.deepEqual(
        pureCircuits.assertValidIssuanceContextProof(credentialBodyRoot, proof),
        [],
        `${vector.id}-proof`,
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
      case "off-curve-signer-key":
        descriptor = { ...descriptor, signerPublicKey: offCurvePoint };
        break;
      case "torsion-signer-key":
        descriptor = { ...descriptor, signerPublicKey: orderTwoPoint };
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
      case "empty-proof-controller":
        proof = {
          ...proof,
          signerVerificationMethodRef: {
            ...proof.signerVerificationMethodRef,
            controllerAddress: { bytes: zeroBytes32() },
          },
        };
        break;
      case "empty-proof-method":
        proof = {
          ...proof,
          signerVerificationMethodRef: {
            ...proof.signerVerificationMethodRef,
            methodId: zeroBytes32(),
          },
        };
        break;
      case "identity-proof-key":
        proof = { ...proof, publicKey: identityPoint };
        break;
      case "off-curve-proof-key":
        proof = { ...proof, publicKey: offCurvePoint };
        break;
      case "torsion-proof-key":
        proof = { ...proof, publicKey: orderTwoPoint };
        break;
      case "identity-proof-nonce":
        proof = {
          ...proof,
          signature: { ...proof.signature, r: identityPoint },
        };
        break;
      case "off-curve-proof-nonce":
        proof = {
          ...proof,
          signature: { ...proof.signature, r: offCurvePoint },
        };
        break;
      case "torsion-proof-nonce":
        proof = {
          ...proof,
          signature: { ...proof.signature, r: orderTwoPoint },
        };
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
      case "update-revoked-to-active":
        previousDescriptor = {
          ...previousDescriptor,
          state: AuthorizationState.revoked,
        };
        nextDescriptor = {
          ...nextDescriptor,
          state: AuthorizationState.active,
        };
        break;
      case "proof-sequence":
      case "authority-controller":
      case "authority-method":
      case "authority-key":
      case "identity-authority-key":
      case "empty-authority-domain":
      case "authority-domain":
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
        pureCircuits.assertAuthorizedIssuerDescriptor(
          schema,
          proof,
          descriptor,
        );
        return pureCircuits.assertValidIssuanceContextProof(
          credentialBodyRoot,
          proof,
        );
      }
      if (vector.operation === "issuance-proof") {
        return pureCircuits.assertValidIssuanceContextProof(
          credentialBodyRoot,
          proof,
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
      } else if (vector.mutation === "empty-authority-domain") {
        return pureCircuits.assertValidSignerAuthorizationProof(
          descriptor,
          authorizationProof,
          { ...authority, domainCommitment: zeroBytes32() },
        );
      } else if (vector.mutation === "authority-domain") {
        return pureCircuits.assertValidSignerAuthorizationProof(
          descriptor,
          authorizationProof,
          { ...authority, domainCommitment: alternateMethod },
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
