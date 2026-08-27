import { execFileSync } from 'node:child_process';

const source = 'https://github.com/ronanrodrigo/skills';
const token = process.env.GITHUB_TOKEN || process.env.VERCEL_GITHUB_TOKEN;

if (!token) {
  throw new Error(
    'Missing GITHUB_TOKEN or VERCEL_GITHUB_TOKEN. The skills repository is private; configure a read-only GitHub token in the Vercel project environment.',
  );
}

execFileSync('npx', ['--yes', 'skills@latest', 'add', source, '--all', '--copy'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    CI: '1',
    GIT_CONFIG_COUNT: '1',
    GIT_CONFIG_KEY_0: 'http.https://github.com/.extraheader',
    GIT_CONFIG_VALUE_0: `AUTHORIZATION: bearer ${token}`,
  },
});
