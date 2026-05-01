import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, WalletCards, Tags } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="mb-8 px-4">
      <div className="flex gap-4 bg-slate-800 p-3 rounded-2xl border border-white/5 shadow-sm">
        <Link to="/" className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${location.pathname === '/' ? 'bg-indigo-500/10 text-indigo-500' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-50'}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <Link to="/budget" className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${location.pathname === '/budget' ? 'bg-indigo-500/10 text-indigo-500' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-50'}`}>
          <WalletCards size={20} />
          <span>Presupuesto</span>
        </Link>
        <Link to="/categories" className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${location.pathname === '/categories' ? 'bg-indigo-500/10 text-indigo-500' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-50'}`}>
          <Tags size={20} />
          <span>Categorías</span>
        </Link>
      </div>
    </nav>
  )
}
