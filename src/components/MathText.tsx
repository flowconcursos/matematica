"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathTextProps {
  text: string;
  className?: string;
  block?: boolean;
}

/**
 * Renderiza texto misto contendo fórmulas matemáticas em KaTeX ($...$ ou $$...$$).
 * Se o texto for puramente LaTeX ou contiver delimitadores, renderiza adequadamente.
 */
export function MathText({ text, className = "", block = false }: MathTextProps) {
  const renderedContent = useMemo(() => {
    if (!text) return [];

    // Expressão regular para capturar delimitadores $$...$$ ou $...$ ou \[...\] ou \(...\)
    const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;

      let isMath = false;
      let isDisplay = block;
      let mathCode = "";

      if (part.startsWith("$$") && part.endsWith("$$")) {
        isMath = true;
        isDisplay = true;
        mathCode = part.slice(2, -2).trim();
      } else if (part.startsWith("\\[") && part.endsWith("\\]")) {
        isMath = true;
        isDisplay = true;
        mathCode = part.slice(2, -2).trim();
      } else if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
        isMath = true;
        isDisplay = false;
        mathCode = part.slice(1, -1).trim();
      } else if (part.startsWith("\\(") && part.endsWith("\\)")) {
        isMath = true;
        isDisplay = false;
        mathCode = part.slice(2, -2).trim();
      }

      if (isMath) {
        try {
          const html = katex.renderToString(mathCode, {
            displayMode: isDisplay,
            throwOnError: false,
            output: "htmlAndMathml",
          });

          return (
            <span
              key={index}
              className={isDisplay ? "my-2 block overflow-x-auto text-center" : "inline-block px-0.5"}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={index}>{part}</span>;
        }
      }

      return <span key={index}>{part}</span>;
    });
  }, [text, block]);

  return <span className={className}>{renderedContent}</span>;
}

/**
 * Renderiza uma fórmula matemática LaTeX pura diretamente em bloco ou linha.
 */
export function MathFormula({ formula, block = false, className = "" }: { formula: string; block?: boolean; className?: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        displayMode: block,
        throwOnError: false,
        output: "htmlAndMathml",
      });
    } catch {
      return formula;
    }
  }, [formula, block]);

  return (
    <span
      className={`${block ? "my-2 block overflow-x-auto text-center" : "inline-block"} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}