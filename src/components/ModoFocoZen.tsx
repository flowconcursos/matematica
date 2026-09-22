"use client";

import { useEffect, useRef, useState } from "react";
import { carregarHistoricoFoco, registrarMinutosFoco, HistoricoFoco } from "@/lib/foco-storage";

export function ModoFocoZen() {
  const [expandido, setExpandido] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(25 * 60); // 25 min default
  const [ativo, setAtivo] = useState(false);
  const [somLigado, setSomLigado] = useState(false);
  const [historico, setHistorico] = useState<HistoricoFoco | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  useEffect(() => {
    setHistorico(carregarHistoricoFoco());
  }, []);

  // Timer Tick
  useEffect(() => {
    if (!ativo) return;
    const interval = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          setAtivo(false);
          pararSom();
          const atualizado = registrarMinutosFoco(25);
          setHistorico(atualizado);
          return 25 * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [ativo]);

  // Sintetizador Nativo Web Audio API (White / Pink Noise suave anti-distração)
  const iniciarSom = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;

      // Brown noise (mais aveludado e relaxante que white noise)
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 2.5; // ganho sutil
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.04, ctx.currentTime); // Volume baixinho confortável

      whiteNoise.connect(gainNode);
      gainNode.connect(ctx.destination);
      whiteNoise.start();

      noiseNodeRef.current = whiteNoise;
      setSomLigado(true);
    } catch (e) {
      console.warn("AudioContext não suportado ou bloqueado pelo browser", e);
    }
  };

  const pararSom = () => {
    try {
      if (noiseNodeRef.current) {
        (noiseNodeRef.current as AudioBufferSourceNode).stop();
        noiseNodeRef.current.disconnect();
        noiseNodeRef.current = null;
      }
      if (audioCtxRef.current) {
        void audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch {
      // safe cleanup
    }
    setSomLigado(false);
  };

  const toggleTimer = () => {
    if (ativo) {
      setAtivo(false);
      pararSom();
    } else {
      setAtivo(true);
      if (somLigado) {
        iniciarSom();
      }
    }
  };

  const toggleSom = () => {
    if (somLigado) {
      pararSom();
    } else {
      if (ativo) {
        iniciarSom();
      } else {
        setSomLigado(true);
      }
    }
  };

  const formatarTempo = (seg: number) => {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
  };

  return (
    <aside aria-label="Modo Foco e Produtividade" className="fixed bottom-4 right-4 z-40">
      {expandido ? (
        <div className="w-80 rounded-2xl border border-line bg-surface/95 backdrop-blur-md p-5 shadow-xl transition-all animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">⏱️</span>
              <h4 className="font-serif text-sm font-semibold text-ink">
                Modo Foco Neurocompatível
              </h4>
            </div>
            <button
              onClick={() => setExpandido(false)}
              className="text-xs text-soft hover:text-ink font-mono px-1"
            >
              ✕
            </button>
          </div>

          <div className="my-5 text-center">
            <span className="font-mono text-4xl font-bold tracking-tight text-ink">
              {formatarTempo(segundosRestantes)}
            </span>
            <span className="text-[11px] font-mono text-soft block mt-1">
              {ativo ? "🔥 Bloco de Hiperfoco Ativo" : "Pausado · Ciclo de 25 minutos"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTimer}
              className={"flex-1 rounded-xl px-4 py-2.5 text-xs font-mono font-semibold transition-all " + (ativo ? "bg-red text-white hover:bg-red/90" : "bg-ink text-paper hover:bg-[#2B2925]")}
            >
              {ativo ? "Pausar Foco" : "Iniciar Bloco (25 min)"}
            </button>
            <button
              onClick={toggleSom}
              title="Ruído Aveludado para Alta Concentração"
              className={"rounded-xl border px-3 py-2.5 text-xs font-mono transition-colors " + (somLigado ? "border-amber bg-amber/15 text-amber font-bold" : "border-line bg-surface text-soft hover:text-ink")}
            >
              {somLigado ? "🔊 Som On" : "🔈 Som Off"}
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-[11px] font-mono text-soft">
            <span className="flex items-center gap-1">
              <span>🔥 Streak:</span>
              <strong className="text-amber">{historico?.streakAtual ?? 1} dias</strong>
            </span>
            <span>Hoje: <strong>{historico?.minutosFocadosHoje ?? 0}m</strong></span>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setExpandido(true)}
          className="group flex items-center gap-2.5 rounded-full border border-line bg-surface/95 px-4 py-2 text-xs font-mono font-medium text-ink shadow-md backdrop-blur-md hover:border-line-strong hover:shadow-lg transition-all"
        >
          <span className="text-sm">🔥</span>
          <span>{formatarTempo(segundosRestantes)}</span>
          {ativo && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
        </button>
      )}
    </aside>
  );
}
