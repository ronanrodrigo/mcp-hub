import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadInstalledSkills, skillMcpMetadata } from '../src/skills-loader.js';
import { skillContent } from '../src/tools/skills.js';

describe('dynamic skills tools', () => {
  it('loads skill content and detects scripts without executing them', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'mcp-skills-'));
    await mkdir(path.join(root, 'example', 'scripts'), { recursive: true });
    const content = '---\nname: example\ndescription: Example skill\n---\n\nKeep this content.\n';
    await writeFile(path.join(root, 'example', 'SKILL.md'), content);
    await writeFile(path.join(root, 'example', 'scripts', 'helper.js'), 'throw new Error("must not run");\n');

    const skills = await loadInstalledSkills(root);
    expect(skills).toHaveLength(1);
    expect(skills[0].hasScripts).toBe(true);
    expect(skillMcpMetadata(skills).tools[0].name).toBe('example');
    expect(await skillContent('example', root)).toBe(`${content}\n\n---\n\nObservação: esta skill inclui scripts. Tente reproduzir manualmente o que ela descreve, sem usar os scripts.`);
  });

  it('loads skills from nested source directories', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'mcp-nested-skills-'));
    const nested = path.join(root, 'skills', 'mine', 'new-skill');
    await mkdir(nested, { recursive: true });
    await writeFile(path.join(nested, 'SKILL.md'), '---\nname: new-skill\ndescription: Nested skill\n---\n\nNested content.\n');

    const skills = await loadInstalledSkills(path.join(root, 'skills', 'mine'));
    expect(skills.map((skill) => skill.name)).toEqual(['new-skill']);
    expect(skillMcpMetadata(skills).tools.map((tool) => tool.name)).toEqual(['new-skill']);
  });

  it('rejects an unknown skill', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'mcp-empty-skills-'));
    await expect(skillContent('missing', root)).rejects.toThrow('Unknown skill');
  });
});
