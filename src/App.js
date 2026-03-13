import { useState, useRef } from "react";

const GROQ_API_KEY = process.env.REACT_APP_GROQ_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

// ─── Fetch cotação real via Yahoo Finance (sem CORS) ──────────────────────
// Usa um proxy público que contorna CORS para ambiente de desenvolvimento
async function fetchRealData(ticker) {
  const t = ticker.toUpperCase().replace(".SA", "");
  const BRAPI_TOKEN = process.env.REACT_APP_BRAPI_KEY;
  
  const url = `https://brapi.dev/api/quote/${t}?token=${BRAPI_TOKEN}&fundamental=true&dividends=true`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Ticker "${t}" não encontrado na B3.`);
  
  const json = await res.json();
  const q = json?.results?.[0];
  if (!q) throw new Error(`Dados não disponíveis para "${t}".`);

  return { meta: q, ticker: t, yTicker: t };
}

function buildSummary({ meta, ticker }) {
  const brl = (v) => v != null && !isNaN(v) && v > 0 ? `R$ ${Number(v).toFixed(2)}` : null;
  return {
    preco_atual:    brl(meta.regularMarketPrice) || "N/A",
    variacao_dia:   meta.regularMarketChangePercent != null ? `${meta.regularMarketChangePercent >= 0 ? "+" : ""}${meta.regularMarketChangePercent.toFixed(2)}%` : "N/A",
    variacao_val:   meta.regularMarketChange != null ? `${meta.regularMarketChange >= 0 ? "+" : ""}R$ ${Math.abs(meta.regularMarketChange).toFixed(2)}` : "",
    fechamento_ant: brl(meta.regularMarketPreviousClose) || "N/A",
    market_cap:     meta.marketCap ? `R$ ${(meta.marketCap / 1e9).toFixed(1)}B` : "N/A",
    min_52s:        brl(meta.fiftyTwoWeekLow) || "N/A",
    max_52s:        brl(meta.fiftyTwoWeekHigh) || "N/A",
    nome:           meta.longName || meta.shortName || ticker,
    currency:       meta.currency || "BRL",
    changePositive: meta.regularMarketChangePercent != null ? meta.regularMarketChangePercent >= 0 : null,
    p_l:            meta.priceEarnings ? meta.priceEarnings.toFixed(1) : "N/A",
    p_vp:           meta.priceToBook ? meta.priceToBook.toFixed(2) : "N/A",
    dividend_yield_atual: meta.dividendYield ? `${meta.dividendYield.toFixed(2)}%` : "N/A",
    roe:            "Ver análise IA",
    ultimo_div_valor:     meta.dividendsData?.cashDividends?.sort((a,b) => new Date(b.paymentDate) - new Date(a.paymentDate))?.[0]?.rate?.toLocaleString('pt-BR', {style:'currency', currency:'BRL'}) || "N/A",
    ultimo_div_ex:        meta.dividendsData?.cashDividends?.sort((a,b) => new Date(b.paymentDate) - new Date(a.paymentDate))?.[0]?.lastDateOnWith?.split("T")[0] || "N/A",
    ultimo_div_pagamento: meta.dividendsData?.cashDividends?.sort((a,b) => new Date(b.paymentDate) - new Date(a.paymentDate))?.[0]?.paymentDate?.split("T")[0] || "N/A",
    historico_divs:       meta.dividendsData?.cashDividends?.sort((a,b) => new Date(b.paymentDate) - new Date(a.paymentDate))?.slice(0,5)?.map(d => `R$ ${d.rate} (${d.paymentDate?.split("T")[0]})`)?.join(", ") || "N/A",
  };
}

function buildPrompt(ticker, rd) {
  return `
Você é um analista fundamentalista sênior. Recebeu os dados de mercado abaixo sobre "${ticker}" e deve gerar uma análise fundamentalista completa, objetiva, educacional e sem recomendações de compra ou venda.

=== DADOS REAIS DE MERCADO ===
Ticker: ${ticker}
Empresa: ${rd.nome}
Preço atual: ${rd.preco_atual} (variação dia: ${rd.variacao_dia})
Fechamento anterior: ${rd.fechamento_ant}
Market Cap: ${rd.market_cap}
Mínima 52 semanas: ${rd.min_52s}
Máxima 52 semanas: ${rd.max_52s}
=== FIM DOS DADOS REAIS ===

Com base nesses dados E no seu conhecimento sobre a empresa, complete a análise com indicadores fundamentalistas (P/L, P/VP, EV/EBITDA, DY, margens, dívida, ROE, ROIC, crescimento etc.) usando os valores mais recentes que você conhece.

REGRAS:
- Mantenha o preço atual como ${rd.preco_atual}
- NÃO emita recomendação de compra, venda ou manutenção
- Para indicadores que você não tem dados precisos, use sua melhor estimativa baseada em dados públicos conhecidos. NUNCA use "Consulte o RI da empresa" como resposta — sempre forneça um valor estimado.
- Seja descritivo, educacional e neutro

Responda APENAS em JSON válido:

{
  "ticker": "${ticker}",
  "empresa": "${rd.nome}",
  "setor": "Setor real da empresa",
  "subsetor": "Subsetor real",
  "resumo": "Descrição objetiva do negócio e posição competitiva. 2-3 frases.",
  "score_geral": 0,
  "preco_teto_graham": "Preço teto estimado pelo método Graham. Ex: R$ XX,XX ou N/A",
  "preco_justo_dcf": "Preço justo estimado por DCF ou consenso. Ex: R$ XX,XX ou N/A",
  "upside_downside": "Upside/downside vs preço justo. Ex: +14% ou -8% ou N/A",
  "nota_sobre_preco": "Posição do preço atual dentro da faixa 52 semanas. 1-2 frases.",
  "valuation": {
    "score": 0,
    "p_l": "valor do seu conhecimento ou N/A",
    "p_vp": "valor do seu conhecimento ou N/A",
    "ev_ebitda": "valor ou N/A",
    "psr": "valor ou N/A",
    "analise": "Análise descritiva dos múltiplos comparados ao setor e histórico. 3-4 frases."
  },
  "dividendos": {
    "score": 0,
    "dividend_yield_atual": "valor do seu conhecimento ou N/A",
    "dividend_yield_medio_3a": "valor ou N/A",
    "payout_ratio": "valor ou N/A",
    "tipo_pagador": "Pagador consistente | Pagador irregular | Não paga dividendos",
    "ultimo_dividendo_valor": "valor ou N/A",
    "ultimo_dividendo_data_ex": "data ou N/A",
    "ultimo_dividendo_pagamento": "data ou N/A",
    "proximo_dividendo_estimado": "estimativa ou N/A",
    "frequencia_pagamento": "Trimestral | Semestral | Anual | Irregular",
    "historico_resumido": "Resumo do histórico de dividendos. 2-3 frases.",
    "analise": "Análise da política de dividendos e sustentabilidade. 3-4 frases."
  },
  "endividamento": {
    "score": 0,
    "divida_liquida_ebitda": "valor ou N/A",
    "divida_pl": "valor ou N/A",
    "cobertura_juros": "valor ou N/A",
    "analise": "Descrição da estrutura de capital. 3-4 frases."
  },
  "eficiencia": {
    "score": 0,
    "margem_bruta": "valor ou N/A",
    "margem_ebitda": "valor ou N/A",
    "margem_liquida": "valor ou N/A",
    "giro_ativos": "valor ou N/A",
    "analise": "Descrição da eficiência operacional. 3-4 frases."
  },
  "rentabilidade": {
    "score": 0,
    "roe": "valor ou N/A",
    "roa": "valor ou N/A",
    "roic": "valor ou N/A",
    "analise": "Análise dos retornos. 3-4 frases."
  },
  "crescimento": {
    "score": 0,
    "receita_cagr_3a": "valor ou N/A",
    "lucro_cagr_3a": "valor ou N/A",
    "perspectivas": "Curto | Médio | Longo prazo",
    "analise": "Descrição do histórico de crescimento e perspectivas. 3-4 frases."
  },
  "macro_setor": {
    "score": 0,
    "ciclo_economico": "expansão | estável | contração",
    "taxa_juros_impacto": "positivo | neutro | negativo",
    "analise": "Contexto macroeconômico do Brasil e impacto no setor. 3-4 frases."
  },
  "pontos_de_atencao": ["ponto 1", "ponto 2", "ponto 3"],
  "destaques_positivos": ["destaque 1", "destaque 2", "destaque 3"],
  "conclusao": "Síntese fundamentalista neutra e educacional. 5-6 frases."
}`;
}

// ─── UI ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0f1a", card: "#111827", border: "#1f2d40",
  text: "#e8f4ff", sub: "#a8bfd4", muted: "#6b8499",
  green: "#22d3a0", yellow: "#fbbf24", red: "#f87171", blue: "#60a5fa",
};

const ScoreRing = ({ score, size = 80, sw = 7, label }) => {
  const r2 = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r2;
  const off = circ - (Math.min(Math.max(score, 0), 100) / 100) * circ;
  const col = score >= 70 ? C.green : score >= 45 ? C.yellow : C.red;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r2} fill="none" stroke="#1f2d40" strokeWidth={sw}/>
        <circle cx={size/2} cy={size/2} r={r2} fill="none" stroke={col} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition:"stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}/>
        <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
          fill={col} fontSize={size*0.22} fontWeight="700"
          style={{ transform:`rotate(90deg) translate(0,-${size}px)`, transformOrigin:`${size/2}px ${size/2}px` }}>
          {score}
        </text>
      </svg>
      {label && <span style={{ fontSize:10, color:C.muted, letterSpacing:"0.07em", textTransform:"uppercase", fontWeight:700, textAlign:"center" }}>{label}</span>}
    </div>
  );
};

const Row = ({ label, value, accent }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid #1a2535" }}>
    <span style={{ color:C.muted, fontSize:13, fontWeight:500 }}>{label}</span>
    <span style={{ color: accent ? C.green : C.text, fontWeight:700, fontSize:13 }}>{value || "—"}</span>
  </div>
);

const AdBanner = ({ slot, height = 90 }) => (
  <div style={{ width:"100%", height, background:"#0c1320", border:"1px dashed #1a2d3a", borderRadius:10, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", marginBottom:20, gap:3 }}>
    <span style={{ color:"#1e3040", fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>Espaço Publicitário · Google AdSense</span>
    <span style={{ color:"#162535", fontSize:10 }}>{slot === "top" ? "Leaderboard 728×90" : slot === "mid" ? "Medium Rectangle 300×250" : "Footer 728×90"}</span>
  </div>
);

const Section = ({ title, icon, score, metrics, analise }) => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden", marginBottom:10 }}>
      <div onClick={() => setOpen(!open)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", cursor:"pointer", userSelect:"none" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:17 }}>{icon}</span>
          <span style={{ color:C.text, fontWeight:700, fontSize:14 }}>{title}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <ScoreRing score={score||0} size={44} sw={5}/>
          <span style={{ color:C.muted, fontSize:13, display:"inline-block", transform:open?"rotate(0)":"rotate(180deg)", transition:"transform .2s" }}>▲</span>
        </div>
      </div>
      {open && (
        <div style={{ padding:"0 20px 18px" }}>
          {metrics?.map(([l,v,a]) => <Row key={l} label={l} value={v} accent={a}/>)}
          {analise && <p style={{ color:C.sub, fontSize:13, lineHeight:1.8, marginTop:14, paddingTop:14, borderTop:"1px solid #1a2535" }}>{analise}</p>}
        </div>
      )}
    </div>
  );
};

const PriceCard = ({ label, value, sub, col, tag }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 18px", flex:1, minWidth:130 }}>
    <div style={{ color:C.muted, fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:7, display:"flex", alignItems:"center", gap:6 }}>
      {tag && <span style={{ background:tag==="LIVE" ? C.green+"22" : "#fbbf2422", color:tag==="LIVE" ? C.green : C.yellow, fontSize:9, padding:"1px 6px", borderRadius:4, fontWeight:800 }}>{tag}</span>}
      {label}
    </div>
    <div style={{ color:col||C.text, fontSize:20, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", letterSpacing:"-0.02em" }}>{value||"N/A"}</div>
    {sub && <div style={{ color:C.muted, fontSize:11, marginTop:5 }}>{sub}</div>}
  </div>
);

const CalChip = ({ icon, label, value }) => (
  <div style={{ background:"#0c1320", border:"1px solid #1a2535", borderRadius:10, padding:"11px 14px" }}>
    <div style={{ color:C.muted, fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:5 }}>{icon} {label}</div>
    <div style={{ color:C.text, fontSize:13, fontWeight:700 }}>{value||"—"}</div>
  </div>
);

const Loader = ({ step }) => {
  const steps = [
    { icon:"📡", msg:"Buscando cotação em tempo real...", sub:"Conectando ao Yahoo Finance" },
    { icon:"🤖", msg:"IA analisando os fundamentos...", sub:"Isso pode levar alguns segundos" },
  ];
  const s = steps[step] || steps[0];
  return (
    <div style={{ textAlign:"center", padding:"70px 0" }}>
      <div style={{ fontSize:46, marginBottom:18, animation:"glow 1.6s infinite" }}>{s.icon}</div>
      <div style={{ color:C.sub, fontSize:15, marginBottom:6, fontWeight:600 }}>{s.msg}</div>
      <div style={{ color:C.muted, fontSize:12 }}>{s.sub}</div>
      <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:20 }}>
        {steps.map((_, i) => (
          <div key={i} style={{ width:8, height:8, borderRadius:"50%", background: i <= step ? C.green : C.border, transition:"background .3s", boxShadow: i === step ? `0 0 8px ${C.green}` : "none" }}/>
        ))}
      </div>
    </div>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────
export default function StockAnalyzer() {
  const [ticker, setTicker]     = useState("");
  const [step, setStep]         = useState(-1);
  const [data, setData]         = useState(null);
  const [realData, setRealData] = useState(null);
  const [dataSource, setDataSource] = useState(null); // "live" | "ia-only"
  const [error, setError]       = useState("");
  const inputRef = useRef(null);

  const analyze = async (override) => {
    const t = (override || ticker).trim().toUpperCase();
    if (!t) return;
    if (override) setTicker(t);
    setStep(0); setData(null); setRealData(null); setError(""); setDataSource(null);

    let rd = null;
    let source = "ia-only";

    // ── Tenta buscar cotação real ──────────────────────────────────────────
    try {
      setStep(0);
      const raw = await fetchRealData(t);
      rd = buildSummary(raw);
      setRealData(rd);
      source = "live";
    } catch (fetchErr) {
      // Fallback: IA analisa sem dados de cotação ao vivo
      console.warn("Cotação ao vivo indisponível:", fetchErr.message);
      rd = {
        preco_atual: "Ver análise IA", variacao_dia: "N/A", variacao_val: "",
        fechamento_ant: "N/A", market_cap: "N/A", min_52s: "N/A", max_52s: "N/A",
        nome: t, changePositive: null,
        p_l: "N/A", p_vp: "N/A", dividend_yield_atual: "N/A", roe: "N/A",
        ultimo_div_valor: "N/A", ultimo_div_ex: "N/A", ultimo_div_pagamento: "N/A",
        historico_divs: "N/A",
      };
      source = "ia-only";
    }

    // ── IA analisa ────────────────────────────────────────────────────────
    try {
      setStep(1);
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method:"POST", headers:{"Content-Type":"application/json", "Authorization":"Bearer "+GROQ_API_KEY},
        body: JSON.stringify({ model:GROQ_MODEL, max_tokens:3500, temperature:0.3, messages:[{ role:"user", content:buildPrompt(t, rd) }] })
      });
      const aiRaw = await res.json();
      const text = aiRaw.choices?.[0]?.message?.content || "";
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("Resposta inválida da IA. Tente novamente.");
      const aiData = JSON.parse(m[0]);

      // Se teve cotação ao vivo, sobrescreve campos críticos
      if (source === "live" && rd.preco_atual !== "Ver análise IA") {
        aiData.preco_atual = rd.preco_atual;
        aiData.variacao_dia = rd.variacao_dia;
        aiData.market_cap = rd.market_cap;
        aiData.min_52s = rd.min_52s;
        aiData.max_52s = rd.max_52s;
      }

      aiData._source = source;
      setData(aiData);
      setDataSource(source);
    } catch(e) {
      setError(e.message);
    } finally {
      setStep(-1);
    }
  };

  const upColor = (v) => (!v||v==="N/A") ? C.text : v.startsWith("+") ? C.green : C.red;
  const chgColor = (d) => d == null ? C.text : d ? C.green : C.red;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'DM Sans','Segoe UI',sans-serif", color:C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0a0f1a}::-webkit-scrollbar-thumb{background:#1f2d40;border-radius:3px}
        .ti::placeholder{color:#2a3d50}
        .ti:focus{outline:none;border-color:#22d3a055!important;box-shadow:0 0 0 3px #22d3a010}
        .abtn:hover:not(:disabled){background:#1ab88a!important;transform:translateY(-1px)}
        .abtn:active{transform:none!important}
        .chip:hover{border-color:#22d3a044!important;color:#22d3a0!important}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .45s ease forwards}
        @keyframes glow{0%,100%{opacity:.6}50%{opacity:1}}
      `}</style>

      {/* Header */}
      <div style={{ borderBottom:`1px solid ${C.border}`, padding:"14px 0", position:"sticky", top:0, background:C.bg, zIndex:100 }}>
        <div style={{ maxWidth:920, margin:"0 auto", padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#22d3a0,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>📊</div>
            <div>
              <div style={{ fontFamily:"'Space Grotesk'", fontSize:17, fontWeight:800, color:C.text }}>AlphaFund AI</div>
              <div style={{ fontSize:10, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase" }}>Análise Fundamentalista · Educacional</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6,
            background: dataSource==="live" ? "#052015" : "#1a1a08",
            border:`1px solid ${dataSource==="live" ? C.green+"33" : "#fbbf2433"}`,
            borderRadius:8, padding:"5px 12px" }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background: dataSource==="live" ? C.green : C.yellow, display:"inline-block", boxShadow:`0 0 8px ${dataSource==="live" ? C.green : C.yellow}` }}/>
            <span style={{ color: dataSource==="live" ? C.green : C.yellow, fontSize:11, fontWeight:700 }}>
              {dataSource==="live" ? "Cotação ao vivo · Yahoo Finance" : dataSource==="ia-only" ? "Análise por IA · sem cotação ao vivo" : "Pronto para analisar"}
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:920, margin:"0 auto", padding:"26px 20px 70px" }}>
        <AdBanner slot="top" height={76}/>

        <div style={{ textAlign:"center", marginBottom:30 }}>
          <h1 style={{ fontFamily:"'Space Grotesk'", fontSize:"clamp(22px,4.5vw,38px)", fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.2, marginBottom:12, color:C.text }}>
            Análise fundamentalista completa<br/>
            <span style={{ background:"linear-gradient(90deg,#22d3a0,#60a5fa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              com dados reais da B3
            </span>
          </h1>
          <p style={{ color:C.sub, fontSize:14, maxWidth:560, margin:"0 auto", lineHeight:1.75 }}>
            Insira o ticker de qualquer ação da B3 para receber análise de valuation, dividendos, endividamento, eficiência, rentabilidade e contexto macro — sem recomendações, apenas dados e interpretação.
          </p>
        </div>

        {/* Input */}
        <div style={{ display:"flex", gap:10, maxWidth:520, margin:"0 auto 30px" }}>
          <input ref={inputRef} className="ti"
            value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())}
            onKeyDown={e => e.key==="Enter" && analyze()}
            placeholder="Ex: PETR4, VALE3, WEGE3, ITUB4..."
            style={{ flex:1, background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 18px", color:C.text, fontSize:16, fontWeight:700, letterSpacing:"0.06em", transition:"border-color .2s,box-shadow .2s" }}
          />
          <button className="abtn" onClick={() => analyze()} disabled={step >= 0}
            style={{ background:"#22d3a0", color:"#04120c", border:"none", borderRadius:12, padding:"14px 24px", fontWeight:800, fontSize:14, cursor:step>=0?"not-allowed":"pointer", letterSpacing:"0.05em", transition:"all .2s", opacity:step>=0?.65:1, whiteSpace:"nowrap" }}>
            {step >= 0
              ? <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ width:15, height:15, border:"2px solid #04120c55", borderTopColor:"#04120c", borderRadius:"50%", display:"inline-block", animation:"spin .75s linear infinite" }}/>
                  {step===0 ? "Buscando cotação..." : "Analisando IA..."}
                </span>
              : "Analisar →"}
          </button>
        </div>

        {error && (
          <div style={{ background:"#1a0808", border:`1px solid ${C.red}44`, borderRadius:12, padding:"14px 20px", color:C.red, marginBottom:24, fontSize:13, lineHeight:1.6 }}>
            ⚠️ {error}
          </div>
        )}

        {step >= 0 && <Loader step={step}/>}

        {data && (
          <div className="fu">
            {/* Aviso se não teve cotação ao vivo */}
            {dataSource === "ia-only" && (
              <div style={{ background:"#1a1505", border:`1px solid ${C.yellow}44`, borderRadius:12, padding:"12px 18px", marginBottom:16, display:"flex", gap:10, alignItems:"flex-start" }}>
                <span style={{ fontSize:16 }}>⚠️</span>
                <p style={{ color:"#d4b84a", fontSize:13, lineHeight:1.6 }}>
                  <strong>Cotação ao vivo indisponível</strong> — o ambiente atual bloqueou a conexão externa. Os dados de preço, dividendos e indicadores abaixo foram estimados pela IA com base no seu conhecimento histórico e <strong>podem não refletir os valores atuais de mercado</strong>. Ao hospedar o site, a cotação em tempo real funcionará normalmente.
                </p>
              </div>
            )}

            {/* Company header */}
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:"24px 28px", marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:16 }}>
                <div style={{ flex:1, minWidth:200 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, flexWrap:"wrap" }}>
                    <span style={{ fontFamily:"'Space Grotesk'", fontSize:30, fontWeight:800, color:C.green }}>{data.ticker}</span>
                    {data.setor && <span style={{ background:"#1d3a5a", color:C.blue, border:"1px solid #2a4e70", borderRadius:7, padding:"3px 12px", fontSize:11, fontWeight:700 }}>{data.setor}</span>}
                    {data.subsetor && <span style={{ background:"#151f2e", color:C.muted, border:`1px solid ${C.border}`, borderRadius:7, padding:"3px 12px", fontSize:11 }}>{data.subsetor}</span>}
                  </div>
                  <div style={{ color:C.text, fontWeight:700, fontSize:18, marginBottom:10 }}>{data.empresa}</div>
                  <p style={{ color:C.sub, fontSize:14, lineHeight:1.75 }}>{data.resumo}</p>
                </div>
                <ScoreRing score={data.score_geral||0} size={84} label="Score Geral"/>
              </div>
            </div>

            {/* Price bar */}
            <div style={{ background: dataSource==="live" ? "#052015" : "#131005", border:`1px solid ${dataSource==="live" ? C.green+"33" : C.yellow+"33"}`, borderRadius:14, padding:"16px 22px", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:20 }}>
                <div>
                  <div style={{ color:C.muted, fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
                    {dataSource==="live"
                      ? <><span style={{ width:7, height:7, borderRadius:"50%", background:C.green, boxShadow:`0 0 8px ${C.green}`, display:"inline-block" }}/>Preço Ao Vivo</>
                      : <><span style={{ fontSize:12 }}>⚠️</span>Estimativa IA</>}
                  </div>
                  <div style={{ fontFamily:"'Space Grotesk'", fontSize:32, fontWeight:800, color:C.text }}>{data.preco_atual}</div>
                </div>
                {data.variacao_dia && data.variacao_dia !== "N/A" && (
                  <div style={{ color:chgColor(realData?.changePositive), fontFamily:"'Space Grotesk'", fontSize:22, fontWeight:800 }}>{data.variacao_dia}</div>
                )}
                <div style={{ marginLeft:"auto", display:"flex", gap:20, flexWrap:"wrap" }}>
                  {[["Market Cap", data.market_cap], ["Mín 52s", data.min_52s], ["Máx 52s", data.max_52s]].map(([l,v]) => v && v!=="N/A" && (
                    <div key={l}>
                      <div style={{ color:C.muted, fontSize:10, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:2 }}>{l}</div>
                      <div style={{ color:C.sub, fontSize:13, fontWeight:700 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Targets */}
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:12 }}>
              <PriceCard label="Preço Justo (DCF)" value={data.preco_justo_dcf} sub="Estimativa IA por fluxo de caixa" tag="IA"/>
              <PriceCard label="Preço Teto (Graham)" value={data.preco_teto_graham} sub="Método Benjamin Graham" tag="IA"/>
              <PriceCard label="Upside / Downside" value={data.upside_downside} sub="Vs. preço justo estimado" col={upColor(data.upside_downside)} tag="IA"/>
            </div>

            {data.nota_sobre_preco && data.nota_sobre_preco !== "N/A" && (
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 18px", marginBottom:16, display:"flex", gap:10 }}>
                <span>📌</span>
                <p style={{ color:C.sub, fontSize:13, lineHeight:1.7 }}><strong style={{ color:C.text }}>Contexto de preço: </strong>{data.nota_sobre_preco}</p>
              </div>
            )}

            {/* Score grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(98px,1fr))", gap:10, marginBottom:16 }}>
              {[["Valuation","💎",data.valuation?.score],["Dividendos","🏦",data.dividendos?.score],["Endividam.","⛓️",data.endividamento?.score],["Eficiência","⚙️",data.eficiencia?.score],["Rentabili.","💰",data.rentabilidade?.score],["Crescimen.","📈",data.crescimento?.score],["Macro","🌐",data.macro_setor?.score]].map(([l,ic,s]) => (
                <div key={l} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 10px", textAlign:"center" }}>
                  <div style={{ fontSize:18, marginBottom:8 }}>{ic}</div>
                  <ScoreRing score={s||0} size={48} sw={5}/>
                  <div style={{ color:C.muted, fontSize:10, marginTop:6, fontWeight:700 }}>{l}</div>
                </div>
              ))}
            </div>

            <AdBanner slot="mid" height={96}/>

            <Section title="Valuation" icon="💎" score={data.valuation?.score}
              metrics={[["P/L (Preço/Lucro)",data.valuation?.p_l,true],["P/VP",data.valuation?.p_vp,true],["EV/EBITDA",data.valuation?.ev_ebitda],["PSR",data.valuation?.psr]]}
              analise={data.valuation?.analise}/>

            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden", marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span>🏦</span>
                  <span style={{ color:C.text, fontWeight:700, fontSize:14 }}>Dividendos</span>
                </div>
                <ScoreRing score={data.dividendos?.score||0} size={44} sw={5}/>
              </div>
              <div style={{ padding:"0 20px 20px" }}>
                <Row label="Dividend Yield Atual" value={data.dividendos?.dividend_yield_atual} accent/>
                <Row label="DY Médio (3 anos)" value={data.dividendos?.dividend_yield_medio_3a}/>
                <Row label="Payout Ratio" value={data.dividendos?.payout_ratio}/>
                <Row label="Perfil do Pagador" value={data.dividendos?.tipo_pagador}/>
                <Row label="Frequência" value={data.dividendos?.frequencia_pagamento}/>
                <div style={{ marginTop:18 }}>
                  <div style={{ color:C.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>📅 Calendário de Dividendos</div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))", gap:8 }}>
                    <CalChip icon="💵" label="Último Valor" value={data.dividendos?.ultimo_dividendo_valor}/>
                    <CalChip icon="📋" label="Data Ex-Dividendo" value={data.dividendos?.ultimo_dividendo_data_ex}/>
                    <CalChip icon="💳" label="Data de Pagamento" value={data.dividendos?.ultimo_dividendo_pagamento}/>
                    <CalChip icon="🔮" label="Próximo (Estimado)" value={data.dividendos?.proximo_dividendo_estimado}/>
                  </div>
                </div>
                {data.dividendos?.historico_resumido && <p style={{ color:C.sub, fontSize:13, lineHeight:1.75, marginTop:14, paddingTop:14, borderTop:"1px solid #1a2535" }}>📜 {data.dividendos.historico_resumido}</p>}
                {data.dividendos?.analise && <p style={{ color:C.sub, fontSize:13, lineHeight:1.8, marginTop:10 }}>{data.dividendos.analise}</p>}
              </div>
            </div>

            <Section title="Endividamento" icon="⛓️" score={data.endividamento?.score}
              metrics={[["Dívida Líq./EBITDA",data.endividamento?.divida_liquida_ebitda],["Dívida/PL",data.endividamento?.divida_pl],["Cobertura de Juros",data.endividamento?.cobertura_juros]]}
              analise={data.endividamento?.analise}/>
            <Section title="Eficiência Operacional" icon="⚙️" score={data.eficiencia?.score}
              metrics={[["Margem Bruta",data.eficiencia?.margem_bruta],["Margem EBITDA",data.eficiencia?.margem_ebitda],["Margem Líquida",data.eficiencia?.margem_liquida],["Giro de Ativos",data.eficiencia?.giro_ativos]]}
              analise={data.eficiencia?.analise}/>
            <Section title="Rentabilidade" icon="💰" score={data.rentabilidade?.score}
              metrics={[["ROE",data.rentabilidade?.roe,true],["ROA",data.rentabilidade?.roa],["ROIC",data.rentabilidade?.roic]]}
              analise={data.rentabilidade?.analise}/>
            <Section title="Crescimento" icon="📈" score={data.crescimento?.score}
              metrics={[["CAGR Receita 3 anos",data.crescimento?.receita_cagr_3a],["CAGR Lucro 3 anos",data.crescimento?.lucro_cagr_3a],["Perspectivas",data.crescimento?.perspectivas]]}
              analise={data.crescimento?.analise}/>
            <Section title="Contexto Macro & Setor" icon="🌐" score={data.macro_setor?.score}
              metrics={[["Ciclo Econômico",data.macro_setor?.ciclo_economico],["Impacto dos Juros",data.macro_setor?.taxa_juros_impacto]]}
              analise={data.macro_setor?.analise}/>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
              <div style={{ background:C.card, border:"1px solid #f8717122", borderRadius:14, padding:20 }}>
                <div style={{ color:"#fca5a5", fontWeight:800, fontSize:12, marginBottom:14 }}>⚠️ PONTOS DE ATENÇÃO</div>
                {(data.pontos_de_atencao||[]).map((r,i) => (
                  <div key={i} style={{ display:"flex", gap:9, marginBottom:9 }}>
                    <span style={{ color:C.red, fontSize:10, marginTop:3 }}>◆</span>
                    <span style={{ color:C.sub, fontSize:13, lineHeight:1.6 }}>{r}</span>
                  </div>
                ))}
              </div>
              <div style={{ background:C.card, border:"1px solid #22d3a022", borderRadius:14, padding:20 }}>
                <div style={{ color:"#6ee7b7", fontWeight:800, fontSize:12, marginBottom:14 }}>✅ DESTAQUES POSITIVOS</div>
                {(data.destaques_positivos||[]).map((c,i) => (
                  <div key={i} style={{ display:"flex", gap:9, marginBottom:9 }}>
                    <span style={{ color:C.green, fontSize:10, marginTop:3 }}>◆</span>
                    <span style={{ color:C.sub, fontSize:13, lineHeight:1.6 }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:24, marginBottom:14 }}>
              <div style={{ color:C.text, fontWeight:800, fontSize:13, marginBottom:14 }}>📋 SÍNTESE FUNDAMENTALISTA</div>
              <p style={{ color:C.sub, fontSize:14, lineHeight:1.85 }}>{data.conclusao}</p>
            </div>

            {/* Disclaimer */}
            <div style={{ background:"#0c1422", border:"1px solid #fbbf2444", borderRadius:14, padding:"20px 24px", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <span>⚖️</span>
                <span style={{ color:"#fbbf24", fontWeight:800, fontSize:12, letterSpacing:"0.1em", textTransform:"uppercase" }}>Aviso Legal</span>
              </div>
              <p style={{ color:"#94a3b8", fontSize:12, lineHeight:1.9, marginBottom:10 }}>
                As informações apresentadas combinam <strong style={{ color:"#cbd5e1" }}>dados de mercado</strong> (cotações via Yahoo Finance, quando disponíveis) com <strong style={{ color:"#cbd5e1" }}>análise gerada por inteligência artificial</strong>, e têm caráter <strong style={{ color:"#cbd5e1" }}>exclusivamente educacional e informativo</strong>. Este conteúdo <strong style={{ color:"#cbd5e1" }}>não constitui recomendação de compra, venda ou manutenção</strong> de qualquer ativo financeiro.
              </p>
              <p style={{ color:"#94a3b8", fontSize:12, lineHeight:1.9, marginBottom:10 }}>
                A emissão de recomendações de investimento é atividade regulada, privativa de <strong style={{ color:"#cbd5e1" }}>Analistas de Valores Mobiliários credenciados (CNPI)</strong>, conforme a <strong style={{ color:"#cbd5e1" }}>Resolução CVM nº 20/2021</strong>. Este serviço não possui tal credenciamento.
              </p>
              <p style={{ color:"#94a3b8", fontSize:12, lineHeight:1.9 }}>
                Indicadores fundamentalistas podem estar desatualizados. Consulte fontes oficiais como <strong style={{ color:"#cbd5e1" }}>B3, CVM, Economatica</strong> ou o <strong style={{ color:"#cbd5e1" }}>Relações com Investidores (RI)</strong> da empresa antes de qualquer decisão. Investimentos em renda variável envolvem riscos. <strong style={{ color:"#cbd5e1" }}>Consulte sempre um profissional habilitado.</strong>
              </p>
            </div>

            <AdBanner slot="footer" height={76}/>
          </div>
        )}

        {!data && step < 0 && (
          <div style={{ textAlign:"center", marginTop:8 }}>
            <div style={{ color:C.muted, fontSize:11, marginBottom:12, letterSpacing:"0.08em", fontWeight:700 }}>TICKERS DA B3 PARA TESTAR</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
              {["PETR4","VALE3","WEGE3","ITUB4","TAEE11","BBDC4","SAPR11","EGIE3","FLRY3","BBSE3"].map(t => (
                <button key={t} className="chip" onClick={() => analyze(t)}
                  style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:"7px 15px", color:C.sub, fontSize:12, cursor:"pointer", fontWeight:700, letterSpacing:"0.06em", transition:"all .2s" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop:`1px solid ${C.border}`, padding:"18px 20px", textAlign:"center" }}>
        <p style={{ color:C.muted, fontSize:11 }}>AlphaFund AI · Análise por IA · Não credenciado pela CVM · Não emite recomendações de investimento</p>
      </div>
    </div>
  );
}
