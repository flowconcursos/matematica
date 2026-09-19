import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Type } from "@google/genai";
import { exigirSessao } from "@/lib/api";
import { gerarSaidaEstruturada } from "@/lib/ai-db";
import { MODELO_FLASH, OrcamentoDiarioExcedidoError } from "@/lib/ai";

const interpretarSchema = z.object({
  enunciado: z.string().min(15, "O enunciado deve ter pelo menos 15 caracteres."),
  banca: z.string().optional(),
  alternativas: z.array(z.string()).optional(),
});

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    comandoReal: {
      type: Type.STRING,
      description: "O que a banca está realmente perguntando de forma direta e sem rodeios (ex: 'Achar o valor restante pós-desconto').",
    },
    dadosEssenciais: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista dos dados numéricos fundamentais e condições que entram no cálculo.",
    },
    ruidosEDistracoes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Informações da historinha colocadas pela banca que NÃO influenciam a conta.",
    },
    armadilhasEPegadinhas: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Armadilhas clássicas (inversão de grandezas, unidades diferentes, descontos sucessivos, ordem de alternativas).",
    },
    traducaoAlgebrica: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          fraseTexto: { type: Type.STRING },
          expressaoMatematica: { type: Type.STRING },
        },
        required: ["fraseTexto", "expressaoMatematica"],
      },
      description: "Mapeamento linha a linha do Português para a Álgebra em LaTeX.",
    },
    puloDoGato: {
      type: Type.STRING,
      description: "O macete ou atalho mais rápido para responder em prova de concurso (ex: eliminação de absurdos, testar letras).",
    },
    passoAPassoSugerido: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Etapas ordenadas de como executar a resolução sem medo.",
    },
  },
  required: [
    "comandoReal",
    "dadosEssenciais",
    "ruidosEDistracoes",
    "armadilhasEPegadinhas",
    "traducaoAlgebrica",
    "puloDoGato",
    "passoAPassoSugerido",
  ],
};

function montarPrompt(dados: z.infer<typeof interpretarSchema>): string {
  const infoBanca = dados.banca ? `Banca examinadora: ${dados.banca}` : "Banca: Concurso público geral de nível médio";
  const infoAlternativas = dados.alternativas && dados.alternativas.length > 0
    ? `\nAlternativas fornecidas:\n${dados.alternativas.join("\n")}`
    : "";

  return `Você é um professor especialista em interpretação de questões de Matemática e Raciocínio Lógico para concursos públicos de nível médio brasileiros (FGV, Cebraspe, Vunesp, FCC, Cesgranrio).

O aluno colou o seguinte enunciado para você dissecar detalhadamente:
${infoBanca}
Enunciado:
"""
${dados.enunciado}
"""
${infoAlternativas}

Sua missão pedagógica:
1. Destaque qual é o COMANDO REAL da questão (muitas vezes escondido na última frase).
2. Separe claramente os DADOS ESSENCIAIS (que entram na conta) dos RUÍDOS E DISTRAÇÕES (história irrelevante).
3. Aponte as ARMADILHAS E PEGADINHAS típicas de concurso que a banca tentou armar.
4. Faça a TRADUÇÃO ALGEBRICA de cada trecho do texto em linguagem matemática (use notação LaTeX elegante, ex: 2x, \\frac{a}{b}, x \\times 1{,}20).
5. Revele o PULO DO GATO (como resolver no menor tempo possível, testando alternativas ou usando propriedades especiais).
6. Forneça o PASSO A PASSO SUGERIDO ordenado de forma clara e encorajadora.

Seja extremamente didático, empático e focado no concurseiro que tem medo de enunciados longos.`;
}

export async function POST(request: NextRequest) {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const corpo = await request.json();
  const validacao = interpretarSchema.safeParse(corpo);
  if (!validacao.success) {
    return NextResponse.json(
      { erro: "Dados inválidos.", detalhes: validacao.error.flatten() },
      { status: 400 },
    );
  }

  const prompt = montarPrompt(validacao.data);

  try {
    const analise = await gerarSaidaEstruturada({
      tarefa: "interpretar_enunciado",
      modelo: MODELO_FLASH,
      prompt,
      responseSchema,
    });

    return NextResponse.json({
      sucesso: true,
      analise,
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
    console.error("Erro ao interpretar enunciado com IA:", erro);
    return NextResponse.json(
      { erro: "Falha ao analisar enunciado. Tente novamente em instantes." },
      { status: 500 },
    );
  }
}
