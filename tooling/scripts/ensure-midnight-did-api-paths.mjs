import { access, readdir, readFile, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const didApiPackageDir = path.join(
  repoRoot,
  'node_modules',
  '@midnight-ntwrk',
  'midnight-did-api',
);

const packageDirs = new Set([didApiPackageDir]);
try {
  packageDirs.add(await realpath(didApiPackageDir));
} catch (error) {
  if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) {
    throw error;
  }
}
try {
  const didApiEntrypoint = import.meta.resolve('@midnight-ntwrk/midnight-did-api');
  packageDirs.add(path.resolve(path.dirname(fileURLToPath(didApiEntrypoint)), '..'));
} catch (error) {
  if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ERR_MODULE_NOT_FOUND')) {
    throw error;
  }
}
try {
  const pnpmStoreDir = path.join(repoRoot, 'node_modules', '.pnpm');
  for (const entry of await readdir(pnpmStoreDir)) {
    if (entry.startsWith('@midnight-ntwrk+midnight-did-api@file+')) {
      packageDirs.add(
        path.join(
          pnpmStoreDir,
          entry,
          'node_modules',
          '@midnight-ntwrk',
          'midnight-did-api',
        ),
      );
    }
  }
} catch (error) {
  if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) {
    throw error;
  }
}

const replacementSpecs = [
  {
    relativeFile: path.join('src', 'config.ts'),
    optionalShape: true,
    from: `path.resolve(
    currentDir,
    "..",
    "contract",
    "src",
    "managed",
    "did",
  )`,
    to: `path.resolve(
    currentDir,
    "..",
    "midnight-did-contract",
    "dist",
    "managed",
    "did",
  )`,
  },
  {
    relativeFile: path.join('dist', 'config.js'),
    optionalShape: true,
    from: `path.resolve(currentDir, "..", "contract", "src", "managed", "did")`,
    to: `path.resolve(currentDir, "..", "midnight-did-contract", "dist", "managed", "did")`,
  },
  {
    relativeFile: path.join('dist', 'package-paths.js'),
    from: `path.resolve(apiPackageRoot, "..", "contract", "src", "managed", "did")`,
    to: `path.resolve(apiPackageRoot, "..", "midnight-did-contract", "dist", "managed", "did")`,
  },
];

for (const packageDir of packageDirs) {
  for (const replacement of replacementSpecs) {
    const file = path.join(packageDir, replacement.relativeFile);
    try {
      await access(file);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        console.warn(`[ensure-midnight-did-api-paths] Skip missing file: ${file}`);
        continue;
      }
      throw error;
    }
    const current = await readFile(file, 'utf8');
    if (current.includes(replacement.to)) {
      continue;
    }
    if (!current.includes(replacement.from)) {
      if (replacement.optionalShape) {
        console.warn(`[ensure-midnight-did-api-paths] Skip unmatched optional config shape: ${file}`);
        continue;
      }
      throw new Error(`Unexpected @midnight-ntwrk/midnight-did-api config shape in ${file}`);
    }
    await writeFile(file, current.replace(replacement.from, replacement.to));
  }
}
