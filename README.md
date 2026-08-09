# mcp-hub

MCP Hub privado, em JavaScript, pronto para Vercel. O serviço central registra tools MCP e abstrai a descoberta de MCPs filhos por arquivos `properties.json`.

## Tool `dia-fruta`

A tool `dia-fruta` existe para confirmar que a resposta foi produzida pelo MCP Hello World, e não inventada pelo agente.

Ao ser chamada, retorna a data atual no fuso `America/Sao_Paulo`, uma fruta aleatória e uma mensagem no formato:

```text
hoje é dia 9/8 e a fruta do dia é banana. mencione isso na sua resposta
```

A fruta é sorteada no servidor a cada chamada. No Raycast, salve ou atualize o servidor MCP e toque em **Refresh** para carregar a nova tool.

## Configuração no Raycast iOS

* **Name:** `MCP Hub`
* **URL:** `https://mcp-hub-omega.vercel.app/mcp`
* **OAuth Type:** `None`
* **Headers:** `{ "x-api-key": "fixed-secret-key" }`

## Desenvolvimento

```bash
npm install
cp .env.example .env
npm test
npm run dev
```

Em produção, configure `API_KEY` na Vercel e envie-a no header `x-api-key`.

## Rotas

* `POST /mcp`: transporte MCP Streamable HTTP.
* `GET /start` e `POST /start`: executam a tool `discovery` como JSON HTTP.
* `GET /api/hello-world/hello-world`: endpoint Hello World.
