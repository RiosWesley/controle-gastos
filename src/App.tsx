// src/App.tsx
import React from 'react';
import Gastos from './components/Gastos';
import './styles/App.css'; // Certifique-se de que este import está correto.  MUITA ATENÇÃO AQUI.
import './index.css'; // Importante:  Importe o index.css aqui também.

const App: React.FC = () => {
  return (
    <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Gastos />
    </div>
  );
};

export default App;