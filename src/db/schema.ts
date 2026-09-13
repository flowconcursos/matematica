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

export const tentativa = pgTable(
  "tentativa",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questaoId: uuid("questao_id")
      .notNull()
      .references(() => questao.id),
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
