import { lstat, mkdir, readlink, rm, symlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const aliases = [
  ['midnight-did-credentials', 'credentials'],
  ['midnight-did-credentials-same-holder', 'credentials-same-holder'],
  ['midnight-did-credentials-birth', 'credentials-birth'],
  ['midnight-did-credentials-birth-secret', 'credentials-birth-secret'],
  ['midnight-did-credentials-iso-registry', 'credentials-iso-registry'],
  ['midnight-did-credentials-openid', 'credentials-openid'],
  ['midnight-did-credentials-protocol', 'credentials-protocol'],
  ['midnight-did-credentials-demo-contract', 'credentials-demo-contract']
];

for (const [alias, targetDir] of aliases) {
  const aliasPath = path.join(repoRoot, alias);
  try {
    const stat = await lstat(aliasPath);
    if (stat.isSymbolicLink()) {
      const existingTarget = await readlink(aliasPath);
      if (existingTarget === targetDir) continue;
      await rm(aliasPath, { force: true, recursive: true });
    } else {
      continue;
    }
  } catch (error) {
    if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) throw error;
  }
  await mkdir(path.dirname(aliasPath), { recursive: true });
  await symlink(targetDir, aliasPath, 'dir');
}
