// src/pages/Contato.js
import { useState } from "react";
import { Link } from "react-router-dom";

const C = {
  bg: "#0a0f1a", card: "#111827", border: "#1f2d40",
  text: "#e8f4ff", sub: "#a8bfd4", muted: "#6b8499",
  green: "#22d3a0", blue: "#60a5fa", red: "#f87171",
};

export default function Contato() {
  const [form, setForm] = useState({ nome: "", email: "", assunto: "", mensagem: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Abre o cliente de e-mail com os dados preenchidos
    const subject = encodeURIComponent(`[AlphaFund AI] ${form.assunto}`);
    const body = encodeURIComponent(
      `Nome: ${form.nome}\nEmail: ${form.email}\n\nMensagem:\n${form.mensagem}`
    );
    // ⚠️ SUBSTITUA pelo seu e-mail real abaixo:
    window.location.href = `mailto:SEU_EMAIL_AQUI@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const input = {
    background: "#0c1320", border: `1px solid ${C.border}`, borderRadius: 10,
    padding: "12px 16px", color: C.text, fontSize: 14, width: "100%",
    fontFamily: "'DM Sans',sans-serif", outline: "none",
    transition: "border-color .2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .fi:focus{border-color:#22d3a055 !important; box-shadow:0 0 0 3px #22d3a010}
        .fi::placeholder{color:#2a3d50}
      `}</style>

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

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "50px 20px 80px" }}>
        <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: 34, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em" }}>
          Entre em <span style={{ color: C.green }}>Contato</span>
        </h1>
        <p style={{ color: C.sub, fontSize: 14, lineHeight: 1.8, marginBottom: 36 }}>
          Tem alguma dúvida, sugestão ou encontrou algum problema? Fale com a gente.
        </p>

        {sent ? (
          <div style={{ background: "#052015", border: `1px solid ${C.green}44`, borderRadius: 16, padding: "40px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 22, fontWeight: 800, color: C.green, marginBottom: 10 }}>Mensagem enviada!</h2>
            <p style={{ color: C.sub, fontSize: 14 }}>Seu cliente de e-mail foi aberto com a mensagem. Respondemos em até 48h.</p>
            <button onClick={() => setSent(false)}
              style={{ marginTop: 24, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 24px", color: C.sub, fontSize: 13, cursor: "pointer" }}>
              Enviar outra mensagem
            </button>
          </div>
        ) : (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "32px" }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 7 }}>Nome *</label>
                  <input className="fi" required style={input} placeholder="Seu nome"
                    value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
                </div>
                <div>
                  <label style={{ color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 7 }}>E-mail *</label>
                  <input className="fi" required type="email" style={input} placeholder="seu@email.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 7 }}>Assunto *</label>
                <select className="fi" required style={{ ...input, cursor: "pointer" }}
                  value={form.assunto} onChange={e => setForm({ ...form, assunto: e.target.value })}>
                  <option value="">Selecione um assunto</option>
                  <option value="Dúvida sobre o site">Dúvida sobre o site</option>
                  <option value="Erro ou bug">Erro ou bug</option>
                  <option value="Sugestão de melhoria">Sugestão de melhoria</option>
                  <option value="Privacidade e dados">Privacidade e dados</option>
                  <option value="Parceria ou publicidade">Parceria ou publicidade</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 7 }}>Mensagem *</label>
                <textarea className="fi" required rows={6} style={{ ...input, resize: "vertical" }}
                  placeholder="Descreva sua dúvida ou sugestão..."
                  value={form.mensagem} onChange={e => setForm({ ...form, mensagem: e.target.value })} />
              </div>

              <button type="submit"
                style={{ width: "100%", background: C.green, color: "#04120c", border: "none", borderRadius: 12, padding: "14px", fontWeight: 800, fontSize: 15, cursor: "pointer", letterSpacing: "0.03em", transition: "all .2s" }}>
                Enviar Mensagem →
              </button>
            </form>
          </div>
        )}

        <div style={{ marginTop: 20, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 24px" }}>
          <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.8 }}>
            📋 <strong style={{ color: C.sub }}>Tempo de resposta:</strong> até 48 horas úteis.<br />
            ⚖️ Para questões sobre privacidade de dados (LGPD), consulte nossa{" "}
            <Link to="/politica-de-privacidade" style={{ color: C.blue }}>Política de Privacidade</Link>.
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
