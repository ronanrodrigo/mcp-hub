# mcp-hub

MCP Hub privado em JavaScript, pronto para Vercel. O Hub expõe tools próprias e registra automaticamente as tools declaradas nos `properties.json` dos MCPs adicionados.

## Namespacing das tools

Todas as tools dos MCPs filhos são publicadas com o nome:

```text
{nome-do-mcp}/{tool}
```

Exemplo:

```text
hello-world/dia-fruta
```

Isso evita colisões entre tools com o mesmo nome em MCPs diferentes. A tool interna do Hub continua sendo:

```text
discovery
```

O loader lê `api/*/properties.json` em cada inicialização. Para cada item do array `tools`, o Hub registra uma tool MCP namespaced e executa o adapter correspondente.

## Tools atuais

* `discovery`: lista o Hub e os MCPs descobertos.
* `hello-world/dia-fruta`: retorna a data atual e uma fruta aleatória.
* `world-monitor/*`: encaminha as tools de inteligência do World Monitor por Streamable HTTP para `https://worldmonitor.app/mcp`.

A integração World Monitor usa `WORLD_MONITOR_MCP_URL` opcionalmente para substituir o endpoint padrão e `WORLD_MONITOR_API_KEY` opcionalmente para enviar o header `X-WorldMonitor-Key`. Chamadas remotas sem resposta válida ou com falha retornam `success: false`.

## Configuração no Raycast iOS

* **Name:** `MCP Hub`
* **URL:** `https://mcp-hub-omega.vercel.app/mcp`
* **OAuth Type:** `None`
* **Headers:** `{ "x-api-key": "fixed-secret-key" }`

Depois de salvar, toque em **Refresh** para carregar todas as tools.

## Desenvolvimento

```bash
npm install
cp .env.example .env
npm test
npm run dev
```

Em produção, configure `API_KEY` na Vercel e envie-a no header `x-api-key`.
