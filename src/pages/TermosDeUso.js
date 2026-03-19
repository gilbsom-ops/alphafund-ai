// src/pages/TermosDeUso.js
import { Link } from "react-router-dom";

const C = {
  bg: "#0a0f1a", card: "#111827", border: "#1f2d40",
  text: "#e8f4ff", sub: "#a8bfd4", muted: "#6b8499",
  green: "#22d3a0", blue: "#60a5fa",
};

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 32 }}>
    <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 18, fontWeight: 800, color: C.green, marginBottom: 12 }}>{title}</h2>
    <div style={{ color: C.sub, fontSize: 14, lineHeight: 1.9 }}>{children}</div>
  </div>
);

export default function TermosDeUso() {
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
        <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: 34, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Termos de <span style={{ color: C.green }}>Uso</span>
        </h1>
        <p style={{ color: C.muted, fontSize: 13, marginBottom: 40 }}>Última atualização: Janeiro de 2025</p>

        <div style={{ background: "#0c1422", border: "1px solid #fbbf2444", borderRadius: 14, padding: "16px 24px", marginBottom: 28 }}>
          <p style={{ color: "#fbbf24", fontSize: 13, lineHeight: 1.8 }}>
            ⚠️ <strong>Leia atentamente antes de usar o AlphaFund AI.</strong> O uso do site implica a aceitação integral destes termos.
          </p>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "32px 36px" }}>

          <Section title="1. Aceitação dos Termos">
            <p>Ao acessar e utilizar o <strong style={{ color: C.text }}>AlphaFund AI</strong> (alphafund-ai-psi.vercel.app), você concorda com estes Termos de Uso. Se não concordar com qualquer parte destes termos, não utilize o serviço.</p>
          </Section>

          <Section title="2. Natureza do Serviço">
            <p>O AlphaFund AI é uma <strong style={{ color: C.text }}>ferramenta educacional e informativa gratuita</strong>. O serviço fornece:</p>
            <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2.2 }}>
              <li>Cotações de ações da B3 em tempo real (via Brapi)</li>
              <li>Análises descritivas geradas por inteligência artificial</li>
              <li>Informações educacionais sobre empresas e setores</li>
            </ul>
            <br />
            <p><strong style={{ color: C.text }}>O AlphaFund AI NÃO é:</strong></p>
            <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2.2 }}>
              <li>Uma casa de análise credenciada pela CVM</li>
              <li>Um serviço de assessoria de investimentos</li>
              <li>Uma plataforma de recomendações financeiras</li>
            </ul>
          </Section>

          <Section title="3. Isenção de Responsabilidade — Informação Financeira">
            <p>As informações disponibilizadas neste site <strong style={{ color: C.text }}>não constituem recomendação de compra, venda ou manutenção</strong> de qualquer ativo financeiro, conforme a <strong style={{ color: C.text }}>Resolução CVM nº 20/2021</strong>.</p>
            <br />
            <p>Análises geradas por inteligência artificial podem conter imprecisões, estar desatualizadas ou não refletir a situação atual das empresas. <strong style={{ color: C.text }}>Não nos responsabilizamos por decisões de investimento baseadas nas informações deste site.</strong></p>
            <br />
            <p>Investimentos em renda variável envolvem riscos e podem resultar em perdas. Sempre consulte um <strong style={{ color: C.text }}>Analista de Valores Mobiliários credenciado (CNPI)</strong> antes de investir.</p>
          </Section>

          <Section title="4. Precisão das Informações">
            <p>Embora nos esforcemos para manter as informações atualizadas e precisas, não garantimos a exatidão, completude ou atualidade dos dados fornecidos. Cotações podem ter pequenos atrasos. Estimativas de preço-alvo são baseadas em dados históricos e modelos estimativos.</p>
          </Section>

          <Section title="5. Uso Adequado">
            <p>Você concorda em usar o AlphaFund AI somente para fins legais e educacionais. É proibido:</p>
            <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2.2 }}>
              <li>Usar o serviço para fins comerciais sem autorização prévia</li>
              <li>Tentar acessar sistemas internos ou APIs de forma não autorizada</li>
              <li>Reproduzir ou redistribuir o conteúdo gerado como se fosse recomendação de investimento</li>
              <li>Realizar scraping automatizado excessivo</li>
            </ul>
          </Section>

          <Section title="6. Propriedade Intelectual">
            <p>O código, design e conteúdo original do AlphaFund AI são protegidos por direitos autorais. As análises geradas por IA são de uso pessoal e educacional — não podem ser redistribuídas como recomendações financeiras.</p>
          </Section>

          <Section title="7. Disponibilidade do Serviço">
            <p>O AlphaFund AI é fornecido "como está", sem garantias de disponibilidade contínua. Podemos interromper, modificar ou descontinuar o serviço a qualquer momento, sem aviso prévio.</p>
          </Section>

          <Section title="8. Alterações nos Termos">
            <p>Reservamo-nos o direito de alterar estes Termos de Uso a qualquer momento. O uso continuado do serviço após alterações constitui aceitação dos novos termos.</p>
          </Section>

          <Section title="9. Lei Aplicável">
            <p>Estes termos são regidos pela legislação brasileira. Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias.</p>
          </Section>

          <Section title="10. Contato">
            <p>Para dúvidas sobre estes termos, entre em contato pela nossa <Link to="/contato" style={{ color: C.blue }}>página de contato</Link>.</p>
          </Section>

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
