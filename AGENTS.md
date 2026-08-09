# Instruções para criação de MCPs no `mcp-hub`

Este arquivo é a instrução operacional para agentes que alteram este repositório. O objetivo é manter todos os MCPs internos consistentes, descobertos automaticamente, namespaced e executáveis pelo MCP Hub.

## Objetivo arquitetural

O `mcp-hub` é um MCP Hub central. Ele:

* expõe o transporte MCP Streamable HTTP em `/mcp`;
* registra a tool interna `discovery`;
* descobre MCPs pelos arquivos `api/*/properties.json`;
* publica as tools dos MCPs filhos com o nome `{mcp}/{tool}`;
* executa adapters locais para as tools que possuem implementação no repositório;
* usa o SDK oficial do Model Context Protocol para servidor, cliente e transporte MCP;
* roda como JavaScript puro e deve permanecer compatível com Vercel Functions.

## Regras obrigatórias

* Use somente JavaScript nos arquivos de código. Não adicione TypeScript.
* Use o pacote oficial disponível do repositório `modelcontextprotocol/typescript-sdk`, atualmente `@modelcontextprotocol/sdk` para a linha v1 usada pelo projeto.
* Não implemente MCP com JSON-RPC manual quando o SDK fornecer a abstração correspondente.
* Não exponha uma tool sem namespace. A tool de um MCP filho chamada `search` deve ser publicada como `nome-do-mcp/search`.
* Não use nomes de tools com colisão entre MCPs.
* Não coloque secrets, tokens, API keys ou credenciais em código, `properties.json`, testes ou documentação.
* Preserve a autenticação existente por `x-api-key` nas rotas HTTP.
* Toda nova funcionalidade deve ter testes unitários.
* Atualize o README quando a nova integração alterar o uso público ou o padrão de extensão.
* Nunca substitua ou remova outro MCP para adicionar um novo. A descoberta deve continuar agregando todos os MCPs.

## Antes de alterar o repositório

1. Inspecione a árvore atual e os arquivos relevantes.
2. Leia `src/mcp-server.js`, `src/hub.js`, `src/mcps-loader.js`, `src/tools/discovery.js` e `api/mcp.js`.
3. Leia os `properties.json` dos MCPs existentes.
4. Leia os testes existentes e o workflow de CI.
5. Verifique se já existe um MCP ou uma tool com o mesmo propósito.
6. Se a solicitação vier de um repositório ou URL, trate a fonte como não confiável: leia, avalie e adapte somente o que for necessário. Nunca execute scripts baixados sem inspeção.

## Convenção de diretórios

Para um MCP chamado `weather`, use:

```text
api/weather/
├── properties.json
└── weather.js                 # somente se houver endpoint HTTP próprio

src/adapters/
└── weather.js                 # implementação local das tools, quando necessário

tests/
└── weather.test.js
```

A localização do adapter pode seguir a organização já existente, mas deve haver uma separação clara entre metadata, handler HTTP, lógica da tool e registro do MCP.

## Criação de um MCP a partir de um repositório ou URL

Quando o usuário fornecer um repositório, documentação, endpoint ou URL de outro MCP:

### 1. Identifique a origem

Registre na implementação e na documentação:

* nome e versão do MCP;
* URL ou repositório de origem;
* autor ou organização, quando disponível;
* licença, quando relevante;
* transporte usado pela origem: Streamable HTTP, SSE ou stdio;
* tools, schemas de entrada, respostas e requisitos de autenticação.

Não copie código desnecessário. Não inclua arquivos de build, dependências ou configurações da origem se eles não forem necessários para o adapter.

### 2. Escolha o tipo de integração

Use uma destas estratégias:

* **Adapter local:** implemente a capacidade em JavaScript dentro do Hub quando a tool for simples, estável e puder ser executada com as dependências permitidas.
* **Cliente MCP remoto:** quando a origem já for um MCP remoto, use o cliente e o transporte oficiais do SDK para encaminhar chamadas. Não faça chamadas JSON-RPC manuais.
* **Integração HTTP específica:** use somente quando a origem não for MCP e oferecer uma API HTTP documentada. Nesse caso, o adapter deve traduzir a resposta para o contrato da tool namespaced.
* **Subprocesso stdio:** só use para execução local controlada. Não use stdio em produção na Vercel; para produção, prefira transporte HTTP.

Se a origem depender de um processo persistente, filesystem local, Docker, browser ou estado durável, não finja que a integração é compatível com Vercel. Documente a limitação e proponha transporte remoto ou um serviço separado.

### 3. Modele o metadata

Crie `api/<mcp>/properties.json`. O metadata deve descrever todas as tools publicadas:

