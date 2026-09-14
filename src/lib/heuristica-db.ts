import "server-only";
import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { db } from "@/db";
import { heuristica, tentativa, questao, questaoTopico } from "@/db/schema";
import {
  heuristicaSuperada,
  podeArquivarPorInatividade,
  proximoContadorAcertos,
} from "@/lib/heuristica";

/**
 * Efeito colateral de toda tentativa registrada: atualiza o contador de
 * acertos firmes consecutivos de toda heurística ativa e não fixada dos
 * tópicos da questão respondida (ver lib/heuristica.ts sobre o porquê do
 * proxy). Espelha registrarResultadoRevisao em revisao-db.ts.
 */
export async function atualizarContadoresHeuristicas(
  questaoId: string,
  acertouFirme: boolean,
): Promise<void> {
  const topicos = await db
    .select({ topicoId: questaoTopico.topicoId })
    .from(questaoTopico)
    .where(eq(questaoTopico.questaoId, questaoId));

  if (topicos.length === 0) return;
  const topicoIds = topicos.map((t) => t.topicoId);

  const ativas = await db
    .select()
    .from(heuristica)
    .where(
      and(
        inArray(heuristica.topicoId, topicoIds),
        eq(heuristica.status, "ativa"),
        eq(heuristica.fixadaPeloUsuario, false),
      ),
    );

  for (const h of ativas) {
    const novoContador = proximoContadorAcertos(h.acertosConsecutivosDesde, acertouFirme);
    await db
      .update(heuristica)
      .set({
        acertosConsecutivosDesde: novoContador,
        status: heuristicaSuperada(novoContador) ? "superada" : "ativa",
      })
      .where(eq(heuristica.id, h.id));
  }
}

/**
 * Arquiva heurísticas ativas e não fixadas sem evidência nova em 60 dias
 * (Tarefa C). Chamado sob demanda ao listar (não há infraestrutura de job
 * agendado neste app pessoal de usuário único).
 */
export async function arquivarHeuristicasInativas(agora: Date): Promise<void> {
  const candidatas = await db
    .select()
    .from(heuristica)
    .where(and(eq(heuristica.status, "ativa"), eq(heuristica.fixadaPeloUsuario, false)));

  for (const h of candidatas) {
    const idsEvidencia = h.tentativasEvidencia;
    let ultimaEvidenciaEm = h.criadaEm;

    if (idsEvidencia.length > 0) {
      const [maisRecente] = await db
        .select({ data: tentativa.data })
        .from(tentativa)
        .where(inArray(tentativa.id, idsEvidencia))
        .orderBy(desc(tentativa.data))
        .limit(1);
      if (maisRecente) ultimaEvidenciaEm = maisRecente.data;
    }

    const dias = (agora.getTime() - ultimaEvidenciaEm.getTime()) / (1000 * 60 * 60 * 24);
    if (podeArquivarPorInatividade(dias)) {
      await db.update(heuristica).set({ status: "arquivada" }).where(eq(heuristica.id, h.id));
    }
  }
}

export async function ultimaDestilacaoEm(): Promise<Date | null> {
  const [linha] = await db
    .select({ criadaEm: heuristica.criadaEm })
    .from(heuristica)
    .orderBy(desc(heuristica.criadaEm))
    .limit(1);
  return linha?.criadaEm ?? null;
}

export type ItemHeuristica = typeof heuristica.$inferSelect & { topicoNome: string };

export async function listarHeuristicas(): Promise<ItemHeuristica[]> {
  await arquivarHeuristicasInativas(new Date());

  const linhas = await db.query.heuristica.findMany({
    with: { topico: { columns: { nome: true } } },
    orderBy: (h, { desc }) => [desc(h.criadaEm)],
  });

  return linhas.map(({ topico, ...h }) => ({ ...h, topicoNome: topico.nome }));
}

/**
 * Tentativas erradas recentes usadas como matéria-prima da destilação —
 * "sobre as tentativas recentes" (Tarefa C), nunca a base inteira.
 */
export async function tentativasParaDestilacao(desde: Date) {
  return db
    .select({
      tentativaId: tentativa.id,
      topicoId: questaoTopico.topicoId,
      enunciado: questao.enunciado,
      respostaDada: tentativa.respostaDada,
      gabarito: questao.gabarito,
      causaErro: tentativa.causaErro,
      motivoDistrator: tentativa.motivoDistrator,
    })
    .from(tentativa)
    .innerJoin(questao, eq(questao.id, tentativa.questaoId))
    .innerJoin(questaoTopico, eq(questaoTopico.questaoId, tentativa.questaoId))
    .where(and(eq(tentativa.acertou, false), gte(tentativa.data, desde)));
}
