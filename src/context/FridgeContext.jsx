import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const FridgeContext = createContext(null);

// ── Storage key ───────────────────────────────────────────────────────────
const STORAGE_KEY = 'cookease_fridge_v1';
const SHOPPING_KEY = 'cookease_shopping_v1';
const RECIPES_KEY  = 'cookease_recipes_v1';

// ── Category definitions ─────────────────────────────────────────────────
export const CATEGORIES = [
  { id: 'dairy',     label: 'Dairy',      emoji: '🥛' },
  { id: 'produce',   label: 'Produce',    emoji: '🥦' },
  { id: 'meat',      label: 'Meat',       emoji: '🥩' },
  { id: 'seafood',   label: 'Seafood',    emoji: '🐟' },
  { id: 'grains',    label: 'Grains',     emoji: '🌾' },
  { id: 'snacks',    label: 'Snacks',     emoji: '🍪' },
  { id: 'beverages', label: 'Beverages',  emoji: '🧃' },
  { id: 'condiments',label: 'Condiments', emoji: '🫙' },
  { id: 'frozen',    label: 'Frozen',     emoji: '🧊' },
  { id: 'bakery',    label: 'Bakery',     emoji: '🍞' },
  { id: 'other',     label: 'Other',      emoji: '📦' },
];

export const LOCATIONS = [
  { id: 'fridge',  label: 'Fridge',  emoji: '🧊' },
  { id: 'freezer', label: 'Freezer', emoji: '❄️' },
  { id: 'pantry',  label: 'Pantry',  emoji: '🗄️' },
  { id: 'counter', label: 'Counter', emoji: '🍽️' },
];

export const UNITS = ['unit(s)', 'g', 'kg', 'ml', 'L', 'oz', 'lb', 'cup(s)', 'tbsp', 'tsp', 'slice(s)', 'pack(s)', 'box(es)', 'can(s)', 'bottle(s)', 'bag(s)'];

// ── Helpers ───────────────────────────────────────────────────────────────
export function getDaysUntilExpiry(expiryDate) {
  if (!expiryDate) return null;
  const now  = new Date(); now.setHours(0,0,0,0);
  const exp  = new Date(expiryDate); exp.setHours(0,0,0,0);
  return Math.round((exp - now) / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(days) {
  if (days === null) return 'none';
  if (days < 0)  return 'expired';
  if (days <= 2) return 'critical';
  if (days <= 7) return 'warning';
  return 'good';
}

// ── Reducer ───────────────────────────────────────────────────────────────
function fridgeReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      return { ...state, items: [action.item, ...state.items] };

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(i => i.id === action.item.id ? action.item : i),
      };

    case 'DELETE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.id) };

    case 'CONSUME_ITEM': {
      const item = state.items.find(i => i.id === action.id);
      if (!item) return state;
      const newQty = item.quantity - action.amount;
      if (newQty <= 0) {
        return { ...state, items: state.items.filter(i => i.id !== action.id) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.id ? { ...i, quantity: newQty } : i
        ),
      };
    }

    case 'ADD_SHOPPING_ITEM':
      return { ...state, shoppingList: [action.item, ...state.shoppingList] };

    case 'TOGGLE_SHOPPING_ITEM':
      return {
        ...state,
        shoppingList: state.shoppingList.map(i =>
          i.id === action.id ? { ...i, checked: !i.checked } : i
        ),
      };

    case 'DELETE_SHOPPING_ITEM':
      return {
        ...state,
        shoppingList: state.shoppingList.filter(i => i.id !== action.id),
      };

    case 'CLEAR_CHECKED_SHOPPING':
      return {
        ...state,
        shoppingList: state.shoppingList.filter(i => !i.checked),
      };

    case 'ADD_RECIPE':
      return { ...state, recipes: [action.recipe, ...state.recipes] };

    case 'DELETE_RECIPE':
      return { ...state, recipes: state.recipes.filter(r => r.id !== action.id) };

    case 'TOGGLE_RECIPE_FAVORITE':
      return {
        ...state,
        recipes: state.recipes.map(r =>
          r.id === action.id ? { ...r, favorite: !r.favorite } : r
        ),
      };

    case 'LOAD':
      return action.state;

    default:
      return state;
  }
}

const initialState = {
  items: [],
  shoppingList: [],
  recipes: [],
};

