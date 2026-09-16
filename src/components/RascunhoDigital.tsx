"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export function RascunhoDigital() {
  const [aberto, setAberto] = useState(false);
  const [cor, setCor] = useState("#1A1915");
  const [espessura, setEspessura] = useState(3);
  const [modo, setModo] = useState<"caneta" | "borracha">("caneta");
  const [fundoTranslucido, setFundoTranslucido] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Redimensionar canvas de acordo com o tamanho real da janela
  const redimensionarCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Guardar imagem anterior antes de redimensionar
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (tempCtx) tempCtx.drawImage(canvas, 0, 0);

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Restaurar traços
    ctx.drawImage(tempCanvas, 0, 0);
  }, []);

  useEffect(() => {
    if (aberto) {
      setTimeout(redimensionarCanvas, 100);
      window.addEventListener("resize", redimensionarCanvas);
      return () => window.removeEventListener("resize", redimensionarCanvas);
    }
  }, [aberto, redimensionarCanvas]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    lastPos.current = getCoordinates(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || !lastPos.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentPos = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);

    if (modo === "borracha") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = espessura * 4;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = cor;
      ctx.lineWidth = espessura;
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    lastPos.current = currentPos;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    lastPos.current = null;
  };

  const limparCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <>
      {/* Botão Flutuante Discreto */}
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-xs font-semibold text-ink shadow-lg transition-all hover:bg-paper active:scale-95"
      >
        <span>✍️</span>
        <span>{aberto ? "Ocultar Rascunho" : "Abrir Rascunho"}</span>
      </button>

      {/* Painel do Rascunho */}
      {aberto && (
        <div
          className={`fixed inset-x-2 bottom-18 top-16 z-40 mx-auto flex max-w-4xl flex-col rounded-2xl border border-line shadow-2xl transition-all sm:inset-x-8 sm:bottom-20 ${
            fundoTranslucido
              ? "bg-surface/85 backdrop-blur-md"
              : "bg-surface"
          }`}
        >
          {/* Barra de Ferramentas */}
          <div className="flex flex-wrap items-center justify-between border-b border-line bg-paper/60 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-ink">Quadro de Rascunho</span>

              {/* Cores */}
              <div className="flex items-center gap-1.5 border-l border-line pl-3">
                {[
                  { id: "#1A1915", title: "Grafite" },
                  { id: "#B33928", title: "Vermelho" },
                  { id: "#2563EB", title: "Azul" },
                  { id: "#266B46", title: "Verde" },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    title={c.title}
                    onClick={() => { setCor(c.id); setModo("caneta"); }}
                    className={`h-5 w-5 rounded-full border transition-transform ${
                      cor === c.id && modo === "caneta" ? "scale-125 border-ink ring-1 ring-ink" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c.id }}
                  />
                ))}
              </div>

              {/* Modo Borracha */}
              <button
                type="button"
                onClick={() => setModo(modo === "borracha" ? "caneta" : "borracha")}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  modo === "borracha"
                    ? "bg-red text-white"
                    : "border border-line bg-surface text-soft hover:text-ink"
                }`}
              >
                🧹 Borracha
              </button>

              {/* Espessuras */}
              <div className="hidden sm:flex items-center gap-1 border-l border-line pl-3 text-xs text-soft">
                {[2, 4, 7].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setEspessura(size)}
                    className={`rounded px-2 py-0.5 ${
                      espessura === size ? "bg-ink text-paper" : "hover:text-ink"
                    }`}
                  >
                    {size === 2 ? "Fino" : size === 4 ? "Médio" : "Grosso"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 sm:pt-0">
              {/* Alternar Transparência */}
              <button
                type="button"
                onClick={() => setFundoTranslucido(!fundoTranslucido)}
                className="text-[11px] text-soft hover:text-ink border border-line rounded px-2 py-1 bg-surface"
              >
                {fundoTranslucido ? "Fundo Sólido" : "Ver Enunciado Por Baixo 👁️"}
              </button>

              {/* Limpar */}
              <button
                type="button"
                onClick={limparCanvas}
                className="rounded border border-line bg-surface px-2.5 py-1 text-xs text-soft hover:border-red hover:text-red transition-colors"
              >
                Limpar Tudo
              </button>

              {/* Fechar */}
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="rounded-full bg-paper p-1 text-soft hover:text-ink"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Área do Canvas */}
          <div className="relative flex-1 cursor-crosshair overflow-hidden touch-none">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      )}
    </>
  );
}
