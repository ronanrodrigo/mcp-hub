# mcp-hub

MCP Hub privado em JavaScript, pronto para Vercel. O Hub expõe tools próprias e registra automaticamente as tools declaradas nos `properties.json` dos MCPs adicionados.

## Namespacing das tools

Todas as tools dos MCPs filhos são publicadas com o nome:

```text
{nome-do-mcp}/{tool}
```

A tool interna do Hub continua sendo `discovery`.

## Tools atuais

* `discovery`: lista o Hub e os MCPs descobertos.
* `hello-world/dia-fruta`: retorna a data atual e uma fruta aleatória.
* `notes-search/search_notes`: pesquisa notas técnicas com correspondência exata, parcial, por tokens e fuzzy search.
* `notes-search/search_tags`: pesquisa tags com correspondência exata, parcial e fuzzy search.
* `notes-search/list_tags`: lista ou ranqueia as tags disponíveis.

## Notes Search

A integração `notes-search` consome somente os índices públicos e somente leitura de `ronanrodrigo.dev`:

* `https://ronanrodrigo.dev/notes/index.json`: notas, slugs, caminhos, datas, descrições e tags.
* `https://ronanrodrigo.dev/notes/list-tags.json`: índice de tags e URLs.
* `https://ronanrodrigo.dev/notes/agent/`: contexto e orientações de uso da base.

A busca normaliza acentos e combina correspondência de frase, tokens, substrings e distância de edição. Os resultados incluem uma pontuação de relevância. A integração não altera o conteúdo, não executa código remoto e não aceita URLs arbitrárias.

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
npm run test:coverage
npm run dev
```

Em produção, configure `API_KEY` na Vercel e envie-a no header `x-api-key`.
