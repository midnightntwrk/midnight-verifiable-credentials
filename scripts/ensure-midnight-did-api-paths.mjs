import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const replacements = [
  {
    file: path.join(
      repoRoot,
      'node_modules',
      '@midnight-ntwrk',
      'midnight-did-api',
      'src',
      'config.ts',
    ),
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
    file: path.join(
      repoRoot,
      'node_modules',
      '@midnight-ntwrk',
      'midnight-did-api',
      'dist',
      'config.js',
    ),
    from: `path.resolve(currentDir, "..", "contract", "src", "managed", "did")`,
    to: `path.resolve(currentDir, "..", "midnight-did-contract", "dist", "managed", "did")`,
  },
];

for (const replacement of replacements) {
  try {
    await access(replacement.file);
  } catch {
    continue;
  }
  const current = await readFile(replacement.file, 'utf8');
  if (current.includes(replacement.to)) {
    continue;
  }
  if (!current.includes(replacement.from)) {
    throw new Error(`Unexpected @midnight-ntwrk/midnight-did-api config shape in ${replacement.file}`);
  }
  await writeFile(replacement.file, current.replace(replacement.from, replacement.to));
}
