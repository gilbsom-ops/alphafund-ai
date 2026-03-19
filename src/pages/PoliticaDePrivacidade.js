// src/pages/PoliticaDePrivacidade.js
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

export default function PoliticaDePrivacidade() {
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
          Política de <span style={{ color: C.green }}>Privacidade</span>
        </h1>
        <p style={{ color: C.muted, fontSize: 13, marginBottom: 40 }}>Última atualização: Janeiro de 2025</p>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "32px 36px" }}>

          <Section title="1. Quem Somos">
            <p>O <strong style={{ color: C.text }}>AlphaFund AI</strong> (alphafund-ai-psi.vercel.app) é uma ferramenta educacional gratuita de análise de ações da B3, desenvolvida para fins informativos e educacionais. Não somos credenciados pela CVM e não emitimos recomendações de investimento.</p>
          </Section>

          <Section title="2. Dados que Coletamos">
            <p>O AlphaFund AI <strong style={{ color: C.text }}>não coleta, armazena ou processa dados pessoais</strong> dos usuários de forma direta. Não exigimos cadastro, login ou fornecimento de qualquer informação pessoal para usar a ferramenta.</p>
            <br />
            <p>No entanto, terceiros integrados ao site podem coletar dados automaticamente:</p>
            <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2.2 }}>
              <li><strong style={{ color: C.text }}>Google AdSense</strong> — pode coletar cookies e dados de navegação para exibição de anúncios personalizados</li>
              <li><strong style={{ color: C.text }}>Vercel</strong> — nossa plataforma de hospedagem coleta logs de acesso padrão (IP, navegador, horário)</li>
              <li><strong style={{ color: C.text }}>Brapi</strong> — API de cotações, sem coleta de dados pessoais</li>
              <li><strong style={{ color: C.text }}>Groq</strong> — API de IA, os tickers digitados podem ser processados temporariamente</li>
            </ul>
          </Section>

          <Section title="3. Cookies e Publicidade">
            <p>Utilizamos o <strong style={{ color: C.text }}>Google AdSense</strong> para exibição de anúncios. O Google pode usar cookies para personalizar anúncios com base no seu histórico de navegação. Para mais informações sobre como o Google usa dados, consulte a <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: C.blue }}>Política de Privacidade do Google</a>.</p>
            <br />
            <p>Você pode optar por não receber anúncios personalizados em: <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: C.blue }}>google.com/settings/ads</a></p>
          </Section>

          <Section title="4. Base Legal (LGPD)">
            <p>Em conformidade com a <strong style={{ color: C.text }}>Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>, a base legal para o tratamento de dados via cookies de publicidade é o <strong style={{ color: C.text }}>legítimo interesse</strong> e/ou o <strong style={{ color: C.text }}>consentimento</strong> do usuário.</p>
          </Section>

          <Section title="5. Seus Direitos">
            <p>Você tem direito a:</p>
            <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2.2 }}>
              <li>Confirmar a existência de tratamento de dados</li>
              <li>Acessar seus dados</li>
              <li>Solicitar correção ou exclusão</li>
              <li>Revogar consentimento a qualquer momento</li>
              <li>Optar por não receber anúncios personalizados</li>
            </ul>
          </Section>

          <Section title="6. Segurança">
            <p>Como não armazenamos dados pessoais em nossos servidores, o risco de exposição é mínimo. Todo o tráfego é criptografado via HTTPS.</p>
          </Section>

          <Section title="7. Alterações nesta Política">
            <p>Podemos atualizar esta Política de Privacidade periodicamente. Recomendamos verificar esta página regularmente. Alterações significativas serão destacadas no site.</p>
          </Section>

          <Section title="8. Contato">
            <p>Para dúvidas sobre esta política ou sobre o tratamento de dados, entre em contato conosco pela nossa <Link to="/contato" style={{ color: C.blue }}>página de contato</Link>.</p>
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
