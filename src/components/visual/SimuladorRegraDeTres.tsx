"use client";

import { useState } from "react";

export function SimuladorRegraDeTres() {
  const [tipoProporcao, setTipoProporcao] = useState<"direta" | "inversa">("direta");
  const [valorA, setValorA] = useState(2);

  const precoPorUnidade = 15;
  const totalDireta = valorA * precoPorUnidade;

  const totalDiasBase = 60;
  const diasInversa = (totalDiasBase / valorA).toFixed(1);

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple bg-purple/10 px-2 py-0.5 rounded-md">
            Raciocínio Proporcional
          </span>
          <h3 className="font-serif text-xl font-normal text-ink mt-1">
            Balança de Proporcionalidade (Direta vs. Inversa)
          </h3>
          <p className="text-xs text-soft">
            Descubra por que você NUNCA deve cruzar grandezas antes de perguntar: "Se um sobe, o outro sobe ou desce?"
          </p>
        </div>

        <div className="flex rounded-xl border border-line bg-surface-alt p-1">
          <button
            onClick={() => setTipoProporcao("direta")}
            className={"px-3 py-1.5 text-xs font-medium rounded-lg transition-all " + (tipoProporcao === "direta" ? "bg-surface font-semibold text-ink shadow-xs" : "text-soft hover:text-ink")}
          >
            ↗️ Diretamente Proporcional
          </button>
          <button
            onClick={() => setTipoProporcao("inversa")}
            className={"px-3 py-1.5 text-xs font-medium rounded-lg transition-all " + (tipoProporcao === "inversa" ? "bg-surface font-semibold text-ink shadow-xs" : "text-soft hover:text-ink")}
          >
            ↘️ Inversamente Proporcional
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col items-center justify-center p-6 bg-[#FDFCFA] rounded-xl border border-line/60">
          <div className="w-full flex items-center justify-around">
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-ink uppercase tracking-wider mb-2">
                {tipoProporcao === "direta" ? "📚 Cadernos" : "👷 Operários"}
              </span>
              <div
                className="w-16 bg-blue rounded-t-xl transition-all duration-300 flex items-center justify-center text-white font-mono font-bold text-sm"
                style={{ height: Math.max(30, valorA * 18) + "px" }}
              >
                {valorA}
              </div>
              <span className="text-xs text-soft font-mono mt-2">{valorA} un.</span>
            </div>

            <div className="flex flex-col items-center justify-center px-4">
              <span className="text-2xl animate-pulse">
                {tipoProporcao === "direta" ? "⚡" : "🔄"}
              </span>
              <span className="text-[11px] font-mono font-bold text-soft mt-1">
                {tipoProporcao === "direta" ? "AMBOS SOBEM" : "UM SOBE, OUTRO CAI"}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-ink uppercase tracking-wider mb-2">
                {tipoProporcao === "direta" ? "💰 Custo Total" : "⏳ Dias de Obra"}
              </span>
              <div
                className={"w-16 rounded-t-xl transition-all duration-300 flex items-center justify-center text-white font-mono font-bold text-sm " + (tipoProporcao === "direta" ? "bg-green" : "bg-red")}
                style={{
                  height: (tipoProporcao === "direta" ? Math.max(30, (totalDireta / 150) * 160) : Math.max(30, (Number(diasInversa) / 60) * 160)) + "px",
                }}
              >
                {tipoProporcao === "direta" ? "R$" + totalDireta : diasInversa + "d"}
              </div>
              <span className="text-xs text-soft font-mono mt-2">
                {tipoProporcao === "direta" ? "R$ " + totalDireta + ",00" : diasInversa + " dias"}
              </span>
            </div>
          </div>

          <div className="mt-6 w-full pt-4 border-t border-line/60 text-center font-mono text-xs">
            {tipoProporcao === "direta" ? (
              <span className="text-green font-semibold">
                {"Multiplique em CRUZ: 1 caderno = R$15 → " + valorA + " cadernos = R$" + totalDireta}
              </span>
            ) : (
              <span className="text-red font-semibold">
                {"Multiplique em LINHA RETA: 1 × 60 = " + valorA + " × " + diasInversa + " = 60"}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-xs font-semibold text-ink block mb-2">
              Ajuste o valor inicial: <strong className="font-mono text-purple text-base">{valorA}</strong>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={valorA}
              onChange={(e) => setValorA(Number(e.target.value))}
              className="w-full accent-purple cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-soft mt-1">
              <span>Mínimo: 1</span>
              <span>Máximo: 10</span>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface-alt p-4 text-xs space-y-2">
            <h4 className="font-bold text-ink flex items-center gap-1.5">
              <span>⚠️</span> A Pegadinha mais mortal em Concursos:
            </h4>
            <p className="text-soft leading-relaxed">
              {tipoProporcao === "direta" ? (
                <>
                  Quando você compra mais itens ou roda mais quilômetros, gasta mais. As grandezas andam na <strong>mesma direção</strong>. Aqui sim, multiplicamos "cruzado".
                </>
              ) : (
                <>
                  Se você contratar o dobro de trabalhadores, a obra não demora o dobro! Ela demora a <strong>metade</strong> do tempo. Se você multiplicar cruzado, você erra a questão da prova garantidamente!
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
