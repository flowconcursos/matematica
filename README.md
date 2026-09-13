# Painel de treino de matemática para concursos públicos

Instrumento pessoal de diagnóstico e treino de matemática/raciocínio lógico.
Ver o documento de produto completo para contexto, princípios e o roteiro
de fases — este README cobre só o estado técnico atual.

## Status: Fase 1 — Fundação

Entregue nesta fase:

- Projeto Next.js (App Router) + TypeScript + Tailwind.
- Banco Postgres via Drizzle ORM, com as tabelas `topico`, `questao`
  (com tópicos N:N) e `tentativa`.
- Autenticação por senha única (`APP_PASSWORD`), sessão em cookie
  `httpOnly` assinado (JWT via `jose`), válida por 30 dias, bloqueando
  toda rota e toda API via `src/proxy.ts` (Proxy — antigo Middleware no
  Next.js 16) + verificação redundante em cada rota de API.
- PWA instalável: manifest, ícones, tema.
- Sessão de treino com cronômetro baseado em timestamp (resiliente a
  tela bloqueada/troca de app), fluxo de registro na ordem obrigatória
  (confiança → resposta → gabarito → causa do erro), e fila offline via
  IndexedDB (`idb-keyval`) que sincroniza quando a rede volta.
- Cadastro manual de tópicos e questões.
- Cálculo de acerto firme (`src/lib/calculo.ts`) coberto por testes
  (`npm run test`).
- Seed de ~60 tentativas de teste cobrindo as 7 áreas
  (`npm run db:seed`).

Fora do escopo desta fase (chegam depois, conforme o roteiro): painel
com métricas agregadas, caderno de erros/repetição espaçada, qualquer
camada de IA, grafo de pré-requisitos/trilha, importação de PDF,
dossiê de banca e simulado.

## Decisões provisórias tomadas nesta fase

- **Meta de tempo por questão** (`src/lib/meta-tempo.ts`): como o
  documento de produto não define isso e o cálculo de acerto firme
  depende de uma meta desde já, foi definida uma tabela fixa de
  segundos por área/nível, editável nesse arquivo. Fica provisória até
  a Fase 3, quando a IA passa a estimar tempo razoável por questão
  (Tarefa A). O valor vigente no momento de cada tentativa é congelado
  em `meta_segundos_na_epoca`, então mudar a tabela não altera
  histórico.
- **Banco de dados de desenvolvimento**: este ambiente usa um Postgres
  local (não há acesso a Neon/Vercel a partir daqui). Em produção, basta
  apontar `DATABASE_URL` para o Neon — o schema e as migrations do
  Drizzle são compatíveis.
- **Deploy**: esta sessão não tenta publicar na Vercel. O projeto está
  pronto para deploy (build passa, variáveis de ambiente documentadas
  abaixo), mas a publicação em si é manual.

## Rodando localmente

Pré-requisitos: Node 22+, Postgres acessível.

```bash
cp .env.example .env   # preencha DATABASE_URL, APP_PASSWORD, SESSION_SECRET
npm install
npm run db:migrate     # aplica o schema
npm run db:seed        # opcional: popula ~60 tentativas de teste
npm run dev
```

### Variáveis de ambiente

| Variável        | Descrição                                                        |
| --------------- | ----------------------------------------------------------------- |
| `DATABASE_URL`  | Connection string do Postgres (Neon em produção).                 |
| `APP_PASSWORD`  | Senha única de acesso ao app.                                     |
| `SESSION_SECRET`| Segredo para assinar o cookie de sessão. Gere com `openssl rand -base64 32`. |

### Scripts

- `npm run dev` — servidor de desenvolvimento.
- `npm run build` / `npm run start` — build e execução de produção.
- `npm run test` — testes unitários (vitest).
- `npm run lint` — lint.
- `npm run db:generate` — gera migration a partir do schema (`src/db/schema.ts`).
- `npm run db:migrate` — aplica migrations pendentes.
- `npm run db:seed` — recria tópicos/questões/tentativas de teste (apaga os anteriores).

## Estrutura

```
src/
  app/            rotas (App Router): páginas, API routes, server actions
  components/     componentes de UI compartilhados
  db/             schema Drizzle, cliente do banco, seed
  lib/            regras de negócio (acerto firme, meta de tempo, sessão, fila offline)
```
