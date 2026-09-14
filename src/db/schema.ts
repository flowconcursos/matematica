import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
  check,
  unique,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const areaEnum = pgEnum("area", [
  "aritmetica",
  "algebra",
  "geometria",
  "raciocinio_logico",
  "estatistica",
  "financeira",
  "conjuntos",
]);

export const origemQuestaoEnum = pgEnum("origem_questao", [
  "manual",
  "pdf",
  "gerada_ia",
]);

export const tipoQuestaoEnum = pgEnum("tipo_questao", [
  "multipla",
  "certo_errado",
  "discursiva",
  "calculo",
]);

export const nivelQuestaoEnum = pgEnum("nivel_questao", [
  "facil",
  "medio",
  "dificil",
]);

export const confiancaEnum = pgEnum("confianca", ["certo", "duvida", "chute"]);

export const causaErroEnum = pgEnum("causa_erro", [
  "conceito",
  "conta",
  "leitura",
  "tempo",
  "distrator",
]);

export const modoTentativaEnum = pgEnum("modo_tentativa", [
  "treino",
  "revisao",
  "simulado",
]);

export const nivelExplicacaoEnum = pgEnum("nivel_explicacao", [
  "curta",
  "passo_a_passo",
  "por_que_erro_parecia_certo",
]);

export const confiabilidadeEnum = pgEnum("confiabilidade", [
  "baixa",
  "media",
  "alta",
]);

/**
 * O doc (seção 3) só define "ativa | superada" para heuristica.status, mas
 * a seção 5 (Tarefa C) exige "arquivada sem evidência nova em 60 dias" —
 * um terceiro estado que o enum documentado não cobre. Adicionado aqui
 * como decisão provisória (ver README).
 */
export const heuristicaStatusEnum = pgEnum("heuristica_status", [
  "ativa",
  "superada",
  "arquivada",
]);

export const topico = pgTable(
  "topico",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nome: text("nome").notNull(),
    area: areaEnum("area").notNull(),
    nivelBase: integer("nivel_base").notNull(),
    descricaoCurta: text("descricao_curta"),
    criadoEm: timestamp("criado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
    arquivadoEm: timestamp("arquivado_em", { withTimezone: true }),
  },
  (t) => [check("nivel_base_range", sql`${t.nivelBase} between 1 and 5`)],
);

export const questao = pgTable("questao", {
  id: uuid("id").primaryKey().defaultRandom(),
  origem: origemQuestaoEnum("origem").notNull(),
  enunciado: text("enunciado").notNull(),
  alternativas: jsonb("alternativas").$type<string[]>(),
  gabarito: text("gabarito").notNull(),
  tipo: tipoQuestaoEnum("tipo").notNull(),
  banca: text("banca"),
  ano: integer("ano"),
  orgao: text("orgao"),
  cargo: text("cargo"),
  nivel: nivelQuestaoEnum("nivel").notNull(),
  arquivoOrigem: text("arquivo_origem"),
  revisadoPorHumano: boolean("revisado_por_humano").notNull().default(false),
  geradoPorModelo: text("gerado_por_modelo"),
  criadoEm: timestamp("criado_em", { withTimezone: true })
    .notNull()
    .defaultNow(),
  arquivadoEm: timestamp("arquivado_em", { withTimezone: true }),
});

export const questaoTopico = pgTable(
  "questao_topico",
  {
    questaoId: uuid("questao_id")
      .notNull()
      .references(() => questao.id, { onDelete: "cascade" }),
    topicoId: uuid("topico_id")
      .notNull()
      .references(() => topico.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.questaoId, t.topicoId] })],
);

export const prerequisito = pgTable(
  "prerequisito",
  {
    topicoId: uuid("topico_id")
      .notNull()
      .references(() => topico.id, { onDelete: "cascade" }),
    dependeDeTopicoId: uuid("depende_de_topico_id")
      .notNull()
      .references(() => topico.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.topicoId, t.dependeDeTopicoId] }),
    check(
      "prerequisito_nao_autorreferente",
      sql`${t.topicoId} != ${t.dependeDeTopicoId}`,
    ),
  ],
);

export const prerequisitoRelations = relations(prerequisito, ({ one }) => ({
  topico: one(topico, {
    fields: [prerequisito.topicoId],
    references: [topico.id],
    relationName: "topico",
  }),
  dependeDe: one(topico, {
    fields: [prerequisito.dependeDeTopicoId],
    references: [topico.id],
    relationName: "dependeDe",
  }),
}));

