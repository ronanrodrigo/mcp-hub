import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHub } from '../src/hub.js';
import { listHubTools } from '../src/mcp-server.js';
import { DEFAULT_SKILLS_DIR, resolveSkillsDirectory } from '../src/tools/superpowers.js';

let dir;
let originalSkillsDir;
beforeEach(async () => {
  originalSkillsDir = process.env.SUPERPOWERS_SKILLS_DIR;
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'superpowers-'));
  await fs.mkdir(path.join(dir, 'brainstorming'));
  await fs.writeFile(path.join(dir, 'brainstorming', 'SKILL.md'), '---\nname: Brainstorming\ndescription: Explore design ideas\n---\nAsk questions before implementation.');
  await fs.writeFile(path.join(dir, 'brainstorming', 'questions.md'), 'Useful questions.');
  process.env.SUPERPOWERS_SKILLS_DIR = dir;
});
afterEach(async () => {
  if (originalSkillsDir === undefined) delete process.env.SUPERPOWERS_SKILLS_DIR;
  else process.env.SUPERPOWERS_SKILLS_DIR = originalSkillsDir;
  await fs.rm(dir, { recursive: true, force: true });
});

describe('superpowers MCP', () => {
  it('publishes all tools with a namespace', async () => {
    const names = (await listHubTools()).map((tool) => tool.name);
    expect(names).toContain('superpowers/list_skills');
    expect(names).toContain('superpowers/semantic_search_skills');
  });

  it('uses SUPERPOWERS_SKILLS_DIR when it is configured', () => {
    expect(resolveSkillsDirectory({ SUPERPOWERS_SKILLS_DIR: '/custom/skills' })).toBe('/custom/skills');
  });

  it('falls back to the bundled skills directory when the env var is absent', async () => {
    delete process.env.SUPERPOWERS_SKILLS_DIR;
    expect(resolveSkillsDirectory({})).toBe(DEFAULT_SKILLS_DIR);
    const result = await (await createHub()).callTool('superpowers/list_skills');
    expect(result.success).toBe(true);
    expect(result.skills.map((skill) => skill.name)).toContain('brainstorming');
  });

  it('falls back when the env var is an empty string', async () => {
    process.env.SUPERPOWERS_SKILLS_DIR = '';
    expect(resolveSkillsDirectory({ SUPERPOWERS_SKILLS_DIR: '' })).toBe(DEFAULT_SKILLS_DIR);
    const result = await (await createHub()).callTool('superpowers/use_skill', { name: 'brainstorming' });
    expect(result.success).toBe(true);
    expect(result.content).toContain('# Brainstorming');
  });

  it('discovers and executes skills and supporting files from the configured directory', async () => {
    const hub = await createHub();
    expect((await hub.callTool('superpowers/list_skills')).skills[0].name).toBe('brainstorming');
    expect((await hub.callTool('superpowers/get_skill_file', { skill: 'brainstorming', file: 'questions.md' })).content).toContain('Useful');
  });

  it('returns a useful error when the configured directory does not exist', async () => {
    process.env.SUPERPOWERS_SKILLS_DIR = path.join(dir, 'missing');
    const result = await (await createHub()).callTool('superpowers/list_skills');
    expect(result.success).toBe(false);
    expect(result.error).toContain('skills directory is not available');
  });

  it('reports missing skills and blocks path traversal after skills are available', async () => {
    const hub = await createHub();
    const missingSkill = await hub.callTool('superpowers/use_skill', { name: 'skill-que-nao-existe' });
    expect(missingSkill).toEqual({ success: false, error: "Skill 'skill-que-nao-existe' not found" });
    const traversal = await hub.callTool('superpowers/get_skill_file', { skill: 'brainstorming', file: '../secrets.txt' });
    expect(traversal).toEqual({ success: false, error: 'Invalid skill file name' });
  });
});
