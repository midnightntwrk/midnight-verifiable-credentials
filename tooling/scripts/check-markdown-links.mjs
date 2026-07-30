#!/usr/bin/env node

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const defaultRoots = ['README.md', 'docs', 'core', 'prototypes', 'use-cases', 'registry', 'tooling/vendor'];
const roots = process.argv.slice(2);
const targets = roots.length > 0 ? roots : defaultRoots;
const markdownFiles = [];
const failures = [];
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'target', 'managed']);

function normalizeLinkTarget(rawTarget) {
  const trimmed = rawTarget.trim();
  const withoutAngles = trimmed.startsWith('<') && trimmed.endsWith('>') ? trimmed.slice(1, -1) : trimmed;
  const titleMatch = withoutAngles.match(/^(\S+)(?:\s+"[^"]*"|\s+'[^']*'|\s+\([^)]*\))$/);
  const candidate = titleMatch ? titleMatch[1] : withoutAngles;
  return candidate.split('#')[0].split('?')[0];
}

async function collectMarkdownFiles(targetPath) {
  const resolved = path.resolve(repoRoot, targetPath);
  let info;
  try {
    info = await stat(resolved);
  } catch {
    failures.push({
      file: path.relative(repoRoot, resolved),
      line: 0,
      link: targetPath,
      message: 'input path does not exist',
    });
    return;
  }

  if (info.isDirectory()) {
    const entries = await readdir(resolved, { withFileTypes: true });
    for (const entry of entries) {
      if (ignoredDirs.has(entry.name)) continue;
      await collectMarkdownFiles(path.join(targetPath, entry.name));
    }
    return;
  }

  if (resolved.endsWith('.md')) {
    markdownFiles.push(resolved);
  }
}

async function pathExists(resolvedPath) {
  try {
    await stat(resolvedPath);
    return true;
  } catch {
    return false;
  }
}

async function validateMarkdownFile(filePath) {
  const source = await readFile(filePath, 'utf8');
  const lines = source.split(/\r?\n/);
  let inFence = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (/^```/.test(line.trim())) {
      inFence = !inFence;
      continue;
    }

    if (inFence) continue;

    const regex = /!?\[[^\]]*\]\(([^)]+)\)/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
      const rawTarget = match[1];
      const normalized = normalizeLinkTarget(rawTarget);

      if (!normalized) continue;
      if (normalized.startsWith('#')) continue;
      if (/^(https?:|mailto:|tel:)/.test(normalized)) continue;

      const resolved = normalized.startsWith('/')
        ? path.resolve(repoRoot, normalized.slice(1))
        : path.resolve(path.dirname(filePath), normalized);

      if (await pathExists(resolved)) continue;
      if (await pathExists(`${resolved}.md`)) continue;
      if (await pathExists(path.join(resolved, 'README.md'))) continue;

      failures.push({
        file: path.relative(repoRoot, filePath),
        line: index + 1,
        link: normalized,
        message: `resolved to ${path.relative(repoRoot, resolved) || '.'}`,
      });
    }
  }
}

for (const target of targets) {
  await collectMarkdownFiles(target);
}

for (const filePath of markdownFiles.sort()) {
  await validateMarkdownFile(filePath);
}

if (failures.length > 0) {
  console.error('Broken markdown links found:');
  for (const failure of failures) {
    const location = failure.line > 0 ? `${failure.file}:${failure.line}` : failure.file;
    console.error(`- ${location} -> ${failure.link} (${failure.message})`);
  }
  process.exit(1);
}

console.log(`Checked ${markdownFiles.length} markdown files. No broken relative links found.`);
