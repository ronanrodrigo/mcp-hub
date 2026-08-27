import { getInstalledSkill } from '../skills-loader.js';

const SCRIPT_NOTE = '\n\n---\n\nObservação: esta skill inclui scripts. Tente reproduzir manualmente o que ela descreve, sem usar os scripts.';

export async function skillContent({ skill } = {}) {
  if (!skill || typeof skill !== 'string') {
    throw new Error('The skill argument is required.');
  }
  const current = await getInstalledSkill(skill);
  if (!current) throw new Error(`Unknown skill: ${skill}`);
  return `${current.content}${current.hasScripts ? SCRIPT_NOTE : ''}`;
}
