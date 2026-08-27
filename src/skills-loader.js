import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultSkillDirectories = [
  path.join(projectRoot, 'installed-skills'),
  path.join(projectRoot, 'src', 'installed-skills'),
  path.join(projectRoot, '.codex', 'skills'),
  path.join(projectRoot, '.claude', 'skills'),
  path.join(projectRoot, '.cursor', 'skills'),
  path.join(projectRoot, '.windsurf', 'skills'),
  path.join(projectRoot, '.github', 'skills'),
];

function parseFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  const values = {};
  if (!match) return values;
  let currentKey;
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':');
    if (separator >= 0) {
      currentKey = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim();
      values[currentKey] = value === '>-' || value === '|' ? '' : value.replace(/^['"]|['"]$/g, '');
    } else if (currentKey && line.trim()) {
      values[currentKey] = `${values[currentKey]} ${line.trim()}`.trim();
    }
  }
  return values;
}

async function hasScripts(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'scripts' && entry.isDirectory()) return true;
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      if (await hasScripts(path.join(directory, entry.name))) return true;
    }
  }
  return false;
}

async function readSkill(directory, directoryName) {
  const skillPath = path.join(directory, 'SKILL.md');
  const content = await fs.readFile(skillPath, 'utf8');
  const frontMatter = parseFrontMatter(content);
  const name = frontMatter.name || directoryName;
  return {
    name,
    description: frontMatter.description || `Use the ${name} agent skill.`,
    content,
    hasScripts: await hasScripts(directory),
    sourcePath: skillPath,
  };
}

export async function loadInstalledSkills(directory) {
  const directories = directory ? [directory] : defaultSkillDirectories;
  const skills = new Map();
  for (const candidate of directories) {
    let entries;
    try {
      entries = await fs.readdir(candidate, { withFileTypes: true });
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      try {
        const skill = await readSkill(path.join(candidate, entry.name), entry.name);
        if (!skills.has(skill.name)) skills.set(skill.name, skill);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
  }
  return [...skills.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function skillMcpMetadata(skills) {
  return {
    name: 'skills',
    version: 'dynamic',
    description: 'Skills installed from ronanrodrigo/skills during the build.',
    author: 'ronanrodrigo',
    source: 'https://github.com/ronanrodrigo/skills',
    transport: 'streamable-http',
    tags: ['skills', 'agents', 'instructions'],
    tools: skills.map((skill) => ({
      name: skill.name,
      title: skill.name,
      description: skill.description,
      inputSchema: { type: 'object', properties: {}, required: [], additionalProperties: false },
    })),
    endpoints: [],
  };
}

export async function getInstalledSkill(name, directory) {
  return (await loadInstalledSkills(directory)).find((skill) => skill.name === name);
}
