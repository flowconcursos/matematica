import { acertoFirme, type TentativaParaCalculo } from "@/lib/calculo";

export type DominioTopico = "nao_avaliado" | "fragil" | "em_construcao" | "firme";

export type TentativaParaDominio = TentativaParaCalculo & { data: Date | string };

const MIN_TENTATIVAS_FIRME = 15;
const MIN_DIAS_DISTINTOS_FIRME = 2;
const TAXA_FIRME_MINIMA = 0.8;
const TAXA_FRAGIL_MAXIMA = 0.5;

/**
 * Classifica o domínio de um tópico a partir das tentativas de suas
 * questões (seção 4.3 do doc de produto). "firme" exige acerto firme
 * >= 80% em >= 15 tentativas, espalhadas em pelo menos 2 dias
 * diferentes — volume num único dia não conta como domínio.
 *
 * Os limiares de "frágil" e "em construção" não são especificados no
 * documento (só "firme" é definido com números); são uma decisão
 * provisória, documentada no README, até haver critério melhor.
 */
export function classificarDominio(
  tentativas: TentativaParaDominio[],
): DominioTopico {
  if (tentativas.length === 0) return "nao_avaliado";

  const taxaAcertoFirme =
    tentativas.filter(acertoFirme).length / tentativas.length;

  const diasDistintos = new Set(
    tentativas.map((t) => new Date(t.data).toISOString().slice(0, 10)),
  ).size;

  const evidenciaSuficiente =
    tentativas.length >= MIN_TENTATIVAS_FIRME &&
    diasDistintos >= MIN_DIAS_DISTINTOS_FIRME;

  if (taxaAcertoFirme >= TAXA_FIRME_MINIMA && evidenciaSuficiente) {
    return "firme";
  }
  if (taxaAcertoFirme < TAXA_FRAGIL_MAXIMA) {
    return "fragil";
  }
  return "em_construcao";
}
