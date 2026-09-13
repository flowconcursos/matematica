"use client";

import { useEffect, useRef, useState } from "react";

function formatar(segundos: number) {
  const m = Math.floor(Math.max(0, segundos) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(Math.max(0, segundos) % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * Cronômetro regressivo do tempo total do simulado (seção 4.4: "modo
 * prova... só o tempo total corre"). Baseado no timestamp de início,
 * não em contador, pela mesma razão do Cronometro por questão.
 */
export function CronometroTotal({
  inicioTimestamp,
  metaSegundos,
  onEsgotar,
}: {
  inicioTimestamp: number;
  metaSegundos: number;
  onEsgotar: () => void;
}) {
  const [agora, setAgora] = useState(() => Date.now());
  const jaEsgotouRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const decorridos = Math.floor((agora - inicioTimestamp) / 1000);
  const restante = metaSegundos - decorridos;

  useEffect(() => {
    if (restante <= 0 && !jaEsgotouRef.current) {
      jaEsgotouRef.current = true;
      onEsgotar();
    }
  }, [restante, onEsgotar]);

  return (
    <div
      className={`font-mono text-3xl font-semibold tabular-nums ${
        restante <= 60 ? "text-red" : "text-ink"
      }`}
      aria-live="polite"
    >
      {formatar(restante)}
    </div>
  );
}
