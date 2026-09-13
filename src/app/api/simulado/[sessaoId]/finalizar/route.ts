import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  questao,
  questaoTopico,
  topico,
  tentativa,
  sessao,
  confiancaEnum,
  causaErroEnum,
} from "@/db/schema";
import { exigirSessao } from "@/lib/api";
import { metaSegundos } from "@/lib/meta-tempo";
import { registrarResultadoRevisao } from "@/lib/revisao-db";

const finalizarSchema = z.object({
  respostas: z
    .array(
      z.object({
        questaoId: z.string().uuid(),
        confiancaDeclarada: z.enum(confiancaEnum.enumValues),
        respostaDada: z.string().min(1),
        segundos: z.number().int().min(0),
        causaErro: z.enum(causaErroEnum.enumValues).optional(),
      }),
    )
    .min(1),
});

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/simulado/[sessaoId]/finalizar">,
) {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const { sessaoId } = await ctx.params;
  const corpo = await request.json();
  const dados = finalizarSchema.safeParse(corpo);
  if (!dados.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  const [sessaoAtual] = await db.select().from(sessao).where(eq(sessao.id, sessaoId));
  if (!sessaoAtual) {
    return NextResponse.json({ erro: "Sessão não encontrada." }, { status: 404 });
  }

  const jaExiste = await db
    .select({ id: tentativa.id })
    .from(tentativa)
    .where(eq(tentativa.sessaoId, sessaoId))
    .limit(1);
  if (jaExiste.length > 0) {
    return NextResponse.json(
      { erro: "Este simulado já foi finalizado." },
      { status: 400 },
    );
  }

  const questaoIds = dados.data.respostas.map((r) => r.questaoId);
  const linhas = await db
    .select({
      id: questao.id,
      gabarito: questao.gabarito,
      nivel: questao.nivel,
      area: topico.area,
    })
    .from(questao)
    .innerJoin(questaoTopico, eq(questaoTopico.questaoId, questao.id))
    .innerJoin(topico, eq(topico.id, questaoTopico.topicoId))
    .where(inArray(questao.id, questaoIds));

  const infoPorQuestao = new Map<string, { gabarito: string; nivel: string; area: string }>();
  for (const l of linhas) {
    if (!infoPorQuestao.has(l.id)) {
      infoPorQuestao.set(l.id, { gabarito: l.gabarito, nivel: l.nivel, area: l.area });
    }
  }

  for (const r of dados.data.respostas) {
    const info = infoPorQuestao.get(r.questaoId);
    if (!info) {
      return NextResponse.json(
        { erro: `Questão ${r.questaoId} não encontrada.` },
        { status: 404 },
      );
    }
    const acertou = r.respostaDada.trim() === info.gabarito.trim();
    if (!acertou && !r.causaErro) {
      return NextResponse.json(
        { erro: "causaErro é obrigatória para toda resposta incorreta." },
        { status: 400 },
      );
    }
  }

  const agora = new Date();
  for (const r of dados.data.respostas) {
    const info = infoPorQuestao.get(r.questaoId)!;
    const acertou = r.respostaDada.trim() === info.gabarito.trim();

    const [criada] = await db
      .insert(tentativa)
      .values({
        questaoId: r.questaoId,
        sessaoId,
        data: agora,
        segundos: r.segundos,
        metaSegundosNaEpoca: metaSegundos(info.area as never, info.nivel as never),
        confiancaDeclarada: r.confiancaDeclarada,
        respostaDada: r.respostaDada,
        acertou,
        causaErro: r.causaErro,
        alternativaEscolhida: r.respostaDada,
        modo: "simulado",
      })
      .returning();

    await registrarResultadoRevisao(db, r.questaoId, acertou, criada.data);
  }

  await db.update(sessao).set({ fim: agora }).where(eq(sessao.id, sessaoId));

  return NextResponse.json({ ok: true });
}
