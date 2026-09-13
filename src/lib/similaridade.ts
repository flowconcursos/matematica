const REGEX_DIACRITICOS = new RegExp("[̀-ͯ]", "g");

function normalizar(texto: string): string[] {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(REGEX_DIACRITICOS, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Similaridade de Jaccard sobre o conjunto de palavras normalizadas
 * (minúsculas, sem acento, sem pontuação). Simples e sem dependências
 * externas — o doc pede "detecção de duplicata por similaridade" sem
 * especificar o algoritmo.
 */
export function similaridadeJaccard(a: string, b: string): number {
  const tokensA = new Set(normalizar(a));
  const tokensB = new Set(normalizar(b));
  if (tokensA.size === 0 && tokensB.size === 0) return 1;

  let intersecao = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) intersecao++;
  }
  const uniao = new Set([...tokensA, ...tokensB]).size;
  return uniao === 0 ? 0 : intersecao / uniao;
}

/**
 * Limiar de "possível duplicata" — decisão provisória (o doc não dá
 * número). 0.6 pega parafraseamentos próximos sem disparar em questões
 * só do mesmo tópico/vocabulário.
 */
export const LIMIAR_DUPLICATA = 0.6;

export function encontrarDuplicataMaisProxima<T extends { id: string; enunciado: string }>(
  enunciado: string,
  existentes: T[],
): (T & { similaridade: number }) | null {
  let melhor: (T & { similaridade: number }) | null = null;
  for (const existente of existentes) {
    const similaridade = similaridadeJaccard(enunciado, existente.enunciado);
    if (similaridade >= LIMIAR_DUPLICATA && (!melhor || similaridade > melhor.similaridade)) {
      melhor = { ...existente, similaridade };
    }
  }
  return melhor;
}
