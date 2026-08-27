import { execFileSync } from 'node:child_process';

const source = 'https://github.com/ronanrodrigo/skills';

execFileSync('npx', ['--yes', 'skills', 'add', source, '--all', '--yes', '--agent', 'codex'], {
  stdio: 'inherit',
  env: { ...process.env, CI: '1' },
});
