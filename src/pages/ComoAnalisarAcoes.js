// src/pages/ComoAnalisarAcoes.js
import { useState } from "react";
import { Link } from "react-router-dom";

const C = {
  bg: "#0a0f1a", card: "#111827", border: "#1f2d40",
  text: "#e8f4ff", sub: "#a8bfd4", muted: "#6b8499",
  green: "#22d3a0", yellow: "#fbbf24", red: "#f87171", blue: "#60a5fa",
};

const indicators = [
  {
    id: "pl",
    nome: "P/L — Preço sobre Lucro",
    icon: "💰",
    categoria: "Valuation",
    descricao: "O P/L mostra quantos anos de lucro atual seriam necessários para 'pagar' o preço da ação. É um dos indicadores mais usados para avaliar se uma ação está cara ou barata em relação ao seu lucro.",
    formula: "P/L = Preço da ação ÷ Lucro por ação (LPA)",
    faixas: [
      { label: "Abaixo de 10", cor: "green", status: "✅ Saudável", desc: "Pode indicar ação descontada. Investigar se há motivo para o desconto." },
      { label: "10 a 20", cor: "green", status: "✅ Saudável", desc: "Faixa considerada razoável para a maioria das empresas brasileiras." },
      { label: "20 a 30", cor: "yellow", status: "⚠️ Atenção", desc: "Começa a ficar esticado. Precisa de crescimento forte para justificar." },
      { label: "Acima de 30", cor: "red", status: "🔴 Caro", desc: "Alto custo relativo ao lucro. Comum em empresas de crescimento acelerado." },
      { label: "Negativo", cor: "red", status: "🔴 Prejuízo", desc: "Empresa está dando prejuízo. P/L negativo não tem utilidade prática." },
    ],
    dica: "Compare sempre com empresas do mesmo setor. Um P/L de 25 pode ser normal para tecnologia e caro para energia elétrica.",
  },
  {
    id: "pvp",
    nome: "P/VP — Preço sobre Valor Patrimonial",
    icon: "🏦",
    categoria: "Valuation",
    descricao: "O P/VP compara o preço de mercado da ação com o valor contábil (patrimônio líquido) por ação. Indica quanto o mercado está disposto a pagar acima (ou abaixo) do que a empresa realmente possui.",
    formula: "P/VP = Preço da ação ÷ Patrimônio Líquido por ação",
    faixas: [
      { label: "Abaixo de 1", cor: "green", status: "✅ Saudável", desc: "Ação sendo negociada abaixo do valor contábil. Pode ser oportunidade — ou sinal de problemas." },
      { label: "1 a 2", cor: "green", status: "✅ Saudável", desc: "Faixa razoável. Mercado paga um prêmio pequeno sobre o patrimônio." },
      { label: "2 a 4", cor: "yellow", status: "⚠️ Atenção", desc: "Prêmio significativo. Justificado apenas por alto ROE ou forte crescimento." },
      { label: "Acima de 4", cor: "red", status: "🔴 Caro", desc: "Mercado precifica muito além do patrimônio. Risco elevado se expectativas não se confirmarem." },
    ],
    dica: "Para bancos e financeiras, o P/VP é especialmente relevante pois o ativo principal é capital. P/VP abaixo de 1 em bancos sólidos é raro e pode ser oportunidade.",
  },
  {
    id: "roe",
    nome: "ROE — Retorno sobre Patrimônio",
    icon: "📈",
    categoria: "Rentabilidade",
    descricao: "O ROE mede quanto de lucro a empresa gera para cada real investido pelos acionistas. É um dos melhores indicadores de qualidade e eficiência da gestão. Empresas com ROE consistentemente alto tendem a criar valor ao longo do tempo.",
    formula: "ROE = Lucro Líquido ÷ Patrimônio Líquido × 100",
    faixas: [
      { label: "Abaixo de 10%", cor: "red", status: "🔴 Fraco", desc: "Retorno abaixo do que o investidor poderia obter em renda fixa. Questione o investimento." },
      { label: "10% a 15%", cor: "yellow", status: "⚠️ Médio", desc: "Razoável, mas não excepcional. Abaixo das melhores empresas do mercado." },
      { label: "15% a 25%", cor: "green", status: "✅ Bom", desc: "Boa rentabilidade. Empresa demonstra eficiência no uso do capital dos acionistas." },
      { label: "Acima de 25%", cor: "green", status: "✅ Excelente", desc: "Alta rentabilidade, característico de empresas com vantagem competitiva forte (moat)." },
    ],
    dica: "Prefira empresas com ROE consistente por vários anos consecutivos. Um ROE alto em apenas um ano pode ser pontual ou resultado de alavancagem excessiva.",
  },
  {
    id: "roe2",
    nome: "ROA — Retorno sobre Ativos",
    icon: "🏭",
    categoria: "Rentabilidade",
    descricao: "O ROA indica quanto lucro a empresa gera para cada real em ativos totais (incluindo o que foi financiado por dívida). Diferente do ROE, o ROA não é influenciado pela alavancagem financeira.",
    formula: "ROA = Lucro Líquido ÷ Ativos Totais × 100",
    faixas: [
      { label: "Abaixo de 3%", cor: "red", status: "🔴 Fraco", desc: "Uso ineficiente dos ativos. Pode indicar empresa pesada em capital com baixo retorno." },
      { label: "3% a 7%", cor: "yellow", status: "⚠️ Médio", desc: "Razoável. Comum em setores de infraestrutura e indústria pesada." },
      { label: "7% a 15%", cor: "green", status: "✅ Bom", desc: "Bom retorno sobre os ativos. Empresa utiliza bem seus recursos." },
      { label: "Acima de 15%", cor: "green", status: "✅ Excelente", desc: "Altamente eficiente. Típico de empresas de tecnologia ou com ativos intangíveis valiosos." },
    ],
    dica: "Compare ROA e ROE juntos. Se o ROE é muito maior que o ROA, a empresa usa muita alavancagem. Isso amplifica ganhos — mas também amplifica riscos.",
  },
  {
    id: "divida",
    nome: "Dívida Líquida / EBITDA",
    icon: "⚖️",
    categoria: "Endividamento",
    descricao: "Este indicador mostra quantos anos de geração de caixa operacional (EBITDA) seriam necessários para quitar toda a dívida líquida da empresa. É a principal métrica de saúde financeira e capacidade de pagamento.",
    formula: "Dívida/EBITDA = Dívida Líquida ÷ EBITDA dos últimos 12 meses",
    faixas: [
      { label: "Negativo (caixa líquido)", cor: "green", status: "✅ Excelente", desc: "Empresa tem mais caixa do que dívida. Solidez financeira máxima." },
      { label: "0 a 1,5x", cor: "green", status: "✅ Saudável", desc: "Endividamento baixo e controlado. Empresa confortável." },
      { label: "1,5x a 3x", cor: "yellow", status: "⚠️ Atenção", desc: "Moderado. Aceitável para setores estáveis, mas monitore a tendência." },
      { label: "3x a 4x", cor: "red", status: "🔴 Alto", desc: "Endividamento elevado. Empresa pode ter dificuldade em momentos de crise ou juros altos." },
      { label: "Acima de 4x", cor: "red", status: "🔴 Perigoso", desc: "Risco financeiro significativo. Alta probabilidade de problemas se o cenário mudar." },
    ],
    dica: "Empresas de utilidade pública (energia, saneamento) toleram dívidas maiores por receita previsível. Já empresas cíclicas (varejo, construção) devem ter dívida mais baixa.",
  },
  {
    id: "dy",
    nome: "Dividend Yield (DY)",
    icon: "💵",
    categoria: "Dividendos",
    descricao: "O DY mede o retorno em dividendos em relação ao preço atual da ação. Para investidores que buscam renda passiva, é um dos indicadores mais importantes — mas alto DY nem sempre é sinal positivo.",
    formula: "DY = Dividendos por ação (últimos 12 meses) ÷ Preço da ação × 100",
    faixas: [
      { label: "Abaixo de 3%", cor: "yellow", status: "⚠️ Baixo", desc: "Retorno em dividendos pequeno. Empresa pode estar reinvestindo o lucro no crescimento." },
      { label: "3% a 6%", cor: "green", status: "✅ Bom", desc: "Faixa interessante. Boa distribuição com potencial de crescimento." },
      { label: "6% a 10%", cor: "green", status: "✅ Excelente", desc: "Alto retorno em dividendos. Típico de empresas maduras e pagadoras consistentes." },
      { label: "Acima de 10%", cor: "yellow", status: "⚠️ Atenção", desc: "DY muito alto pode indicar queda do preço da ação ou dividendo não sustentável. Investigue." },
    ],
    dica: "Prefira empresas com payout saudável (40–70%) e histórico consistente de dividendos. Um DY de 15% pode significar que o preço caiu muito — não que a empresa ficou melhor.",
  },
  {
    id: "margem",
    nome: "Margem EBITDA",
    icon: "📊",
    categoria: "Rentabilidade",
    descricao: "A margem EBITDA mede a eficiência operacional da empresa — quanto de cada real em receita se converte em geração de caixa operacional, antes de juros, impostos e depreciação.",
    formula: "Margem EBITDA = EBITDA ÷ Receita Líquida × 100",
    faixas: [
      { label: "Abaixo de 10%", cor: "red", status: "🔴 Baixa", desc: "Negócio com baixa eficiência operacional. Qualquer adversidade pode virar prejuízo." },
      { label: "10% a 20%", cor: "yellow", status: "⚠️ Média", desc: "Razoável. Comum em setores de baixa margem como varejo e distribuição." },
      { label: "20% a 35%", cor: "green", status: "✅ Boa", desc: "Eficiência operacional sólida. Empresa gera caixa com conforto." },
      { label: "Acima de 35%", cor: "green", status: "✅ Excelente", desc: "Alta margem. Típico de empresas com poder de precificação e vantagens competitivas." },
    ],
    dica: "Compare sempre com empresas do mesmo setor. Uma margem de 8% é ruim para software, mas pode ser boa para supermercados. O que importa é a tendência: margem crescente ou estável é sinal positivo.",
  },
  {
    id: "liquidez",
    nome: "Liquidez Corrente",
    icon: "💧",
    categoria: "Endividamento",
    descricao: "A liquidez corrente mostra a capacidade da empresa de honrar suas obrigações de curto prazo com seus ativos de curto prazo. É um termômetro da saúde financeira no curto prazo.",
    formula: "Liquidez Corrente = Ativo Circulante ÷ Passivo Circulante",
    faixas: [
      { label: "Abaixo de 1", cor: "red", status: "🔴 Crítico", desc: "Empresa pode não conseguir pagar as contas de curto prazo. Risco de inadimplência." },
      { label: "1 a 1,5", cor: "yellow", status: "⚠️ Atenção", desc: "Razoável, mas margem de segurança pequena. Empresa precisa de fluxo de caixa constante." },
      { label: "1,5 a 3", cor: "green", status: "✅ Saudável", desc: "Boa folga para honrar compromissos. Empresa financeiramente equilibrada." },
      { label: "Acima de 3", cor: "yellow", status: "⚠️ Avaliar", desc: "Pode indicar excesso de caixa parado ou gestão ineficiente do capital de giro." },
    ],
    dica: "Bancos e financeiras têm estrutura diferente e não devem ser avaliados por liquidez corrente. Use este indicador principalmente para empresas industriais e de varejo.",
  },
];

