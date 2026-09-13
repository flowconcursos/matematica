import { NextResponse } from "next/server";
import { and, desc, eq, inArray, isNull, lte } from "drizzle-orm";
import { db } from "@/db";
import { revisao, questao, questaoTopico, topico, tentativa } from "@/db/schema";
import { exigirSessao } from "@/lib/api";
import { temAlertaPrerequisito } from "@/lib/revisao";

export async function GET() {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const agora = new Date();

  const linhas = await db
    .select({ revisao, questao })
    .from(revisao)
    .innerJoin(questao, eq(questao.id, revisao.questaoId))
    .where(and(isNull(revisao.concluidaEm), lte(revisao.proximaData, agora)));

  const questaoIds = linhas.map((l) => l.questao.id);

  const topicosPorQuestao = new Map<string, { id: string; nome: string; area: string }[]>();
  const ultimaAnotacaoPorQuestao = new Map<string, string | null>();

  if (questaoIds.length > 0) {
    const linhasTopico = await db
      .select({ questaoId: questaoTopico.questaoId, topico })
      .from(questaoTopico)
      .innerJoin(topico, eq(topico.id, questaoTopico.topicoId))
      .where(inArray(questaoTopico.questaoId, questaoIds));

    for (const { questaoId, topico: t } of linhasTopico) {
      const lista = topicosPorQuestao.get(questaoId) ?? [];
      lista.push({ id: t.id, nome: t.nome, area: t.area });
      topicosPorQuestao.set(questaoId, lista);
    }

    const tentativasRecentes = await db
      .select({ questaoId: tentativa.questaoId, anotacao: tentativa.anotacao })
      .from(tentativa)
      .where(inArray(tentativa.questaoId, questaoIds))
      .orderBy(desc(tentativa.data));

    for (const t of tentativasRecentes) {
      if (!ultimaAnotacaoPorQuestao.has(t.questaoId)) {
        ultimaAnotacaoPorQuestao.set(t.questaoId, t.anotacao);
      }
    }
  }

  const itens = linhas.map(({ revisao: r, questao: q }) => ({
    ...r,
    questao: {
      ...q,
      topicos: topicosPorQuestao.get(q.id) ?? [],
    },
    ultimaAnotacao: ultimaAnotacaoPorQuestao.get(q.id) ?? null,
    errosAcumulados: r.historico.filter((h) => h.resultado === "errou").length,
    alertaPrerequisito: temAlertaPrerequisito(r.historico),
  }));

  const vencidas = itens
    .filter((item) => !item.alertaPrerequisito)
    .sort((a, b) => b.errosAcumulados - a.errosAcumulados);

  const alertas = itens.filter((item) => item.alertaPrerequisito);

  return NextResponse.json({ vencidas, alertas });
}
