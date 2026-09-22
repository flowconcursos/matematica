"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Dominio = "nao_avaliado" | "fragil" | "em_construcao" | "firme";

interface TopicoNode {
  id: string;
  nome: string;
  area: string;
  nivelBase: number;
  dominio: Dominio;
  prerequisitos: string[];
  liberado: boolean;
  liberadoManualmente: boolean;
}

interface MapaTreeProps {
  topicos: TopicoNode[];
  onSelecionarTopico?: (topico: TopicoNode) => void;
}

const CORES_DOMINIO: Record<Dominio, { fill: string; stroke: string; text: string; glow: string }> = {
  nao_avaliado: { fill: "#F4F2EB", stroke: "#D6D2C4", text: "#636058", glow: "transparent" },
  fragil: { fill: "#FEF2F2", stroke: "#DC2626", text: "#B83A2A", glow: "rgba(220, 38, 38, 0.2)" },
  em_construcao: { fill: "#FFFBEB", stroke: "#D97706", text: "#A36F1E", glow: "rgba(217, 119, 6, 0.25)" },
  firme: { fill: "#ECFDF5", stroke: "#059669", text: "#236E48", glow: "rgba(5, 150, 105, 0.35)" },
};

export function MapaConhecimentoTree({ topicos, onSelecionarTopico }: MapaTreeProps) {
  const [topicoHover, setTopicoHover] = useState<TopicoNode | null>(null);

  // Mapeamento e distribuição por níveis (Níveis 1 a 5)
  const niveis = useMemo(() => {
    const map = new Map<number, TopicoNode[]>();
    for (let i = 1; i <= 5; i++) map.set(i, []);
    for (const t of topicos) {
      const n = Math.min(5, Math.max(1, t.nivelBase || 1));
      map.get(n)?.push(t);
    }
    return map;
  }, [topicos]);

  // Calcular posições (x, y) de cada nó na tela do mapa
  const posicoes = useMemo(() => {
    const pos = new Map<string, { x: number; y: number }>();
    const larguraTotal = 860;
    const alturaTotal = 560;

    for (let nivel = 1; nivel <= 5; nivel++) {
      const lista = niveis.get(nivel) || [];
      const x = 70 + (nivel - 1) * ((larguraTotal - 140) / 4);
      const qtd = lista.length;

      lista.forEach((item, index) => {
        const y = qtd === 1
          ? alturaTotal / 2
          : 60 + index * ((alturaTotal - 120) / (qtd - 1));
        pos.set(item.id, { x, y });
      });
    }
    return pos;
  }, [niveis]);

  // Gerar linhas conectando nós aos seus pré-requisitos
  const conexoes = useMemo(() => {
    const lines: { id: string; x1: number; y1: number; x2: number; y2: number; ativa: boolean }[] = [];
    for (const t of topicos) {
      const dest = posicoes.get(t.id);
      if (!dest) continue;
      for (const preId of t.prerequisitos) {
        const orig = posicoes.get(preId);
        if (!orig) continue;
        const ativa = t.liberado;
        lines.push({
          id: preId + "->" + t.id,
          x1: orig.x,
          y1: orig.y,
          x2: dest.x,
          y2: dest.y,
          ativa,
        });
      }
    }
    return lines;
  }, [topicos, posicoes]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-[#1C1B18] via-[#24221E] to-[#171614] p-6 text-paper shadow-lg">
      {/* Cabeçalho do Mapa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-400">
              Constelação de Habilidades
            </span>
          </div>
          <h3 className="font-serif text-2xl font-normal text-white mt-1">
            Árvore Cósmica de Pré-Requisitos
          </h3>
          <p className="text-xs text-paper/70 font-serif">
            Navegue da esquerda para a direita (Fundamentos &rarr; Domínio Avançado). Os elos se iluminam conforme os nós anteriores ficam firmes.
          </p>
        </div>

        {/* Legenda de Domínio */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl">
          <span className="flex items-center gap-1.5 text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
            Firme
          </span>
          <span className="flex items-center gap-1.5 text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Em Construção
          </span>
          <span className="flex items-center gap-1.5 text-rose-300">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Frágil
          </span>
          <span className="flex items-center gap-1.5 text-white/50">
            <span className="h-2 w-2 rounded-full bg-white/40" />
            Não avaliado
          </span>
        </div>
      </div>

      {/* Rótulos dos Níveis no Topo do SVG */}
      <div className="mt-4 grid grid-cols-5 text-center text-[10px] font-mono uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">
        <span>Nível 1 &bull; Fundação</span>
        <span>Nível 2 &bull; Operações</span>
        <span>Nível 3 &bull; Aplicações</span>
        <span>Nível 4 &bull; Raciocínio</span>
        <span>Nível 5 &bull; Mestria</span>
      </div>

      {/* Visualizador do Grafo Cósmico em SVG */}
      <div className="relative mt-2 w-full overflow-x-auto">
        <svg
          viewBox="0 0 860 560"
          className="w-full min-w-[700px] h-[520px] select-none"
        >
          {/* Linhas de Conexão com Curva Bezier Suave */}
          {conexoes.map((c) => {
            const dx = (c.x2 - c.x1) / 2;
            const pathData = "M " + c.x1 + " " + c.y1 + " C " + (c.x1 + dx) + " " + c.y1 + ", " + (c.x2 - dx) + " " + c.y2 + ", " + c.x2 + " " + c.y2;
            return (
              <path
                key={c.id}
                d={pathData}
                fill="none"
                stroke={c.ativa ? "#34D399" : "#525252"}
                strokeWidth={c.ativa ? "2" : "1.2"}
                strokeDasharray={c.ativa ? "none" : "4,4"}
                strokeOpacity={c.ativa ? "0.8" : "0.35"}
                className={c.ativa ? "transition-all duration-300" : ""}
              />
            );
          })}

          {/* Nós dos Tópicos */}
          {topicos.map((t) => {
            const p = posicoes.get(t.id);
            if (!p) return null;
            const cores = CORES_DOMINIO[t.dominio];
            const isHover = topicoHover?.id === t.id;
            const liberado = t.liberado;

            return (
              <g
                key={t.id}
                transform={"translate(" + p.x + "," + p.y + ")"}
                className="cursor-pointer transition-transform duration-200"
                onMouseEnter={() => setTopicoHover(t)}
                onMouseLeave={() => setTopicoHover(null)}
                onClick={() => onSelecionarTopico?.(t)}
              >
                {/* Halo de Brilho */}
                <circle
                  r={isHover ? "26" : "20"}
                  fill={cores.stroke}
                  fillOpacity={liberado ? "0.2" : "0.05"}
                  className="transition-all duration-200"
                />

                {/* Círculo Principal */}
                <circle
                  r={isHover ? "18" : "15"}
                  fill={cores.fill}
                  stroke={cores.stroke}
                  strokeWidth={isHover ? "3" : "2"}
                  className="transition-all duration-200"
                />

                {/* Ícone de status dentro do nó */}
                <text
                  textAnchor="middle"
                  dy="4"
                  fontSize="11"
                  className="font-mono font-bold"
                  fill={cores.text}
                >
                  {t.dominio === "firme"
                    ? "✓"
                    : t.dominio === "fragil"
                    ? "!"
                    : t.liberado
                    ? "•"
                    : "🔒"}
                </text>

                {/* Rótulo de Texto do Tópico */}
                <text
                  y={p.y > 450 ? "-24" : "28"}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isHover ? "#FFFFFF" : liberado ? "#E5E5E5" : "#737373"}
                  fontWeight={isHover ? "bold" : "normal"}
                  className="font-sans transition-colors duration-200"
                >
                  {t.nome.length > 18 ? t.nome.slice(0, 16) + "…" : t.nome}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Cartão de Detalhes do Nó em Foco */}
      {topicoHover && (
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/10 backdrop-blur-md p-4 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-300">
                Nível {topicoHover.nivelBase} &bull; {topicoHover.area.replace("_", " ").toUpperCase()}
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase"
                style={{
                  backgroundColor: CORES_DOMINIO[topicoHover.dominio].fill,
                  color: CORES_DOMINIO[topicoHover.dominio].text,
                }}
              >
                {topicoHover.dominio.replace("_", " ")}
              </span>
              {topicoHover.liberado ? (
                <span className="text-[10px] text-emerald-400 font-mono">Liberado</span>
              ) : (
                <span className="text-[10px] text-rose-400 font-mono">Bloqueado por pré-requisito</span>
              )}
            </div>
            <h4 className="font-serif text-lg font-normal text-white mt-1">
              {topicoHover.nome}
            </h4>
            <p className="text-xs text-paper/80 font-serif">
              {topicoHover.prerequisitos.length > 0
                ? "Exige domínio em " + topicoHover.prerequisitos.length + " pré-requisito(s) para liberação automática."
                : "Tópico fundamental sem pré-requisitos bloqueadores."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {topicoHover.liberado ? (
              <Link
                href={"/trilha/reforco/" + topicoHover.id}
                className="rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-mono font-semibold text-ink hover:bg-emerald-400 transition-colors"
              >
                Treinar Agora &rarr;
              </Link>
            ) : (
              <Link
                href={"/trilha/relampago/" + topicoHover.id}
                className="rounded-xl border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-mono text-paper hover:bg-white/15 transition-colors"
              >
                Teste Relâmpago ⚡
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
