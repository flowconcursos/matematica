import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { sessao, tentativa, questao, revisao } from "@/db/schema";
import { taxaAcertoFirme, tempoMedioSegundos, CAUSAS, type TentativaPainel } from "@/lib/painel";

/** Tutor bloqueado em simulado (Tarefa G, seção 5): nunca durante a prova. */
export async function simuladoEmAndamento(): Promise<boolean> {
  const [emAndamento] = await db
    .select({ id: sessao.id })
    .from(sessao)
    .where(and(eq(sessao.modo, "simulado"), isNull(sessao.fim)))
    .limit(1);
  return !!emAndamento;
}

export type ContextoQuestao = {
  enunciado: string;
  gabarito: string;
  alternativas: string[] | null;
  tentativas: { data: string; acertou: boolean; causaErro: string | null }[];
  pendenteDeRevisao: boolean;
};

export type ContextoTutor = {
  agregados: {
    totalTentativas: number;
    taxaAcertoFirme: number;
    tempoMedioSegundos: number;
    causaMaisFrequente: { causa: string; contagem: number } | null;
  };
  questao: ContextoQuestao | null;
};

/**
 * "Acesso somente leitura ao histórico" (Tarefa G) — só SELECT, nunca
 * grava nada. Agregados gerais + (se houver) o histórico real da questão
 * em discussão, para respostas ancoradas em número, nunca opinião solta.
 */
export async function montarContextoTutor(questaoId?: string): Promise<ContextoTutor> {
  const todasTentativas: TentativaPainel[] = await db
    .select({
      questaoId: tentativa.questaoId,
      data: tentativa.data,
      segundos: tentativa.segundos,
      metaSegundosNaEpoca: tentativa.metaSegundosNaEpoca,
      confiancaDeclarada: tentativa.confiancaDeclarada,
      acertou: tentativa.acertou,
      causaErro: tentativa.causaErro,
    })
    .from(tentativa);

  const erros = todasTentativas.filter((t) => !t.acertou && t.causaErro);
  const contagemPorCausa = CAUSAS.map((c) => ({
    causa: c,
    contagem: erros.filter((e) => e.causaErro === c).length,
  })).sort((a, b) => b.contagem - a.contagem);

  const agregados = {
    totalTentativas: todasTentativas.length,
    taxaAcertoFirme: taxaAcertoFirme(todasTentativas),
    tempoMedioSegundos: tempoMedioSegundos(todasTentativas),
    causaMaisFrequente: contagemPorCausa[0]?.contagem > 0 ? contagemPorCausa[0] : null,
  };

  if (!questaoId) {
    return { agregados, questao: null };
  }

  const [q] = await db
    .select({
      enunciado: questao.enunciado,
      gabarito: questao.gabarito,
      alternativas: questao.alternativas,
    })
    .from(questao)
    .where(eq(questao.id, questaoId));

  if (!q) {
    return { agregados, questao: null };
  }

  const [tentativasDaQuestao, [revisaoDaQuestao]] = await Promise.all([
    db
      .select({ data: tentativa.data, acertou: tentativa.acertou, causaErro: tentativa.causaErro })
      .from(tentativa)
      .where(eq(tentativa.questaoId, questaoId))
      .orderBy(desc(tentativa.data)),
    db.select().from(revisao).where(eq(revisao.questaoId, questaoId)),
  ]);

  return {
    agregados,
    questao: {
      enunciado: q.enunciado,
      gabarito: q.gabarito,
      alternativas: q.alternativas,
      tentativas: tentativasDaQuestao.map((t) => ({
        data: t.data.toISOString(),
        acertou: t.acertou,
        causaErro: t.causaErro,
      })),
      pendenteDeRevisao: !!revisaoDaQuestao && !revisaoDaQuestao.concluidaEm,
    },
  };
}
