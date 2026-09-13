import { describe, expect, it } from "vitest";
import {
  avaliarRevisao,
  errosSeguidos,
  temAlertaPrerequisito,
  INTERVALOS_DIAS,
} from "./revisao";
import type { EntradaHistoricoRevisao } from "@/db/schema";

const AGORA = new Date("2026-01-01T12:00:00Z");

function diasDepois(dias: number) {
  const d = new Date(AGORA);
  d.setDate(d.getDate() + dias);
  return d;
}

describe("avaliarRevisao", () => {
  it("errar sempre volta para etapa 0, com próxima revisão em 1 dia", () => {
    const resultado = avaliarRevisao(2, false, AGORA);
    expect(resultado.etapa).toBe(0);
    expect(resultado.proximaData).toEqual(diasDepois(INTERVALOS_DIAS[0]));
    expect(resultado.concluidaEm).toBeNull();
  });

  it("acertar na etapa 0 avança para etapa 1, com próxima revisão em 3 dias", () => {
    const resultado = avaliarRevisao(0, true, AGORA);
    expect(resultado.etapa).toBe(1);
    expect(resultado.proximaData).toEqual(diasDepois(INTERVALOS_DIAS[1]));
    expect(resultado.concluidaEm).toBeNull();
  });

  it("acertar na etapa 1 avança para etapa 2, com próxima revisão em 7 dias", () => {
    const resultado = avaliarRevisao(1, true, AGORA);
    expect(resultado.etapa).toBe(2);
    expect(resultado.proximaData).toEqual(diasDepois(INTERVALOS_DIAS[2]));
  });

  it("acertar na etapa 2 avança para etapa 3, com próxima revisão em 21 dias", () => {
    const resultado = avaliarRevisao(2, true, AGORA);
    expect(resultado.etapa).toBe(3);
    expect(resultado.proximaData).toEqual(diasDepois(INTERVALOS_DIAS[3]));
  });

  it("acertar na etapa 3 gradua o item (concluida_em), sem próxima data", () => {
    const resultado = avaliarRevisao(3, true, AGORA);
    expect(resultado.etapa).toBe(3);
    expect(resultado.proximaData).toBeNull();
    expect(resultado.concluidaEm).toEqual(AGORA);
  });

  it("errar depois de graduado reabre a revisão na etapa 0", () => {
    const resultado = avaliarRevisao(3, false, AGORA);
    expect(resultado.etapa).toBe(0);
    expect(resultado.proximaData).toEqual(diasDepois(INTERVALOS_DIAS[0]));
    expect(resultado.concluidaEm).toBeNull();
  });
});

function historico(
  ...resultados: EntradaHistoricoRevisao["resultado"][]
): EntradaHistoricoRevisao[] {
  return resultados.map((resultado) => ({ data: AGORA.toISOString(), resultado }));
}

describe("errosSeguidos / temAlertaPrerequisito", () => {
  it("conta 0 quando o histórico está vazio", () => {
    expect(errosSeguidos([])).toBe(0);
    expect(temAlertaPrerequisito([])).toBe(false);
  });

  it("conta apenas os erros mais recentes, parando no primeiro acerto", () => {
    expect(errosSeguidos(historico("acertou", "errou", "errou"))).toBe(2);
  });

  it("não alerta com menos de 3 erros seguidos", () => {
    expect(temAlertaPrerequisito(historico("errou", "errou"))).toBe(false);
  });

  it("alerta com exatamente 3 erros seguidos", () => {
    expect(temAlertaPrerequisito(historico("errou", "errou", "errou"))).toBe(
      true,
    );
  });

  it("um acerto no meio quebra a sequência e derruba o alerta", () => {
    expect(
      temAlertaPrerequisito(historico("errou", "errou", "acertou", "errou")),
    ).toBe(false);
  });
});
