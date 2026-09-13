import { GoogleGenAI, type Schema } from "@google/genai";

/**
 * Nomes de modelo conferidos em ai.google.dev/gemini-api/docs/models em
 * 2026-09-13 (ver seção 2 do doc de produto — a linha muda com
 * frequência, então revalide antes de trocar). "flash" para tarefas de
 * rotina (classificador, explicação); "pro" para análises pesadas
 * (diagnóstico, dossiê — Fases 5/6).
 */
export const MODELO_FLASH = "gemini-3.5-flash";
export const MODELO_PRO = "gemini-3.1-pro-preview";

export class OrcamentoDiarioExcedidoError extends Error {
  constructor(
    public readonly tokensUsados: number,
    public readonly teto: number,
  ) {
    super(
      `Teto diário de IA excedido: ${tokensUsados} de ${teto} tokens já usados hoje.`,
    );
    this.name = "OrcamentoDiarioExcedidoError";
  }
}

/** Verificação pura do limiar, separada da leitura do banco para ser testável. */
export function orcamentoExcedido(tokensUsados: number, teto: number): boolean {
  return teto > 0 && tokensUsados >= teto;
}

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type ResultadoChamada = {
  texto: string;
  tokensEntrada: number;
  tokensSaida: number;
};

export type ChamarModelo = () => Promise<ResultadoChamada>;

/**
 * Retry com backoff exponencial. Lógica pura (sem tocar o SDK real),
 * testável injetando um `chamar` fake — o doc de produto proíbe chamar
 * a API do Gemini em teste automatizado.
 */
export async function comRetentativa(
  chamar: ChamarModelo,
  opcoes: { tentativasMax?: number; esperaBaseMs?: number } = {},
): Promise<ResultadoChamada> {
  const tentativasMax = opcoes.tentativasMax ?? 3;
  const esperaBaseMs = opcoes.esperaBaseMs ?? 500;

  let ultimoErro: unknown;
  for (let tentativa = 0; tentativa < tentativasMax; tentativa++) {
    try {
      return await chamar();
    } catch (erro) {
      ultimoErro = erro;
      if (tentativa < tentativasMax - 1) {
        await esperar(esperaBaseMs * 2 ** tentativa);
      }
    }
  }
  throw ultimoErro;
}

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Chamada à IA excedeu o timeout de ${ms}ms.`);
    this.name = "TimeoutError";
  }
}

export function comTimeout<T>(promessa: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promessa,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new TimeoutError(ms)), ms);
    }),
  ]);
}

let clienteSingleton: GoogleGenAI | null = null;

function obterCliente(): GoogleGenAI {
  if (!clienteSingleton) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY não configurada no servidor.");
    }
    clienteSingleton = new GoogleGenAI({ apiKey });
  }
  return clienteSingleton;
}

export async function chamarGemini(params: {
  modelo: string;
  prompt: string;
  responseSchema: Schema;
}): Promise<ResultadoChamada> {
  const ai = obterCliente();
  const resposta = await ai.models.generateContent({
    model: params.modelo,
    contents: params.prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: params.responseSchema,
    },
  });

  const texto = resposta.text;
  if (!texto) {
    throw new Error("Resposta vazia do modelo.");
  }

  return {
    texto,
    tokensEntrada: resposta.usageMetadata?.promptTokenCount ?? 0,
    tokensSaida: resposta.usageMetadata?.candidatesTokenCount ?? 0,
  };
}
