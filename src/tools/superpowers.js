import fs from 'node:fs/promises';
import path from 'node:path';

const SKILLS_DIR = () => process.env.SUPERPOWERS_SKILLS_DIR;
const missing = () => ({ success: false, error: 'SUPERPOWERS_SKILLS_DIR is not configured or does not exist' });

async function readSkills() {
  const dir = SKILLS_DIR();
  if (!dir) return null;
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const skills = [];
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      const skillPath = path.join(dir, entry.name);
      try {
        const content = await fs.readFile(path.join(skillPath, 'SKILL.md'), 'utf8');
        const description = content.match(/^description:\s*(.+)$/mi)?.[1]?.trim() || content.split('\n').find(Boolean)?.trim() || '';
        const files = (await fs.readdir(skillPath, { withFileTypes: true }))
          .filter((file) => file.isFile() && file.name !== 'SKILL.md' && !file.name.startsWith('.'))
          .map((file) => file.name);
        skills.push({ name: entry.name, description, files, content, skillPath });
      } catch { /* Ignore directories without a valid SKILL.md. */ }
    }
    return skills.sort((a, b) => a.name.localeCompare(b.name));
  } catch { return null; }
}

function words(text) { return new Set(String(text || '').toLowerCase().split(/[^a-z0-9-]+/).filter((word) => word.length > 2)); }
function rank(skills, query) {
  const queryWords = words(query);
  return skills.map((skill) => {
    const haystack = `${skill.name} ${skill.description} ${skill.content}`.toLowerCase();
    const score = [...queryWords].reduce((total, word) => total + (haystack.includes(word) ? 1 : 0), 0);
    return { name: skill.name, description: skill.description, score };
  }).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}
function error(message) { return { success: false, error: message }; }

export async function listSkills() {
  const skills = await readSkills(); if (!skills) return missing();
  return { success: true, skills: skills.map(({ name, description, files }) => ({ name, description, files })) };
}
export async function useSkill({ name, goal = '', enforce_guardrails = false } = {}) {
  const skills = await readSkills(); if (!skills) return missing();
  const skill = skills.find((item) => item.name === name); if (!skill) return error(`Skill '${name}' not found`);
  if (enforce_guardrails && /implement|build|code|feature/i.test(goal) && name === 'executing-plans') {
    const names = new Set(skills.map((item) => item.name));
    if (names.has('writing-plans') && !goal.toLowerCase().includes('plan')) return error('Guardrail requires writing-plans before executing-plans');
  }
  return { success: true, name: skill.name, content: skill.content };
}
export async function getSkillFile({ skill, file } = {}) {
  const skills = await readSkills(); if (!skills) return missing();
  const item = skills.find((entry) => entry.name === skill); if (!item) return error(`Skill '${skill}' not found`);
  if (!file || file.includes('/') || file.includes('\\') || file === '..') return error('Invalid skill file name');
  if (!item.files.includes(file)) return error(`File '${file}' not found in skill '${skill}'`);
  try { return { success: true, skill, file, content: await fs.readFile(path.join(item.skillPath, file), 'utf8') }; }
  catch { return error(`Unable to read '${file}' from skill '${skill}'`); }
}
export async function recommendSkills({ task, repo_context = '', max_results = 5 } = {}) {
  const skills = await readSkills(); if (!skills) return missing();
  return { success: true, recommendations: rank(skills, `${task} ${repo_context}`).slice(0, max_results) };
}
export async function composeWorkflow({ goal, max_steps = 6 } = {}) {
  const skills = await readSkills(); if (!skills) return missing();
  const ranked = rank(skills, goal).filter((item) => item.score > 0);
  const preferred = ['brainstorming', 'writing-plans', 'test-driven-development', 'verification-before-completion'];
  const ordered = [...preferred.map((name) => ranked.find((item) => item.name === name)).filter(Boolean), ...ranked.filter((item) => !preferred.includes(item.name))];
  return { success: true, goal, workflow: ordered.slice(0, max_steps).map(({ name, description }) => ({ name, description })) };
}
export async function validateWorkflow({ goal, selected_skills = [], enforce_order = true } = {}) {
  const skills = await readSkills(); if (!skills) return missing();
  const available = new Set(skills.map((skill) => skill.name));
  const unknown = selected_skills.filter((name) => !available.has(name));
  const needsPlanning = /implement|build|feature|develop|code/i.test(goal);
  const planIndex = selected_skills.indexOf('writing-plans');
  const tddIndex = selected_skills.indexOf('test-driven-development');
  const violations = [...unknown.map((name) => `Unknown skill '${name}'.`)];
  if (needsPlanning && !selected_skills.includes('writing-plans')) violations.push('writing-plans is recommended for implementation goals.');
  if (enforce_order && tddIndex >= 0 && planIndex >= 0 && tddIndex < planIndex) violations.push('writing-plans should precede test-driven-development.');
  return { success: true, valid: violations.length === 0, violations };
}
export async function semanticSearchSkills({ query, skill, max_results = 5 } = {}) {
  const skills = await readSkills(); if (!skills) return missing();
  const selected = skill ? skills.filter((item) => item.name === skill) : skills;
  return { success: true, matches: rank(selected, query).slice(0, max_results).map((item) => ({ ...item, file: 'SKILL.md' })) };
}

export const superpowersHandlers = { listSkills, useSkill, getSkillFile, recommendSkills, composeWorkflow, validateWorkflow, semanticSearchSkills };