/**
 * Uma sessão de simulado (seção 3 do doc). meta_segundos aqui é o tempo
 * total configurado da prova, não a meta por questão.
 */
export const sessao = pgTable("sessao", {
  id: uuid("id").primaryKey().defaultRandom(),
  data: timestamp("data", { withTimezone: true }).notNull().defaultNow(),
  inicio: timestamp("inicio", { withTimezone: true }).notNull(),
  fim: timestamp("fim", { withTimezone: true }),
  modo: modoTentativaEnum("modo").notNull(),
  metaSegundos: integer("meta_segundos").notNull(),
  observacao: text("observacao"),
});

export const tentativa = pgTable(
  "tentativa",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questaoId: uuid("questao_id")
      .notNull()
      .references(() => questao.id),
    // Só preenchido para tentativas de simulado (necessário para comparar
    // simulados entre si; o doc não detalha essa ligação no schema).
    sessaoId: uuid("sessao_id").references(() => sessao.id),
    data: timestamp("data", { withTimezone: true }).notNull().defaultNow(),
    segundos: integer("segundos").notNull(),
    metaSegundosNaEpoca: integer("meta_segundos_na_epoca").notNull(),
    confiancaDeclarada: confiancaEnum("confianca_declarada").notNull(),
    respostaDada: text("resposta_dada").notNull(),
    acertou: boolean("acertou").notNull(),
    causaErro: causaErroEnum("causa_erro"),
    alternativaEscolhida: text("alternativa_escolhida"),
    motivoDistrator: text("motivo_distrator"),
    anotacao: text("anotacao"),
    modo: modoTentativaEnum("modo").notNull().default("treino"),
  },
  (t) => [
    check(
      "causa_erro_obrigatoria_em_erro",
      sql`${t.acertou} = true or ${t.causaErro} is not null`,
    ),
  ],
);

export type EntradaHistoricoRevisao = {
  data: string;
  resultado: "acertou" | "errou";
};

export const revisao = pgTable(
  "revisao",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questaoId: uuid("questao_id")
      .notNull()
      .references(() => questao.id),
    etapa: integer("etapa").notNull().default(0),
    proximaData: timestamp("proxima_data", { withTimezone: true }),
    historico: jsonb("historico").$type<EntradaHistoricoRevisao[]>().notNull().default([]),
    concluidaEm: timestamp("concluida_em", { withTimezone: true }),
  },
  (t) => [
    unique("revisao_questao_unica").on(t.questaoId),
    check("etapa_range", sql`${t.etapa} between 0 and 3`),
  ],
);

export const revisaoRelations = relations(revisao, ({ one }) => ({
  questao: one(questao, {
    fields: [revisao.questaoId],
    references: [questao.id],
  }),
}));

export const explicacao = pgTable("explicacao", {
  id: uuid("id").primaryKey().defaultRandom(),
  questaoId: uuid("questao_id")
    .notNull()
    .references(() => questao.id),
  nivel: nivelExplicacaoEnum("nivel").notNull(),
  texto: text("texto").notNull(),
  geradoEm: timestamp("gerado_em", { withTimezone: true }).notNull().defaultNow(),
  modelo: text("modelo").notNull(),
  util: boolean("util"),
});

export const explicacaoRelations = relations(explicacao, ({ one }) => ({
  questao: one(questao, {
    fields: [explicacao.questaoId],
    references: [questao.id],
  }),
}));

export const aiUsage = pgTable("ai_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  data: timestamp("data", { withTimezone: true }).notNull().defaultNow(),
  tarefa: text("tarefa").notNull(),
  modelo: text("modelo").notNull(),
  tokensEntrada: integer("tokens_entrada").notNull(),
  tokensSaida: integer("tokens_saida").notNull(),
});

/**
 * Override do botão "não concordo com o bloqueio" (seção 4.3): quando
 * o teste relâmpago é aprovado, o tópico fica liberado mesmo que o
 * pré-requisito ainda não esteja "firme" nos dados. Não existe no
 * doc como tabela nomeada — é a peça mínima necessária para persistir
 * esse override (sem ela, o bloqueio simplesmente voltaria no próximo
 * carregamento).
 */
