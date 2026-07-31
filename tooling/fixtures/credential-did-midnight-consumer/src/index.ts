import {
  createOffchainDIDHolderBindingFromDidUrl,
  type OffchainDIDHolderBinding,
} from "@midnight-ntwrk/credential-did-midnight";

const binding: OffchainDIDHolderBinding = {
  holderDidStateHash: new Uint8Array(32),
  holderMethodId: new Uint8Array(32),
  holderPublicKey: { x: 1n, y: 2n },
};

export const evidence = {
  binding,
  create: createOffchainDIDHolderBindingFromDidUrl,
};
