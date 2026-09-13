export type TentativaParaCalculo = {
  acertou: boolean;
  confiancaDeclarada: "certo" | "duvida" | "chute";
  segundos: number;
  metaSegundosNaEpoca: number;
};

/**
 * acerto_firme = acertou AND confianca = certo AND segundos <= meta_segundos_na_epoca
 * Ver seção 3 do documento de produto: é a métrica principal do app,
 * nunca o acerto bruto.
 */
export function acertoFirme(t: TentativaParaCalculo): boolean {
  return (
    t.acertou &&
    t.confiancaDeclarada === "certo" &&
    t.segundos <= t.metaSegundosNaEpoca
  );
}
