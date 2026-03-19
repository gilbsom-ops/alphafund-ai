// src/pages/Sobre.js
import { Link } from "react-router-dom";

const C = {
  bg: "#0a0f1a", card: "#111827", border: "#1f2d40",
  text: "#e8f4ff", sub: "#a8bfd4", muted: "#6b8499",
  green: "#22d3a0", blue: "#60a5fa",
};

export default function Sobre() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "14px 0", background: C.bg }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "50px 20px 80px" }}>
        <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: 34, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em" }}>
          Sobre o <span style={{ color: C.green }}>AlphaFund AI</span>
        </h1>
        <p style={{ color: C.sub, fontSize: 15, lineHeight: 1.8, marginBottom: 40 }}>
          Ferramenta educacional gratuita de análise de ações da B3 com inteligência artificial.
        </p>

        {[
          {
            icon: "🎯", title: "Nossa Missão",
            content: `O AlphaFund AI nasceu com um propósito claro: democratizar o acesso à informação sobre o mercado de capitais brasileiro. Acreditamos que qualquer pessoa, independentemente de sua experiência com investimentos, merece ter acesso a análises claras, objetivas e educacionais sobre as empresas listadas na B3.

Nossa ferramenta combina dados de mercado em tempo real com análises geradas por inteligência artificial para apresentar um panorama educacional completo sobre cada empresa analisada — sem jargões desnecessários, sem ruído e sem viés.`
          },
          {
            icon: "🤖", title: "Como Funciona",
            content: `Ao inserir o ticker de uma ação da B3, o AlphaFund AI executa dois processos simultâneos:

1. Busca a cotação em tempo real diretamente da B3 via Brapi, trazendo preço atual, variação do dia, market cap e faixa de 52 semanas.

2. Envia os dados coletados para um modelo de inteligência artificial (LLaMA 3.3 70B via Groq), que gera uma análise descritiva e educacional sobre a empresa, seu setor, contexto macroeconômico e pontos de atenção.

Toda a análise é gerada dinamicamente e tem caráter exclusivamente educacional.`
          },
          {
            icon: "📚", title: "Caráter Educacional",
            content: `É fundamental deixar claro: o AlphaFund AI é uma ferramenta educacional e informativa. Não somos uma casa de análise credenciada pela CVM, não emitimos recomendações de compra, venda ou manutenção de ativos financeiros.

A emissão de recomendações de investimento é atividade regulada, privativa de Analistas de Valores Mobiliários credenciados (CNPI), conforme a Resolução CVM nº 20/2021. Sempre consulte um profissional habilitado antes de tomar decisões de investimento.`
          },
          {
            icon: "🔧", title: "Tecnologias Utilizadas",
            content: `O AlphaFund AI é construído com tecnologias modernas e confiáveis:

• React — interface rápida e responsiva
• Brapi — API oficial para cotações da B3 em tempo real
• Groq + LLaMA 3.3 70B — processamento de linguagem natural e análise por IA
• Vercel — hospedagem com alta disponibilidade`
          },
        ].map(({ icon, title, content }) => (
          <div key={title} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px 32px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 800, color: C.text }}>{title}</h2>
            </div>
            <p style={{ color: C.sub, fontSize: 14, lineHeight: 1.9, whiteSpace: "pre-line" }}>{content}</p>
          </div>
        ))}

        <div style={{ background: "#0c1422", border: "1px solid #fbbf2444", borderRadius: 14, padding: "20px 28px", marginTop: 10 }}>
          <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.9 }}>
            ⚖️ <strong style={{ color: "#fbbf24" }}>Aviso Legal:</strong> Este site não é credenciado pela CVM e não emite recomendações de investimento. Todo o conteúdo é de caráter educacional. Investimentos em renda variável envolvem riscos.
          </p>
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
