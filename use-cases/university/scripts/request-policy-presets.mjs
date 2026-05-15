import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const presetCatalogPath = path.resolve(
  __dirname,
  "..",
  "data",
  "request-policy-presets.json",
);

const cloneRequestPolicy = (requestPolicy) => ({ ...requestPolicy });
const clonePolicyRationale = (policyRationale) => ({
  ...policyRationale,
});

const readPresetCatalog = () =>
  /** @type {Readonly<Record<string, {
   *   presetId: string,
   *   kind: "jobApplication" | "mallDiscount",
   *   title: string,
   *   purpose: string,
   *   requestPolicy: Record<string, unknown>,
   *   policyRationale: Record<string, string>,
   * }>>} */ (
    JSON.parse(readFileSync(presetCatalogPath, "utf8"))
  );

export const listUniversityRequestPolicyPresets = (kind) =>
  Object.values(readPresetCatalog())
    .filter((preset) => (kind ? preset.kind === kind : true))
    .map((preset) => ({
      ...preset,
      requestPolicy: cloneRequestPolicy(preset.requestPolicy),
      policyRationale: clonePolicyRationale(preset.policyRationale),
    }));

export const resolveUniversityRequestPolicyPreset = (presetId) => {
  const presetCatalog = readPresetCatalog();
  const preset = presetCatalog[presetId];
  if (!preset) {
    const supported = Object.keys(presetCatalog).sort().join(", ");
    throw new Error(
      `Unknown university request-policy preset ${presetId}. Supported presets: ${supported}`,
    );
  }
  return {
    ...preset,
    requestPolicy: cloneRequestPolicy(preset.requestPolicy),
    policyRationale: clonePolicyRationale(preset.policyRationale),
  };
};
