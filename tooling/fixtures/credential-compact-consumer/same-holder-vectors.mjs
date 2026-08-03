import { pathToFileURL } from "node:url";
import path from "node:path";

const outputRoot = path.resolve(process.argv[2] ?? "");
if (!outputRoot) throw new Error("generated Compact output is required");
const { pureCircuits } = await import(
  pathToFileURL(path.join(outputRoot, "contract/index.js")).href
);
const bytes = (value) => new Uint8Array(32).fill(value);
const buildBinding = (secret, opening, blinding, nonce, challenge) => ({
  blindedHolderSecretCommitment: pureCircuits.blindedSecretHolderCommitment(
    pureCircuits.secretHolderBindingCommitment(secret, opening),
    nonce,
    blinding,
  ),
  issuerNonce: nonce,
  requestChallengeResponse: pureCircuits.secretHolderBindingChallengeResponse(
    secret,
    challenge,
  ),
});
const secret = bytes(11);
const challenge = bytes(12);
const first = buildBinding(secret, bytes(13), bytes(14), bytes(15), challenge);
const second = buildBinding(secret, bytes(16), bytes(17), bytes(18), challenge);
const differentHolder = buildBinding(bytes(19), bytes(16), bytes(17), bytes(18), challenge);
const differentChallenge = buildBinding(secret, bytes(16), bytes(17), bytes(18), bytes(20));
const prove = (a, b, verifierSecret, verifierChallenge) =>
  pureCircuits.assertSameBlindedSecretHolderBindingWitnesses(
    a,
    b,
    verifierChallenge,
    verifierSecret,
    bytes(13),
    bytes(14),
    bytes(16),
    bytes(17),
  );
prove(first, second, secret, challenge);
const rejects = (label, callback) => {
  try {
    callback();
  } catch {
    return;
  }
  throw new Error(`${label} vector unexpectedly passed`);
};
rejects("different holder", () => prove(first, differentHolder, secret, challenge));
rejects("different challenge", () => prove(first, differentChallenge, secret, challenge));
rejects("same binding", () => prove(first, first, secret, challenge));
console.log("same-holder semantic vectors passed: positive + different-holder + different-challenge + duplicate-binding");
