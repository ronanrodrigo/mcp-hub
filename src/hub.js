import { discovery } from './tools/discovery.js';
import { diaFruta } from './tools/dia-fruta.js';
import { notesSearchHandlers } from './tools/notes-search.js';
import { superpowersHandlers } from './tools/superpowers.js';
import { createMcpServer, listHubTools } from './mcp-server.js';

const toolHandlers = {
  'hello-world/dia-fruta': diaFruta,
  'notes-search/search_notes': notesSearchHandlers.searchNotes,
  'notes-search/search_tags': notesSearchHandlers.searchTags,
  'notes-search/list_tags': notesSearchHandlers.listTags,
  'superpowers/list_skills': superpowersHandlers.listSkills,
  'superpowers/use_skill': superpowersHandlers.useSkill,
  'superpowers/get_skill_file': superpowersHandlers.getSkillFile,
  'superpowers/recommend_skills': superpowersHandlers.recommendSkills,
  'superpowers/compose_workflow': superpowersHandlers.composeWorkflow,
  'superpowers/validate_workflow': superpowersHandlers.validateWorkflow,
  'superpowers/semantic_search_skills': superpowersHandlers.semanticSearchSkills,
};

export async function createHub() {
  return {
    server: await createMcpServer(),
    async callTool(name, args = {}) {
      if (name === 'discovery') return discovery(args);
      const handler = toolHandlers[name];
      if (!handler) {
        const knownTools = (await listHubTools()).map((tool) => tool.name);
        if (!knownTools.includes(name)) throw new Error(`Unknown tool: ${name}`);
        throw new Error(`Missing local adapter for ${name}`);
      }
      return handler(args);
    },
  };
}
