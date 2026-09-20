import { NextRequest, NextResponse } from "next/server";
import { Type } from "@google/genai";
import { exigirSessao } from "@/lib/api";
import { gerarSaidaEstruturada } from "@/lib/ai-db";
import { MODELO_FLASH, OrcamentoDiarioExcedidoError } from "@/lib/ai";

const MIME_PERMITIDO = "application/pdf";

const materiaSchema = {
  type: Type.OBJECT,
  properties: {
    materia: { type: Type.STRING, description: "Nome do assunto ou tópico cobrado no edital." },
    porcentagem: { type: Type.NUMBER, description: "Peso percentual estimado de incidência deste assunto na prova (número de 1 a 100)." },
    peso: { type: Type.STRING, enum: ["critico", "alto", "medio"], description: "Grau de relevância estatística na banca." },
    dicaBanca: { type: Type.STRING, description: "Orientação pontual sobre como a banca examinadora aborda esse conteúdo." },
    moduloJornadaSugerido: { type: Type.NUMBER, description: "Número do módulo sugerido na Jornada do Zero (de 0 a 5)." },
  },
  required: ["materia", "porcentagem", "peso", "dicaBanca", "moduloJornadaSugerido"],
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    nomeConcurso: { type: Type.STRING, description: "Nome resumido e amigável do concurso (ex: Concurso Caixa Econômica 2026)." },
    orgao: { type: Type.STRING, description: "Órgão público ou instituição realizadora." },
    banca: { type: Type.STRING, description: "Banca examinadora responsável identificada (ex: FGV, Cebraspe, Vunesp, Cesgranrio, FCC, etc.)." },
    anoReferencia: { type: Type.STRING, description: "Ano ou período do edital (ex: 2026)." },
    descricao: { type: Type.STRING, description: "Síntese em 2 ou 3 frases sobre o perfil de exigência da parte de exatas deste edital." },
    dicaEstrategica: { type: Type.STRING, description: "O maior conselho tático para gabaritar a prova de matemática dessa banca." },
    materias: {
      type: Type.ARRAY,
      items: materiaSchema,
      description: "Lista de todos os tópicos de matemática e raciocínio lógico localizados no edital.",
    },
    pegadinhasClassicas: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista das 3 a 5 pegadinhas mais recorrentes desta banca examinadora nesta matéria.",
    },
  },
  required: [
    "nomeConcurso",
    "orgao",
    "banca",
    "anoReferencia",
    "descricao",
    "dicaEstrategica",
    "materias",
    "pegadinhasClassicas",
  ],
};

function montarPrompt(): string {
  return `Você é um analista especialista em editais de concursos públicos brasileiros de nível médio e superior, focado exclusivamente em Matemática, Raciocínio Lógico Matemático (RLM) e Matemática Financeira.

Sua tarefa:
1. Examine com máxima atenção o documento/texto fornecido.
2. Localize a seção de CONTEÚDO PROGRAMÁTICO das disciplinas de Matemática, Raciocínio Lógico e/ou Matemática Financeira para o cargo em questão.
3. Identifique o Órgão, a Banca Examinadora (Cesgranrio, FGV, Cebraspe, Vunesp, FCC, etc.) e o Cargo/Ano.
4. Decomponha os tópicos cobrados em uma lista estruturada de 'materias', estimando a relevância estatística e peso percentual de cada assunto na referida banca (a soma das porcentagens deve se aproximar de 100%).
5. Para cada matéria, recomende o módulo mais afim da Jornada do Zero (de 0 a 5):
   - 0: Operações Básicas, Frações e Sinais
   - 1: Frações, Decimais e Conversões
   - 2: Porcentagem e Regra de Três
   - 3: Matemática Financeira (Juros Simples e Compostos)
   - 4: Álgebra e Equações do 1º Grau
   - 5: Geometria Plana e Raciocínio Lógico Proposicional
6. Liste as pegadinhas clássicas que a banca costuma aprontar nestes temas específicos.

Responda exclusivamente no formato JSON estruturado solicitado.`;
}

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
      { erro: "Envie um arquivo PDF ou o texto do conteúdo programático do edital." },
      { status: 400 },
    );
  }

  let arquivoParam: { base64: string; mimeType: string } | undefined;
  let promptExtra = "";

  if (temArquivo) {
    const file = arquivo as File;
    if (file.type !== MIME_PERMITIDO) {
      return NextResponse.json(
        { erro: "Formato não suportado. Por favor, envie um arquivo PDF." },
        { status: 400 },
      );
    }

    const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { erro: "Arquivo muito grande. O limite máximo para PDF é de 15 MB." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    arquivoParam = {
      base64: buffer.toString("base64"),
      mimeType: MIME_PERMITIDO,
    };
  }

  if (temTexto) {
    promptExtra = `\n\nConteúdo textual do edital fornecido pelo usuário:\n"""\n${texto}\n"""`;
  }

  const promptFinal = montarPrompt() + promptExtra;

  try {
    const analise = await gerarSaidaEstruturada({
      tarefa: "analisar_edital",
      modelo: MODELO_FLASH,
      prompt: promptFinal,
      responseSchema,
      timeoutMs: 45_000,
      arquivo: arquivoParam,
    });

    return NextResponse.json({
      sucesso: true,
      edital: analise,
    });
  } catch (erro) {
    if (erro instanceof OrcamentoDiarioExcedidoError) {
      return NextResponse.json(
        {
          erro: "Teto diário de IA atingido.",
          tokensUsados: erro.tokensUsados,
          teto: erro.teto,
        },
        { status: 429 },
      );
    }
    console.error("Erro ao analisar edital com IA:", erro);
    return NextResponse.json(
      { erro: "Falha ao analisar o edital. Verifique o arquivo e tente novamente." },
      { status: 500 },
    );
  }
}
