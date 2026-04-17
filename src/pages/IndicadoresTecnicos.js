import React from 'react';

const IndicadoresTecnicos = () => {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: '#fff', backgroundColor: '#0a0e17', fontFamily: 'sans-serif', lineHeight: '1.6' }}>
      <h1 style={{ color: '#00ffa3' }}>Indicadores Técnicos para Swing Trade</h1>
      <p>Os indicadores ajudam a confirmar a tendência e a força do movimento dos preços.</p>
      
      <h2 style={{ color: '#00ffa3' }}>Médias Móveis</h2>
      <p>A média de 20 períodos indica a tendência de curto prazo, enquanto a de 200 períodos mostra a tendência de longo prazo.</p>

      <h2 style={{ color: '#00ffa3' }}>IFR (Índice de Força Relativa)</h2>
      <p>Este oscilador mostra se uma ação está sobrecomprada (acima de 70) ou sobrevendida (abaixo de 30).</p>

      <h2 style={{ color: '#00ffa3' }}>Volume Financeiro</h2>
      <p>O volume confirma o rompimento. Rompimentos sem volume costumam ser armadilhas (falsos rompimentos).</p>
      
      <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #00ffa3', borderRadius: '8px' }}>
        <p><strong>Dica:</strong> Nunca tome decisões baseadas em apenas um indicador. Busque a confluência de sinais.</p>
      </div>
    </div>
  );
};

export default IndicadoresTecnicos;