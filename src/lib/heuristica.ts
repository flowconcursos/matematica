const MINIMO_EVIDENCIAS = 3;
const ACERTOS_PARA_SUPERAR = 5;
const DIAS_PARA_ARQUIVAR = 60;
const DIAS_ENTRE_DESTILACOES = 7;

/**
 * Tarefa C (seção 5): "mínimo de 3 tentativas de evidência". Usado tanto
 * ao aceitar uma heurística recém-destilada quanto para rejeitar qualquer
 * candidata da IA que cite menos evidência do que isso.
 */
export function evidenciaSuficiente(nTentativas: number): boolean {
  return nTentativas >= MINIMO_EVIDENCIAS;
}

/**
 * "Superada após 5 acertos firmes consecutivos no gatilho." O gatilho é
 * texto livre (não há como o código detectar automaticamente se uma nova
 * questão o contém), então o contador usa acerto firme no mesmo tópico
 * como proxy — decisão provisória documentada no README.
 */
export function proximoContadorAcertos(atual: number, acertoFirme: boolean): number {
  return acertoFirme ? atual + 1 : 0;
}

export function heuristicaSuperada(acertosConsecutivos: number): boolean {
  return acertosConsecutivos >= ACERTOS_PARA_SUPERAR;
}

/** "Arquivada sem evidência nova em 60 dias." */
export function podeArquivarPorInatividade(diasSemEvidenciaNova: number): boolean {
  return diasSemEvidenciaNova >= DIAS_PARA_ARQUIVAR;
}

/** Tarefa C roda semanalmente, mesmo cap usado no dossiê (seção 2). */
export function podeDestilarNovamente(ultimaDestilacao: Date | null, agora: Date): boolean {
  if (!ultimaDestilacao) return true;
  const dias = (agora.getTime() - ultimaDestilacao.getTime()) / (1000 * 60 * 60 * 24);
  return dias >= DIAS_ENTRE_DESTILACOES;
}

export function proximaDestilacaoDisponivelEm(ultimaDestilacao: Date): Date {
  const proxima = new Date(ultimaDestilacao);
  proxima.setDate(proxima.getDate() + DIAS_ENTRE_DESTILACOES);
  return proxima;
}
