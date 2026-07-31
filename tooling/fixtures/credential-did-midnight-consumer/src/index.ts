import {
  createLongFormOffchainDIDUrlForJubjubHolder,
  createOffchainDIDHolderBindingFromDidUrl,
} from "@midnight-ntwrk/credential-did-midnight";

const longFormDidUrl = createLongFormOffchainDIDUrlForJubjubHolder({
  publicKey: { x: 1n, y: 2n },
});
const resolved = createOffchainDIDHolderBindingFromDidUrl({ longFormDidUrl });

if (resolved.binding.holderPublicKey.x !== 1n) {
  throw new Error("unexpected holder public key");
}

export const evidence = resolved.binding;
