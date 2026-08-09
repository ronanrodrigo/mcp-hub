# mcp-hub

Hub privado de MCPs pronto para Vercel, implementado exclusivamente em JavaScript.

## Conceito

Cada MCP é um diretório dentro de `api/` com:

* `properties.json`: metadados do MCP e dos seus endpoints.
* Um ou mais handlers serverless em JavaScript.

A rota raiz descobre automaticamente todos os diretórios que contêm `properties.json`, agrega os metadados e os expõe em uma única resposta. Para adicionar um MCP, não é necessário editar o hub.

## Desenvolvimento local

Requisitos: Node.js 18+ e Vercel CLI.

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

Os testes cobrem autenticação, respostas dos endpoints, discovery e agregação das estatísticas.

## Autenticação

Todas as rotas atuais exigem o header:

```text
x-api-key: fixed-secret-key
```

A variável `API_KEY` tem precedência sobre a chave padrão. Em produção, configure `API_KEY` como variável de ambiente na Vercel; não comite segredos no repositório.

## Deploy na Vercel

1. Instale e autentique a Vercel CLI.
2. Execute `vercel` na raiz do projeto ou importe o repositório no painel da Vercel.
3. Configure `API_KEY` nas Environment Variables.
4. Faça o deploy de produção com `vercel --prod`.

O `vercel.json` define as funções e rotas necessárias.

## Rotas atuais

| Método | Rota | Autenticação |
|---|---|---|
| GET | `/` | `x-api-key` |
| GET | `/api/hello-world/hello-world` | `x-api-key` |

Exemplo:

```bash
curl -H "x-api-key: fixed-secret-key" https://seu-projeto.vercel.app/
```

## Adicionando um MCP

Siga este padrão:

```text
1. Criar api/novo-mcp/
2. Criar api/novo-mcp/properties.json com os metadados
3. Criar api/novo-mcp/novo-mcp.js com o handler
4. Criar tests/novo-mcp.test.js
```

O arquivo `properties.json` deve conter ao menos `name`, `version`, `description` e `endpoints`. O loader em `src/mcps-loader.js` lerá o arquivo automaticamente na próxima requisição à rota `/`.
