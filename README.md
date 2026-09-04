# mcp-hub

MCP Hub privado em JavaScript, pronto para Vercel. O Hub expõe tools próprias e registra automaticamente as tools declaradas nos `properties.json` dos MCPs adicionados.

## Namespacing das tools

Todas as tools dos MCPs filhos são publicadas com o nome `{nome-do-mcp}/{tool}`. A tool interna do Hub continua sendo `discovery`.

## Skills dinâmicas

As skills de `https://github.com/ronanrodrigo/skills` são obtidas durante o build com um clone Git raso (`--depth 1`). O build copia somente os arquivos `SKILL.md` para `src/installed-skills`, sem scripts, testes ou fontes TypeScript da origem:

```bash
git clone --depth 1 https://github.com/ronanrodrigo/skills /tmp/skills-source
```

Cada diretório instalado que contém `SKILL.md` vira uma tool namespaced `skills/{nome-da-skill}`. A tool retorna o conteúdo textual puro do `SKILL.md`, sem executar scripts ou outros arquivos da skill. Quando a skill contém um diretório `scripts`, a resposta inclui uma observação para reproduzir manualmente suas instruções sem usar os scripts.

A descoberta acontece durante cada inicialização do servidor a partir dos arquivos instalados pelo build em `src/installed-skills`. O instalador procura recursivamente todos os `SKILL.md` do repositório, incluindo skills organizadas em subdiretórios. Portanto, adicionar ou atualizar uma skill no repositório de origem exige somente um novo deploy; não exige alteração no código do Hub. O build falha se o clone ou a cópia das skills falhar.

## Tools atuais

* `discovery`: lista o Hub e os MCPs descobertos.
* `hello-world/dia-fruta`: retorna a data atual e uma fruta aleatória.
* `notes-search/search_notes`: pesquisa notas técnicas com correspondência exata, parcial, por tokens e fuzzy search.
* `notes-search/search_tags`: pesquisa tags com correspondência exata, parcial e fuzzy search.
* `notes-search/list_tags`: lista ou ranqueia as tags disponíveis.
* `notes-search/get_note`: busca o conteúdo markdown completo de uma nota pelo slug (aceita também a URL do post ou a markdown_url).
* `skills/{nome-da-skill}`: retorna o conteúdo puro de cada skill instalada do repositório de skills.

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
