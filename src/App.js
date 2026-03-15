import { useState, useRef } from "react";

const GROQ_API_KEY = process.env.REACT_APP_GROQ_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

async function fetchRealData(ticker) {
  const t = ticker.toUpperCase().replace(".SA", "");
  const BRAPI_TOKEN = process.env.REACT_APP_BRAPI_KEY;

  const res = await fetch(`https://brapi.dev/api/quote/${t}?token=${BRAPI_TOKEN}`);
  if (!res.ok) throw new Error(`Ticker "${t}" não encontrado na B3.`);

  const json = await res.json();
  const q = json?.results?.[0];
  if (!q) throw new Error(`Dados não disponíveis para "${t}".`);

  return { meta: q, ticker: t };
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
  };
}

function buildPrompt(ticker, rd) {
  return `
Você é um analista fundamentalista sênior. Recebeu os dados de mercado abaixo sobre "${ticker}" e deve gerar uma análise descritiva, objetiva, educacional e sem recomendações de compra ou venda.

=== DADOS REAIS DE MERCADO (tempo real via Brapi/B3) ===
Ticker: ${ticker}
Empresa: ${rd.nome}
Preço atual: ${rd.preco_atual} (variação dia: ${rd.variacao_dia})
Fechamento anterior: ${rd.fechamento_ant}
Market Cap: ${rd.market_cap}
Mínima 52 semanas: ${rd.min_52s}
Máxima 52 semanas: ${rd.max_52s}
=== FIM DOS DADOS REAIS ===

REGRAS:
- Mantenha o preço atual exatamente como ${rd.preco_atual}
- NÃO emita recomendação de compra, venda ou manutenção
- NÃO forneça indicadores fundamentalistas (P/L, ROE, etc.) pois podem estar desatualizados
- Seja descritivo, educacional e neutro
- Para preço_teto_graham e preco_justo_dcf, SEMPRE forneça um valor estimado em reais. Ex: "R$ 45,00". NUNCA retorne N/A ou N/D.

Responda APENAS em JSON válido:

{
  "ticker": "${ticker}",
  "empresa": "${rd.nome}",
  "setor": "Setor real da empresa",
  "subsetor": "Subsetor real",
  "resumo": "Descrição objetiva do negócio e posição competitiva. 3-4 frases.",
  "score_geral": 0,
  "preco_teto_graham": "Estimativa baseada em dados históricos. Ex: R$ XX,XX ou N/A",
  "preco_justo_dcf": "Estimativa baseada em dados históricos. Ex: R$ XX,XX ou N/A",
  "upside_downside": "Upside/downside vs preço justo estimado. Ex: +14% ou -8% ou N/A",
  "nota_sobre_preco": "Posição do preço atual dentro da faixa 52 semanas. 1-2 frases.",
  "sobre_empresa": {
    "historia": "Breve histórico da empresa. 2-3 frases.",
    "modelo_negocio": "Como a empresa ganha dinheiro. 2-3 frases.",
    "posicao_mercado": "Posição competitiva e market share. 2-3 frases.",
    "principais_riscos": "Principais riscos do negócio. 2-3 frases."
  },
  "macro_setor": {
    "score": 0,
    "ciclo_economico": "expansão | estável | contração",
    "taxa_juros_impacto": "positivo | neutro | negativo",
    "analise": "Contexto macroeconômico do Brasil e impacto no setor. 3-4 frases."
  },
  "pontos_de_atencao": ["ponto 1", "ponto 2", "ponto 3"],
  "destaques_positivos": ["destaque 1", "destaque 2", "destaque 3"],
  "conclusao": "Síntese descritiva neutra e educacional sobre a empresa e seu momento. 4-5 frases."
}`;
}

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

