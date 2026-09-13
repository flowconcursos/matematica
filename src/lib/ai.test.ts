import { describe, expect, it, vi } from "vitest";
import {
  comRetentativa,
  comTimeout,
  orcamentoExcedido,
  TimeoutError,
  type ResultadoChamada,
} from "./ai";

const RESULTADO: ResultadoChamada = {
  texto: "{}",
  tokensEntrada: 10,
  tokensSaida: 5,
};

describe("orcamentoExcedido", () => {
  it("não excede quando não há teto configurado (0)", () => {
    expect(orcamentoExcedido(999999, 0)).toBe(false);
  });

  it("não excede quando usado está abaixo do teto", () => {
    expect(orcamentoExcedido(50, 100)).toBe(false);
  });

  it("excede quando usado atinge o teto", () => {
    expect(orcamentoExcedido(100, 100)).toBe(true);
  });

  it("excede quando usado passa do teto", () => {
    expect(orcamentoExcedido(150, 100)).toBe(true);
  });
});

describe("comRetentativa", () => {
  it("retorna no primeiro sucesso sem retentar", async () => {
    const chamar = vi.fn().mockResolvedValue(RESULTADO);
    const resultado = await comRetentativa(chamar, { esperaBaseMs: 1 });
    expect(resultado).toEqual(RESULTADO);
    expect(chamar).toHaveBeenCalledTimes(1);
  });

  it("tenta de novo após falha e retorna no segundo sucesso", async () => {
    const chamar = vi
      .fn()
      .mockRejectedValueOnce(new Error("falha transitória"))
      .mockResolvedValueOnce(RESULTADO);

    const resultado = await comRetentativa(chamar, { esperaBaseMs: 1 });
    expect(resultado).toEqual(RESULTADO);
    expect(chamar).toHaveBeenCalledTimes(2);
  });

  it("desiste após esgotar as tentativas e propaga o último erro", async () => {
    const erroFinal = new Error("falha permanente");
    const chamar = vi.fn().mockRejectedValue(erroFinal);

    await expect(
      comRetentativa(chamar, { tentativasMax: 3, esperaBaseMs: 1 }),
    ).rejects.toThrow(erroFinal);
    expect(chamar).toHaveBeenCalledTimes(3);
  });
});

describe("comTimeout", () => {
  it("resolve normalmente quando termina antes do timeout", async () => {
    const promessa = new Promise<string>((resolve) =>
      setTimeout(() => resolve("ok"), 5),
    );
    await expect(comTimeout(promessa, 200)).resolves.toBe("ok");
  });

  it("rejeita com TimeoutError quando demora mais que o limite", async () => {
    const promessa = new Promise<string>((resolve) =>
      setTimeout(() => resolve("tarde demais"), 100),
    );
    await expect(comTimeout(promessa, 10)).rejects.toBeInstanceOf(TimeoutError);
  });
});
