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
      <div className="h-screen flex flex-col items-center justify-center text-slate-400 animate-[fadeIn_0.4s_ease-out_forwards]">
        <div className="w-12 h-12 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-8">
      <header className="mb-8 p-8 bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6">
            <Wallet className="text-indigo-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" size={40} />
            <div>
              <h1 className="text-3xl font-heading mb-1 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Tracker de Gastos Bancario</h1>
              <p className="text-slate-400 m-0">Controla tus finanzas personales de forma fácil y segura</p>
            </div>
          </div>
        </div>
      </header>

      <Navigation />

      <main className="p-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/budget" element={<BudgetPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
