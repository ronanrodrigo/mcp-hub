import { execFileSync } from 'node:child_process';

const source = 'https://github.com/ronanrodrigo/skills';

execFileSync('npx', ['--yes', 'skills@latest', 'add', source, '--all', '--copy'], {
  stdio: 'inherit',
  env: { ...process.env, CI: '1' },
});