export const liberacaoManual = pgTable("liberacao_manual", {
  topicoId: uuid("topico_id")
    .primaryKey()
    .references(() => topico.id, { onDelete: "cascade" }),
  liberadaEm: timestamp("liberada_em", { withTimezone: true })
    .notNull()
    .defaultNow(),
  acertosNoTeste: integer("acertos_no_teste").notNull(),
});

export type ConteudoDossie = {
  observado: {
    distribuicaoPorTopico: { topico: string; contagem: number }[];
    distribuicaoPorTipo: { tipo: string; contagem: number }[];
    tempoMedioSegundos: number;
    nQuestoes: number;
  };
  inferido: string;
  conhecimentoGeral: string;
};

export const dossieBanca = pgTable("dossie_banca", {
  id: uuid("id").primaryKey().defaultRandom(),
  banca: text("banca").notNull(),
  versao: integer("versao").notNull().default(1),
  geradoEm: timestamp("gerado_em", { withTimezone: true }).notNull().defaultNow(),
  baseadoEmNQuestoes: integer("baseado_em_n_questoes").notNull(),
  conteudo: jsonb("conteudo").$type<ConteudoDossie>().notNull(),
  confiabilidade: confiabilidadeEnum("confiabilidade").notNull(),
});

/**
 * Tarefa C (seção 5): regra curta e acionável, ligada a um gatilho
 * observável no enunciado, com evidência real em tentativas.
 */
export const heuristica = pgTable("heuristica", {
  id: uuid("id").primaryKey().defaultRandom(),
  texto: text("texto").notNull(),
  topicoId: uuid("topico_id")
    .notNull()
    .references(() => topico.id, { onDelete: "cascade" }),
  // Modelo que destilou a heurística (não existe manual nesta fase).
  origem: text("origem").notNull(),
  tentativasEvidencia: jsonb("tentativas_evidencia")
    .$type<string[]>()
    .notNull()
    .default([]),
  criadaEm: timestamp("criada_em", { withTimezone: true }).notNull().defaultNow(),
  // Contador de acertos firmes consecutivos no tópico desde a criação —
  // proxy para "gatilho respeitado" (o gatilho é texto livre, não há como
  // o código detectar automaticamente se apareceu numa questão nova).
  acertosConsecutivosDesde: integer("acertos_consecutivos_desde").notNull().default(0),
  status: heuristicaStatusEnum("status").notNull().default("ativa"),
  fixadaPeloUsuario: boolean("fixada_pelo_usuario").notNull().default(false),
});

export const heuristicaRelations = relations(heuristica, ({ one }) => ({
  topico: one(topico, {
    fields: [heuristica.topicoId],
    references: [topico.id],
  }),
}));

export type EvidenciaDiagnostico = { afirmacao: string; numero: string };

export type ConteudoDiagnostico = {
  evidencias: EvidenciaDiagnostico[];
  comoDerrubarHipotese: string[];
  comparacaoComAnterior: string | null;
};

/**
 * Tarefa D (seção 5): a cada 7 dias ou 100 tentativas, sobre agregados do
 * período — nunca a base inteira.
 */
export const diagnostico = pgTable("diagnostico", {
  id: uuid("id").primaryKey().defaultRandom(),
  geradoEm: timestamp("gerado_em", { withTimezone: true }).notNull().defaultNow(),
  periodoAnalisado: text("periodo_analisado").notNull(),
  hipotesePrincipal: text("hipotese_principal").notNull(),
  evidencias: jsonb("evidencias").$type<ConteudoDiagnostico>().notNull(),
  prescricao: text("prescricao").notNull(),
  modelo: text("modelo").notNull(),
});

export const topicoRelations = relations(topico, ({ many }) => ({
  questoes: many(questaoTopico),
}));

export const questaoRelations = relations(questao, ({ many }) => ({
  topicos: many(questaoTopico),
  tentativas: many(tentativa),
}));

export const questaoTopicoRelations = relations(questaoTopico, ({ one }) => ({
  questao: one(questao, {
    fields: [questaoTopico.questaoId],
    references: [questao.id],
  }),
  topico: one(topico, {
    fields: [questaoTopico.topicoId],
    references: [topico.id],
  }),
}));

export const tentativaRelations = relations(tentativa, ({ one }) => ({
  questao: one(questao, {
    fields: [tentativa.questaoId],
    references: [questao.id],
  }),
}));