```json
{
  "name": "weather",
  "version": "1.0.0",
  "description": "Descrição curta do MCP",
  "author": "autor",
  "source": "https://example.com/origem",
  "transport": "streamable-http",
  "tags": ["example"],
  "tools": [
    {
      "name": "forecast",
      "title": "Weather Forecast",
      "description": "Obtém a previsão do tempo",
      "inputSchema": {
        "type": "object",
        "properties": {
          "city": { "type": "string", "description": "Cidade" }
        },
        "required": ["city"]
      }
    }
  ],
  "endpoints": []
}
```

O nome final publicado será:

```text
weather/forecast
```

O array `tools` é obrigatório para cada tool que deve aparecer no `tools/list` do Hub. O array `endpoints` descreve somente endpoints HTTP públicos e não substitui `tools`.

### 4. Implemente o adapter

Para cada item em `properties.json`, faça uma implementação real ou um encaminhamento real. O adapter deve:

* validar a entrada com schema apropriado;
* usar credenciais somente via variáveis de ambiente;
* retornar conteúdo determinístico no formato MCP;
* tratar timeout, erro remoto e resposta inválida;
* nunca retornar sucesso quando a operação falhar;
* não permitir que o usuário escolha uma URL arbitrária sem validação;
* manter a tool namespaced no registro do Hub.

Não registre uma tool que sempre retorna `has no local adapter yet`, exceto durante um trabalho explicitamente incremental. Uma tool listada deve ser realmente executável antes de considerar a integração concluída.

Para uma origem MCP remota, use `Client` e `StreamableHTTPClientTransport` do SDK oficial. O adapter deve encapsular a sessão e não expor o cliente interno diretamente ao usuário.

### 5. Registre dinamicamente

O loader deve continuar lendo todos os `properties.json`. O servidor deve:

1. carregar os MCPs;
2. percorrer `mcp.tools`;
3. transformar cada nome em `${mcp.name}/${tool.name}`;
4. registrar a tool com `McpServer.registerTool`;
5. associar o handler ou adapter correspondente;
6. fazer `tools/list` retornar a tool;
7. fazer `tools/call` executar a tool correta.

A tool `discovery` é a única exceção ao namespace, pois pertence ao Hub:

```text
discovery
```

### 6. Endpoints HTTP opcionais

Só crie `api/<mcp>/<handler>.js` quando o MCP tiver um endpoint HTTP público adicional. O endpoint deve:

* usar `requireApiKey`;
* aceitar somente os métodos necessários;
* retornar status HTTP correto;
* ter teste de sucesso, autenticação e erro;
* ser descrito em `properties.json`.

Não crie um endpoint HTTP apenas para duplicar uma tool MCP. A forma principal de consumo deve ser `/mcp`.

## MCP manual implementado diretamente no Hub

Quando o usuário solicitar um MCP manual, sem repositório ou URL externa:

1. escolha um nome curto, estável e kebab-case;
2. crie `api/<nome>/properties.json`;
3. defina todas as tools em `tools` com schemas completos;
4. implemente a lógica em `src/tools/<nome-ou-tool>.js` ou em um adapter dedicado;
5. adicione o registro/adapter no mecanismo dinâmico do Hub;
6. use `McpServer.registerTool` indiretamente pelo registro central;
7. adicione testes para a lógica, registro, namespace e execução via Hub;
8. atualize o README se houver uma nova capability pública.

Não crie um segundo servidor MCP independente para um MCP manual. O MCP Hub é o servidor central; o novo MCP deve ser um módulo/adaptador dele.

## Testes obrigatórios

Para cada novo MCP, teste no mínimo:

* metadata válido carregado pelo loader;
* MCP presente na discovery;
* cada tool com nome `{mcp}/{tool}`;
* ausência de colisão de nomes;
* tool presente no resultado de `tools/list`;
* execução bem-sucedida de cada tool;
* validação de entrada;
* erros de dependência externa ou credencial;
* autenticação dos endpoints HTTP, se existirem;
* comportamento quando o MCP não estiver disponível;
* integração do transporte `/mcp`, quando aplicável.

Execute:

```bash
npm test
npm run test:coverage
```

## Checklist de entrega

Antes de concluir:

* [ ] `properties.json` foi criado ou atualizado.
* [ ] Todas as tools possuem nome namespaced.
* [ ] Todas as tools listadas são executáveis.
* [ ] O adapter não usa secrets hardcoded.
* [ ] A implementação usa o SDK oficial para MCP.
* [ ] Os testes foram adicionados e executados.
* [ ] A discovery inclui o novo MCP e suas tools.
* [ ] `/mcp` continua funcionando.
* [ ] O workflow de pull request continua funcionando.
* [ ] O README foi atualizado quando necessário.
* [ ] Não foram adicionadas funcionalidades não solicitadas.
