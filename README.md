# Painel de treino de matemática para concursos públicos

Instrumento pessoal de diagnóstico e treino de matemática/raciocínio lógico.
Ver o documento de produto completo para contexto, princípios e o roteiro
de fases — este README cobre só o estado técnico atual.

## Status: Fase 4 — Base (trilha)

Entregue na Fase 1 (fundação):

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
- Cálculo de acerto firme (`src/lib/calculo.ts`) coberto por testes.

Entregue na Fase 2 (memória):

- Tabela `revisao` (repetição espaçada) e `src/lib/revisao.ts`: agendamento
  por etapas (intervalos 1/3/7/21 dias), reabertura ao errar, graduação
  (`concluida_em`) ao acertar na última etapa — coberto por testes.
- Toda tentativa registrada atualiza a revisão da questão como efeito
  colateral (`src/lib/revisao-db.ts`), chamado a partir de
  `POST /api/tentativas`.
- `/caderno`: fila de revisões vencidas ordenada por erros acumulados,
  reaproveitando o mesmo fluxo de registro da sessão de treino (extraído
  para `src/components/RegistroTentativa.tsx`); item errado 3 vezes
  seguidas sai da fila normal e vira alerta de possível buraco de
  pré-requisito (`src/lib/revisao.ts#temAlertaPrerequisito`).
- `src/lib/dominio.ts`: classificação de domínio por tópico (não avaliado
  / frágil / em construção / firme), coberta por testes.
- `/painel`: acerto firme, tempo médio, revisões vencidas, tópicos
  firmes/avaliados, calibração por confiança declarada, causas de erro
  ao longo do tempo, constância diária (30 dias) e tempo médio por
  tópico — server component, sem chamada a IA.

Entregue na Fase 3 (IA básica):

- `src/lib/ai.ts` (lógica pura: modelos, retry com backoff exponencial,
  timeout — coberta por testes, nunca chama a API real) e
  `src/lib/ai-db.ts` (orquestração: verificação de orçamento diário,
  registro de uso, chamada ao `@google/genai`).
- Tabela `ai_usage` (tokens por chamada) e teto diário configurável via
  `AI_TETO_DIARIO_TOKENS` (em tokens totais/dia); ao estourar, novas
  chamadas são bloqueadas com aviso na interface (não falha em
  silêncio) — indicador visível na home.
- Tarefa A — classificador de questão (`POST /api/ia/classificar-questao`):
  sugere tópicos/pré-requisitos (ancorados nos tópicos já cadastrados,
  nunca inventa categoria nova), tipo de armadilha, competência real e
  tempo razoável estimado. Botão "Sugerir com IA" em `/questoes/nova`;
  a sugestão só pré-marca tópicos, o humano sempre confere antes de
  salvar.
- Tarefa B — explicação em 3 níveis (`POST /api/ia/explicacao`, tabela
  `explicacao`): curta, passo a passo, e "por que meu erro parecia
  certo" (usa a alternativa escolhida e a causa declarada). Liberada só
  depois que a resposta foi registrada; os dois primeiros níveis usam
  cache por questão, o terceiro é sempre gerado de novo. Feedback
  "foi útil?" por explicação.
- Toda chamada usa `responseSchema` (saída estruturada), nunca parsing
  de texto livre.

Entregue na Fase 4 (base):

- Tabela `prerequisito` (grafo dirigido de tópicos) e `src/lib/grafo.ts`:
  `haveriaCiclo` valida na escrita que uma nova aresta não fecha um
  ciclo (busca no grafo a partir do pré-requisito, seguindo as
  dependências existentes) — coberta por testes.
- `src/lib/trilha.ts`: `topicoLiberado` — um tópico só libera quando
  todos os seus pré-requisitos diretos estão "firme" — coberta por
  testes. Com isso, as 4 regras críticas do documento (acerto firme,
  repetição espaçada, ciclo no grafo, liberação de tópico) estão
  todas testadas.
- `/trilha`: lista de tópicos com domínio e estado de bloqueio,
  cadastro/remoção de pré-requisitos (erro amigável se criaria ciclo).
