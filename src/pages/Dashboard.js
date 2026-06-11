import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, PackageX, ShoppingCart, Clock, ChevronRight, Plus } from 'lucide-react';
import { useFridge, getDaysUntilExpiry, getExpiryStatus, CATEGORIES, LOCATIONS } from '../context/FridgeContext';
import { StatCard, Badge, ExpiryBadge, Button, EmptyState } from '../components/UI';
import './Dashboard.css';

export default function Dashboard() {
  const { items, shoppingList, recipes, stats } = useFridge();
  const navigate = useNavigate();

  const expiringSoon = useMemo(() =>
    items
      .filter(i => {
        const d = getDaysUntilExpiry(i.expiryDate);
        return d !== null && d >= 0 && d <= 7;
      })
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
      .slice(0, 5),
    [items]
  );

  const expired = useMemo(() =>
    items.filter(i => {
      const d = getDaysUntilExpiry(i.expiryDate);
      return d !== null && d < 0;
    }),
    [items]
  );

  const recentItems = useMemo(() =>
    [...items].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)).slice(0, 5),
    [items]
  );

  const pendingShopping = shoppingList.filter(i => !i.checked).length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__greeting">{greeting()} 👋</h1>
          <p className="dashboard__subtitle">Here's what's happening in your kitchen.</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/scanner')}
        >
          Add item
        </Button>
      </div>

      {/* Alert banner for expired items */}
      {expired.length > 0 && (
        <div className="dashboard__alert">
          <PackageX size={18} />
          <span>
            <strong>{expired.length} item{expired.length > 1 ? 's' : ''}</strong> in your fridge{expired.length > 1 ? ' have' : ' has'} expired and should be removed.
          </span>
          <button className="dashboard__alert-link" onClick={() => navigate('/fridge?filter=expired')}>
            View all <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="dashboard__stats">
        <StatCard
          label="Total items"
          value={stats.total}
          sub="across all storage"
          accent="cookie"
        />
        <StatCard
          label="Expiring soon"
          value={stats.expiringSoon}
          sub="within 7 days"
          accent={stats.expiringSoon > 0 ? 'yellow' : undefined}
        />
        <StatCard
          label="Expired"
          value={stats.expired}
          sub="need to discard"
          accent={stats.expired > 0 ? 'red' : undefined}
        />
        <StatCard
          label="Shopping items"
          value={pendingShopping}
          sub="on your list"
        />
      </div>

      <div className="dashboard__grid">
        {/* Expiring soon */}
        <div className="dashboard__panel">
          <div className="dashboard__panel-header">
            <div className="dashboard__panel-title">
              <Clock size={16} />
              Expiring soon
            </div>
            <button className="dashboard__see-all" onClick={() => navigate('/fridge?filter=expiring')}>
              See all <ChevronRight size={13} />
            </button>
          </div>

          {expiringSoon.length === 0 ? (
            <div className="dashboard__panel-empty">
              <span>✅</span>
              <p>Nothing expiring in the next 7 days!</p>
            </div>
          ) : (
            <ul className="dashboard__item-list">
              {expiringSoon.map(item => {
                const cat = CATEGORIES.find(c => c.id === item.category);
                return (
                  <li key={item.id} className="dashboard__item-row" onClick={() => navigate('/fridge')}>
                    <span className="dashboard__item-emoji">{cat?.emoji || '📦'}</span>
                    <div className="dashboard__item-info">
                      <span className="dashboard__item-name">{item.name}</span>
                      {item.brand && <span className="dashboard__item-brand">{item.brand}</span>}
                    </div>
                    <ExpiryBadge expiryDate={item.expiryDate} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Storage breakdown */}
        <div className="dashboard__panel">
          <div className="dashboard__panel-header">
            <div className="dashboard__panel-title">
              🗂️ Storage breakdown
            </div>
          </div>
          <div className="dashboard__locations">
            {LOCATIONS.map(loc => {
              const count = stats.byLocation.find(l => l.id === loc.id)?.count || 0;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={loc.id} className="dashboard__loc-row" onClick={() => navigate(`/fridge?location=${loc.id}`)}>
                  <div className="dashboard__loc-label">
                    <span>{loc.emoji}</span>
                    <span>{loc.label}</span>
                  </div>
                  <div className="dashboard__loc-bar-wrap">
                    <div className="dashboard__loc-bar">
                      <div className="dashboard__loc-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="dashboard__loc-count">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Category pills */}
          <div className="dashboard__categories">
            {CATEGORIES.filter(c => (stats.byCategory.find(x => x.id === c.id)?.count || 0) > 0).map(c => {
              const count = stats.byCategory.find(x => x.id === c.id)?.count || 0;
              return (
                <button
                  key={c.id}
                  className="dashboard__cat-pill"
                  onClick={() => navigate(`/fridge?category=${c.id}`)}
                >
                  {c.emoji} {c.label} <span className="dashboard__cat-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recently added */}
        <div className="dashboard__panel">
          <div className="dashboard__panel-header">
            <div className="dashboard__panel-title">
              🕐 Recently added
            </div>
            <button className="dashboard__see-all" onClick={() => navigate('/fridge')}>
              See all <ChevronRight size={13} />
            </button>
          </div>

          {recentItems.length === 0 ? (
            <div className="dashboard__panel-empty">
              <span>📦</span>
              <p>Your fridge is empty — scan something to get started!</p>
            </div>
          ) : (
            <ul className="dashboard__item-list">
              {recentItems.map(item => {
                const cat = CATEGORIES.find(c => c.id === item.category);
                const loc = LOCATIONS.find(l => l.id === item.location);
                return (
                  <li key={item.id} className="dashboard__item-row" onClick={() => navigate('/fridge')}>
                    <span className="dashboard__item-emoji">{cat?.emoji || '📦'}</span>
                    <div className="dashboard__item-info">
                      <span className="dashboard__item-name">{item.name}</span>
                      <span className="dashboard__item-brand">{loc?.label} · {item.quantity} {item.unit}</span>
                    </div>
                    <Badge variant="default">{new Date(item.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Quick actions */}
        <div className="dashboard__panel">
          <div className="dashboard__panel-header">
            <div className="dashboard__panel-title">⚡ Quick actions</div>
          </div>
          <div className="dashboard__quick-actions">
            <button className="dashboard__qa-btn" onClick={() => navigate('/scanner')}>
              <span className="dashboard__qa-icon">📷</span>
              <span className="dashboard__qa-label">Scan barcode</span>
            </button>
            <button className="dashboard__qa-btn" onClick={() => navigate('/fridge')}>
              <span className="dashboard__qa-icon">🧊</span>
              <span className="dashboard__qa-label">View fridge</span>
            </button>
            <button className="dashboard__qa-btn" onClick={() => navigate('/shopping')}>
              <span className="dashboard__qa-icon">🛒</span>
              <span className="dashboard__qa-label">Shopping list</span>
              {pendingShopping > 0 && (
                <span className="dashboard__qa-badge">{pendingShopping}</span>
              )}
            </button>
            <button className="dashboard__qa-btn" onClick={() => navigate('/recipes')}>
              <span className="dashboard__qa-icon">📖</span>
              <span className="dashboard__qa-label">Recipes</span>
            </button>
            <button className="dashboard__qa-btn" onClick={() => navigate('/analytics')}>
              <span className="dashboard__qa-icon">📊</span>
              <span className="dashboard__qa-label">Analytics</span>
            </button>
            <button className="dashboard__qa-btn" onClick={() => navigate('/fridge?filter=expired')}>
              <span className="dashboard__qa-icon">🗑️</span>
              <span className="dashboard__qa-label">Clear expired</span>
              {expired.length > 0 && (
                <span className="dashboard__qa-badge dashboard__qa-badge--red">{expired.length}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
