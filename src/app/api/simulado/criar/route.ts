import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { questao, questaoTopico, topico, sessao, areaEnum } from "@/db/schema";
import { exigirSessao } from "@/lib/api";

const criarSchema = z.object({
  nQuestoes: z.number().int().min(1).max(200),
  tempoTotalMinutos: z.number().int().min(1).max(600),
  areas: z.array(z.enum(areaEnum.enumValues)).optional(),
  banca: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const corpo = await request.json();
  const dados = criarSchema.safeParse(corpo);
  if (!dados.success) {
    return NextResponse.json(
      { erro: "Dados inválidos.", detalhes: dados.error.flatten() },
      { status: 400 },
    );
  }

  let linhas = await db
    .select({
      questaoId: questao.id,
      enunciado: questao.enunciado,
      alternativas: questao.alternativas,
      tipo: questao.tipo,
      nivel: questao.nivel,
      banca: questao.banca,
      area: topico.area,
    })
    .from(questao)
    .innerJoin(questaoTopico, eq(questaoTopico.questaoId, questao.id))
    .innerJoin(topico, eq(topico.id, questaoTopico.topicoId));

  if (dados.data.banca) {
    linhas = linhas.filter((l) => l.banca === dados.data.banca);
  }
  if (dados.data.areas && dados.data.areas.length > 0) {
    const areasSelecionadas = new Set(dados.data.areas);
    linhas = linhas.filter((l) => areasSelecionadas.has(l.area));
  }

  const questoesUnicas = new Map<string, (typeof linhas)[number]>();
  for (const l of linhas) questoesUnicas.set(l.questaoId, l);

  const disponiveis = [...questoesUnicas.values()];
  if (disponiveis.length === 0) {
    return NextResponse.json(
      { erro: "Nenhuma questão encontrada com esses filtros." },
      { status: 400 },
    );
  }

  const embaralhadas = disponiveis.sort(() => Math.random() - 0.5);
  const escolhidas = embaralhadas.slice(0, dados.data.nQuestoes);

  const metaSegundos = dados.data.tempoTotalMinutos * 60;
  const [novaSessao] = await db
    .insert(sessao)
    .values({ inicio: new Date(), modo: "simulado", metaSegundos })
    .returning();

  return NextResponse.json({
    sessaoId: novaSessao.id,
    metaSegundos,
    questoes: escolhidas.map(({ questaoId, enunciado, alternativas, tipo, nivel }) => ({
      id: questaoId,
      enunciado,
      alternativas,
      tipo,
      nivel,
    })),
  });
}
