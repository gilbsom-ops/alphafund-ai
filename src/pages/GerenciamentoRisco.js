import React from 'react';

const GerenciamentoRisco = () => {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: '#fff', backgroundColor: '#0a0e17', fontFamily: 'sans-serif', lineHeight: '1.6' }}>
      <h1 style={{ color: '#00ffa3' }}>Gerenciamento de Risco: O Segredo da Longevidade</h1>
      <p>O objetivo principal de um trader não é ganhar dinheiro rápido, mas sim proteger o capital para continuar operando.</p>
      
      <h2 style={{ color: '#00ffa3' }}>A Regra dos 2%</h2>
      <p>Nunca arrisque perder mais de 2% do seu capital total em uma única operação de Swing Trade.</p>

      <h2 style={{ color: '#00ffa3' }}>Relação Risco x Retorno</h2>
      <p>Busque operações onde o alvo seja pelo menos duas vezes maior que o seu risco (Stop Loss). Isso garante que, mesmo acertando apenas 50% das vezes, você será lucrativo.</p>

      <h2 style={{ color: '#00ffa3' }}>O Uso do Stop Loss</h2>
      <p>O Stop Loss deve ser posicionado de forma técnica, abaixo de um suporte ou mínima anterior, e nunca deve ser removido durante a operação.</p>
    </div>
  );
};

export default GerenciamentoRisco;