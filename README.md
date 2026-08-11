# mcp-hub

MCP Hub privado em JavaScript, pronto para Vercel. O Hub expõe tools próprias e registra automaticamente as tools declaradas nos `properties.json` dos MCPs adicionados.

## Namespacing das tools

Todas as tools dos MCPs filhos são publicadas com o nome `{nome-do-mcp}/{tool}`. A tool interna do Hub continua sendo `discovery`.

## Tools atuais

* `discovery`: lista o Hub e os MCPs descobertos.
* `hello-world/dia-fruta`: retorna a data atual e uma fruta aleatória.
* `notes-search/search_notes`: pesquisa notas técnicas com correspondência exata, parcial, por tokens e fuzzy search.
* `notes-search/search_tags`: pesquisa tags com correspondência exata, parcial e fuzzy search.
* `notes-search/list_tags`: lista ou ranqueia as tags disponíveis.

## Notes Search

A integração `notes-search` consome somente os índices públicos de `ronanrodrigo.dev`:

* `https://ronanrodrigo.dev/notes/index.json`
* `https://ronanrodrigo.dev/notes/list-tags.json`
* `https://ronanrodrigo.dev/notes/agent/`

A busca normaliza acentos e combina correspondência de frase, tokens, substrings e distância de edição. A integração é somente leitura, não aceita URLs arbitrárias e não executa código remoto.

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
npm run test:coverage
npm run dev
```

Em produção, configure `API_KEY` na Vercel e envie-a no header `x-api-key`.
