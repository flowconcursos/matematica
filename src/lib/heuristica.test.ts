import { describe, expect, it } from "vitest";
import {
  evidenciaSuficiente,
  heuristicaSuperada,
  podeArquivarPorInatividade,
  podeDestilarNovamente,
  proximaDestilacaoDisponivelEm,
  proximoContadorAcertos,
} from "./heuristica";

describe("evidenciaSuficiente", () => {
  it("exige ao menos 3 tentativas de evidência", () => {
    expect(evidenciaSuficiente(0)).toBe(false);
    expect(evidenciaSuficiente(2)).toBe(false);
    expect(evidenciaSuficiente(3)).toBe(true);
    expect(evidenciaSuficiente(10)).toBe(true);
  });
});

describe("proximoContadorAcertos", () => {
  it("incrementa em acerto firme", () => {
    expect(proximoContadorAcertos(0, true)).toBe(1);
    expect(proximoContadorAcertos(4, true)).toBe(5);
  });

  it("zera em qualquer resultado que não seja acerto firme", () => {
    expect(proximoContadorAcertos(4, false)).toBe(0);
  });
});

describe("heuristicaSuperada", () => {
  it("supera com 5 acertos firmes consecutivos", () => {
    expect(heuristicaSuperada(4)).toBe(false);
    expect(heuristicaSuperada(5)).toBe(true);
    expect(heuristicaSuperada(6)).toBe(true);
  });
});

describe("podeArquivarPorInatividade", () => {
  it("arquiva só a partir de 60 dias sem evidência nova", () => {
    expect(podeArquivarPorInatividade(59)).toBe(false);
    expect(podeArquivarPorInatividade(60)).toBe(true);
  });
});

describe("podeDestilarNovamente / proximaDestilacaoDisponivelEm", () => {
  it("permite quando nunca destilado", () => {
    expect(podeDestilarNovamente(null, new Date())).toBe(true);
  });

  it("bloqueia antes de 7 dias e libera depois", () => {
    const ultima = new Date("2026-01-05T00:00:00Z");
    expect(podeDestilarNovamente(ultima, new Date("2026-01-10T00:00:00Z"))).toBe(false);
    expect(podeDestilarNovamente(ultima, new Date("2026-01-12T00:00:00Z"))).toBe(true);
  });

  it("proximaDestilacaoDisponivelEm soma 7 dias", () => {
    const ultima = new Date("2026-01-05T00:00:00Z");
    expect(proximaDestilacaoDisponivelEm(ultima).toISOString()).toBe(
      "2026-01-12T00:00:00.000Z",
    );
  });
});
