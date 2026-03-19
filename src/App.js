// src/App.js
// Para instalar o React Router, rode no terminal:
// npm install react-router-dom

import { BrowserRouter, Routes, Route } from "react-router-dom";
import StockAnalyzer from "./StockAnalyzer";
import Sobre from "./pages/Sobre";
import PoliticaDePrivacidade from "./pages/PoliticaDePrivacidade";
import TermosDeUso from "./pages/TermosDeUso";
import Contato from "./pages/Contato";
import ComoAnalisarAcoes from "./pages/ComoAnalisarAcoes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                         element={<StockAnalyzer />} />
        <Route path="/sobre"                    element={<Sobre />} />
        <Route path="/politica-de-privacidade"  element={<PoliticaDePrivacidade />} />
        <Route path="/termos-de-uso"            element={<TermosDeUso />} />
        <Route path="/contato"                  element={<Contato />} />
        <Route path="/como-analisar-acoes"      element={<ComoAnalisarAcoes />} />
        <Route path="*"                         element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const C = { bg: "#0a0f1a", text: "#e8f4ff", muted: "#6b8499", green: "#22d3a0", border: "#1f2d40" };

function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", color: C.text, gap: 16 }}>
      <div style={{ fontSize: 64 }}>📊</div>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Página não encontrada</h1>
      <p style={{ color: C.muted, fontSize: 14 }}>A página que você procura não existe.</p>
      <a href="/" style={{ marginTop: 8, color: C.green, fontWeight: 700, fontSize: 14, textDecoration: "none", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 24px" }}>
        ← Voltar ao início
      </a>
    </div>
  );
}
