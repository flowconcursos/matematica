export interface DesafioCalculo {
  id: string;
  tipo: "divisao5" | "mult11" | "porcentagem" | "quadrado" | "soma_rapida";
  tituloTipo: string;
  expressao: string;
  respostaCorreta: string;
  macete: string;
  dicaPasso: string;
}

export function gerarDesafio(tipoFiltro: string = "todas"): DesafioCalculo {
  const tipos = ["divisao5", "mult11", "porcentagem", "quadrado", "soma_rapida"];
  const tipoEscolhido = tipoFiltro === "todas" ? tipos[Math.floor(Math.random() * tipos.length)] : tipoFiltro;
  const id = Math.random().toString(36).substring(2, 9);

  switch (tipoEscolhido) {
    case "divisao5": {
      // Ex: 140 / 5, 85 / 5, 260 / 5, 120 / 5
      const base = Math.floor(Math.random() * 50) + 10;
      const num = base * 5;
      const resposta = (num / 5).toString();
      return {
        id,
        tipo: "divisao5",
        tituloTipo: "Divisão por 5",
        expressao: `${num} \\div 5`,
        respostaCorreta: resposta,
        macete: "Dobre o número e divida por 10 (corte um zero ou volte uma vírgula).",
        dicaPasso: `Dobro de ${num} é ${num * 2}. Dividindo por 10 = ${resposta}.`,
      };
    }

    case "mult11": {
      // Ex: 24 x 11, 35 x 11, 43 x 11, 62 x 11
      const d1 = Math.floor(Math.random() * 6) + 1; // 1 a 6
      const d2 = Math.floor(Math.random() * (9 - d1)) + 1; // para d1 + d2 <= 9
      const num = d1 * 10 + d2;
      const resposta = (num * 11).toString();
      return {
        id,
        tipo: "mult11",
        tituloTipo: "Multiplicação por 11",
        expressao: `${num} \\times 11`,
        respostaCorreta: resposta,
        macete: "Separe os dois dígitos e coloque a soma deles no meio.",
        dicaPasso: `${d1} _ ${d2} -> Soma: ${d1} + ${d2} = ${d1 + d2} -> Resposta: ${resposta}.`,
      };
    }

    case "porcentagem": {
      // Ex: 10%, 20%, 15%, 5%, 50% de múltiplos de 20
      const taxas = [10, 20, 5, 15, 50, 25];
      const taxa = taxas[Math.floor(Math.random() * taxas.length)];
      const base = (Math.floor(Math.random() * 20) + 2) * 20; // 40, 60, 80, 100, etc.
      const resposta = ((taxa / 100) * base).toString();
      return {
        id,
        tipo: "porcentagem",
        tituloTipo: "Porcentagem Mental",
        expressao: `${taxa}\\% \\text{ de } ${base}`,
        respostaCorreta: resposta,
        macete: "Ache 10% (divida por 10) e multiplique ou divida para chegar na taxa desejada.",
        dicaPasso: `10% de ${base} é ${base / 10}. Para ${taxa}%, o resultado é ${resposta}.`,
      };
    }

    case "quadrado": {
      // Quadrados de 11 a 20
      const n = Math.floor(Math.random() * 10) + 11;
      const resposta = (n * n).toString();
      return {
        id,
        tipo: "quadrado",
        tituloTipo: "Quadrado Perfeito",
        expressao: `${n}^2`,
        respostaCorreta: resposta,
        macete: "Memorização de potências frequentes em geometria e equações quadráticas.",
        dicaPasso: `${n} × ${n} = ${resposta}.`,
      };
    }

    case "soma_rapida":
    default: {
      // Arredondamento para soma rápida: ex 88 + 47 -> 90 + 45 = 135
      const n1 = Math.floor(Math.random() * 40) + 50;
      const n2 = Math.floor(Math.random() * 30) + 20;
      const resposta = (n1 + n2).toString();
      return {
        id,
        tipo: "soma_rapida",
        tituloTipo: "Agilidade de Adição",
        expressao: `${n1} + ${n2}`,
        respostaCorreta: resposta,
        macete: "Tire uma unidade de um para arredondar o outro para a dezena mais próxima.",
        dicaPasso: `${n1} + ${n2} = ${resposta}.`,
      };
    }
  }
}
