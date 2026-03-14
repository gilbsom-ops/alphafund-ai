module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { ticker } = req.query;
  if (!ticker) return res.status(400).json({ error: "Ticker obrigatório" });

  try {
    const url = `https://statusinvest.com.br/acoes/${ticker.toLowerCase()}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "pt-BR,pt;q=0.9",
      }
    });

    if (!response.ok) throw new Error("Ticker não encontrado");

    const html = await response.text();
    
    // Extrai dados via regex
    const extract = (pattern) => {
      const m = html.match(pattern);
      return m ? m[1].trim() : "N/A";
    };

    const data = {
      pl:           extract(/P\/L[\s\S]*?value">([\d,\.]+)</),
      pvp:          extract(/P\/VP[\s\S]*?value">([\d,\.]+)</),
      dy:           extract(/DY[\s\S]*?value">([\d,\.]+)</),
      roe:          extract(/ROE[\s\S]*?value">([\d,\.]+)</),
      roic:         extract(/ROIC[\s\S]*?value">([\d,\.]+)</),
      margem_liq:   extract(/Margem Líquida[\s\S]*?value">([\d,\.]+)</),
      divida_ebitda: extract(/Dívida Líquida \/ EBITDA[\s\S]*?value">([\-\d,\.]+)</),
    };

    res.json({ ticker, data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};