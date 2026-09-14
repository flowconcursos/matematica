import { describe, expect, it } from "vitest";
import { elegivelParaDiagnostico } from "./diagnostico";

describe("elegivelParaDiagnostico", () => {
  it("nunca é elegível sem tentativas novas", () => {
    expect(elegivelParaDiagnostico(null, new Date(), 0)).toBe(false);
  });

  it("é elegível na primeira vez, havendo ao menos 1 tentativa", () => {
    expect(elegivelParaDiagnostico(null, new Date(), 1)).toBe(true);
  });

  it("bloqueia antes de 7 dias e menos de 100 tentativas", () => {
    const ultimo = new Date("2026-01-01T00:00:00Z");
    const agora = new Date("2026-01-05T00:00:00Z");
    expect(elegivelParaDiagnostico(ultimo, agora, 40)).toBe(false);
  });

  it("libera com 7 dias mesmo com poucas tentativas", () => {
    const ultimo = new Date("2026-01-01T00:00:00Z");
    const agora = new Date("2026-01-08T00:00:00Z");
    expect(elegivelParaDiagnostico(ultimo, agora, 5)).toBe(true);
  });

  it("libera com 100 tentativas mesmo antes de 7 dias", () => {
    const ultimo = new Date("2026-01-01T00:00:00Z");
    const agora = new Date("2026-01-02T00:00:00Z");
    expect(elegivelParaDiagnostico(ultimo, agora, 100)).toBe(true);
  });
});
