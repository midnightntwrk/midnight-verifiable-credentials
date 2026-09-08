import { lstat, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { retiredCompatibilityAliases } from './compatibility-aliases.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const removeRetiredSymlink = async (linkPath) => {
  try {
    if ((await lstat(linkPath)).isSymbolicLink()) {
      await rm(linkPath, { force: true });
    }
  } catch (error) {
    if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) throw error;
  }
};

for (const alias of retiredCompatibilityAliases) {
  await removeRetiredSymlink(path.join(repoRoot, alias));
  await removeRetiredSymlink(
    path.join(repoRoot, 'node_modules', '@midnight-ntwrk', alias),
  );
}