- Botão "não concordo com o bloqueio" → teste relâmpago de 5 questões
  do pré-requisito bloqueador; aprovado libera o tópico via uma tabela
  de override (`liberacao_manual` — não existe no doc como tabela
  nomeada, é a peça mínima para o "libera" persistir).
- Fluxo de fragilidade (`/trilha/reforco/[topicoId]`): conceito
  (descrição curta do tópico) → até 3 exemplos resolvidos em níveis
  crescentes (com explicação passo a passo da Tarefa B) → até 10
  questões de fixação → reavaliação (domínio recalculado ao final).
  Degrada com elegância quando o tópico tem poucas questões
  cadastradas, em vez de travar.

Fora do escopo (chegam depois, conforme o roteiro): importação de PDF,
dossiê de banca, simulado, heurísticas, diagnóstico periódico, gerador
de questões e tutor conversacional (Fases 5-6).

## Decisões provisórias tomadas

- **Meta de tempo por questão** (`src/lib/meta-tempo.ts`): como o
  documento de produto não define isso e o cálculo de acerto firme
  depende de uma meta desde já, foi definida uma tabela fixa de
  segundos por área/nível, editável nesse arquivo. Fica provisória até
  a Fase 3, quando a IA passa a estimar tempo razoável por questão
  (Tarefa A). O valor vigente no momento de cada tentativa é congelado
  em `meta_segundos_na_epoca`, então mudar a tabela não altera
  histórico.
- **Limiares de domínio do tópico** (`src/lib/dominio.ts`): o documento só
  define os números de "firme" (acerto firme ≥80% em ≥15 tentativas, em
  dias diferentes). Os limiares de "frágil" (<50%) e "em construção"
  (entre 50% e 80%, ou acima de 80% sem volume/dias suficientes) são uma
  decisão provisória, sem número definido no documento.
- **Modelos Gemini** (`src/lib/ai.ts`): conferidos em
  ai.google.dev/gemini-api/docs/models em 2026-09-13 —
  `gemini-3.5-flash` (rotina) e `gemini-3.1-pro-preview` (análises
  pesadas, ainda não usado nesta fase). Revalide antes de trocar; a
  linha muda com frequência e nomes decorados quebram em produção.
- **Teto diário de IA**: implementado em tokens totais/dia
  (`AI_TETO_DIARIO_TOKENS`), não em custo estimado em R$ — mais simples
  e não depende de tabela de preço por modelo, que desatualiza fácil.
- **Limiar do teste relâmpago** (`src/lib/trilha.ts`): o doc diz "acertou,
  libera" sem definir quantas das 5 questões. Decisão provisória: exige
  acerto de todas as 5, por ser uma exceção deliberadamente rigorosa ao
  bloqueio normal.
- **Regra de liberação de tópico**: considera só os pré-requisitos
  diretos do tópico (a aresta na tabela `prerequisito`), não a cadeia
  transitiva completa — é a leitura literal do texto ("todos os seus
  pré-requisitos estão firmes").
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

| Variável                 | Descrição                                                        |
| ------------------------ | ----------------------------------------------------------------- |
| `DATABASE_URL`           | Connection string do Postgres (Neon em produção).                 |
| `APP_PASSWORD`           | Senha única de acesso ao app.                                     |
| `SESSION_SECRET`         | Segredo para assinar o cookie de sessão. Gere com `openssl rand -base64 32`. |
| `GEMINI_API_KEY`         | Chave da API Gemini (aistudio.google.com/apikey). Sem ela, os recursos de IA falham com aviso na interface, o resto do app continua funcionando. |
| `AI_TETO_DIARIO_TOKENS`  | Teto diário de tokens (entrada + saída) para as chamadas de IA. `0` ou vazio = sem teto. |

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
  lib/            regras de negócio (acerto firme, domínio, revisão espaçada,
                  meta de tempo, sessão, fila offline, agregações do painel,
                  cliente de IA e controle de custo)
```
