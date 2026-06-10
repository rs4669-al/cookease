import React, { useState, useEffect } from 'react';
import { CATEGORIES, LOCATIONS, UNITS } from '../context/FridgeContext';
import { FormField, Input, Select, Textarea, Button } from './UI';
import './ItemForm.css';

const DEFAULT = {
  name: '', brand: '', category: 'other', location: 'fridge',
  quantity: 1, unit: 'unit(s)', expiryDate: '', purchaseDate: '',
  notes: '', calories: '',
};

export default function ItemForm({ initial = {}, onSubmit, onCancel, submitLabel = 'Save item' }) {
  const [form, setForm] = useState({ ...DEFAULT, ...initial });

  useEffect(() => {
    setForm({ ...DEFAULT, ...initial });
  }, [initial]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit({
      ...form,
      quantity: Number(form.quantity) || 1,
      calories: form.calories ? Number(form.calories) : null,
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      {/* Name & Brand */}
      <div className="item-form__row">
        <FormField label="Item name" required>
          <Input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Whole Milk"
            required
            autoFocus
          />
        </FormField>
        <FormField label="Brand">
          <Input
            value={form.brand}
            onChange={e => set('brand', e.target.value)}
            placeholder="e.g. Organic Valley"
          />
        </FormField>
      </div>

      {/* Category & Location */}
      <div className="item-form__row">
        <FormField label="Category" required>
          <Select value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Storage location" required>
          <Select value={form.location} onChange={e => set('location', e.target.value)}>
            {LOCATIONS.map(l => (
              <option key={l.id} value={l.id}>{l.emoji} {l.label}</option>
            ))}
          </Select>
        </FormField>
      </div>

      {/* Quantity & Unit */}
      <div className="item-form__row item-form__row--qty">
        <FormField label="Quantity" required>
          <Input
            type="number"
            min="0.1"
            step="0.1"
            value={form.quantity}
            onChange={e => set('quantity', e.target.value)}
          />
        </FormField>
        <FormField label="Unit" required>
          <Select value={form.unit} onChange={e => set('unit', e.target.value)}>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </Select>
        </FormField>
        <FormField label="Calories (per serving)">
          <Input
            type="number"
            min="0"
            value={form.calories}
            onChange={e => set('calories', e.target.value)}
            placeholder="—"
          />
        </FormField>
      </div>

      {/* Dates */}
      <div className="item-form__row">
        <FormField label="Purchase date">
          <Input
            type="date"
            value={form.purchaseDate}
            max={today}
            onChange={e => set('purchaseDate', e.target.value)}
          />
        </FormField>
        <FormField label="Expiry date">
          <Input
            type="date"
            value={form.expiryDate}
            onChange={e => set('expiryDate', e.target.value)}
          />
        </FormField>
      </div>

      {/* Notes */}
      <FormField label="Notes">
        <Textarea
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Any extra details..."
        />
      </FormField>

      {/* Actions */}
      <div className="item-form__actions">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
