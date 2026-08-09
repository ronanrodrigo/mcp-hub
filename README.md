# mcp-hub

Hub privado de MCPs pronto para Vercel, implementado exclusivamente em JavaScript e usando o SDK oficial do Model Context Protocol.

## SDK e transporte

O MCP `hello-world` usa [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk) para abstrair o protocolo, o registro de tools e o transporte **Streamable HTTP**.

A implementação está separada em duas camadas:

* `src/mcp-server.js`: cria o servidor MCP e registra as tools.
* `api/hello-world/mcp.js`: autentica a requisição, conecta o servidor ao transporte e expõe o endpoint serverless.

O endpoint MCP é compatível com clientes MCP que suportam Streamable HTTP. A resposta usa JSON quando possível e segue JSON-RPC 2.0.

## Discovery dinâmico

Cada MCP é um diretório dentro de `api/` com:

* `properties.json`: metadados do MCP, SDK, transporte e endpoints.
* Um ou mais handlers serverless em JavaScript.

A rota raiz descobre automaticamente todos os diretórios que contêm `properties.json`, agrega os metadados e os expõe em uma única resposta. Para adicionar um MCP, não é necessário editar o hub.

## Desenvolvimento local

Requisitos: Node.js 22+ e Vercel CLI.

```bash
npm install
npm run dev
```

A chave padrão local é `fixed-secret-key`. Para alterar:

```bash
API_KEY=minha-chave npm run dev
```

## Testes

```bash
npm test
npm run test:coverage
```

Os testes são executados automaticamente pelo GitHub Actions em pushes para `main` e em pull requests.

## Autenticação

Todas as rotas atuais exigem o header:

```text
x-api-key: fixed-secret-key
```

A variável `API_KEY` tem precedência sobre a chave padrão. Em produção, configure `API_KEY` como variável de ambiente na Vercel; não comite segredos no repositório.

## Deploy na Vercel

1. Importe o repositório no painel da Vercel.
2. Use o preset `Other`.
3. Mantenha o Root Directory como `./`.
4. Deixe Build Command e Output Directory vazios.
5. Configure `API_KEY` nas Environment Variables.
6. Faça o deploy.

A Vercel detectará os handlers JavaScript dentro de `api/`. O `vercel.json` define os rewrites das rotas públicas.

## Rotas atuais

| Método | Rota | Autenticação | Função |
|---|---|---|---|
| GET | `/` | `x-api-key` | Catálogo agregado dos MCPs |
| POST/GET/DELETE | `/api/hello-world/mcp` | `x-api-key` | Endpoint MCP Streamable HTTP |
| GET | `/api/hello-world/hello-world` | `x-api-key` | Endpoint HTTP legado |

## Adicionando um MCP

Siga este padrão:

```text
1. Criar api/novo-mcp/
2. Criar api/novo-mcp/properties.json com os metadados
3. Criar src/novo-mcp-server.js usando McpServer
4. Registrar tools, resources ou prompts com o SDK
5. Criar api/novo-mcp/mcp.js e conectar o servidor ao transporte
6. Criar tests/novo-mcp.test.js
7. Adicionar a rota do MCP ao vercel.json
```

Exemplo de registro de tool:

```javascript
server.registerTool(
  "nome_da_tool",
  {
    description: "Descrição da tool",
    inputSchema: {
      value: "string"
    }
  },
  async ({ value }) => ({
    content: [{ type: "text", text: value }]
  })
);
```

O loader em `src/mcps-loader.js` lerá o `properties.json` automaticamente na próxima requisição à rota `/`.
