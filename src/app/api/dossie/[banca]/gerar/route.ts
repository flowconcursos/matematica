import { NextResponse } from "next/server";
import { desc, eq, inArray } from "drizzle-orm";
import { Type } from "@google/genai";
import { db } from "@/db";
import { questao, questaoTopico, topico, tentativa, dossieBanca } from "@/db/schema";
import { exigirSessao } from "@/lib/api";
import { gerarSaidaEstruturada } from "@/lib/ai-db";
import { MODELO_PRO, OrcamentoDiarioExcedidoError } from "@/lib/ai";
import {
  calcularConfiabilidade,
  calcularObservado,
  podeGerarNovamente,
  proximaGeracaoDisponivelEm,
} from "@/lib/dossie";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    inferido: {
      type: Type.STRING,
      description:
        "Padrões plausíveis a partir dos dados observados (distribuição por tópico/tipo, tempo médio). Se a amostra for pequena, diga isso explicitamente.",
    },
    conhecimentoGeral: {
      type: Type.STRING,
      description:
        "Impressão geral do modelo sobre essa banca, sem lastro nos dados do usuário. Deixe claro que é conhecimento geral não verificado.",
    },
  },
  required: ["inferido", "conhecimentoGeral"],
};

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/dossie/[banca]/gerar">,
) {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const { banca } = await ctx.params;
  const bancaDecodificada = decodeURIComponent(banca);

  const [ultimoDossie] = await db
    .select()
    .from(dossieBanca)
    .where(eq(dossieBanca.banca, bancaDecodificada))
    .orderBy(desc(dossieBanca.versao))
    .limit(1);

  const agora = new Date();
  if (!podeGerarNovamente(ultimoDossie?.geradoEm ?? null, agora)) {
    return NextResponse.json(
      {
        erro: "O dossiê desta banca já foi gerado esta semana.",
        proximaGeracaoDisponivelEm: proximaGeracaoDisponivelEm(
          ultimoDossie!.geradoEm,
        ).toISOString(),
      },
      { status: 400 },
    );
  }

  const questoesDaBanca = await db
    .select({ id: questao.id, tipo: questao.tipo })
    .from(questao)
    .where(eq(questao.banca, bancaDecodificada));

  if (questoesDaBanca.length === 0) {
    return NextResponse.json(
      { erro: "Sem questões registradas desta banca ainda." },
      { status: 404 },
    );
  }

  const questaoIds = questoesDaBanca.map((q) => q.id);
  const [associacoes, tentativas] = await Promise.all([
    db
      .select({ questaoId: questaoTopico.questaoId, nome: topico.nome })
      .from(questaoTopico)
      .innerJoin(topico, eq(topico.id, questaoTopico.topicoId))
      .where(inArray(questaoTopico.questaoId, questaoIds)),
    db
      .select({ segundos: tentativa.segundos })
      .from(tentativa)
      .where(inArray(tentativa.questaoId, questaoIds)),
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

  const prompt = `Você monta o dossiê de uma banca de concurso a partir de dados reais
registrados pelo usuário. Nunca invente fato verificado sobre a banca — só
o que estiver nos dados fornecidos entra como "inferido".

Banca: ${bancaDecodificada}
Dados observados (contagens reais do usuário):
${JSON.stringify(observado, null, 2)}

Se nQuestoes for menor que 30, declare explicitamente que o volume ainda é
insuficiente para conclusões fortes, mas ainda descreva o que os dados
sugerem.`;

  try {
    const resultado = await gerarSaidaEstruturada<{
      inferido: string;
      conhecimentoGeral: string;
    }>({
      tarefa: "dossie_banca",
      modelo: MODELO_PRO,
      prompt,
      responseSchema,
      timeoutMs: 30_000,
    });

    const [criado] = await db
      .insert(dossieBanca)
      .values({
        banca: bancaDecodificada,
        versao: (ultimoDossie?.versao ?? 0) + 1,
        baseadoEmNQuestoes: observado.nQuestoes,
        confiabilidade: calcularConfiabilidade(observado.nQuestoes),
        conteudo: {
          observado,
          inferido: resultado.inferido,
          conhecimentoGeral: resultado.conhecimentoGeral,
        },
      })
      .returning();

    return NextResponse.json(criado, { status: 201 });
  } catch (erro) {
    if (erro instanceof OrcamentoDiarioExcedidoError) {
      return NextResponse.json({ erro: erro.message }, { status: 429 });
    }
    console.error("Falha ao gerar dossiê:", erro);
    return NextResponse.json(
      { erro: "Não foi possível gerar o dossiê agora." },
      { status: 502 },
    );
  }
}