const categorias = ["Todos", "Valuation", "Rentabilidade", "Endividamento", "Dividendos"];

const corMap = {
  green: C.green,
  yellow: C.yellow,
  red: C.red,
};

const bgCorMap = {
  green: "#052015",
  yellow: "#1a1400",
  red: "#1a0808",
};

const borderCorMap = {
  green: "#22d3a033",
  yellow: "#fbbf2433",
  red: "#f8717133",
};

function IndicatorCard({ ind }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, marginBottom: 14, overflow: "hidden" }}>
      {/* Header clicável */}
      <div onClick={() => setOpen(o => !o)}
        style={{ padding: "20px 24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 28 }}>{ind.icon}</span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Space Grotesk'", fontSize: 16, fontWeight: 800, color: C.text }}>{ind.nome}</span>
              <span style={{ background: "#1d3a5a", color: C.blue, border: "1px solid #2a4e70", borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{ind.categoria}</span>
            </div>
            <p style={{ color: C.muted, fontSize: 12 }}>{open ? "Clique para fechar" : "Clique para ver detalhes, faixas e dicas"}</p>
          </div>
        </div>
        <span style={{ color: C.muted, fontSize: 20, transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
      </div>

      {open && (
        <div style={{ padding: "0 24px 24px", borderTop: `1px solid ${C.border}` }}>
          {/* Descrição */}
          <p style={{ color: C.sub, fontSize: 14, lineHeight: 1.85, marginTop: 18, marginBottom: 16 }}>{ind.descricao}</p>

          {/* Fórmula */}
          <div style={{ background: "#0c1320", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 16px", marginBottom: 20, fontFamily: "monospace", fontSize: 13, color: C.green }}>
            {ind.formula}
          </div>

          {/* Faixas */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Faixas de referência</p>
            {ind.faixas.map((f, i) => (
              <div key={i} style={{ background: bgCorMap[f.cor], border: `1px solid ${borderCorMap[f.cor]}`, borderRadius: 10, padding: "12px 16px", marginBottom: 8, display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ minWidth: 120 }}>
                  <div style={{ color: corMap[f.cor], fontWeight: 700, fontSize: 12 }}>{f.label}</div>
                  <div style={{ color: corMap[f.cor], fontSize: 11, marginTop: 3 }}>{f.status}</div>
                </div>
                <p style={{ color: C.sub, fontSize: 13, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Dica */}
          <div style={{ background: "#0a1628", border: "1px solid #60a5fa33", borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10 }}>
            <span style={{ fontSize: 16 }}>💡</span>
            <p style={{ color: C.sub, fontSize: 13, lineHeight: 1.75 }}><strong style={{ color: C.blue }}>Dica prática: </strong>{ind.dica}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComoAnalisarAcoes() {
  const [catAtiva, setCatAtiva] = useState("Todos");
  const filtrados = catAtiva === "Todos" ? indicators : indicators.filter(i => i.categoria === catAtiva);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .cat-btn:hover{border-color:#22d3a055!important;color:#22d3a0!important}
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "14px 0", background: C.bg, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#22d3a0,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📊</div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk'", fontSize: 17, fontWeight: 800, color: C.text }}>AlphaFund AI</div>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Análise de Ações · Educacional</div>
            </div>
          </Link>
          <Link to="/" style={{ color: C.green, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>← Voltar ao analisador</Link>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "50px 20px 90px" }}>

        {/* Hero */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#052015", border: "1px solid #22d3a033", borderRadius: 8, padding: "5px 14px", marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block" }}/>
            <span style={{ color: C.green, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>GUIA EDUCACIONAL · ATUALIZADO</span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 16 }}>
            Como analisar uma ação<br/>
            <span style={{ background: "linear-gradient(90deg,#22d3a0,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              antes de comprar
            </span>
          </h1>
          <p style={{ color: C.sub, fontSize: 15, lineHeight: 1.85, maxWidth: 680 }}>
            Antes de investir em qualquer ação da B3, é essencial entender os principais indicadores fundamentalistas. Este guia explica cada indicador, sua fórmula, faixas de referência e o que observar para tomar decisões mais conscientes.
          </p>
        </div>

        {/* Aviso */}
        <div style={{ background: "#0c1422", border: "1px solid #fbbf2444", borderRadius: 14, padding: "16px 22px", marginBottom: 36, display: "flex", gap: 12 }}>
          <span style={{ fontSize: 18 }}>⚖️</span>
          <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.8 }}>
            <strong style={{ color: "#fbbf24" }}>Este conteúdo é educacional.</strong> Os indicadores e faixas apresentados são referências amplamente utilizadas pelo mercado, mas não constituem recomendação de compra ou venda. Cada empresa tem contexto único — sempre avalie o conjunto de indicadores e consulte um profissional credenciado.
          </p>
        </div>

        {/* Introdução */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px 32px", marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 800, marginBottom: 16, color: C.text }}>
            🧭 Por onde começar?
          </h2>
          <p style={{ color: C.sub, fontSize: 14, lineHeight: 1.9, marginBottom: 16 }}>
            A análise fundamentalista avalia a empresa por trás da ação — seus resultados, sua saúde financeira e seu potencial de longo prazo. Para isso, utilizamos <strong style={{ color: C.text }}>indicadores divididos em 4 grupos principais:</strong>
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            {[
              { icon: "💰", nome: "Valuation", desc: "Se a ação está cara ou barata (P/L, P/VP)" },
              { icon: "📈", nome: "Rentabilidade", desc: "Quanto a empresa gera de retorno (ROE, ROA, Margem)" },
              { icon: "⚖️", nome: "Endividamento", desc: "Saúde financeira e capacidade de pagar dívidas" },
              { icon: "💵", nome: "Dividendos", desc: "Retorno em proventos para o acionista" },
            ].map(g => (
              <div key={g.nome} style={{ background: "#0c1320", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{g.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 4 }}>{g.nome}</div>
                <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.6 }}>{g.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Regra de Ouro */}
        <div style={{ background: "#052015", border: "1px solid #22d3a044", borderRadius: 14, padding: "22px 28px", marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 18, fontWeight: 800, marginBottom: 14, color: C.green }}>
            🏆 As 3 regras de ouro da análise fundamentalista
          </h2>
          {[
            { n: "1", titulo: "Nunca analise um indicador isoladamente", texto: "Um P/L baixo pode significar oportunidade — ou empresa em declínio. Sempre analise o conjunto de indicadores e compare com o setor." },
            { n: "2", titulo: "Consistência vale mais do que um número alto", texto: "Uma empresa com ROE de 18% por 10 anos consecutivos é muito mais valiosa do que uma com ROE de 40% em apenas um ano. Busque consistência histórica." },
            { n: "3", titulo: "Entenda o negócio antes dos números", texto: "Os indicadores confirmam o que o negócio já diz. Se você não entende como a empresa ganha dinheiro, os números não vão te salvar. Comece pelo modelo de negócio." },
          ].map(r => (
            <div key={r.n} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0a2918", border: "1px solid #22d3a044", display: "flex", alignItems: "center", justifyContent: "center", color: C.green, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{r.n}</div>
              <div>
                <div style={{ color: C.text, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{r.titulo}</div>
                <p style={{ color: C.sub, fontSize: 13, lineHeight: 1.75 }}>{r.texto}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filtro por categoria */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Filtrar por categoria</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categorias.map(cat => (
              <button key={cat} className="cat-btn" onClick={() => setCatAtiva(cat)}
                style={{ background: catAtiva === cat ? "#052015" : C.card, border: `1px solid ${catAtiva === cat ? C.green : C.border}`, color: catAtiva === cat ? C.green : C.sub, borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .2s" }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cards dos indicadores */}
        <div style={{ marginBottom: 40 }}>
          {filtrados.map(ind => <IndicatorCard key={ind.id} ind={ind} />)}
        </div>

        {/* Checklist */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px 32px", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 800, marginBottom: 6, color: C.text }}>
            ✅ Checklist antes de comprar uma ação
          </h2>
          <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Use este roteiro rápido antes de qualquer decisão de investimento:</p>
          {[
            { grupo: "Sobre o negócio", itens: ["Entendo como a empresa ganha dinheiro?", "Ela tem vantagem competitiva clara (moat)?", "O setor tem boas perspectivas nos próximos anos?"] },
            { grupo: "Valuation", itens: ["O P/L está em linha com o histórico e com pares do setor?", "O P/VP justifica o prêmio cobrado?"] },
            { grupo: "Rentabilidade", itens: ["O ROE é consistentemente acima de 15%?", "A margem EBITDA é estável ou crescente?"] },
            { grupo: "Saúde financeira", itens: ["A dívida/EBITDA está abaixo de 3x?", "A liquidez corrente está acima de 1,5?"] },
            { grupo: "Dividendos (se aplicável)", itens: ["O DY é sustentável (payout entre 40% e 70%)?", "A empresa tem histórico consistente de pagamento?"] },
          ].map(grupo => (
            <div key={grupo.grupo} style={{ marginBottom: 20 }}>
              <div style={{ color: C.blue, fontWeight: 700, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>{grupo.grupo}</div>
              {grupo.itens.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{ color: C.green, fontSize: 14, marginTop: 1 }}>□</span>
                  <p style={{ color: C.sub, fontSize: 13, lineHeight: 1.7 }}>{item}</p>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* CTA para a ferramenta */}
        <div style={{ background: "linear-gradient(135deg, #052015, #0a1628)", border: "1px solid #22d3a033", borderRadius: 16, padding: "32px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>📊</div>
          <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 22, fontWeight: 800, marginBottom: 10, color: C.text }}>
            Pronto para praticar?
          </h2>
          <p style={{ color: C.sub, fontSize: 14, lineHeight: 1.8, maxWidth: 480, margin: "0 auto 24px" }}>
            Use o AlphaFund AI para analisar qualquer ação da B3 com cotação em tempo real e análise educacional gerada por inteligência artificial.
          </p>
          <Link to="/" style={{ display: "inline-block", background: C.green, color: "#04120c", borderRadius: 12, padding: "14px 32px", fontWeight: 800, fontSize: 15, textDecoration: "none", letterSpacing: "0.03em" }}>
            Analisar uma ação agora →
          </Link>
        </div>

      </div>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <div style={{ borderTop: `1px solid ${C.border}`, padding: "18px 20px", textAlign: "center" }}>
      <p style={{ color: C.muted, fontSize: 11 }}>
        AlphaFund AI · Análise Educacional · Não credenciado pela CVM ·{" "}
        <Link to="/politica-de-privacidade" style={{ color: C.muted }}>Política de Privacidade</Link> ·{" "}
        <Link to="/termos-de-uso" style={{ color: C.muted }}>Termos de Uso</Link> ·{" "}
        <Link to="/contato" style={{ color: C.muted }}>Contato</Link>
      </p>
    </div>
  );
}
