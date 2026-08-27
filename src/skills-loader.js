import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const installedSkillsDirectory = path.join(projectRoot, '.agents', 'skills');

function parseFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  const values = {};
  if (!match) return values;
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && value) values[key] = value;
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

export async function loadInstalledSkills(directory = installedSkillsDirectory) {
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }

  const skills = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    try {
      skills.push(await readSkill(path.join(directory, entry.name), entry.name));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

export function skillMcpMetadata(skills) {
  return {
    name: 'skills',
    version: 'dynamic',
    description: 'Skills installed from ronanrodrigo/skills via the Skills npm CLI.',
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

export async function getInstalledSkill(name, directory = installedSkillsDirectory) {
  return (await loadInstalledSkills(directory)).find((skill) => skill.name === name);
}
