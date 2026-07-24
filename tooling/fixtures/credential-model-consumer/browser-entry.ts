import { accessFamily } from "./family.js";

const encoded = accessFamily.presentationCodec.encode({
  minimumAccessLevel: 3,
});
const decoded = accessFamily.presentationCodec.decode(encoded);

if (decoded.minimumAccessLevel !== 3) {
  throw new Error("Bundled credential model codec returned an invalid value");
}

console.log("Browser-targeted credential model bundle executed successfully.");
