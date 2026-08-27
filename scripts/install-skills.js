import { execFileSync } from 'node:child_process';

const source = 'https://github.com/ronanrodrigo/skills';

execFileSync('npx', ['--yes', 'skills@latest', 'add', source, '--skill', '*', '--agent', 'codex', '--yes', '--copy'], {
  stdio: 'inherit',
  env: { ...process.env, CI: '1' },
});
