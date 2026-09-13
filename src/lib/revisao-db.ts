import { eq } from "drizzle-orm";
import type { db as BancoDeDados } from "@/db";
import { revisao, type EntradaHistoricoRevisao } from "@/db/schema";
import { avaliarRevisao } from "@/lib/revisao";

/**
 * Efeito colateral de toda tentativa registrada (seção 4.2 do doc de
 * produto): erro sempre entra/reabre na fila de revisão; acerto só
 * avança uma revisão já ativa. Acerto sem revisão ativa não cria fila
 * — revisão nasce do erro, não de todo acerto em treino livre.
 *
 * Recebe a conexão como parâmetro (em vez de importar "@/db") para que
 * o seed também possa reaproveitar esta função com sua própria conexão,
 * sem herdar o guard de "server-only" do cliente da aplicação.
 */
export async function registrarResultadoRevisao(
  db: typeof BancoDeDados,
  questaoId: string,
  acertou: boolean,
  agora: Date,
) {
  const [existente] = await db
    .select()
    .from(revisao)
    .where(eq(revisao.questaoId, questaoId))
    .limit(1);

  const novaEntrada: EntradaHistoricoRevisao = {
    data: agora.toISOString(),
    resultado: acertou ? "acertou" : "errou",
  };

  if (!existente) {
    if (acertou) return;
    const resultado = avaliarRevisao(0, false, agora);
    await db.insert(revisao).values({
      questaoId,
      etapa: resultado.etapa,
      proximaData: resultado.proximaData,
      concluidaEm: resultado.concluidaEm,
      historico: [novaEntrada],
    });
    return;
  }

  const historico = [...existente.historico, novaEntrada];

  if (existente.concluidaEm && acertou) {
    // já graduado e acertou de novo: só registra, não regride nem re-gradua.
    await db
      .update(revisao)
      .set({ historico })
      .where(eq(revisao.id, existente.id));
    return;
  }

  const etapaBase = existente.concluidaEm ? 0 : existente.etapa;
  const resultado = avaliarRevisao(etapaBase, acertou, agora);

  await db
    .update(revisao)
    .set({
      etapa: resultado.etapa,
      proximaData: resultado.proximaData,
      concluidaEm: resultado.concluidaEm,
      historico,
    })
    .where(eq(revisao.id, existente.id));
}
