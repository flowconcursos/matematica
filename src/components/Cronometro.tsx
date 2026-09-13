"use client";

import { useEffect, useState } from "react";

function formatar(segundos: number) {
  const m = Math.floor(segundos / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(segundos % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * Baseado no timestamp de início (não em um contador incremental), para
 * sobreviver a tela bloqueada, aba em segundo plano e troca de app —
 * ver seção 2 do documento de produto ("Resiliência da sessão").
 */
export function Cronometro({
  inicioTimestamp,
  metaSegundos,
  parado = false,
}: {
  inicioTimestamp: number;
  metaSegundos: number;
  parado?: boolean;
}) {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    if (parado) return;
    const id = setInterval(() => setAgora(Date.now()), 250);
    return () => clearInterval(id);
  }, [parado]);

  const segundosDecorridos = Math.floor((agora - inicioTimestamp) / 1000);
  const estourouMeta = segundosDecorridos > metaSegundos;
  const estourouDobro = segundosDecorridos > metaSegundos * 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`font-mono text-6xl font-semibold tabular-nums ${
          estourouMeta ? "text-red" : "text-ink"
        }`}
        aria-live="polite"
      >
        {formatar(segundosDecorridos)}
      </div>
      <div className="text-sm text-soft">meta: {formatar(metaSegundos)}</div>
      {estourouDobro && (
        <p className="mt-2 max-w-xs text-center text-sm text-red">
          Já passou do dobro da meta. Considere abandonar e registrar como
          erro por tempo: largar questão é habilidade de prova.
        </p>
      )}
    </div>
  );
}
