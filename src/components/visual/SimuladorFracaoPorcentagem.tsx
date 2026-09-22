"use client";

import { useState } from "react";

export function SimuladorFracaoPorcentagem() {
  const [numerador, setNumerador] = useState(3);
  const [denominador, setDenominador] = useState(8);

  const num = Math.min(numerador, denominador);
  const den = Math.max(1, denominador);
  const porcentagem = ((num / den) * 100).toFixed(1);
  const decimal = (num / den).toFixed(3);

  const fatias = Array.from({ length: den }, (_, i) => {
    const anguloPorFatia = 360 / den;
    const startAngle = i * anguloPorFatia;
    const endAngle = (i + 1) * anguloPorFatia;
    const selected = i < num;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const cx = 100;
    const cy = 100;
    const r = 80;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArc = anguloPorFatia > 180 ? 1 : 0;

    const d = den === 1
      ? "M " + (cx - r) + " " + cy + " A " + r + " " + r + " 0 1 0 " + (cx + r) + " " + cy + " A " + r + " " + r + " 0 1 0 " + (cx - r) + " " + cy
      : "M " + cx + " " + cy + " L " + x1 + " " + y1 + " A " + r + " " + r + " 0 " + largeArc + " 1 " + x2 + " " + y2 + " Z";

    return { id: i, d, selected };
  });

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber bg-amber/10 px-2 py-0.5 rounded-md">
            Visualizador Sensorial
          </span>
          <h3 className="font-serif text-xl font-normal text-ink mt-1">
            Fatiamento de Frações & Porcentagem
          </h3>
          <p className="text-xs text-soft">
            Mude o numerador (quantas você pegou) e o denominador (em quantas foi dividida).
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface-alt px-4 py-2.5 rounded-xl border border-line font-mono text-center">
          <div>
            <span className="text-[10px] uppercase text-soft block">Fração</span>
            <span className="text-base font-bold text-ink">{num}/{den}</span>
          </div>
          <span className="text-soft font-bold">=</span>
          <div>
            <span className="text-[10px] uppercase text-soft block">Decimal</span>
            <span className="text-base font-bold text-blue">{decimal}</span>
          </div>
          <span className="text-soft font-bold">=</span>
          <div>
            <span className="text-[10px] uppercase text-soft block">Porcentagem</span>
            <span className="text-base font-bold text-green">{porcentagem}%</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col items-center justify-center p-4 bg-[#FDFCFA] rounded-xl border border-line/60">
          <div className="relative w-52 h-52">
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xs">
              <circle cx="100" cy="100" r="82" fill="#F4F2EB" stroke="#E8E5DD" strokeWidth="2" />
              {fatias.map((fatia) => (
                <path
                  key={fatia.id}
                  d={fatia.d}
                  fill={fatia.selected ? "#A36F1E" : "#FFFFFF"}
                  fillOpacity={fatia.selected ? "0.9" : "0.7"}
                  stroke="#FAF8F5"
                  strokeWidth="2.5"
                  className="transition-all duration-300 cursor-pointer hover:opacity-80"
                  onClick={() => setNumerador(fatia.id + 1)}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="bg-surface/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-mono font-bold text-ink shadow-xs border border-line">
                {num} de {den}
              </span>
            </div>
          </div>

          <div className="w-full mt-6">
            <div className="flex justify-between text-[11px] font-mono text-soft mb-1.5">
              <span>Barra Linear (0%)</span>
              <span>{porcentagem}% Preenchida</span>
              <span>100%</span>
            </div>
            <div className="h-6 w-full rounded-lg bg-surface-alt border border-line overflow-hidden flex">
              {Array.from({ length: den }).map((_, i) => (
                <div
                  key={i}
                  onClick={() => setNumerador(i + 1)}
                  className={"flex-1 border-r border-paper last:border-0 cursor-pointer transition-colors duration-200 " + (i < num ? "bg-amber" : "bg-transparent hover:bg-amber/20")}
                  title={"Fatia " + (i + 1) + " de " + den}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-ink">
                  Fatias Pegas (Numerador): <strong className="font-mono text-amber text-sm">{num}</strong>
                </label>
                <span className="text-[11px] text-soft font-mono">1 até {den}</span>
              </div>
              <input
                type="range"
                min="0"
                max={den}
                value={num}
                onChange={(e) => setNumerador(Number(e.target.value))}
                className="w-full accent-amber cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-ink">
                  Total de Fatias (Denominador): <strong className="font-mono text-ink text-sm">{den}</strong>
                </label>
                <span className="text-[11px] text-soft font-mono">1 até 16</span>
              </div>
              <input
                type="range"
                min="1"
                max="16"
                value={den}
                onChange={(e) => {
                  const novoDen = Number(e.target.value);
                  setDenominador(novoDen);
                  if (num > novoDen) setNumerador(novoDen);
                }}
                className="w-full accent-ink cursor-pointer"
              />
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-soft block mb-2 uppercase tracking-wider">
              Casos Muito Comuns em Provas:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "1/2 (50%)", n: 1, d: 2 },
                { label: "1/4 (25%)", n: 1, d: 4 },
                { label: "3/4 (75%)", n: 3, d: 4 },
                { label: "1/5 (20%)", n: 1, d: 5 },
                { label: "1/10 (10%)", n: 1, d: 10 },
                { label: "3/8 (37.5%)", n: 3, d: 8 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setDenominador(preset.d);
                    setNumerador(preset.n);
                  }}
                  className="px-2.5 py-1 text-xs font-mono rounded-lg border border-line bg-surface hover:border-amber hover:text-amber transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-amber/20 bg-[#FAF7F0] p-3 text-xs leading-relaxed text-soft font-serif">
            <strong className="font-bold text-ink block mb-0.5">💡 Insight de Concurso:</strong>
            Em qualquer questão onde a banca disser <em>"3 a cada 8 candidatos passaram"</em>, pense imediatamente na fração <strong>3/8</strong> e multiplique pelo total de inscritos!
          </div>
        </div>
      </div>
    </div>
  );
}
