import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const source = 'https://github.com/ronanrodrigo/skills';
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destination = path.join(projectRoot, 'src', 'installed-skills');
const token = process.env.GITHUB_TOKEN || process.env.VERCEL_GITHUB_TOKEN;

if (!token) {
  throw new Error(
    'Missing GITHUB_TOKEN or VERCEL_GITHUB_TOKEN. The skills repository is private; configure a read-only GitHub token in the Vercel project environment.',
  );
}

const credentials = Buffer
  .from(`x-access-token:${token}`)
  .toString('base64');
const cloneDirectory = await mkdtemp(path.join(os.tmpdir(), 'mcp-hub-skills-'));

try {
  execFileSync('git', ['clone', '--depth', '1', source, cloneDirectory], {
    stdio: 'inherit',
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: '0',
      GIT_CONFIG_COUNT: '1',
      GIT_CONFIG_KEY_0: 'http.extraHeader',
      GIT_CONFIG_VALUE_0: `Authorization: Basic ${credentials}`,
    },
  });

  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });

  async function copySkills(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await copySkills(entryPath);
        continue;
      }
      if (entry.name !== 'SKILL.md') continue;
      const skillDirectory = path.basename(path.dirname(entryPath));
      const targetDirectory = path.join(destination, skillDirectory);
      await mkdir(targetDirectory, { recursive: true });
      await cp(entryPath, path.join(targetDirectory, 'SKILL.md'));
    }
  }

  await copySkills(cloneDirectory);
} finally {
  await rm(cloneDirectory, { recursive: true, force: true });
}
