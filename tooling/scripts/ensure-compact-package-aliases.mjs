import { lstat, mkdir, readlink, rm, symlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const aliases = [
  ['midnight-did-credentials', 'credentials'],
  ['midnight-did-credentials-same-holder', 'credentials-same-holder'],
  ['midnight-did-credentials-birth', 'credentials-birth'],
  ['midnight-did-credentials-birth-secret', 'credentials-birth-secret'],
  ['midnight-did-credentials-iso-registry', 'credentials-iso-registry'],
  ['midnight-did-credentials-status-registry', 'credentials-status-registry'],
  ['midnight-did-credentials-openid', 'protocols/openid'],
  ['midnight-did-credentials-protocol', 'components/orchestration/protocol'],
  ['midnight-did-credentials-demo-contract', 'use-cases/age-gate/contract']
];

for (const [alias, targetDir] of aliases) {
  const aliasPath = path.join(repoRoot, alias);
  const packagePath = path.join(repoRoot, targetDir);
  let aliasReady = false;
  try {
    const stat = await lstat(aliasPath);
    if (stat.isSymbolicLink()) {
      const existingTarget = await readlink(aliasPath);
      if (existingTarget === targetDir) {
        aliasReady = true;
      } else {
        await rm(aliasPath, { force: true, recursive: true });
      }
    } else {
      aliasReady = true;
    }
  } catch (error) {
    if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) throw error;
  }

  if (!aliasReady) {
    await mkdir(path.dirname(aliasPath), { recursive: true });
    await symlink(targetDir, aliasPath, 'dir');
  }

  const distPath = path.join(packagePath, 'dist');
  try {
    const distStat = await lstat(distPath);
    if (distStat.isSymbolicLink()) {
      const existingTarget = await readlink(distPath);
      if (existingTarget === 'src') continue;
      await rm(distPath, { force: true, recursive: true });
    } else {
      continue;
    }
  } catch (error) {
    if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) throw error;
  }

  await symlink('src', distPath, 'dir');
}
