#!/usr/bin/env node

import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(scriptDirectory, "..");
const repoRoot = resolve(docsRoot, "..");
const generatedNotice =
  "<!-- Generated from a canonical repository source by scripts/sync-content.mjs. Do not edit this copy. -->\n\n";

for (const directory of ["spec", "conformance", "public/conformance"]) {
  await rm(resolve(docsRoot, directory), { force: true, recursive: true });
}

const pages = [
  ["spec/README.md", "docs-site/spec/index.md"],
  ["conformance/README.md", "docs-site/conformance/index.md"],
  ["packages/core/model/README.md", "docs-site/packages/model.md"],
  ["packages/core/model/CHANGELOG.md", "docs-site/packages/model-changelog.md"],
  ["packages/core/compact/README.md", "docs-site/packages/compact.md"],
  [
    "packages/core/compact/CHANGELOG.md",
    "docs-site/packages/compact-changelog.md",
  ],
  [
    "docs/decisions/0016-core-only-specification-and-implementation.md",
    "docs-site/architecture/core-only.md",
  ],
  [
    "docs/guides/npmjs-publication.md",
    "docs-site/development/npmjs-publication.md",
  ],
  ["SECURITY.md", "docs-site/development/security.md"],
];

const specFiles = await readdir(resolve(repoRoot, "spec"));
for (const file of specFiles.filter((candidate) => candidate.endsWith(".md"))) {
  if (file !== "README.md") {
    pages.push([`spec/${file}`, `docs-site/spec/${file}`]);
  }
}

const rewriteLinks = (source, sourcePath) => {
  let rewritten = source
    .replaceAll("(../conformance/)", "(/conformance/)")
    .replaceAll(
      "(../conformance/manifest.json)",
      "(/conformance/manifest.json)",
    )
    .replaceAll(
      "(../conformance/manifest.sha256)",
      "(/conformance/manifest.sha256.txt)",
    )
    .replaceAll(
      "(../conformance/vectors/compact-generated.json)",
      "(/conformance/vectors/compact-generated.json)",
    );

  if (sourcePath === "conformance/README.md") {
    rewritten = rewritten
      .replace("(./manifest.json)", "(/conformance/manifest.json)")
      .replace("(./manifest.sha256)", "(/conformance/manifest.sha256.txt)")
      .replace("(./vectors/)", "(./vectors)");
  }
  if (sourcePath === "packages/core/model/README.md") {
    return rewritten
      .replace(
        "[`CHANGELOG.md`](./CHANGELOG.md)",
        "[package changelog](/packages/model-changelog)",
      )
      .replace(
        "[`SECURITY.md`](../../../SECURITY.md)",
        "[security policy](/development/security)",
      );
  }
  if (sourcePath === "packages/core/compact/README.md") {
    return rewritten.replace(
      "[`CHANGELOG.md`](./CHANGELOG.md)",
      "[package changelog](/packages/compact-changelog)",
    );
  }
  if (sourcePath === "docs/guides/npmjs-publication.md") {
    return rewritten.replace(
      "[`SECURITY.md`](../../SECURITY.md)",
      "[security policy](/development/security)",
    );
  }
  return rewritten;
};

for (const [sourcePath, targetPath] of pages) {
  const source = await readFile(resolve(repoRoot, sourcePath), "utf8");
  const target = resolve(repoRoot, targetPath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(
    target,
    `${generatedNotice}${rewriteLinks(source, sourcePath)}`,
  );
}

const publicConformance = resolve(docsRoot, "public", "conformance");
await mkdir(resolve(publicConformance, "vectors"), { recursive: true });
for (const file of ["manifest.json", "manifest.sha256"]) {
  await copyFile(
    resolve(repoRoot, "conformance", file),
    resolve(
      publicConformance,
      file === "manifest.sha256" ? `${file}.txt` : file,
    ),
  );
}
const vectorFiles = (
  await readdir(resolve(repoRoot, "conformance", "vectors"))
).sort();
for (const file of vectorFiles) {
  await copyFile(
    resolve(repoRoot, "conformance", "vectors", file),
    resolve(publicConformance, "vectors", file),
  );
}

await writeFile(
  resolve(docsRoot, "conformance", "vectors.md"),
  `${generatedNotice}# Conformance Vectors\n\n${vectorFiles
    .map((file) => `- [\`${file}\`](/conformance/vectors/${file})`)
    .join("\n")}\n`,
);

console.log(
  `Synchronized ${pages.length} documentation pages and conformance data.`,
);
