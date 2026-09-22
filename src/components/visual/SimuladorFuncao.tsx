"use client";

import { useState } from "react";

export function SimuladorFuncao() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);

  const cx = 150;
  const cy = 120;
  const escala = 18;

  const xMin = -7;
  const xMax = 7;
  const yMin = a * xMin + b;
  const yMax = a * xMax + b;

  const svgX1 = cx + xMin * escala;
  const svgY1 = cy - yMin * escala;
  const svgX2 = cx + xMax * escala;
  const svgY2 = cy - yMax * escala;

  const raiz = a !== 0 ? (-b / a).toFixed(2) : null;

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-green bg-green/10 px-2 py-0.5 rounded-md">
            Álgebra Geométrica
          </span>
          <h3 className="font-serif text-xl font-normal text-ink mt-1">
            Gráfico Vivo da Função Afim: f(x) = ax + b
          </h3>
          <p className="text-xs text-soft">
            Arraste os coeficientes e sinta a reta subir, descer, inclinar e cortar os eixos.
          </p>
        </div>

        <div className="bg-surface-alt px-4 py-2 rounded-xl border border-line font-mono text-center">
          <span className="text-[10px] uppercase text-soft block">Lei da Função</span>
          <span className="text-base font-bold text-ink">
            f(x) = {a}x {b >= 0 ? "+ " + b : "- " + Math.abs(b)}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col items-center justify-center p-4 bg-[#FDFCFA] rounded-xl border border-line/60">
          <div className="relative w-full max-w-[320px] aspect-4/3 overflow-hidden rounded-lg bg-surface border border-line/40">
            <svg viewBox="0 0 300 240" className="w-full h-full">
              {[-6, -4, -2, 2, 4, 6].map((gridX) => (
                <line
                  key={"gx-" + gridX}
                  x1={cx + gridX * escala}
                  y1="0"
                  x2={cx + gridX * escala}
                  y2="240"
                  stroke="#F4F2EB"
                  strokeWidth="1"
                />
              ))}
              {[-5, -3, -1, 1, 3, 5].map((gridY) => (
                <line
                  key={"gy-" + gridY}
                  x1="0"
                  y1={cy - gridY * escala}
                  x2="300"
                  y2={cy - gridY * escala}
                  stroke="#F4F2EB"
                  strokeWidth="1"
                />
              ))}

              <line x1="0" y1={cy} x2="300" y2={cy} stroke="#A8A29E" strokeWidth="1.5" />
              <line x1={cx} y1="0" x2={cx} y2="240" stroke="#A8A29E" strokeWidth="1.5" />

              <line
                x1={svgX1}
                y1={svgY1}
                x2={svgX2}
                y2={svgY2}
                stroke={a > 0 ? "#16A34A" : a < 0 ? "#DC2626" : "#2563EB"}
                strokeWidth="3"
                className="transition-all duration-150"
              />

              <circle
                cx={cx}
                cy={cy - b * escala}
                r="5"
                fill="#2563EB"
                stroke="#FFFFFF"
                strokeWidth="2"
              />

              {raiz !== null && (
                <circle
                  cx={cx + Number(raiz) * escala}
                  cy={cy}
                  r="5"
                  fill="#A36F1E"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              )}
            </svg>
          </div>

          <div className="mt-3 flex items-center justify-between w-full text-[11px] font-mono text-soft">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue" />
              Corte Y (b): (0, {b})
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber" />
              Raiz (f(x)=0): {raiz !== null ? "x = " + raiz : "Não cruza"}
            </span>
            <span className="font-bold text-ink">
              {a > 0 ? "↗️ Crescente" : a < 0 ? "↘️ Decrescente" : "➡️ Constante"}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-ink">
                Coeficiente Angular (a) &bull; Taxa / Inclinação:
              </label>
              <span className="text-xs font-mono font-bold text-ink">{a}</span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.5"
              value={a}
              onChange={(e) => setA(Number(e.target.value))}
              className="w-full accent-green cursor-pointer"
            />
            <span className="text-[11px] text-soft font-serif block mt-1">
              {a > 0 ? "Reta sobe para a direita." : a < 0 ? "Reta desce para a direita." : "Reta totalmente horizontal."}
            </span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-ink">
                Coeficiente Linear (b) &bull; Ponto de Partida / Fixo:
              </label>
              <span className="text-xs font-mono font-bold text-ink">{b}</span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="1"
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              className="w-full accent-blue cursor-pointer"
            />
            <span className="text-[11px] text-soft font-serif block mt-1">
              Onde a reta corta o eixo vertical (Y).
            </span>
          </div>

          <div className="rounded-xl border border-line bg-surface-alt p-4 text-xs space-y-1.5">
            <strong className="font-bold text-ink block">🚕 A Analogia do Táxi (Questão Certa de Prova):</strong>
            <p className="text-soft leading-relaxed font-serif">
              "Um táxi cobra R$ <strong>{b}</strong> de bandeirada fixa (valor de <em>b</em>) mais R$ <strong>{a}</strong> por km rodado (valor de <em>a</em>)".
              O preço final da corrida após <em>x</em> quilômetros é exatamente: <code>P(x) = {a}x + {b}</code>!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
