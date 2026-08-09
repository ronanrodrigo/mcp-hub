import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHub } from '../src/hub.js';
import { listHubTools } from '../src/mcp-server.js';

let dir;
beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'superpowers-'));
  await fs.mkdir(path.join(dir, 'brainstorming'));
  await fs.writeFile(path.join(dir, 'brainstorming', 'SKILL.md'), '---\nname: Brainstorming\ndescription: Explore design ideas\n---\nAsk questions before implementation.');
  await fs.writeFile(path.join(dir, 'brainstorming', 'questions.md'), 'Useful questions.');
  process.env.SUPERPOWERS_SKILLS_DIR = dir;
});
afterEach(async () => { delete process.env.SUPERPOWERS_SKILLS_DIR; await fs.rm(dir, { recursive: true, force: true }); });

describe('superpowers MCP', () => {
  it('publishes all tools with a namespace', async () => {
    const names = (await listHubTools()).map((tool) => tool.name);
    expect(names).toContain('superpowers/list_skills');
    expect(names).toContain('superpowers/semantic_search_skills');
  });
  it('discovers and executes skills and supporting files', async () => {
    const hub = await createHub();
    expect((await hub.callTool('superpowers/list_skills')).skills[0].name).toBe('brainstorming');
    expect((await hub.callTool('superpowers/get_skill_file', { skill: 'brainstorming', file: 'questions.md' })).content).toContain('Useful');
  });
  it('returns a clear configuration error without an environment variable', async () => {
    delete process.env.SUPERPOWERS_SKILLS_DIR;
    expect((await (await createHub()).callTool('superpowers/list_skills')).success).toBe(false);
  });
});
