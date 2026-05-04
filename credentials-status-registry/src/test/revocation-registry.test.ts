import { Buffer } from "node:buffer";

import {
  createCircuitContext,
  createConstructorContext,
  dummyContractAddress,
} from "@midnight-ntwrk/compact-runtime";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import {
  Contract,
  ledger,
  pureCircuits,
} from "../managed/revocation-registry/contract/index.js";

setNetworkId("undeployed");

const bytes32 = (label: string): Uint8Array =>
  new Uint8Array(Buffer.from(label.padEnd(32, "_").slice(0, 32)));

const compactPad32 = (label: string): Uint8Array => {
  const bytes = new Uint8Array(32);
  bytes.set(Buffer.from(label).subarray(0, 32));
  return bytes;
};

const createRegistryFixture = () => {
  const contract = new Contract({});
  const initialState = contract.initialState(
    createConstructorContext({}, { bytes: new Uint8Array(32) }),
  );
  const context = createCircuitContext(
    dummyContractAddress(),
    initialState.currentZswapLocalState,
    initialState.currentContractState.data,
    initialState.currentPrivateState,
  );

  return { contract, context };
};

describe("revocation registry contract", () => {
  it("builds a typed revocation registry state snapshot", () => {
    const state = {
      registryId: bytes32("registry:hidden-holder"),
      revokedRoot: bytes32("revoked-root:epoch-42"),
      epoch: 42n,
    };

    expect(() =>
      pureCircuits.assertValidRevocationRegistryState(state),
    ).not.toThrow();
  });

  it("rejects an empty registry id or revoked root in a typed snapshot", () => {
    expect(() =>
      pureCircuits.assertValidRevocationRegistryState({
        registryId: new Uint8Array(32),
        revokedRoot: bytes32("revoked-root:epoch-42"),
        epoch: 42n,
      }),
    ).toThrow(/Revocation registry id must be set/);

    expect(() =>
      pureCircuits.assertValidRevocationRegistryState({
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: new Uint8Array(32),
        epoch: 42n,
      }),
    ).toThrow(/Revocation registry root must be set/);
  });

  it("initializes the registry once and rejects invalid follow-up initialization", () => {
    const { contract, context } = createRegistryFixture();

    const initialized = contract.impureCircuits.initializeRegistry(
      context,
      bytes32("registry:hidden-holder"),
    );
    const initializedLedger = ledger(
      initialized.context.currentQueryContext.state,
    );

    expect(initializedLedger.initialized).toBe(true);
    expect(Buffer.from(initializedLedger.registryId)).toEqual(
      Buffer.from(bytes32("registry:hidden-holder")),
    );

    expect(() =>
      contract.impureCircuits.initializeRegistry(context, new Uint8Array(32)),
    ).toThrow(/Revocation registry id must be set/);
    expect(() =>
      contract.impureCircuits.initializeRegistry(
        context,
        compactPad32("midnight:vc:status:unset"),
      ),
    ).toThrow(/must not reuse the unset sentinel/);
    expect(() =>
      contract.impureCircuits.initializeRegistry(
        initialized.context,
        bytes32("registry:secondary"),
      ),
    ).toThrow(/already been initialized/);
  });

  it("binds state snapshots to registry id and epoch, and rejects use before initialization", () => {
    const { contract, context } = createRegistryFixture();
    const snapshot = {
      registryId: bytes32("registry:hidden-holder"),
      revokedRoot: bytes32("revoked-root:epoch-0"),
      epoch: 0n,
    };

    expect(() =>
      contract.impureCircuits.assertStateUsesThisRegistry(context, snapshot),
    ).toThrow(/not initialized/);

    const initialized = contract.impureCircuits.initializeRegistry(
      context,
      bytes32("registry:hidden-holder"),
    );

    expect(() =>
      contract.impureCircuits.assertStateUsesThisRegistry(
        initialized.context,
        snapshot,
      ),
    ).not.toThrow();

    expect(() =>
      contract.impureCircuits.assertStateUsesThisRegistry(initialized.context, {
        ...snapshot,
        registryId: bytes32("registry:wrong"),
      }),
    ).toThrow(/does not belong to this registry/);

    expect(() =>
      contract.impureCircuits.assertStateUsesThisRegistry(initialized.context, {
        ...snapshot,
        epoch: 1n,
      }),
    ).toThrow(/cannot exceed the current registry epoch/);
  });

  it("currently does not bind a supplied revokedRoot to the live merkle root", () => {
    const { contract, context } = createRegistryFixture();
    const initialized = contract.impureCircuits.initializeRegistry(
      context,
      bytes32("registry:hidden-holder"),
    );

    expect(() =>
      contract.impureCircuits.assertStateUsesThisRegistry(initialized.context, {
        registryId: bytes32("registry:hidden-holder"),
        revokedRoot: bytes32("fabricated-root"),
        epoch: 0n,
      }),
    ).not.toThrow();
  });

  it("records revoked status handles and advances the registry epoch", () => {
    const { contract, context } = createRegistryFixture();
    const initialized = contract.impureCircuits.initializeRegistry(
      context,
      bytes32("registry:hidden-holder"),
    );
    const statusHandle = bytes32("status-handle:alice");

    const revoked = contract.impureCircuits.revokeStatusHandle(
      initialized.context,
      statusHandle,
    );
    const revokedLedger = ledger(revoked.context.currentQueryContext.state);

    expect(revokedLedger.revokedStatusHandleCount).toEqual(1n);
    expect(revokedLedger.version).toEqual(1n);
    expect(
      revokedLedger.revokedStatusHandles.findPathForLeaf(statusHandle),
    ).toBeDefined();
  });

  it("rejects an empty revoked status handle", () => {
    const { contract, context } = createRegistryFixture();
    const initialized = contract.impureCircuits.initializeRegistry(
      context,
      bytes32("registry:hidden-holder"),
    );

    expect(() =>
      contract.impureCircuits.revokeStatusHandle(
        initialized.context,
        new Uint8Array(32),
      ),
    ).toThrow(/must be set/);
  });
});
