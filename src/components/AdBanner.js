// src/components/AdBanner.js
// Substitua os "slots" pelos IDs reais gerados no painel do AdSense
// Painel > Anúncios > Por unidade de anúncio > Criar novo anúncio

import { useEffect } from "react";

export default function AdBanner({ slot, height = 90, style: extraStyle = {} }) {
  useEffect(() => {
    try {
      // Inicializa o anúncio após o componente montar
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  // Mapeamento de slots para formatos
  const formats = {
    top:    { format: "horizontal",  style: { display: "block", width: "100%", height: 90 } },
    mid:    { format: "rectangle",   style: { display: "block", width: "100%", height: 250 } },
    footer: { format: "horizontal",  style: { display: "block", width: "100%", height: 90 } },
  };

  const { format, style: slotStyle } = formats[slot] || formats.top;

  // ⚠️ SUBSTITUA os data-ad-slot abaixo pelos IDs reais do seu painel AdSense
  const slotIds = {
    top:    "XXXXXXXXXX",   // <-- cole o ID do anúncio "topo"
    mid:    "XXXXXXXXXX",   // <-- cole o ID do anúncio "meio"
    footer: "XXXXXXXXXX",   // <-- cole o ID do anúncio "rodapé"
  };

  return (
    <div style={{ width: "100%", marginBottom: 20, minHeight: height, ...extraStyle }}>
      <ins
        className="adsbygoogle"
        style={{ ...slotStyle, ...extraStyle }}
        data-ad-client="ca-pub-6830111889182944"
        data-ad-slot={slotIds[slot] || slotIds.top}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
