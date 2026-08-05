import {
  createLongFormOffchainDIDUrlForJubjubHolder,
  createOffchainDIDHolderBindingFromDidUrl,
} from "@midnight-ntwrk/credential-did-midnight";

const longFormDidUrl = createLongFormOffchainDIDUrlForJubjubHolder({
  publicKey: { x: 1n, y: 2n },
});
const resolved = createOffchainDIDHolderBindingFromDidUrl({ longFormDidUrl });

if (
  !resolved.did.startsWith("did:midnight:offchain:") ||
  resolved.method.id !== "#holder-key-1" ||
  resolved.binding.holderPublicKey.x !== 1n ||
  resolved.binding.holderPublicKey.y !== 2n ||
  resolved.binding.holderDidStateHash.length !== 32 ||
  resolved.binding.holderMethodId.length !== 32
) {
  throw new Error("offchain DID holder-binding behavior did not round-trip");
}

console.log("Offchain DID holder-binding behavior passed.");
