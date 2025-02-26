import React from 'react';
import Gastos from './components/Gastos';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <Gastos />
    </div>
  );
};

export default App;