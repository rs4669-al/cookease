import React, { useState, useMemo } from 'react';
import { Plus, Trash2, X, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFridge, CATEGORIES, UNITS } from '../context/FridgeContext';
import { Button, Badge, EmptyState, FormField, Input, Select, Modal } from '../components/UI';
import './ShoppingList.css';

export default function ShoppingList() {
  const {
    shoppingList, items,
    addShoppingItem, toggleShoppingItem,
    deleteShoppingItem, clearCheckedShopping,
    addItem,
  } = useFridge();

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', quantity: 1, unit: 'unit(s)', category: 'other', note: '' });
  const [search, setSearch] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Suggest items that might be running low (in fridge but qty <= 1)
  const suggestions = useMemo(() => {
    const onList = new Set(shoppingList.map(i => i.name.toLowerCase()));
    return items
      .filter(i => i.quantity <= 1 && !onList.has(i.name.toLowerCase()))
      .slice(0, 6);
  }, [items, shoppingList]);

  // Group by category
  const grouped = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = shoppingList.filter(i =>
      !q || i.name.toLowerCase().includes(q)
    );

    const groups = {};
    filtered.forEach(item => {
      const cat = CATEGORIES.find(c => c.id === item.category) || CATEGORIES.at(-1);
      if (!groups[cat.id]) groups[cat.id] = { ...cat, items: [] };
      groups[cat.id].items.push(item);
    });

    // Sort: unchecked first within each group
    Object.values(groups).forEach(g => {
      g.items.sort((a, b) => a.checked - b.checked);
    });

    return Object.values(groups);
  }, [shoppingList, search]);

  const checkedCount  = shoppingList.filter(i => i.checked).length;
  const totalCount    = shoppingList.length;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addShoppingItem({ ...form, quantity: Number(form.quantity) || 1 });
    toast.success(`"${form.name}" added to list`);
    setForm({ name: '', quantity: 1, unit: 'unit(s)', category: 'other', note: '' });
    setShowAdd(false);
  };

  const handleClearChecked = () => {
    clearCheckedShopping();
    toast.success('Checked items removed');
  };

  // Move checked items directly into fridge
  const handleMoveToFridge = () => {
    const checked = shoppingList.filter(i => i.checked);
    checked.forEach(i => {
      addItem({ name: i.name, category: i.category, quantity: i.quantity, unit: i.unit, notes: i.note });
      deleteShoppingItem(i.id);
    });
    toast.success(`${checked.length} item${checked.length > 1 ? 's' : ''} added to your fridge!`);
  };

  const addSuggestion = (item) => {
    addShoppingItem({ name: item.name, category: item.category, unit: item.unit });
    toast.success(`"${item.name}" added to list`);
  };

  return (
    <div className="shopping">
      {/* Header */}
      <div className="shopping__header">
        <div className="shopping__header-left">
          {totalCount > 0 && (
            <div className="shopping__progress-wrap">
              <div className="shopping__progress-bar">
                <div
                  className="shopping__progress-fill"
                  style={{ width: totalCount > 0 ? `${(checkedCount / totalCount) * 100}%` : '0%' }}
                />
              </div>
              <span className="shopping__progress-label">
                {checkedCount} / {totalCount} checked
              </span>
            </div>
          )}
        </div>
        <div className="shopping__header-actions">
          {checkedCount > 0 && (
            <>
              <Button variant="secondary" size="sm" onClick={handleMoveToFridge}>
                📦 Move to fridge ({checkedCount})
              </Button>
              <Button variant="danger" size="sm" onClick={handleClearChecked}>
                <Trash2 size={14} /> Clear checked
              </Button>
            </>
          )}
          <Button variant="primary" size="sm" icon={<Plus size={15} />} onClick={() => setShowAdd(true)}>
            Add item
          </Button>
        </div>
      </div>

      {/* Search */}
      {totalCount > 4 && (
        <div className="shopping__search-wrap">
          <input
            className="shopping__search"
            placeholder="Search list…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="shopping__search-clear" onClick={() => setSearch('')}><X size={13} /></button>}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && !search && (
        <div className="shopping__suggestions">
          <p className="shopping__suggestions-title">⚡ Running low — add to list?</p>
          <div className="shopping__suggestions-list">
            {suggestions.map(item => {
              const cat = CATEGORIES.find(c => c.id === item.category);
              return (
                <button key={item.id} className="shopping__suggestion-pill" onClick={() => addSuggestion(item)}>
                  {cat?.emoji} {item.name}
                  <span className="shopping__suggestion-qty">{item.quantity} {item.unit} left</span>
                  <Plus size={12} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty */}
      {shoppingList.length === 0 ? (
        <EmptyState
          emoji="🛒"
          title="Your list is empty"
          description="Add items you need to buy, or they'll appear automatically when you're running low."
          action={
            <Button variant="primary" icon={<Plus size={15} />} onClick={() => setShowAdd(true)}>
              Add first item
            </Button>
          }
        />
      ) : (
        <div className="shopping__groups">
          {grouped.map(group => (
            <div key={group.id} className="shopping__group">
              <div className="shopping__group-header">
                <span>{group.emoji} {group.label}</span>
                <Badge variant="default">{group.items.length}</Badge>
              </div>
              <ul className="shopping__group-items">
                {group.items.map(item => (
                  <ShoppingItem
                    key={item.id}
                    item={item}
                    onToggle={() => toggleShoppingItem(item.id)}
                    onDelete={() => { deleteShoppingItem(item.id); toast.success(`"${item.name}" removed`); }}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add to shopping list">
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormField label="Item name" required>
            <Input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Whole milk"
              required
              autoFocus
            />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FormField label="Quantity">
              <Input
                type="number" min="0.1" step="0.1"
                value={form.quantity}
                onChange={e => set('quantity', e.target.value)}
              />
            </FormField>
            <FormField label="Unit">
              <Select value={form.unit} onChange={e => set('unit', e.target.value)}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </Select>
            </FormField>
          </div>
          <FormField label="Category">
            <Select value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Note">
            <Input
              value={form.note}
              onChange={e => set('note', e.target.value)}
              placeholder="e.g. Low fat, store brand OK"
            />
          </FormField>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add to list</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function ShoppingItem({ item, onToggle, onDelete }) {
  const cat = CATEGORIES.find(c => c.id === item.category);
  return (
    <li className={`shopping-item ${item.checked ? 'shopping-item--checked' : ''}`}>
      <button
        className={`shopping-item__check ${item.checked ? 'shopping-item__check--done' : ''}`}
        onClick={onToggle}
        aria-label={item.checked ? 'Uncheck' : 'Check'}
      >
        {item.checked ? '✓' : ''}
      </button>
      <div className="shopping-item__body">
        <span className="shopping-item__name">{item.name}</span>
        <span className="shopping-item__meta">
          {item.quantity} {item.unit}
          {item.note && <> · <em>{item.note}</em></>}
        </span>
      </div>
      <button className="shopping-item__delete" onClick={onDelete} aria-label="Delete">
        <X size={14} />
      </button>
    </li>
  );
}
