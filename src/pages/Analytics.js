import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFridge, CATEGORIES, LOCATIONS, getDaysUntilExpiry, getExpiryStatus } from '../context/FridgeContext';
import { StatCard, Badge, EmptyState, Button } from '../components/UI';
import './Analytics.css';

export default function Analytics() {
  //const { items, shoppingList, recipes } = useFridge();
  const navigate = useNavigate();

  // ── Computed analytics ────────────────────────────────────────────────
  const analytics = useMemo(() => {
    const total = items.length;

    // Expiry breakdown
    const expiryBuckets = { expired: 0, critical: 0, warning: 0, good: 0, none: 0 };
    items.forEach(item => {
      const d = getDaysUntilExpiry(item.expiryDate);
      expiryBuckets[getExpiryStatus(d)]++;
    });

    // By category
    const byCategory = CATEGORIES.map(c => ({
      ...c,
      count: items.filter(i => i.category === c.id).length,
    })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

    // By location
    const byLocation = LOCATIONS.map(l => ({
      ...l,
      count: items.filter(i => i.location === l.id).length,
    }));

    // Items added over time (last 30 days)
    const now = new Date();
    const days30 = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0];
    });

    const addedByDay = {};
    days30.forEach(d => { addedByDay[d] = 0; });
    items.forEach(item => {
      const day = item.addedAt?.split('T')[0];
      if (day && addedByDay[day] !== undefined) addedByDay[day]++;
    });

    const timelineData = days30.map(d => ({ date: d, count: addedByDay[d] }));

    // Waste estimate (expired items)
    const expiredItems = items.filter(i => {
      const d = getDaysUntilExpiry(i.expiryDate);
      return d !== null && d < 0;
    });

    // Freshness score
    const itemsWithExpiry = items.filter(i => i.expiryDate);
    let freshnessScore = 100;
    if (itemsWithExpiry.length > 0) {
      const expiryPoints = itemsWithExpiry.map(i => {
        const d = getDaysUntilExpiry(i.expiryDate);
        if (d < 0)  return 0;
        if (d <= 2) return 25;
        if (d <= 7) return 60;
        return 100;
      });
      freshnessScore = Math.round(expiryPoints.reduce((a, b) => a + b, 0) / expiryPoints.length);
    }

    return {
      total, expiryBuckets, byCategory, byLocation,
      timelineData, expiredItems, freshnessScore,
      maxTimelineCount: Math.max(...Object.values(addedByDay), 1),
    };
  }, [items]);

  if (items.length === 0) {
    return (
      <EmptyState
        emoji="📊"
        title="No data yet"
        description="Add items to your fridge to see analytics about your kitchen."
        action={<Button variant="primary" onClick={() => navigate('/scanner')}>Add your first item</Button>}
      />
    );
  }

  const freshnessColor = analytics.freshnessScore >= 80 ? 'green' :
                         analytics.freshnessScore >= 50 ? 'yellow' : 'red';

  return (
    <div className="analytics">

      {/* Top stats */}
      <div className="analytics__stats">
        <StatCard label="Total items" value={analytics.total} sub="in your kitchen" accent="cookie" />
        <StatCard
          label="Freshness score"
          value={`${analytics.freshnessScore}%`}
          sub="based on expiry dates"
          accent={freshnessColor}
        />
        <StatCard
          label="Needs attention"
          value={analytics.expiryBuckets.expired + analytics.expiryBuckets.critical}
          sub="expired or expiring today"
          accent={analytics.expiryBuckets.expired + analytics.expiryBuckets.critical > 0 ? 'red' : undefined}
        />
        <StatCard label="Recipes saved" value={recipes.length} sub="in your cookbook" />
      </div>

      {/* Freshness donut + expiry breakdown */}
      <div className="analytics__row">
        <div className="analytics__panel analytics__panel--donut">
          <h3 className="analytics__panel-title">Expiry status</h3>
          <DonutChart buckets={analytics.expiryBuckets} total={analytics.total} />
          <div className="analytics__legend">
            {[
              { key: 'expired',  label: 'Expired',       color: 'var(--red-alert)'   },
              { key: 'critical', label: 'Expiring today/tmrw', color: '#E65100' },
              { key: 'warning',  label: 'Within 7 days', color: 'var(--yellow-warn)' },
              { key: 'good',     label: 'Fresh (7d+)',   color: 'var(--green-fresh)' },
              { key: 'none',     label: 'No date set',   color: 'var(--cream-200)'   },
            ].map(({ key, label, color }) => (
              analytics.expiryBuckets[key] > 0 && (
                <div key={key} className="analytics__legend-item">
                  <span className="analytics__legend-dot" style={{ background: color }} />
                  <span className="analytics__legend-label">{label}</span>
                  <span className="analytics__legend-count">{analytics.expiryBuckets[key]}</span>
                </div>
              )
            ))}
          </div>
        </div>

        <div className="analytics__panel analytics__panel--location">
          <h3 className="analytics__panel-title">Items by location</h3>
          <div className="analytics__location-bars">
            {analytics.byLocation.map(loc => (
              <div key={loc.id} className="analytics__location-row">
                <span className="analytics__location-label">{loc.emoji} {loc.label}</span>
                <div className="analytics__bar-wrap">
                  <div className="analytics__bar">
                    <div
                      className="analytics__bar-fill analytics__bar-fill--cookie"
                      style={{ width: analytics.total > 0 ? `${(loc.count / analytics.total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="analytics__bar-count">{loc.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Items by category */}
      <div className="analytics__panel">
        <h3 className="analytics__panel-title">Items by category</h3>
        {analytics.byCategory.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '16px' }}>No categorized items yet.</p>
        ) : (
          <div className="analytics__category-grid">
            {analytics.byCategory.map(cat => {
              const pct = analytics.total > 0 ? (cat.count / analytics.total) * 100 : 0;
              return (
                <div key={cat.id} className="analytics__cat-item">
                  <div className="analytics__cat-emoji">{cat.emoji}</div>
                  <div className="analytics__cat-info">
                    <div className="analytics__cat-header">
                      <span className="analytics__cat-name">{cat.label}</span>
                      <span className="analytics__cat-count">{cat.count}</span>
                    </div>
                    <div className="analytics__bar analytics__bar--thin">
                      <div
                        className="analytics__bar-fill analytics__bar-fill--cookie"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Items added over time */}
      <div className="analytics__panel">
        <h3 className="analytics__panel-title">Items added — last 30 days</h3>
        <TimelineChart data={analytics.timelineData} max={analytics.maxTimelineCount} />
      </div>

      {/* Expired items list */}
      {analytics.expiredItems.length > 0 && (
        <div className="analytics__panel analytics__panel--alert">
          <h3 className="analytics__panel-title analytics__panel-title--alert">
            🗑️ Expired items ({analytics.expiredItems.length})
          </h3>
          <p className="analytics__alert-desc">These items have passed their expiry date and should be discarded.</p>
          <div className="analytics__expired-list">
            {analytics.expiredItems.map(item => {
              const days = Math.abs(getDaysUntilExpiry(item.expiryDate));
              const cat = CATEGORIES.find(c => c.id === item.category);
              return (
                <div key={item.id} className="analytics__expired-row">
                  <span>{cat?.emoji || '📦'}</span>
                  <span className="analytics__expired-name">{item.name}</span>
                  {item.brand && <span className="analytics__expired-brand">{item.brand}</span>}
                  <Badge variant="red">Expired {days}d ago</Badge>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14 }}>
            <Button variant="danger" size="sm" onClick={() => navigate('/fridge?filter=expired')}>
              Manage expired items
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Donut Chart ───────────────────────────────────────────────────────────
function DonutChart({ buckets, total }) {
  const colors = {
    expired:  '#B94040',
    critical: '#E65100',
    warning:  '#C8960A',
    good:     '#5A8A5E',
    none:     '#E8E0D4',
  };

  const R = 60;
  const stroke = 20;
  const cx = 80; const cy = 80;
  const circumference = 2 * Math.PI * R;

  let offset = 0;
  const segments = Object.entries(buckets)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => {
      const pct  = count / (total || 1);
      const dash = pct * circumference;
      const seg  = { key, count, pct, dash, offset };
      offset += dash;
      return seg;
    });

  return (
    <div className="donut-chart">
      <svg viewBox="0 0 160 160" className="donut-chart__svg">
        {segments.map(seg => (
          <circle
            key={seg.key}
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke={colors[seg.key]}
            strokeWidth={stroke}
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={-seg.offset}
            transform={`rotate(-90, ${cx}, ${cy})`}
          />
        ))}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--brown-900)" fontFamily="DM Serif Display, serif">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontFamily="Inter, sans-serif">
          total items
        </text>
      </svg>
    </div>
  );
}

// ── Timeline Chart ────────────────────────────────────────────────────────
function TimelineChart({ data, max }) {
  const W = 100;
  const H = 80;
  const barW = W / data.length;

  // Only show every 5th label
  const labelStep = 5;

  return (
    <div className="timeline-chart">
      <svg viewBox={`0 0 ${W} ${H + 14}`} preserveAspectRatio="none" className="timeline-chart__svg">
        {data.map((d, i) => {
          const barH = max > 0 ? (d.count / max) * (H - 4) : 0;
          const x = i * barW;
          const y = H - barH;
          return (
            <g key={d.date}>
              <rect
                x={x + barW * 0.15}
                y={y}
                width={barW * 0.7}
                height={barH}
                fill="var(--cookie-500)"
                rx="1"
                opacity={d.count > 0 ? 1 : 0.15}
              />
              {i % labelStep === 0 && (
                <text
                  x={x + barW / 2}
                  y={H + 11}
                  textAnchor="middle"
                  fontSize="3.5"
                  fill="var(--text-muted)"
                  fontFamily="Inter, sans-serif"
                >
                  {d.date.slice(5)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {max === 0 && (
        <p className="timeline-chart__empty">No items added in the last 30 days</p>
      )}
    </div>
  );
}
