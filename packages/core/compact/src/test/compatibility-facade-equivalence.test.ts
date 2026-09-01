import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const packageRoot = resolve(import.meta.dirname, "../..");
const canonicalRoot = resolve(packageRoot, "src");
const facadeRoot = resolve(packageRoot, "../primitives/credentials/src");

const intentionalFacadeExtensions = new Set([
  "credentials/composable.compact",
  "credentials/proofs.compact",
]);

const compactFiles = (root: string): string[] => {
  const visit = (directory: string, prefix = ""): string[] =>
    readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolute = resolve(directory, entry.name);
      if (entry.isDirectory()) return visit(absolute, relative);
      return entry.isFile() && entry.name.endsWith(".compact")
        ? [relative]
        : [];
    });
  return visit(root).sort();
};

const sharedCanonicalFiles = compactFiles(canonicalRoot).filter(
  (file) =>
    (file === "credentials.compact" || file.startsWith("credentials/")) &&
    !intentionalFacadeExtensions.has(file),
);

const equivalentSharedSources = (
  read: (root: string, file: string) => string,
): boolean =>
  sharedCanonicalFiles.every(
    (file) => read(canonicalRoot, file) === read(facadeRoot, file),
  );

const readSource = (root: string, file: string): string =>
  readFileSync(resolve(root, file), "utf8");

describe("private credentials compatibility facade", () => {
  it("is byte-equivalent for every non-extended canonical VC/VP source", () => {
    expect(sharedCanonicalFiles.length).toBeGreaterThan(10);
    expect(equivalentSharedSources(readSource)).toBe(true);
  });

  it("detects a semantic mutation in a retained facade source", () => {
    const mutatedFile = "credentials/vc.compact";
    const readMutatedFacade = (root: string, file: string): string => {
      const source = readSource(root, file);
      if (root !== facadeRoot || file !== mutatedFile) return source;
      return source.replace(
        "Credential version mismatch",
        "MUTATED credential version mismatch",
      );
    };

    expect(equivalentSharedSources(readMutatedFacade)).toBe(false);
  });

  it("keeps legacy authority/status extensions outside canonical ownership", () => {
    expect(compactFiles(facadeRoot)).toContain(
      "credentials/verification-v1.compact",
    );
    expect(compactFiles(canonicalRoot)).not.toContain(
      "credentials/verification-v1.compact",
    );
    expect([...intentionalFacadeExtensions]).toEqual([
      "credentials/composable.compact",
      "credentials/proofs.compact",
    ]);
  });
});
