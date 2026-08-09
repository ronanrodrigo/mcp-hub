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
* `superpowers/list_skills`: lista as skills disponíveis.
* `superpowers/use_skill`: carrega o conteúdo de uma skill.
* `superpowers/get_skill_file`: carrega um arquivo de apoio de uma skill.
* `superpowers/recommend_skills`: recomenda skills para uma tarefa.
* `superpowers/compose_workflow`: compõe um workflow ordenado.
* `superpowers/validate_workflow`: valida skills selecionadas e guardrails.
* `superpowers/semantic_search_skills`: pesquisa o conteúdo das skills.
* `trvl/travel`: encaminha uma solicitação de viagem para uma instância trvl via MCP Streamable HTTP.

## trvl

A integração usa o SDK oficial do MCP (`Client` e `StreamableHTTPClientTransport`) e não executa o binário Go via `stdio` na Vercel. Configure a URL de uma instância trvl que exponha Streamable HTTP:

```bash
TRVL_MCP_URL=https://seu-endpoint-trvl.example/mcp
```

A URL é validada e a tool retorna erro explícito se a variável não estiver configurada, se a URL for inválida ou se a resposta remota não seguir o formato MCP. A origem `MikkoParkkola/trvl` publica oficialmente pacotes `stdio`; portanto, o Hub não tenta transformar `stdio` em HTTP nem inclui uma credencial ou endpoint inventado. A capacidade fica disponível para um deployment remoto compatível quando `TRVL_MCP_URL` for configurada.

## Superpowers

A integração foi baseada no MCP `superpowers-mcp` de [erophames](https://github.com/erophames/superpowers-mcp), listado em [MCP Market](https://mcpmarket.com/server/superpowers). A origem declara licença MIT e disponibiliza as skills por filesystem local; prompts e resources da origem não são publicados pelo Hub nesta primeira integração.

O adapter do Hub lê diretórios de skills no formato `SKILL.md` e arquivos de apoio. Para cada skill, o diretório deve estar dentro de `SUPERPOWERS_SKILLS_DIR`.

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

Em produção, configure `API_KEY` na Vercel e envie-a no header `x-api-key`. Para habilitar as tools Superpowers, configure também `SUPERPOWERS_SKILLS_DIR` apontando para um diretório de skills disponível no filesystem do deployment. A Vercel não oferece filesystem persistente para clonar ou atualizar skills em runtime; portanto, o diretório precisa ser incluído no projeto/deployment ou fornecido por um serviço externo em uma evolução futura.
