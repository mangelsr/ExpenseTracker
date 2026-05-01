import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, WalletCards } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="navigation-bar">
      <div className="nav-container">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <Link to="/budget" className={`nav-link ${location.pathname === '/budget' ? 'active' : ''}`}>
          <WalletCards size={20} />
          <span>Presupuesto</span>
        </Link>
      </div>
    </nav>
  );
}
