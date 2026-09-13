import { describe, expect, it } from "vitest";
import { acertoFirme } from "./calculo";

const base = {
  acertou: true,
  confiancaDeclarada: "certo" as const,
  segundos: 50,
  metaSegundosNaEpoca: 60,
};

describe("acertoFirme", () => {
  it("é true quando acertou, confiança certo e dentro da meta", () => {
    expect(acertoFirme(base)).toBe(true);
  });

  it("é false quando errou, mesmo com confiança certo e dentro da meta", () => {
    expect(acertoFirme({ ...base, acertou: false })).toBe(false);
  });

  it("é false quando a confiança declarada não foi 'certo' (duvida)", () => {
    expect(acertoFirme({ ...base, confiancaDeclarada: "duvida" })).toBe(false);
  });

  it("é false quando a confiança declarada não foi 'certo' (chute)", () => {
    expect(acertoFirme({ ...base, confiancaDeclarada: "chute" })).toBe(false);
  });

  it("é false quando estourou a meta de tempo", () => {
    expect(acertoFirme({ ...base, segundos: 61, metaSegundosNaEpoca: 60 })).toBe(
      false,
    );
  });

  it("é true no limite exato da meta (segundos == meta)", () => {
    expect(acertoFirme({ ...base, segundos: 60, metaSegundosNaEpoca: 60 })).toBe(
      true,
    );
  });

  it("acerto bruto não é o mesmo que acerto firme", () => {
    const acertoBrutoComChute = {
      ...base,
      confiancaDeclarada: "chute" as const,
    };
    expect(acertoBrutoComChute.acertou).toBe(true);
    expect(acertoFirme(acertoBrutoComChute)).toBe(false);
  });
});
