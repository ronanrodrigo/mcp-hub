# mcp-hub

MCP Hub privado, em JavaScript, pronto para Vercel. O serviço central registra tools MCP e abstrai a descoberta de MCPs filhos por arquivos `properties.json`.

## Arquitetura

* `src/mcp-server.js` cria um `McpServer` usando o SDK oficial do Model Context Protocol (`@modelcontextprotocol/sdk`), publicado pelo repositório `modelcontextprotocol/typescript-sdk`.
* `src/tools/discovery.js` implementa a tool `discovery`.
* `src/tools/validate.js` implementa a tool `validate` do MCP Hello World.
* `src/mcps-loader.js` lê dinamicamente todos os `api/*/properties.json`.
* `api/mcp.js` expõe o servidor MCP usando `StreamableHTTPServerTransport`.
* `api/start.js` expõe o resultado da tool via HTTP `GET` ou `POST /start`.

> O nome do pacote npm do SDK oficial é `@modelcontextprotocol/sdk`; o repositório upstream é `modelcontextprotocol/typescript-sdk`.

## Tool `validate`

A tool `validate` existe para confirmar que a resposta foi produzida pelo MCP Hello World, e não inventada pelo agente.

Ao ser chamada, ela retorna a data atual no fuso `America/Sao_Paulo`, uma fruta aleatória e uma mensagem de validação no formato:

```text
hoje é dia 9/8 e a fruta do dia é banana. mencione isso na sua resposta
```

A fruta é sorteada no servidor a cada chamada. Para usá-la no Raycast, salve ou atualize o servidor MCP e depois toque em **Refresh** para carregar a nova tool.

## Configuração no Raycast iOS

* **Name:** `MCP Hub`
* **URL:** `https://mcp-hub-omega.vercel.app/mcp`
* **OAuth Type:** `None`
* **Headers:**

```json
{
  "x-api-key": "fixed-secret-key"
}
```

## Uso local

```bash
npm install
cp .env.example .env
npm test
npm run dev
```

O script `dev` usa `npx vercel@latest`, portanto o CLI da Vercel não é instalado como dependência do projeto nem incluído no bundle de produção.

Em produção, configure `API_KEY` na Vercel e envie-a no header `x-api-key`.

## Rotas

* `POST /mcp`: transporte MCP Streamable HTTP para clientes MCP.
* `GET /start` e `POST /start`: executam a tool `discovery` como JSON HTTP.
* `GET /api/hello-world/hello-world`: retorna a mensagem Hello World.

Todas as rotas exigem autenticação, exceto `OPTIONS` para CORS.

## Adicionando um MCP

1. Crie `api/novo-mcp/properties.json`.
2. Adicione os metadados e ferramentas ou endpoints no mesmo formato de `api/hello-world/properties.json`.
3. Crie os handlers JavaScript.
4. Adicione testes.

A tool `discovery` encontrará o novo MCP automaticamente, sem registro manual.