// ── Provider ──────────────────────────────────────────────────────────────
export function FridgeProvider({ children }) {
  const [state, dispatch] = useReducer(fridgeReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const shopping = localStorage.getItem(SHOPPING_KEY);
      const recipes  = localStorage.getItem(RECIPES_KEY);
      if (saved || shopping || recipes) {
        dispatch({
          type: 'LOAD',
          state: {
            items:        saved    ? JSON.parse(saved)    : [],
            shoppingList: shopping ? JSON.parse(shopping) : [],
            recipes:      recipes  ? JSON.parse(recipes)  : [],
          },
        });
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  }, []);

  // Persist on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY,  JSON.stringify(state.items));
    localStorage.setItem(SHOPPING_KEY, JSON.stringify(state.shoppingList));
    localStorage.setItem(RECIPES_KEY,  JSON.stringify(state.recipes));
  }, [state]);

  // ── Actions ────────────────────────────────────────────────────────────
  const addItem = (data) => {
    const item = {
      id:           uuidv4(),
      name:         data.name || 'Unknown Item',
      brand:        data.brand || '',
      category:     data.category || 'other',
      location:     data.location || 'fridge',
      quantity:     data.quantity || 1,
      unit:         data.unit || 'unit(s)',
      expiryDate:   data.expiryDate || null,
      purchaseDate: data.purchaseDate || new Date().toISOString().split('T')[0],
      barcode:      data.barcode || null,
      notes:        data.notes || '',
      imageUrl:     data.imageUrl || null,
      calories:     data.calories || null,
      addedAt:      new Date().toISOString(),
    };
    dispatch({ type: 'ADD_ITEM', item });
    return item;
  };

  const updateItem = (item) => dispatch({ type: 'UPDATE_ITEM', item });
  const deleteItem = (id)   => dispatch({ type: 'DELETE_ITEM', id });
  const consumeItem = (id, amount = 1) => dispatch({ type: 'CONSUME_ITEM', id, amount });

  const addShoppingItem = (data) => {
    const item = {
      id:       uuidv4(),
      name:     data.name,
      quantity: data.quantity || 1,
      unit:     data.unit || 'unit(s)',
      category: data.category || 'other',
      note:     data.note || '',
      checked:  false,
      addedAt:  new Date().toISOString(),
    };
    dispatch({ type: 'ADD_SHOPPING_ITEM', item });
  };

  const toggleShoppingItem  = (id) => dispatch({ type: 'TOGGLE_SHOPPING_ITEM', id });
  const deleteShoppingItem  = (id) => dispatch({ type: 'DELETE_SHOPPING_ITEM', id });
  const clearCheckedShopping = ()  => dispatch({ type: 'CLEAR_CHECKED_SHOPPING' });

  const addRecipe = (data) => {
    const recipe = {
      id:          uuidv4(),
      title:       data.title,
      description: data.description || '',
      ingredients: data.ingredients || [],
      instructions:data.instructions || '',
      prepTime:    data.prepTime || null,
      cookTime:    data.cookTime || null,
      servings:    data.servings || null,
      tags:        data.tags || [],
      favorite:    false,
      createdAt:   new Date().toISOString(),
    };
    dispatch({ type: 'ADD_RECIPE', recipe });
  };

  const deleteRecipe          = (id) => dispatch({ type: 'DELETE_RECIPE', id });
  const toggleRecipeFavorite  = (id) => dispatch({ type: 'TOGGLE_RECIPE_FAVORITE', id });

  // Derived stats
  const stats = {
    total:   state.items.length,
    expired: state.items.filter(i => getDaysUntilExpiry(i.expiryDate) !== null && getDaysUntilExpiry(i.expiryDate) < 0).length,
    expiringSoon: state.items.filter(i => {
      const d = getDaysUntilExpiry(i.expiryDate);
      return d !== null && d >= 0 && d <= 7;
    }).length,
    byCategory: CATEGORIES.map(c => ({
      ...c,
      count: state.items.filter(i => i.category === c.id).length,
    })),
    byLocation: LOCATIONS.map(l => ({
      ...l,
      count: state.items.filter(i => i.location === l.id).length,
    })),
  };

  return (
    <FridgeContext.Provider value={{
      items: state.items,
      shoppingList: state.shoppingList,
      recipes: state.recipes,
      stats,
      addItem, updateItem, deleteItem, consumeItem,
      addShoppingItem, toggleShoppingItem, deleteShoppingItem, clearCheckedShopping,
      addRecipe, deleteRecipe, toggleRecipeFavorite,
    }}>
      {children}
    </FridgeContext.Provider>
  );
}

export function useFridge() {
  const ctx = useContext(FridgeContext);
  if (!ctx) throw new Error('useFridge must be used inside FridgeProvider');
  return ctx;
}
