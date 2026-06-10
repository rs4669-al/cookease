import React from 'react';
import { X } from 'lucide-react';
import { getDaysUntilExpiry, getExpiryStatus } from '../context/FridgeContext';
import './UI.css';

// ── Button ────────────────────────────────────────────────────────────────
export function Button({
  children, variant = 'primary', size = 'md',
  className = '', icon, ...props
}) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${className}`}
      {...props}
    >
      {icon && <span className="btn__icon">{icon}</span>}
      {children}
    </button>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`badge badge--${variant} ${className}`}>
      {children}
    </span>
  );
}

// ── ExpiryBadge ───────────────────────────────────────────────────────────
export function ExpiryBadge({ expiryDate }) {
  const days   = getDaysUntilExpiry(expiryDate);
  const status = getExpiryStatus(days);

  if (status === 'none') return null;

  const labels = {
    expired:  `Expired ${Math.abs(days)}d ago`,
    critical: days === 0 ? 'Expires today' : `Expires in ${days}d`,
    warning:  `Expires in ${days}d`,
    good:     `${days}d left`,
  };

  return (
    <span className={`expiry-badge expiry-badge--${status}`}>
      {labels[status]}
    </span>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal ${wide ? 'modal--wide' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────
export function Card({ children, className = '', onClick }) {
  return (
    <div
      className={`card ${onClick ? 'card--clickable' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ── FormField ─────────────────────────────────────────────────────────────
export function FormField({ label, children, required, hint }) {
  return (
    <div className="form-field">
      {label && (
        <label className="form-field__label">
          {label} {required && <span className="form-field__required">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="form-field__hint">{hint}</p>}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────
export function Input({ className = '', ...props }) {
  return <input className={`input ${className}`} {...props} />;
}

// ── Select ────────────────────────────────────────────────────────────────
export function Select({ children, className = '', ...props }) {
  return (
    <select className={`input input--select ${className}`} {...props}>
      {children}
    </select>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────
export function Textarea({ className = '', ...props }) {
  return <textarea className={`input input--textarea ${className}`} rows={3} {...props} />;
}

// ── EmptyState ────────────────────────────────────────────────────────────
export function EmptyState({ emoji, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__emoji">{emoji}</div>
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__desc">{description}</p>}
      {action}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`stat-card ${accent ? `stat-card--${accent}` : ''}`}>
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
      {sub && <p className="stat-card__sub">{sub}</p>}
    </div>
  );
}
