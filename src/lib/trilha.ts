import type { DominioTopico } from "@/lib/dominio";

/**
 * Tópico só libera quando todos os seus pré-requisitos diretos estão
 * "firme" (seção 4.3 do doc de produto: "o bloqueio é a função
 * principal do módulo"). Sem pré-requisitos, está sempre liberado.
 * Um pré-requisito ausente do mapa de domínio conta como não
 * avaliado, ou seja, bloqueia.
 */
export function topicoLiberado(
  prerequisitosDiretos: string[],
  dominioPorTopico: Map<string, DominioTopico>,
): boolean {
  return prerequisitosDiretos.every(
    (topicoId) => dominioPorTopico.get(topicoId) === "firme",
  );
}

/**
 * Teste relâmpago do botão "não concordo com o bloqueio" (seção 4.3):
 * 5 questões do pré-requisito bloqueador; acertar libera. O doc não
 * define um limiar de acerto — decisão provisória: exige acerto de
 * todas as 5, por ser um teste deliberadamente rigoroso (é uma
 * exceção ao bloqueio normal, não deveria ser fácil de contornar).
 */
export const RELAMPAGO_TOTAL_QUESTOES = 5;

export function relampagoAprovado(acertos: number): boolean {
  return acertos >= RELAMPAGO_TOTAL_QUESTOES;
}
