import { lstat, mkdir, readlink, rm, symlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { officialCompatibilityAliases } from './compatibility-aliases.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const ensureSymlink = async (target, linkPath) => {
  try {
    await symlink(target, linkPath, 'dir');
  } catch (error) {
    if (!(error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST')) {
      throw error;
    }
    const stat = await lstat(linkPath);
    if (!stat.isSymbolicLink()) {
      throw error;
    }
    const existingTarget = await readlink(linkPath);
    if (existingTarget !== target) {
      throw error;
    }
  }
};

for (const { alias, target: targetDir } of officialCompatibilityAliases) {
  const aliasPath = path.join(repoRoot, alias);
  const packagePath = path.join(repoRoot, targetDir);
  const workspaceLinkPath = path.join(
    repoRoot,
    'node_modules',
    '@midnight-ntwrk',
    alias,
  );
  const workspaceLinkTarget = path.relative(
    path.dirname(workspaceLinkPath),
    packagePath,
  );
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
      throw new Error(
        `[ensure-compact-package-aliases] ${alias} exists but is not a symlink; run npm run clean:artifacts before re-running, or remove the stale top-level shell manually if cleanup reports it as non-disposable.`,
      );
    }
  } catch (error) {
    if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) throw error;
  }

  if (!aliasReady) {
    await mkdir(path.dirname(aliasPath), { recursive: true });
    await ensureSymlink(targetDir, aliasPath);
  }

  let workspaceLinkReady = false;
  try {
    const stat = await lstat(workspaceLinkPath);
    if (stat.isSymbolicLink()) {
      const existingTarget = await readlink(workspaceLinkPath);
      if (existingTarget === workspaceLinkTarget) {
        workspaceLinkReady = true;
      } else {
        await rm(workspaceLinkPath, { force: true, recursive: true });
      }
    } else {
      await rm(workspaceLinkPath, { force: true, recursive: true });
    }
  } catch (error) {
    if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) throw error;
  }

  if (!workspaceLinkReady) {
    await mkdir(path.dirname(workspaceLinkPath), { recursive: true });
    await ensureSymlink(workspaceLinkTarget, workspaceLinkPath);
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

  await ensureSymlink('src', distPath);
}
