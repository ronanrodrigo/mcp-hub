import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { discovery, discoveryTool } from './tools/discovery.js';
import { diaFruta, diaFrutaTool } from './tools/dia-fruta.js';
import { superpowersHandlers } from './tools/superpowers.js';
import { loadAllMCPs } from './mcps-loader.js';

const localToolHandlers = {
  'hello-world/dia-fruta': diaFruta,
  'superpowers/list_skills': superpowersHandlers.listSkills,
  'superpowers/use_skill': superpowersHandlers.useSkill,
  'superpowers/get_skill_file': superpowersHandlers.getSkillFile,
  'superpowers/recommend_skills': superpowersHandlers.recommendSkills,
  'superpowers/compose_workflow': superpowersHandlers.composeWorkflow,
  'superpowers/validate_workflow': superpowersHandlers.validateWorkflow,
  'superpowers/semantic_search_skills': superpowersHandlers.semanticSearchSkills,
};

function registerJsonTool(server, tool, handler) {
  server.registerTool(tool.name, {
    title: tool.title,
    description: tool.description,
    inputSchema: tool.inputSchema || {},
  }, async (args) => {
    const result = await handler(args || {});
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
      structuredContent: result,
      ...(result?.success === false ? { isError: true } : {}),
    };
  });
}

function metadataToolToDefinition(mcp, metadataTool) {
  const name = `${mcp.name}/${metadataTool.name}`;
  return {
    name,
    title: metadataTool.title || `${mcp.name}: ${metadataTool.name}`,
    description: metadataTool.description || `Execute ${metadataTool.name} from MCP ${mcp.name}`,
    inputSchema: metadataTool.inputSchema || {},
  };
}

export async function createMcpServer() {
  const server = new McpServer({ name: 'mcp-hub', version: '1.0.0' });
  registerJsonTool(server, discoveryTool, discovery);

  const mcps = await loadAllMCPs();
  for (const mcp of mcps) {
    for (const metadataTool of mcp.tools || []) {
      const tool = metadataToolToDefinition(mcp, metadataTool);
      const handler = localToolHandlers[tool.name];
      if (!handler) throw new Error(`Missing local adapter for ${tool.name}`);
      registerJsonTool(server, tool, handler);
    }
  }

  return server;
}

export async function listHubTools() {
  const mcps = await loadAllMCPs();
  return [
    discoveryTool,
    ...mcps.flatMap((mcp) => (mcp.tools || []).map((tool) => metadataToolToDefinition(mcp, tool))),
  ];
}
