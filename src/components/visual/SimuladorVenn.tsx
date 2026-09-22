"use client";

import { useState } from "react";

export function SimuladorVenn() {
  const [apenasA, setApenasA] = useState(35);
  const [intersecao, setIntersecao] = useState(15);
  const [apenasB, setApenasB] = useState(25);
  const [nenhum, setNenhum] = useState(25);

  const [regiaoDestaque, setRegiaoDestaque] = useState<string | null>(null);

  const totalGrupoA = apenasA + intersecao;
  const totalGrupoB = apenasB + intersecao;
  const totalGeral = apenasA + intersecao + apenasB + nenhum;

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue bg-blue/10 px-2 py-0.5 rounded-md">
            Lógica de Conjuntos
          </span>
          <h3 className="font-serif text-xl font-normal text-ink mt-1">
            Diagrama de Venn Interativo
          </h3>
          <p className="text-xs text-soft">
            Passe o mouse ou clique nas áreas para entender o que a banca chama de "Apenas", "Ambos" e "Ao Menos Um".
          </p>
        </div>

        <div className="bg-surface-alt px-3.5 py-1.5 rounded-xl border border-line text-xs font-mono text-center">
          <span className="text-soft block text-[10px] uppercase">Universo Total (N)</span>
          <strong className="text-base text-ink">{totalGeral} pessoas</strong>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-[#FDFCFA] rounded-xl border border-line/60">
          <svg viewBox="0 0 360 220" className="w-full max-w-md h-auto">
            <rect
              x="10"
              y="10"
              width="340"
              height="200"
              rx="12"
              fill={regiaoDestaque === "nenhum" ? "#FEE2E2" : "#FAF8F5"}
              stroke="#D6D2C4"
              strokeWidth="1.5"
              className="cursor-pointer transition-colors"
              onClick={() => setRegiaoDestaque(regiaoDestaque === "nenhum" ? null : "nenhum")}
            />
            <text x="25" y="32" className="text-[10px] font-mono fill-soft font-bold uppercase">
              Universo (N = {totalGeral})
            </text>

            <circle
              cx="135"
              cy="115"
              r="68"
              fill={
                regiaoDestaque === "apenasA"
                  ? "#93C5FD"
                  : regiaoDestaque === "totalA"
                  ? "#BFDBFE"
                  : "#3B82F6"
              }
              fillOpacity={regiaoDestaque === "apenasA" || regiaoDestaque === "totalA" ? "0.6" : "0.2"}
              stroke="#2563EB"
              strokeWidth="2"
              className="cursor-pointer transition-colors"
              onClick={() => setRegiaoDestaque(regiaoDestaque === "apenasA" ? null : "apenasA")}
            />

            <circle
              cx="225"
              cy="115"
              r="68"
              fill={
                regiaoDestaque === "apenasB"
                  ? "#86EFAC"
                  : regiaoDestaque === "totalB"
                  ? "#BBF7D0"
                  : "#10B981"
              }
              fillOpacity={regiaoDestaque === "apenasB" || regiaoDestaque === "totalB" ? "0.6" : "0.2"}
              stroke="#059669"
              strokeWidth="2"
              className="cursor-pointer transition-colors"
              onClick={() => setRegiaoDestaque(regiaoDestaque === "apenasB" ? null : "apenasB")}
            />

            <text
              x="100"
              y="120"
              textAnchor="middle"
              className="font-mono text-sm font-bold fill-blue cursor-pointer"
              onClick={() => setRegiaoDestaque("apenasA")}
            >
              {apenasA}
            </text>
            <text x="100" y="135" textAnchor="middle" className="text-[9px] fill-soft">
              Apenas Direito
            </text>

            <text
              x="180"
              y="115"
              textAnchor="middle"
              className="font-mono text-sm font-bold fill-purple cursor-pointer"
              onClick={() => setRegiaoDestaque("intersecao")}
            >
              {intersecao}
            </text>
            <text x="180" y="130" textAnchor="middle" className="text-[9px] font-bold fill-purple">
              Ambos
            </text>

            <text
              x="260"
              y="120"
              textAnchor="middle"
              className="font-mono text-sm font-bold fill-green cursor-pointer"
              onClick={() => setRegiaoDestaque("apenasB")}
            >
              {apenasB}
            </text>
            <text x="260" y="135" textAnchor="middle" className="text-[9px] fill-soft">
              Apenas TI
            </text>

            <text
              x="300"
              y="190"
              textAnchor="middle"
              className="font-mono text-xs font-bold fill-red cursor-pointer"
              onClick={() => setRegiaoDestaque("nenhum")}
            >
              Nenhum: {nenhum}
            </text>
          </svg>

          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            <button
              onClick={() => setRegiaoDestaque("totalA")}
              className="px-2.5 py-1 text-xs font-mono rounded-lg border border-blue/30 bg-blue/5 text-blue hover:bg-blue/10"
            >
              Total Direito ({totalGrupoA})
            </button>
            <button
              onClick={() => setRegiaoDestaque("intersecao")}
              className="px-2.5 py-1 text-xs font-mono rounded-lg border border-purple/30 bg-purple/5 text-purple hover:bg-purple/10"
            >
              Interseção / Ambos ({intersecao})
            </button>
            <button
              onClick={() => setRegiaoDestaque("totalB")}
              className="px-2.5 py-1 text-xs font-mono rounded-lg border border-green/30 bg-green/5 text-green hover:bg-green/10"
            >
              Total TI ({totalGrupoB})
            </button>
            <button
              onClick={() => setRegiaoDestaque("nenhum")}
              className="px-2.5 py-1 text-xs font-mono rounded-lg border border-red/30 bg-red/5 text-red hover:bg-red/10"
            >
              Nenhum dos Dois ({nenhum})
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-blue">Apenas Direito:</span>
              <span className="font-mono font-bold">{apenasA}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={apenasA}
              onChange={(e) => setApenasA(Number(e.target.value))}
              className="w-full accent-blue cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-purple">Ambos (Interseção):</span>
              <span className="font-mono font-bold">{intersecao}</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={intersecao}
              onChange={(e) => setIntersecao(Number(e.target.value))}
              className="w-full accent-purple cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-green">Apenas TI:</span>
              <span className="font-mono font-bold">{apenasB}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={apenasB}
              onChange={(e) => setApenasB(Number(e.target.value))}
              className="w-full accent-green cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-red">Nenhum dos dois:</span>
              <span className="font-mono font-bold">{nenhum}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={nenhum}
              onChange={(e) => setNenhum(Number(e.target.value))}
              className="w-full accent-red cursor-pointer"
            />
          </div>

          <div className="rounded-xl border border-blue/20 bg-blue/5 p-3 text-xs leading-relaxed text-soft font-serif">
            <strong className="font-bold text-ink block mb-0.5">💡 Fórmula Mágica da Interseção:</strong>
            <em>n(A ∪ B) = n(A) + n(B) - n(A ∩ B)</em>. A banca costuma te dar o total de A e o total de B e você deve subtrair a interseção para não somar as mesmas pessoas duas vezes!
          </div>
        </div>
      </div>
    </div>
  );
}
