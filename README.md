# mcp-hub

MCP Hub privado, em JavaScript, pronto para Vercel. O serviço central registra a tool MCP `discovery` e abstrai a descoberta de MCPs filhos por arquivos `properties.json`.

## Arquitetura

* `src/mcp-server.js` cria um `McpServer` usando o SDK oficial do Model Context Protocol (`@modelcontextprotocol/sdk`), publicado pelo repositório `modelcontextprotocol/typescript-sdk`.
* `src/tools/discovery.js` implementa a tool `discovery`.
* `src/mcps-loader.js` lê dinamicamente todos os `api/*/properties.json`.
* `api/start.js` expõe o resultado da execução da tool via HTTP `GET` ou `POST /start`.
* Cada MCP pode ter seu próprio handler HTTP e metadata estático.

> O nome do pacote npm do SDK oficial é `@modelcontextprotocol/sdk`; o repositório upstream é `modelcontextprotocol/typescript-sdk`.

## Uso local

```bash
npm install
cp .env.example .env
npm test
npm run dev
```

O script `dev` usa `npx vercel@latest`, portanto o CLI da Vercel não é instalado como dependência do projeto nem incluído no bundle de produção.

A chave padrão é `fixed-secret-key`. Em produção, configure `API_KEY` na Vercel. Envie-a no header `x-api-key`.

## Rotas

* `GET /start` e `POST /start`: executam a tool MCP `discovery`.
* `GET /api/hello-world/hello-world`: retorna `{ "success": true, "message": "Hello World" }`.

Todas as rotas exigem autenticação. Sem chave ou com chave incorreta, retornam `401`.

## Adicionando um MCP

1. Crie `api/novo-mcp/properties.json`.
2. Adicione os metadados e seus endpoints no mesmo formato de `api/hello-world/properties.json`.
3. Crie os handlers JavaScript do MCP.
4. Adicione testes.

A tool `discovery` encontrará o novo MCP automaticamente, sem registro manual.

## Deploy

O projeto fixa o runtime de build e funções no Node.js `24.x`, evitando upgrades automáticos de major do Node.js na Vercel. Importe o repositório na Vercel, configure `API_KEY` nas Environment Variables e faça o deploy.

O workflow `.github/workflows/tests.yml` executa os testes em cada pull request.
