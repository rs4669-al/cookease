import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Refrigerator, ScanLine,
  ShoppingCart, BookOpen, BarChart3, Menu, X
} from 'lucide-react';
import './Layout.css';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/fridge',    icon: Refrigerator,    label: 'My Fridge'  },
  { to: '/scanner',   icon: ScanLine,        label: 'Scan & Add' },
  { to: '/shopping',  icon: ShoppingCart,    label: 'Shopping'   },
  { to: '/recipes',   icon: BookOpen,        label: 'Recipes'    },
  { to: '/analytics', icon: BarChart3,       label: 'Analytics'  },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const pageTitle = NAV.find(n => location.pathname.startsWith(n.to))?.label || 'Cookease';

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">🍪</div>
          <span className="sidebar__logo-text">Cookease</span>
        </div>

        <nav className="sidebar__nav">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={20} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <p className="sidebar__tagline">Fresh tracking,<br />zero waste.</p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar__overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="main-wrapper">
        <header className="topbar">
          <button
            className="topbar__menu-btn"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <h1 className="topbar__title">{pageTitle}</h1>
          <div className="topbar__right" />
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
