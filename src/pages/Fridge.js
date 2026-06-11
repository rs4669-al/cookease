import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, Minus, SlidersHorizontal, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useFridge, CATEGORIES, LOCATIONS,
  getDaysUntilExpiry, getExpiryStatus
} from '../context/FridgeContext';
import {
  Button, Badge, ExpiryBadge, Modal, EmptyState,
  FormField, Input, Select
} from '../components/UI';
import ItemForm from '../components/ItemForm';
import './Fridge.css';

const SORT_OPTIONS = [
  { value: 'expiry-asc',  label: 'Expiry: soonest first' },
  { value: 'expiry-desc', label: 'Expiry: latest first' },
  { value: 'name-asc',    label: 'Name: A → Z' },
  { value: 'name-desc',   label: 'Name: Z → A' },
  { value: 'added-desc',  label: 'Recently added' },
  { value: 'added-asc',   label: 'Oldest first' },
];

export default function Fridge() {
  const { items, updateItem, deleteItem, consumeItem, addShoppingItem } = useFridge();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState(searchParams.get('category') || '');
  const [filterLocation, setFilterLocation] = useState(searchParams.get('location') || '');
  const [filterExpiry, setFilterExpiry] = useState(searchParams.get('filter') || '');
  const [sort, setSort] = useState('expiry-asc');
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState('grid'); // grid | list

  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [consumeTarget, setConsumeTarget] = useState(null);
  const [consumeAmount, setConsumeAmount] = useState(1);

  // Sync filter from URL
  useEffect(() => {
    const f = searchParams.get('filter');
    const c = searchParams.get('category');
    const l = searchParams.get('location');
    if (f) setFilterExpiry(f);
    if (c) setFilterCategory(c);
    if (l) setFilterLocation(l);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = [...items];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.brand || '').toLowerCase().includes(q) ||
        (i.notes || '').toLowerCase().includes(q)
      );
    }

    if (filterCategory) list = list.filter(i => i.category === filterCategory);
    if (filterLocation) list = list.filter(i => i.location === filterLocation);

    if (filterExpiry === 'expired')  list = list.filter(i => { const d = getDaysUntilExpiry(i.expiryDate); return d !== null && d < 0; });
    if (filterExpiry === 'expiring') list = list.filter(i => { const d = getDaysUntilExpiry(i.expiryDate); return d !== null && d >= 0 && d <= 7; });
    if (filterExpiry === 'good')     list = list.filter(i => { const d = getDaysUntilExpiry(i.expiryDate); return d === null || d > 7; });

    list.sort((a, b) => {
      switch (sort) {
        case 'expiry-asc': {
          const da = getDaysUntilExpiry(a.expiryDate) ?? 9999;
          const db = getDaysUntilExpiry(b.expiryDate) ?? 9999;
          return da - db;
        }
        case 'expiry-desc': {
          const da = getDaysUntilExpiry(a.expiryDate) ?? -9999;
          const db = getDaysUntilExpiry(b.expiryDate) ?? -9999;
          return db - da;
        }
        case 'name-asc':    return a.name.localeCompare(b.name);
        case 'name-desc':   return b.name.localeCompare(a.name);
        case 'added-desc':  return new Date(b.addedAt) - new Date(a.addedAt);
        case 'added-asc':   return new Date(a.addedAt) - new Date(b.addedAt);
        default: return 0;
      }
    });

    return list;
  }, [items, search, filterCategory, filterLocation, filterExpiry, sort]);

  const handleEdit = (item) => setEditItem({ ...item });
  const handleEditSave = (data) => {
    updateItem({ ...editItem, ...data });
    setEditItem(null);
    toast.success(`"${data.name}" updated`);
  };

  const handleDelete = () => {
    deleteItem(deleteTarget.id);
    toast.success(`"${deleteTarget.name}" removed`);
    setDeleteTarget(null);
  };

  const handleConsume = () => {
    const amt = parseFloat(consumeAmount) || 1;
    consumeItem(consumeTarget.id, amt);
    const remaining = consumeTarget.quantity - amt;
    if (remaining <= 0) {
      toast.success(`"${consumeTarget.name}" finished and removed`);
    } else {
      toast.success(`Used ${amt} ${consumeTarget.unit} of "${consumeTarget.name}"`);
    }
    setConsumeTarget(null);
    setConsumeAmount(1);
  };

  const handleAddToShopping = (item) => {
    addShoppingItem({ name: item.name, category: item.category, unit: item.unit });
    toast.success(`Added "${item.name}" to shopping list`);
  };

  const clearFilters = () => {
    setSearch('');
    setFilterCategory('');
    setFilterLocation('');
    setFilterExpiry('');
    navigate('/fridge', { replace: true });
  };

  const activeFilterCount = [filterCategory, filterLocation, filterExpiry].filter(Boolean).length;

  return (
    <div className="fridge">
      {/* Toolbar */}
      <div className="fridge__toolbar">
        <div className="fridge__search-wrap">
          <Search size={16} className="fridge__search-icon" />
          <input
            className="fridge__search"
            placeholder="Search items…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="fridge__search-clear" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <Button
          variant={showFilters ? 'primary' : 'secondary'}
          size="sm"
          icon={<SlidersHorizontal size={15} />}
          onClick={() => setShowFilters(v => !v)}
        >
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>

        <select
          className="fridge__sort"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <div className="fridge__view-toggle">
          <button
            className={`fridge__view-btn ${view === 'grid' ? 'fridge__view-btn--active' : ''}`}
            onClick={() => setView('grid')}
            title="Grid view"
          >⊞</button>
          <button
            className={`fridge__view-btn ${view === 'list' ? 'fridge__view-btn--active' : ''}`}
            onClick={() => setView('list')}
            title="List view"
          >☰</button>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={15} />}
          onClick={() => navigate('/scanner')}
        >
          Add
        </Button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="fridge__filters">
          <FormField label="Category">
            <Select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">All categories</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Location">
            <Select value={filterLocation} onChange={e => setFilterLocation(e.target.value)}>
              <option value="">All locations</option>
              {LOCATIONS.map(l => (
                <option key={l.id} value={l.id}>{l.emoji} {l.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Expiry status">
            <Select value={filterExpiry} onChange={e => setFilterExpiry(e.target.value)}>
              <option value="">All items</option>
              <option value="expired">Expired</option>
              <option value="expiring">Expiring soon (≤7d)</option>
              <option value="good">Fresh (7d+)</option>
            </Select>
          </FormField>
          {activeFilterCount > 0 && (
            <button className="fridge__clear-filters" onClick={clearFilters}>
              <X size={13} /> Clear filters
            </button>
          )}
        </div>
      )}

      {/* Count */}
      <div className="fridge__count">
        {filtered.length} item{filtered.length !== 1 ? 's' : ''}
        {activeFilterCount > 0 || search ? ' matching filters' : ' in your kitchen'}
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <EmptyState
          emoji="🧊"
          title="Nothing here"
          description={items.length === 0
            ? "Scan a barcode or add items manually to start tracking your food."
            : "No items match your current filters."
          }
          action={
            items.length === 0
              ? <Button variant="primary" icon={<Plus size={15} />} onClick={() => navigate('/scanner')}>Scan or add item</Button>
              : <Button variant="ghost" onClick={clearFilters}>Clear filters</Button>
          }
        />
      ) : (
        <div className={`fridge__items fridge__items--${view}`}>
          {filtered.map(item => (
            <FridgeItem
              key={item.id}
              item={item}
              view={view}
              onEdit={() => handleEdit(item)}
              onDelete={() => setDeleteTarget(item)}
              onConsume={() => { setConsumeTarget(item); setConsumeAmount(1); }}
              onAddToShopping={() => handleAddToShopping(item)}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit item" wide>
        {editItem && (
          <ItemForm
            initial={editItem}
            onSubmit={handleEditSave}
            onCancel={() => setEditItem(null)}
            submitLabel="Save changes"
          />
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove item">
        {deleteTarget && (
          <>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Remove <strong>"{deleteTarget.name}"</strong> from your fridge? This can't be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete}>Remove item</Button>
            </div>
          </>
        )}
      </Modal>

      {/* Consume Modal */}
      <Modal open={!!consumeTarget} onClose={() => setConsumeTarget(null)} title="Log usage">
        {consumeTarget && (
          <>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              How much of <strong>"{consumeTarget.name}"</strong> did you use?
              <br />
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                Currently: {consumeTarget.quantity} {consumeTarget.unit}
              </span>
            </p>
            <FormField label="Amount used">
              <Input
                type="number"
                min="0.1"
                step="0.1"
                max={consumeTarget.quantity}
                value={consumeAmount}
                onChange={e => setConsumeAmount(e.target.value)}
                autoFocus
              />
            </FormField>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setConsumeTarget(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleConsume}>Log usage</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

// ── FridgeItem card/row ───────────────────────────────────────────────────
function FridgeItem({ item, view, onEdit, onDelete, onConsume, onAddToShopping }) {
  const cat = CATEGORIES.find(c => c.id === item.category);
  const loc = LOCATIONS.find(l => l.id === item.location);
  const days   = getDaysUntilExpiry(item.expiryDate);
  const status = getExpiryStatus(days);

  if (view === 'list') {
    return (
      <div className={`fridge-item-row fridge-item-row--${status}`}>
        <span className="fridge-item-row__emoji">{cat?.emoji || '📦'}</span>
        <div className="fridge-item-row__main">
          <span className="fridge-item-row__name">{item.name}</span>
          {item.brand && <span className="fridge-item-row__brand">{item.brand}</span>}
        </div>
        <span className="fridge-item-row__qty">{item.quantity} {item.unit}</span>
        <Badge variant="default">{loc?.emoji} {loc?.label}</Badge>
        <ExpiryBadge expiryDate={item.expiryDate} />
        <div className="fridge-item-row__actions">
          <button className="fridge-item-row__action" title="Log usage" onClick={onConsume}><Minus size={14} /></button>
          <button className="fridge-item-row__action" title="Edit" onClick={onEdit}><Pencil size={14} /></button>
          <button className="fridge-item-row__action fridge-item-row__action--danger" title="Delete" onClick={onDelete}><Trash2 size={14} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fridge-card fridge-card--${status}`}>
      <div className="fridge-card__top">
        <span className="fridge-card__emoji">{cat?.emoji || '📦'}</span>
        <div className="fridge-card__badges">
          <ExpiryBadge expiryDate={item.expiryDate} />
        </div>
      </div>
      <div className="fridge-card__body">
        <p className="fridge-card__name">{item.name}</p>
        {item.brand && <p className="fridge-card__brand">{item.brand}</p>}
        <p className="fridge-card__meta">
          {item.quantity} {item.unit} · {loc?.emoji} {loc?.label}
        </p>
        {item.notes && <p className="fridge-card__notes">{item.notes}</p>}
      </div>
      <div className="fridge-card__actions">
        <button className="fridge-card__action" title="Add to shopping" onClick={onAddToShopping}>🛒</button>
        <button className="fridge-card__action" title="Log usage" onClick={onConsume}><Minus size={14} /></button>
        <button className="fridge-card__action" title="Edit" onClick={onEdit}><Pencil size={14} /></button>
        <button className="fridge-card__action fridge-card__action--danger" title="Delete" onClick={onDelete}><Trash2 size={14} /></button>
      </div>
    </div>
  );
}
