import { NextResponse } from "next/server";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { questao, questaoTopico, topico, tentativa, dossieBanca } from "@/db/schema";
import { exigirSessao } from "@/lib/api";
import {
  calcularConfiabilidade,
  calcularObservado,
  podeGerarNovamente,
  proximaGeracaoDisponivelEm,
} from "@/lib/dossie";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/dossie/[banca]">,
) {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const { banca } = await ctx.params;
  const bancaDecodificada = decodeURIComponent(banca);

  const questoesDaBanca = await db
    .select({ id: questao.id, tipo: questao.tipo })
    .from(questao)
    .where(eq(questao.banca, bancaDecodificada));

  if (questoesDaBanca.length === 0) {
    return NextResponse.json(
      { erro: "Sem questões registradas desta banca ainda.", nQuestoes: 0 },
      { status: 404 },
    );
  }

  const questaoIds = questoesDaBanca.map((q) => q.id);

  const [associacoes, tentativas, ultimoDossie] = await Promise.all([
    db
      .select({ questaoId: questaoTopico.questaoId, nome: topico.nome })
      .from(questaoTopico)
      .innerJoin(topico, eq(topico.id, questaoTopico.topicoId))
      .where(inArray(questaoTopico.questaoId, questaoIds)),
    db
      .select({ segundos: tentativa.segundos })
      .from(tentativa)
      .where(inArray(tentativa.questaoId, questaoIds)),
    db
      .select()
      .from(dossieBanca)
      .where(eq(dossieBanca.banca, bancaDecodificada))
      .orderBy(desc(dossieBanca.versao))
      .limit(1),
  ]);

  const topicosPorQuestao = new Map<string, string[]>();
  for (const { questaoId, nome } of associacoes) {
    const lista = topicosPorQuestao.get(questaoId) ?? [];
    lista.push(nome);
    topicosPorQuestao.set(questaoId, lista);
  }

  const observado = calcularObservado(
    questoesDaBanca.map((q) => ({
      tipo: q.tipo,
      topicoNomes: topicosPorQuestao.get(q.id) ?? [],
    })),
    tentativas,
  );

  const dossieExistente = ultimoDossie[0] ?? null;
  const agora = new Date();

  return NextResponse.json({
    banca: bancaDecodificada,
    observado,
    confiabilidade: calcularConfiabilidade(observado.nQuestoes),
    dossie: dossieExistente,
    podeGerar: podeGerarNovamente(dossieExistente?.geradoEm ?? null, agora),
    proximaGeracaoDisponivelEm: dossieExistente
      ? proximaGeracaoDisponivelEm(dossieExistente.geradoEm).toISOString()
      : null,
  });
}
