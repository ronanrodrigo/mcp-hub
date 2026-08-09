# mcp-hub

MCP Hub privado em JavaScript, pronto para Vercel. O Hub expõe tools próprias e registra automaticamente as tools declaradas nos `properties.json` dos MCPs adicionados.

## Namespacing das tools

Todas as tools dos MCPs filhos são publicadas com o nome `{nome-do-mcp}/{tool}`. A tool interna do Hub continua sendo `discovery`.

## Tools atuais

* `discovery`
* `hello-world/dia-fruta`
* `superpowers/list_skills`, `superpowers/use_skill`, `superpowers/get_skill_file`, `superpowers/recommend_skills`, `superpowers/compose_workflow`, `superpowers/validate_workflow`, `superpowers/semantic_search_skills`
* `trvl/plan_natural`: encaminha uma solicitação de viagem para uma instância trvl via MCP Streamable HTTP.

## trvl

A integração usa `Client` e `StreamableHTTPClientTransport` do SDK oficial do MCP e não executa o binário Go via `stdio` na Vercel. Configure uma URL de uma instância trvl que exponha Streamable HTTP em `TRVL_MCP_URL`. A versão pública consultada do projeto (`1.21.0`) registra a tool MCP `plan_natural` e publica pacotes `stdio`; o Hub não inventa um endpoint HTTP nem inclui credenciais. Sem `TRVL_MCP_URL`, a tool falha explicitamente.

```bash
TRVL_MCP_URL=https://seu-endpoint-trvl.example/mcp
```

## Configuração no Raycast iOS

* **Name:** `MCP Hub`
* **URL:** `https://mcp-hub-omega.vercel.app/mcp`
* **OAuth Type:** `None`
* **Headers:** `{ "x-api-key": "fixed-secret-key" }`

Depois de salvar, toque em **Refresh**.

## Desenvolvimento

```bash
npm install
cp .env.example .env
npm test
npm run test:coverage
npm run dev
```

Em produção, configure `API_KEY` e `TRVL_MCP_URL` na Vercel. A origem trvl permanece responsável pelo transporte e pelas credenciais opcionais de seus próprios providers.
