import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

import { describe, expect, it } from "vitest";

const compactAvailable = (() => {
  try {
    execFileSync("compact", ["--version"], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
})();
const compactRequired = Boolean(process.env.COMPACT_COMPILER_VERSION);

if (compactRequired && !compactAvailable) {
  throw new Error(
    "COMPACT_COMPILER_VERSION is set but the compact toolchain is not on PATH",
  );
}

const compileProbe = (
  source: string,
): { ok: true } | { ok: false; message: string } => {
  const tempDir = mkdtempSync(path.join(os.tmpdir(), "hello-family-compact-"));
  const sourcePath = path.join(tempDir, "probe.compact");
  const targetPath = path.join(tempDir, "artifacts");

  try {
    writeFileSync(sourcePath, source, "utf8");
    execFileSync("compact", ["compile", sourcePath, targetPath], {
      encoding: "utf8",
      stdio: "pipe",
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof Error) {
      const stderr =
        "stderr" in error && typeof error.stderr?.toString === "function"
          ? error.stderr.toString()
          : "";
      const stdout =
        "stdout" in error && typeof error.stdout?.toString === "function"
          ? error.stdout.toString()
          : "";
      const message = [error.message, stderr, stdout]
        .filter((chunk) => chunk.length > 0)
        .join("\n");
      return { ok: false, message };
    }
    const message = String(error);
    return { ok: false, message };
  } finally {
    rmSync(tempDir, { force: true, recursive: true });
  }
};

(compactAvailable ? describe : describe.skip)(
  "hello-family Compact claim-type support",
  () => {
    it("accepts the supported primitive claim-type probe", () => {
      const result = compileProbe(`pragma language_version >= 0.20;

import CompactStandardLibrary;

export struct SupportedProbe {
  boolValue: Boolean,
  smallUint: Uint<8>,
  bigUint: Uint<248>,
  bytesValue: Bytes<32>,
  fieldValue: Field,
  bools: Vector<2, Boolean>,
  uints: Vector<2, Uint<64>>,
  bytesVec: Vector<2, Bytes<16>>,
  fields: Vector<2, Field>,
}

export pure circuit probeRoot(value: SupportedProbe): Bytes<32> {
  return persistentHash<SupportedProbe>(value);
}`);

      expect(result).toEqual({ ok: true });
    });

    it("rejects signed integers, floats, and strings in the current Compact surface", () => {
      const signedIntResult = compileProbe(`pragma language_version >= 0.20;
import CompactStandardLibrary;
export struct SignedProbe { value: Int<32>, }
export pure circuit probeRoot(value: SignedProbe): Bytes<32> {
  return persistentHash<SignedProbe>(value);
}`);
      expect(signedIntResult.ok).toEqual(false);
      expect(signedIntResult.ok ? "" : signedIntResult.message).toMatch(
        /\bInt\b/i,
      );

      const floatResult = compileProbe(`pragma language_version >= 0.20;
import CompactStandardLibrary;
export struct FloatProbe { value: Float<32>, }
export pure circuit probeRoot(value: FloatProbe): Bytes<32> {
  return persistentHash<FloatProbe>(value);
}`);
      expect(floatResult.ok).toEqual(false);
      expect(floatResult.ok ? "" : floatResult.message).toMatch(/\bFloat\b/i);

      const stringResult = compileProbe(`pragma language_version >= 0.20;
import CompactStandardLibrary;
export struct StringProbe { value: String, }
export pure circuit probeRoot(value: StringProbe): Bytes<32> {
  return persistentHash<StringProbe>(value);
}`);
      expect(stringResult.ok).toEqual(false);
      expect(stringResult.ok ? "" : stringResult.message).toMatch(
        /\bString\b/i,
      );
    });
  },
);
