import { NextResponse } from "next/server";
import { db } from "@/db";
import { topico, questaoTopico, tentativa, prerequisito, liberacaoManual } from "@/db/schema";
import { exigirSessao } from "@/lib/api";
import { classificarDominio, type TentativaParaDominio } from "@/lib/dominio";
import { topicoLiberado } from "@/lib/trilha";

export async function GET() {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const [todosTopicos, associacoes, todasTentativas, arestas, liberacoesManuais] =
    await Promise.all([
      db.select().from(topico),
      db.select().from(questaoTopico),
      db
        .select({
          questaoId: tentativa.questaoId,
          acertou: tentativa.acertou,
          confiancaDeclarada: tentativa.confiancaDeclarada,
          segundos: tentativa.segundos,
          metaSegundosNaEpoca: tentativa.metaSegundosNaEpoca,
          data: tentativa.data,
        })
        .from(tentativa),
      db.select().from(prerequisito),
      db.select({ topicoId: liberacaoManual.topicoId }).from(liberacaoManual),
    ]);

  const topicosLiberadosManualmente = new Set(
    liberacoesManuais.map((l) => l.topicoId),
  );

  const topicosPorQuestao = new Map<string, string[]>();
  for (const { questaoId, topicoId } of associacoes) {
    const lista = topicosPorQuestao.get(questaoId) ?? [];
    lista.push(topicoId);
    topicosPorQuestao.set(questaoId, lista);
  }

  const tentativasPorTopico = new Map<string, TentativaParaDominio[]>();
  for (const t of todasTentativas) {
    for (const topicoId of topicosPorQuestao.get(t.questaoId) ?? []) {
      const lista = tentativasPorTopico.get(topicoId) ?? [];
      lista.push(t);
      tentativasPorTopico.set(topicoId, lista);
    }
  }

  const dominioPorTopico = new Map(
    todosTopicos.map((t) => [
      t.id,
      classificarDominio(tentativasPorTopico.get(t.id) ?? []),
    ]),
  );

  const prerequisitosPorTopico = new Map<string, string[]>();
  for (const { topicoId, dependeDeTopicoId } of arestas) {
    const lista = prerequisitosPorTopico.get(topicoId) ?? [];
    lista.push(dependeDeTopicoId);
    prerequisitosPorTopico.set(topicoId, lista);
  }

  const resultado = todosTopicos.map((t) => {
    const prerequisitosDiretos = prerequisitosPorTopico.get(t.id) ?? [];
    return {
      ...t,
      dominio: dominioPorTopico.get(t.id)!,
      prerequisitos: prerequisitosDiretos,
      liberado:
        topicoLiberado(prerequisitosDiretos, dominioPorTopico) ||
        topicosLiberadosManualmente.has(t.id),
      liberadoManualmente: topicosLiberadosManualmente.has(t.id),
    };
  });

  return NextResponse.json(resultado);
}
