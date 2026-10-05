import { accessSchema } from "./schema.js";

if (accessSchema.claims[0]?.id !== "accessLevel") {
  throw new Error("Bundled credential metadata is invalid");
}

console.log("Browser-targeted credential model bundle executed successfully.");
