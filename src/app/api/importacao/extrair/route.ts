import { NextRequest, NextResponse } from "next/server";
import { Type } from "@google/genai";
import { db } from "@/db";
import { topico, questao } from "@/db/schema";
import { exigirSessao } from "@/lib/api";
import { gerarSaidaEstruturada } from "@/lib/ai-db";
import { MODELO_FLASH, OrcamentoDiarioExcedidoError } from "@/lib/ai";
import { encontrarDuplicataMaisProxima } from "@/lib/similaridade";

const MIME_PERMITIDO = "application/pdf";

const itemSchema = {
  type: Type.OBJECT,
  properties: {
    enunciado: { type: Type.STRING },
    alternativas: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Vazio quando o tipo não usa alternativas de texto livre.",
    },
    gabarito: { type: Type.STRING },
    tipo: {
      type: Type.STRING,
      enum: ["multipla", "certo_errado", "discursiva", "calculo"],
    },
    banca: { type: Type.STRING, description: "Vazio se não identificável." },
    ano: { type: Type.NUMBER, description: "0 se não identificável." },
    orgao: { type: Type.STRING, description: "Vazio se não identificável." },
    cargo: { type: Type.STRING, description: "Vazio se não identificável." },
    nivel: { type: Type.STRING, enum: ["facil", "medio", "dificil"] },
    topicoNomesSugeridos: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Só nomes da lista de tópicos existentes fornecida.",
    },
  },
  required: ["enunciado", "gabarito", "tipo", "nivel", "topicoNomesSugeridos"],
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    itens: { type: Type.ARRAY, items: itemSchema },
  },
  required: ["itens"],
};

type ItemExtraido = {
  enunciado: string;
  alternativas: string[];
  gabarito: string;
  tipo: "multipla" | "certo_errado" | "discursiva" | "calculo";
  banca: string;
  ano: number;
  orgao: string;
  cargo: string;
  nivel: "facil" | "medio" | "dificil";
  topicoNomesSugeridos: string[];
};

export async function POST(request: NextRequest) {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const formData = await request.formData();
  const arquivo = formData.get("arquivo");
  const texto = formData.get("texto");

  const temArquivo = arquivo instanceof File && arquivo.size > 0;
  const temTexto = typeof texto === "string" && texto.trim().length > 0;

  if (!temArquivo && !temTexto) {
    return NextResponse.json(
      { erro: "Envie um PDF ou cole o texto da prova." },
      { status: 400 },
    );
  }

  if (temArquivo && (arquivo as File).type !== MIME_PERMITIDO) {
    return NextResponse.json(
      { erro: "Só é aceito arquivo PDF." },
      { status: 400 },
    );
  }

  const topicosExistentes = await db.select({ nome: topico.nome }).from(topico);
  if (topicosExistentes.length === 0) {
    return NextResponse.json(
      { erro: "Cadastre ao menos um tópico antes de importar questões." },
      { status: 400 },
    );
  }

  const instrucoes = `Você extrai questões de provas de concursos públicos brasileiros
(matemática e raciocínio lógico) a partir do material fornecido.

Regras:
- Extraia cada questão encontrada, uma por item.
- Nunca invente enunciado, alternativa ou gabarito que não esteja no material.
- Em "topicoNomesSugeridos", use exclusivamente nomes desta lista de tópicos
  existentes (não invente tópicos novos): ${JSON.stringify(topicosExistentes.map((t) => t.nome))}
- Se banca, ano, órgão ou cargo não estiverem identificáveis no material,
  deixe vazio (ou 0 para ano) — nunca invente.`;

  let prompt: string;
  let arquivoParaIa: { base64: string; mimeType: string } | undefined;

  if (temArquivo) {
    const bytes = await (arquivo as File).arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    arquivoParaIa = { base64, mimeType: MIME_PERMITIDO };
    prompt = `${instrucoes}\n\nO material está no PDF anexado.`;
  } else {
    prompt = `${instrucoes}\n\nMaterial (texto colado):\n${texto}`;
  }

  try {
    const resultado = await gerarSaidaEstruturada<{ itens: ItemExtraido[] }>({
      tarefa: "importacao_extracao",
      modelo: MODELO_FLASH,
      prompt,
      responseSchema,
      arquivo: arquivoParaIa,
      timeoutMs: 60_000,
    });

    const existentes = await db
      .select({ id: questao.id, enunciado: questao.enunciado })
      .from(questao);

    const itensComDuplicata = resultado.itens.map((item) => ({
      ...item,
      duplicataDe: encontrarDuplicataMaisProxima(item.enunciado, existentes),
    }));

    return NextResponse.json({ itens: itensComDuplicata });
  } catch (erro) {
    if (erro instanceof OrcamentoDiarioExcedidoError) {
      return NextResponse.json({ erro: erro.message }, { status: 429 });
    }
    console.error("Falha na extração de importação:", erro);
    return NextResponse.json(
      { erro: "Não foi possível extrair as questões agora." },
      { status: 502 },
    );
  }
}
