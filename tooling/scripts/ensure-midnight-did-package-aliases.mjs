import {
  access,
  lstat,
  mkdir,
  readdir,
  readlink,
  rm,
  symlink,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const nodeModulesScope = path.join(repoRoot, 'node_modules', '@midnight-ntwrk');
const pnpmDir = path.join(repoRoot, 'node_modules', '.pnpm');

const packageNames = [
  '@midnight-ntwrk/midnight-did',
  '@midnight-ntwrk/midnight-did-api',
  '@midnight-ntwrk/midnight-did-contract',
  '@midnight-ntwrk/midnight-did-domain',
  '@midnight-ntwrk/midnight-did-jubjub-schnorr',
  '@midnight-ntwrk/midnight-did-secret-storage',
];

const pnpmPackageDir = async (packageName) => {
  const entryPrefix = packageName.replace('/', '+');
  const entries = await readdir(pnpmDir);
  const matches = entries
    .filter((value) => value.startsWith(`${entryPrefix}@`))
    .sort();
  if (matches.length === 0) {
    throw new Error(`Missing pnpm package entry for ${packageName}`);
  }
  if (matches.length > 1) {
    throw new Error(
      `Expected exactly one pnpm package entry for ${packageName}, found: ${matches.join(', ')}`,
    );
  }
  const [entry] = matches;
  const packageDir = path.join(pnpmDir, entry, 'node_modules', packageName);
  await access(packageDir);
  return packageDir;
};

const isMissing = (error) =>
  error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT';

const ensureSymlink = async (linkPath, targetPath) => {
  await mkdir(path.dirname(linkPath), { recursive: true });

  let linkReady = false;
  try {
    const stat = await lstat(linkPath);
    if (stat.isSymbolicLink()) {
      const existing = await readlink(linkPath);
      linkReady = path.resolve(path.dirname(linkPath), existing) === targetPath;
    }
    if (!linkReady) {
      await rm(linkPath, { recursive: true, force: true });
    }
  } catch (error) {
    if (!isMissing(error)) {
      throw error;
    }
  }

  if (!linkReady) {
    await symlink(path.relative(path.dirname(linkPath), targetPath), linkPath, 'dir');
  }
};

for (const packageName of packageNames) {
  await ensureSymlink(
    path.join(nodeModulesScope, packageName.slice('@midnight-ntwrk/'.length)),
    await pnpmPackageDir(packageName),
  );
}

await ensureSymlink(
  path.join(nodeModulesScope, 'contract'),
  path.join(nodeModulesScope, 'midnight-did-contract'),
);
