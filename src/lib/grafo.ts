export type Aresta = {
  topicoId: string;
  dependeDeTopicoId: string;
};

/**
 * Verifica se acrescentar `novaAresta` ao grafo dirigido de
 * pré-requisitos criaria um ciclo (seção 3 do doc de produto: "grafo
 * dirigido, sem ciclos; validado na escrita"). Uma aresta (A, B)
 * significa "A depende de B". Há ciclo se B já depende
 * (transitivamente) de A — nesse caso, fazer A depender de B fecharia
 * o ciclo.
 */
export function haveriaCiclo(
  arestasExistentes: Aresta[],
  novaAresta: Aresta,
): boolean {
  if (novaAresta.topicoId === novaAresta.dependeDeTopicoId) return true;

  const adjacencia = new Map<string, string[]>();
  for (const aresta of arestasExistentes) {
    const lista = adjacencia.get(aresta.topicoId) ?? [];
    lista.push(aresta.dependeDeTopicoId);
    adjacencia.set(aresta.topicoId, lista);
  }

  const visitados = new Set<string>();
  const pilha = [novaAresta.dependeDeTopicoId];

  while (pilha.length > 0) {
    const atual = pilha.pop()!;
    if (atual === novaAresta.topicoId) return true;
    if (visitados.has(atual)) continue;
    visitados.add(atual);
    for (const proximo of adjacencia.get(atual) ?? []) {
      pilha.push(proximo);
    }
  }

  return false;
}