const AdBanner = ({ slot, height = 90 }) => (
  <div style={{ width:"100%", height, background:"#0c1320", border:"1px dashed #1a2d3a", borderRadius:10, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", marginBottom:20, gap:3 }}>
    <span style={{ color:"#1e3040", fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>Espaço Publicitário · Google AdSense</span>
    <span style={{ color:"#162535", fontSize:10 }}>{slot === "top" ? "Leaderboard 728×90" : slot === "mid" ? "Medium Rectangle 300×250" : "Footer 728×90"}</span>
  </div>
);

const InfoCard = ({ title, icon, content }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 20px", marginBottom:10 }}>
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
      <span style={{ fontSize:16 }}>{icon}</span>
      <span style={{ color:C.text, fontWeight:700, fontSize:14 }}>{title}</span>
    </div>
    <p style={{ color:C.sub, fontSize:13, lineHeight:1.8 }}>{content}</p>
  </div>
);

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

const Loader = ({ step }) => {
  const steps = [
    { icon:"📡", msg:"Buscando cotação em tempo real...", sub:"Conectando à B3 via Brapi" },
    { icon:"🤖", msg:"IA analisando a empresa...", sub:"Isso pode levar alguns segundos" },
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

export default function StockAnalyzer() {
  const [ticker, setTicker]     = useState("");
  const [step, setStep]         = useState(-1);
  const [data, setData]         = useState(null);
  const [realData, setRealData] = useState(null);
  const [dataSource, setDataSource] = useState(null);
  const [error, setError]       = useState("");
  const inputRef = useRef(null);

  const analyze = async (override) => {
    const t = (override || ticker).trim().toUpperCase();
    if (!t) return;
    if (override) setTicker(t);
    setStep(0); setData(null); setRealData(null); setError(""); setDataSource(null);

    let rd = null;
    let source = "ia-only";

    try {
      setStep(0);
      const raw = await fetchRealData(t);
      rd = buildSummary(raw);
      setRealData(rd);
      source = "live";
    } catch (fetchErr) {
      console.warn("Cotação ao vivo indisponível:", fetchErr.message);
      rd = {
        preco_atual: "N/A", variacao_dia: "N/A", variacao_val: "",
        fechamento_ant: "N/A", market_cap: "N/A", min_52s: "N/A", max_52s: "N/A",
        nome: t, changePositive: null,
      };
      source = "ia-only";
    }

    try {
      setStep(1);
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method:"POST", headers:{"Content-Type":"application/json", "Authorization":"Bearer "+GROQ_API_KEY},
        body: JSON.stringify({ model:GROQ_MODEL, max_tokens:3000, temperature:0.3, messages:[{ role:"user", content:buildPrompt(t, rd) }] })
      });
      const aiRaw = await res.json();
      const text = aiRaw.choices?.[0]?.message?.content || "";
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("Resposta inválida da IA. Tente novamente.");
      const aiData = JSON.parse(m[0]);

      if (source === "live") {
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
              <div style={{ fontSize:10, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase" }}>Análise de Ações · Educacional</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6,
            background: dataSource==="live" ? "#052015" : "#1a1a08",
            border:`1px solid ${dataSource==="live" ? C.green+"33" : "#fbbf2433"}`,
            borderRadius:8, padding:"5px 12px" }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background: dataSource==="live" ? C.green : C.yellow, display:"inline-block", boxShadow:`0 0 8px ${dataSource==="live" ? C.green : C.yellow}` }}/>
            <span style={{ color: dataSource==="live" ? C.green : C.yellow, fontSize:11, fontWeight:700 }}>
              {dataSource==="live" ? "Cotação ao vivo · B3 via Brapi" : dataSource==="ia-only" ? "Análise por IA · sem cotação ao vivo" : "Pronto para analisar"}
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:920, margin:"0 auto", padding:"26px 20px 70px" }}>
        <AdBanner slot="top" height={76}/>

        <div style={{ textAlign:"center", marginBottom:30 }}>
          <h1 style={{ fontFamily:"'Space Grotesk'", fontSize:"clamp(22px,4.5vw,38px)", fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.2, marginBottom:12, color:C.text }}>
            Análise de ações da B3<br/>
            <span style={{ background:"linear-gradient(90deg,#22d3a0,#60a5fa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              com cotação em tempo real
            </span>
          </h1>
          <p style={{ color:C.sub, fontSize:14, maxWidth:560, margin:"0 auto", lineHeight:1.75 }}>
            Insira o ticker de qualquer ação da B3 para receber cotação em tempo real e análise descritiva educacional sobre a empresa, setor e contexto de mercado.
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
                  {step===0 ? "Buscando cotação..." : "Analisando..."}
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
            <div style={{ background:"#052015", border:`1px solid ${C.green}33`, borderRadius:14, padding:"16px 22px", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:20 }}>
                <div>
                  <div style={{ color:C.muted, fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:C.green, boxShadow:`0 0 8px ${C.green}`, display:"inline-block" }}/>
                    Preço Ao Vivo · B3
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
              <PriceCard label="Preço Justo (DCF)" value={data.preco_justo_dcf} sub="Estimativa IA — pode estar desatualizada" tag="IA"/>
              <PriceCard label="Preço Teto (Graham)" value={data.preco_teto_graham} sub="Estimativa IA — pode estar desatualizada" tag="IA"/>
              <PriceCard label="Upside / Downside" value={data.upside_downside} sub="Vs. preço justo estimado" col={upColor(data.upside_downside)} tag="IA"/>
            </div>

            {data.nota_sobre_preco && data.nota_sobre_preco !== "N/A" && (
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 18px", marginBottom:16, display:"flex", gap:10 }}>
                <span>📌</span>
                <p style={{ color:C.sub, fontSize:13, lineHeight:1.7 }}><strong style={{ color:C.text }}>Contexto de preço: </strong>{data.nota_sobre_preco}</p>
              </div>
            )}

            <AdBanner slot="mid" height={96}/>

            {/* Sobre a empresa */}
            {data.sobre_empresa && (
              <>
                <InfoCard title="Histórico da Empresa" icon="🏛️" content={data.sobre_empresa.historia}/>
                <InfoCard title="Modelo de Negócio" icon="⚙️" content={data.sobre_empresa.modelo_negocio}/>
                <InfoCard title="Posição no Mercado" icon="🏆" content={data.sobre_empresa.posicao_mercado}/>
                <InfoCard title="Principais Riscos" icon="⚠️" content={data.sobre_empresa.principais_riscos}/>
              </>
            )}

            {/* Macro */}
            {data.macro_setor && (
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 20px", marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <span>🌐</span>
                  <span style={{ color:C.text, fontWeight:700, fontSize:14 }}>Contexto Macro & Setor</span>
                </div>
                <div style={{ display:"flex", gap:10, marginBottom:12, flexWrap:"wrap" }}>
                  <span style={{ background:"#0c1320", border:`1px solid ${C.border}`, borderRadius:8, padding:"6px 14px", color:C.sub, fontSize:12 }}>
                    Ciclo: <strong style={{ color:C.text }}>{data.macro_setor.ciclo_economico}</strong>
                  </span>
                  <span style={{ background:"#0c1320", border:`1px solid ${C.border}`, borderRadius:8, padding:"6px 14px", color:C.sub, fontSize:12 }}>
                    Juros: <strong style={{ color:C.text }}>{data.macro_setor.taxa_juros_impacto}</strong>
                  </span>
                </div>
                <p style={{ color:C.sub, fontSize:13, lineHeight:1.8 }}>{data.macro_setor.analise}</p>
              </div>
            )}

            {/* Pontos */}
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

            {/* Conclusão */}
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:24, marginBottom:14 }}>
              <div style={{ color:C.text, fontWeight:800, fontSize:13, marginBottom:14 }}>📋 SÍNTESE</div>
              <p style={{ color:C.sub, fontSize:14, lineHeight:1.85 }}>{data.conclusao}</p>
            </div>

            {/* Disclaimer */}
            <div style={{ background:"#0c1422", border:"1px solid #fbbf2444", borderRadius:14, padding:"20px 24px", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <span>⚖️</span>
                <span style={{ color:"#fbbf24", fontWeight:800, fontSize:12, letterSpacing:"0.1em", textTransform:"uppercase" }}>Aviso Legal</span>
              </div>
              <p style={{ color:"#94a3b8", fontSize:12, lineHeight:1.9, marginBottom:10 }}>
                A <strong style={{ color:"#cbd5e1" }}>cotação em tempo real</strong> é fornecida via <strong style={{ color:"#cbd5e1" }}>Brapi/B3</strong> e pode ter pequeno atraso. A <strong style={{ color:"#cbd5e1" }}>análise descritiva</strong> é gerada por inteligência artificial com caráter <strong style={{ color:"#cbd5e1" }}>exclusivamente educacional e informativo</strong>. Estimativas de preço-alvo são baseadas em dados históricos e <strong style={{ color:"#cbd5e1" }}>podem estar desatualizadas</strong>.
              </p>
              <p style={{ color:"#94a3b8", fontSize:12, lineHeight:1.9, marginBottom:10 }}>
                Este conteúdo <strong style={{ color:"#cbd5e1" }}>não constitui recomendação de compra, venda ou manutenção</strong> de qualquer ativo financeiro. A emissão de recomendações é atividade regulada, privativa de <strong style={{ color:"#cbd5e1" }}>Analistas credenciados (CNPI)</strong>, conforme <strong style={{ color:"#cbd5e1" }}>Resolução CVM nº 20/2021</strong>.
              </p>
              <p style={{ color:"#94a3b8", fontSize:12, lineHeight:1.9 }}>
                Investimentos em renda variável envolvem riscos. <strong style={{ color:"#cbd5e1" }}>Consulte sempre um profissional habilitado antes de investir.</strong>
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
        <p style={{ color:C.muted, fontSize:11 }}>AlphaFund AI · Análise Educacional · Não credenciado pela CVM · Não emite recomendações de investimento</p>
      </div>
    </div>
  );
}