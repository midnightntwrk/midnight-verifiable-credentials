import { createHash } from "node:crypto";
import { execFile, execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);

const VERSION = "0.4.0";
const RELEASE_ARCHIVE_URL =
  process.env.MIDNIGHT_DID_ZK_RELEASE_ARCHIVE_URL ??
  "https://api.github.com/repos/midnightntwrk/midnight-did/releases/assets/442733108";
const RELEASE_SHA256_URL =
  process.env.MIDNIGHT_DID_ZK_RELEASE_SHA256_URL ??
  "https://api.github.com/repos/midnightntwrk/midnight-did/releases/assets/442733106";
const RELEASE_FETCH_BASE_URL =
  "https://midnight-did-release-assets.local/zk-artifacts";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../..");
const cacheRoot = path.resolve(
  process.env.MIDNIGHT_DID_ZK_ARTIFACT_CACHE ??
    path.join(repoRoot, ".midnight-test", "did-zk-artifacts", VERSION),
);
const archivePath = path.join(
  cacheRoot,
  `midnight-did-zk-artifacts-${VERSION}.tar.gz`,
);
const extractDir = path.join(cacheRoot, "extracted");
const extractedManifestPath = path.join(extractDir, "manifest.json");

const getGitHubToken = () => {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;

  try {
    return execFileSync("gh", ["auth", "token"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
};

const fetchBytes = async (url) => {
  const headers = {
    "user-agent": "midnight-did-zk-release-smoke",
  };

  if (url.includes("api.github.com/repos/") && url.includes("/releases/assets/")) {
    headers.accept = "application/octet-stream";
    const token = getGitHubToken();
    if (token) {
      headers.authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, { headers, redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
};

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

const readExpectedArchiveSha = async () => {
  if (process.env.MIDNIGHT_DID_ZK_RELEASE_SHA256) {
    return process.env.MIDNIGHT_DID_ZK_RELEASE_SHA256.trim();
  }

  const shaFile = (await fetchBytes(RELEASE_SHA256_URL)).toString("utf8").trim();
  const [digest] = shaFile.split(/\s+/);
  if (!/^[a-f0-9]{64}$/i.test(digest)) {
    throw new Error(`Unexpected sha256 asset contents: ${shaFile}`);
  }
  return digest.toLowerCase();
};

const ensureReleaseArchive = async () => {
  await fs.mkdir(cacheRoot, { recursive: true });

  const expectedSha = await readExpectedArchiveSha();
  let currentSha;
  try {
    currentSha = sha256(await fs.readFile(archivePath));
  } catch {
    currentSha = undefined;
  }

  if (currentSha !== expectedSha) {
    const archive = await fetchBytes(RELEASE_ARCHIVE_URL);
    const actualSha = sha256(archive);
    if (actualSha !== expectedSha) {
      throw new Error(
        `Release archive sha256 mismatch: expected ${expectedSha}, got ${actualSha}`,
      );
    }
    await fs.writeFile(archivePath, archive);
  }

  try {
    await fs.access(extractedManifestPath);
  } catch {
    await fs.rm(extractDir, { recursive: true, force: true });
    await fs.mkdir(extractDir, { recursive: true });
    await execFileAsync("tar", ["-xzf", archivePath, "-C", extractDir]);
  }
};

const readReleaseManifest = async () => {
  await ensureReleaseArchive();
  const manifest = JSON.parse(await fs.readFile(extractedManifestPath, "utf8"));
  if (manifest.schema !== "midnight-did-zk-artifacts") {
    throw new Error(`Unexpected manifest schema: ${manifest.schema}`);
  }
  if (manifest.version !== VERSION) {
    throw new Error(`Unexpected manifest version: ${manifest.version}`);
  }
  if (!Array.isArray(manifest.circuits) || manifest.circuits.length === 0) {
    throw new Error("Release manifest does not list circuits");
  }
  return manifest;
};

const assertProviderMatchesManifest = async (label, provider, manifest) => {
  for (const circuit of manifest.circuits) {
    const [proverKey, verifierKey, zkir] = await Promise.all([
      provider.getProverKey(circuit.id),
      provider.getVerifierKey(circuit.id),
      provider.getZKIR(circuit.id),
    ]);

    const actual = {
      prover: sha256(Buffer.from(proverKey)),
      verifier: sha256(Buffer.from(verifierKey)),
      zkir: sha256(Buffer.from(zkir)),
    };

    for (const kind of ["prover", "verifier", "zkir"]) {
      if (actual[kind] !== circuit.sha256[kind]) {
        throw new Error(
          `${label} ${circuit.id}.${kind} sha256 mismatch: expected ${circuit.sha256[kind]}, got ${actual[kind]}`,
        );
      }
    }
  }
};

const didContractZkConfigPath = () => {
  const contractEntry = require.resolve("@midnight-ntwrk/midnight-did-contract");
  return path.join(path.dirname(contractEntry), "managed", "did");
};

const installReleaseArtifactsIntoPackage = async (zkConfigPath) => {
  await ensureReleaseArchive();
  await fs.rm(path.join(zkConfigPath, "keys"), { recursive: true, force: true });
  await fs.rm(path.join(zkConfigPath, "zkir"), { recursive: true, force: true });
  await fs.cp(path.join(extractDir, "keys"), path.join(zkConfigPath, "keys"), {
    recursive: true,
  });
  await fs.cp(path.join(extractDir, "zkir"), path.join(zkConfigPath, "zkir"), {
    recursive: true,
  });
};

const createReleaseArchiveFetch = () => async (requestUrl) => {
  await ensureReleaseArchive();

  const url = new URL(String(requestUrl));
  const basePath = new URL(RELEASE_FETCH_BASE_URL).pathname.replace(/\/$/, "");
  const requestedPath = decodeURIComponent(url.pathname);
  if (!requestedPath.startsWith(`${basePath}/`)) {
    return new Response("Not found", { status: 404, statusText: "Not found" });
  }

  const relativePath = requestedPath.slice(basePath.length + 1);
  if (!relativePath.startsWith("keys/") && !relativePath.startsWith("zkir/")) {
    return new Response("Not found", { status: 404, statusText: "Not found" });
  }

  const filePath = path.resolve(extractDir, relativePath);
  if (!filePath.startsWith(path.resolve(extractDir) + path.sep)) {
    return new Response("Not found", { status: 404, statusText: "Not found" });
  }

  try {
    const body = await fs.readFile(filePath);
    return new Response(body, { status: 200, statusText: "OK" });
  } catch {
    return new Response("Not found", { status: 404, statusText: "Not found" });
  }
};

const manifest = await readReleaseManifest();
const packageZkConfigPath = didContractZkConfigPath();

await installReleaseArtifactsIntoPackage(packageZkConfigPath);

await assertProviderMatchesManifest(
  "node package",
  new NodeZkConfigProvider(packageZkConfigPath),
  manifest,
);

await assertProviderMatchesManifest(
  "fetch release archive",
  new FetchZkConfigProvider(RELEASE_FETCH_BASE_URL, createReleaseArchiveFetch()),
  manifest,
);

console.log(
  `Validated midnight-did ${VERSION} ZK artifacts for ${manifest.circuits.length} circuits via NodeZkConfigProvider and FetchZkConfigProvider.`,
);
