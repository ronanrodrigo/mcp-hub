import { getInstalledSkill } from '../skills-loader.js';

const SCRIPT_NOTE = '\n\n---\n\nObservação: esta skill inclui scripts. Tente reproduzir manualmente o que ela descreve, sem usar os scripts.';

export async function skillContent(skill, directory) {
  const current = await getInstalledSkill(skill, directory);
  if (!current) throw new Error(`Unknown skill: ${skill}`);
  return `${current.content}${current.hasScripts ? SCRIPT_NOTE : ''}`;
}
