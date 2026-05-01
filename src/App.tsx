import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { initDatabase } from './utils/database';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { BudgetPage } from './pages/BudgetPage';
import './index.css';

function App() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        setIsDbReady(true);
      } catch (error) {
        console.error("Error al inicializar la base de datos", error);
      }
    };
    init();
  }, []);

  if (!isDbReady) {
    return (
      <div className="loading-screen fade-in">
        <div className="spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="d-flex align-items-center">
            <Wallet className="header-icon" size={40} />
            <div>
              <h1>Tracker de Gastos Bancario</h1>
              <p>Controla tus finanzas personales de forma fácil y segura</p>
            </div>
          </div>
        </div>
      </header>

      <Navigation />

      <main className="app-main p-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/budget" element={<BudgetPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
