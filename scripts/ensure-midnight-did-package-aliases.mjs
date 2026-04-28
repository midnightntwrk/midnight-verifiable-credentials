import { lstat, mkdir, readlink, rm, symlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const aliasPath = path.join(repoRoot, 'node_modules', '@midnight-ntwrk', 'contract');
const target = 'midnight-did-contract';

await mkdir(path.dirname(aliasPath), { recursive: true });
try {
  const stat = await lstat(aliasPath);
  if (stat.isSymbolicLink()) {
    const existing = await readlink(aliasPath);
    if (existing === target) process.exit(0);
  }
  await rm(aliasPath, { recursive: true, force: true });
} catch (error) {
  if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) {
    throw error;
  }
}
await symlink(target, aliasPath, 'dir');
