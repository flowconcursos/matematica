export interface SimulacaoInfo {
  id: string;
  titulo: string;
  subtitulo: string;
  icone: string;
  area: string;
  dicaNeuro: string;
}

export const SIMULACOES: SimulacaoInfo[] = [
  {
    id: "fracoes-porcentagem",
    titulo: "Frações, Decimais & Porcentagem",
    subtitulo: "Veja a pizza e as barras se repartirem conforme os números mudam.",
    icone: "🍕",
    area: "Aritmética Básica",
    dicaNeuro: "O cérebro compreende frações como proporção espacial antes de entender o símbolo numérico abstrato.",
  },
  {
    id: "regra-de-tres",
    titulo: "Balança de Proporcionalidade",
    subtitulo: "Entenda visualmente a diferença entre Grandezas Diretas e Inversas.",
    icone: "⚖️",
    area: "Aritmética & Álgebra",
    dicaNeuro: "A maior armadilha de bancas é aplicar multiplicação cruzada quando as grandezas são inversas (ex: mais operários = menos dias).",
  },
  {
    id: "diagrama-venn",
    titulo: "Diagrama de Venn Interativo",
    subtitulo: "Clique nas regiões para iluminar a Interseção, União e a diferença entre conjuntos.",
    icone: "⭕",
    area: "Raciocínio Lógico & Conjuntos",
    dicaNeuro: "Questões de 'apenas A', 'ambos' ou 'nenhum' tornam-se triviais quando mapeadas em círculos sobrepostos.",
  },
  {
    id: "funcao-afim",
    titulo: "Gráfico Vivo da Função Afim",
    subtitulo: "Arraste a inclinação (coeficiente angular) e o ponto de corte do eixo Y.",
    icone: "📈",
    area: "Álgebra & Funções",
    dicaNeuro: "Ver a reta girar e subir fixa instantaneamente o papel de 'a' (taxa de variação) e 'b' (custo fixo inicial).",
  },
];
