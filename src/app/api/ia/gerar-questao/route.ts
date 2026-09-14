import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { Type } from "@google/genai";
import { db } from "@/db";
import { topico, dossieBanca, nivelQuestaoEnum } from "@/db/schema";
import { exigirSessao } from "@/lib/api";
import { gerarSaidaEstruturada } from "@/lib/ai-db";
import { MODELO_FLASH, OrcamentoDiarioExcedidoError } from "@/lib/ai";

const gerarSchema = z.object({
  topicoId: z.string().uuid(),
  nivel: z.enum(nivelQuestaoEnum.enumValues),
  banca: z.string().optional(),
});

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    enunciado: { type: Type.STRING },
    alternativas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          texto: { type: Type.STRING },
          correta: { type: Type.BOOLEAN },
          erroCapturado: {
            type: Type.STRING,
            description:
              "Qual erro específico esta alternativa captura (ex: 'usa o valor inicial em vez do valor anterior'). Vazio na alternativa correta.",
          },
        },
        required: ["texto", "correta", "erroCapturado"],
      },
      description: "Exatamente 4 alternativas, exatamente uma correta.",
    },
    explicacao: {
      type: Type.STRING,
      description: "Explicação passo a passo da resolução.",
    },
  },
  required: ["enunciado", "alternativas", "explicacao"],
};

type RespostaIA = {
  enunciado: string;
  alternativas: { texto: string; correta: boolean; erroCapturado: string }[];
  explicacao: string;
};

export async function POST(request: NextRequest) {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const corpo = await request.json();
  const dados = gerarSchema.safeParse(corpo);
  if (!dados.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  const [topicoInfo] = await db
    .select({ nome: topico.nome, descricaoCurta: topico.descricaoCurta })
    .from(topico)
    .where(eq(topico.id, dados.data.topicoId));

  if (!topicoInfo) {
    return NextResponse.json({ erro: "Tópico não encontrado." }, { status: 404 });
  }

  let padraoArmadilha = "Nenhum dossiê de banca disponível — use armadilhas típicas do tópico.";
  if (dados.data.banca) {
    const [dossie] = await db
      .select()
      .from(dossieBanca)
      .where(eq(dossieBanca.banca, dados.data.banca))
      .orderBy(desc(dossieBanca.versao))
      .limit(1);
    if (dossie) {
      padraoArmadilha = `Padrão observado no dossiê da banca "${dados.data.banca}" (confiabilidade ${dossie.confiabilidade}): ${dossie.conteudo.inferido}`;
    }
  }

  const prompt = `Você gera uma questão de treino inédita (Tarefa F, seção 5 do doc de
produto) de matemática/raciocínio lógico para concurso público brasileiro.

Tópico: ${topicoInfo.nome}${topicoInfo.descricaoCurta ? ` — ${topicoInfo.descricaoCurta}` : ""}
Nível: ${dados.data.nivel}
${padraoArmadilha}

Regras:
- Múltipla escolha, exatamente 4 alternativas, exatamente uma correta.
- Cada distrator (alternativa errada) deve capturar um erro específico e
  plausível (conta, conceito, interpretação) — declare qual em
  "erroCapturado". A alternativa correta tem "erroCapturado" vazio.
- Enunciado original, nunca copiado de prova real.
- Explicação passo a passo, sem pular conta.`;

  try {
    const resultado = await gerarSaidaEstruturada<RespostaIA>({
      tarefa: "gerador_questao",
      modelo: MODELO_FLASH,
      prompt,
      responseSchema,
      timeoutMs: 30_000,
    });

    const corretas = resultado.alternativas.filter((a) => a.correta);
    if (resultado.alternativas.length !== 4 || corretas.length !== 1) {
      return NextResponse.json(
        { erro: "A IA não devolveu exatamente 4 alternativas com 1 correta. Tente novamente." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      enunciado: resultado.enunciado,
      alternativas: resultado.alternativas,
      gabarito: corretas[0].texto,
      explicacao: resultado.explicacao,
      topicoId: dados.data.topicoId,
      topicoNome: topicoInfo.nome,
      nivel: dados.data.nivel,
      modelo: MODELO_FLASH,
    });
  } catch (erro) {
    if (erro instanceof OrcamentoDiarioExcedidoError) {
      return NextResponse.json({ erro: erro.message }, { status: 429 });
    }
    console.error("Falha ao gerar questão:", erro);
    return NextResponse.json(
      { erro: "Não foi possível gerar a questão agora." },
      { status: 502 },
    );
  }
}
