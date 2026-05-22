import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const presetCatalogPath = path.resolve(
  __dirname,
  "..",
  "data",
  "request-policy-presets.json",
);
const presetMarkdownPath = path.resolve(
  __dirname,
  "..",
  "data",
  "request-policy-presets.md",
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

const formatPolicyValue = (value) =>
  typeof value === "string" ? value : JSON.stringify(value);

// Preserve request-policy JSON field order as the operator-facing display order.
const renderPolicyFields = (requestPolicy) =>
  Object.entries(requestPolicy)
    .map(([field, value]) => `- \`${field}\`: \`${formatPolicyValue(value)}\``)
    .join("\n");

const renderPolicyRationale = (policyRationale) =>
  Object.entries(policyRationale)
    .map(([field, rationale]) => `- \`${field}\`: ${rationale}`)
    .join("\n");

export const renderUniversityRequestPolicyPresetMarkdown = () => {
  const lines = [
    "# University Request Policy Presets",
    "",
    "Status: generated from `request-policy-presets.json`.",
    "",
    "Regenerate with:",
    "",
    "```bash",
    "npm run update:university-request-policy-presets",
    "npm run check:university-request-policy-presets",
    "```",
    "",
  ];

  for (const preset of listUniversityRequestPolicyPresets()) {
    lines.push(
      `## \`${preset.presetId}\``,
      "",
      `- Kind: \`${preset.kind}\``,
      `- Title: ${preset.title}`,
      `- Purpose: ${preset.purpose}`,
      "",
      "Request policy:",
      "",
      renderPolicyFields(preset.requestPolicy),
      "",
      "Policy rationale:",
      "",
      renderPolicyRationale(preset.policyRationale),
      "",
    );
  }

  return lines.join("\n");
};

export const updateUniversityRequestPolicyPresetMarkdown = () => {
  writeFileSync(
    presetMarkdownPath,
    renderUniversityRequestPolicyPresetMarkdown(),
    "utf8",
  );
};

export const checkUniversityRequestPolicyPresetMarkdown = () => {
  const expected = renderUniversityRequestPolicyPresetMarkdown();
  let actual;
  try {
    actual = readFileSync(presetMarkdownPath, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "ENOENT") {
        throw new Error(
          "Missing packages/use-cases/university/data/request-policy-presets.md; run `npm run update:university-request-policy-presets`.",
        );
      }
    }
    throw error;
  }
  if (actual !== expected) {
    throw new Error(
      "packages/use-cases/university/data/request-policy-presets.md is out of sync; run `npm run update:university-request-policy-presets`.",
    );
  }
};

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const args = new Set(process.argv.slice(2));
  const requestedMarkdownModes = [
    "--markdown",
    "--update-markdown",
    "--check-markdown",
  ].filter((flag) => args.has(flag));
  try {
    if (requestedMarkdownModes.length > 1) {
      throw new Error(
        `Use exactly one request-policy preset markdown mode, got: ${requestedMarkdownModes.join(", ")}`,
      );
    }
    if (args.has("--markdown")) {
      process.stdout.write(renderUniversityRequestPolicyPresetMarkdown());
    } else if (args.has("--update-markdown")) {
      updateUniversityRequestPolicyPresetMarkdown();
      console.log(
        "[request-policy-presets] Updated packages/use-cases/university/data/request-policy-presets.md.",
      );
    } else if (args.has("--check-markdown")) {
      checkUniversityRequestPolicyPresetMarkdown();
      console.log("[request-policy-presets] Verified generated preset markdown.");
    } else {
      console.log(
        JSON.stringify(listUniversityRequestPolicyPresets(), null, 2),
      );
    }
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}
