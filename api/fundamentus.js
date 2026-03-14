const https = require("https");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { ticker } = req.query;
  if (!ticker) return res.status(400).json({ error: "Ticker obrigatório" });

  const url = `https://www.fundamentus.com.br/detalhes.php?papel=${ticker.toUpperCase()}`;

  try {
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const data = {};

    $("table.w100 tr").each((_, row) => {
      const cells = $(row).find("td");
      cells.each((i, cell) => {
        const label = $(cell).text().trim();
        const value = $(cells[i + 1]).text().trim();
        if (label && value) data[label] = value;
      });
    });

    res.json({ ticker, data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (resp) => {
      let body = "";
      resp.on("data", (chunk) => body += chunk);
      resp.on("end", () => resolve(body));
    }).on("error", reject);
  });
}
```

Depois no terminal instale o cheerio:
```
npm install cheerio
