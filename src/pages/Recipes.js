import React, { useState, useMemo } from 'react';
import { Plus, Heart, Trash2, Clock, Users, X, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFridge } from '../context/FridgeContext';
import { Button, Badge, Modal, FormField, Input, Textarea, EmptyState } from '../components/UI';
import './Recipes.css';

const TAG_OPTIONS = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Vegetarian', 'Vegan', 'Quick', 'Healthy', 'Comfort food'];

const SAMPLE_RECIPES = [
  {
    id: '__sample1',
    title: 'Classic Scrambled Eggs',
    description: 'Creamy, buttery scrambled eggs — perfect any time of day.',
    ingredients: ['3 eggs', '1 tbsp butter', '2 tbsp milk', 'Salt & pepper'],
    instructions: '1. Crack eggs into a bowl, add milk, salt and pepper. Whisk well.\n2. Melt butter in a pan over low heat.\n3. Pour in eggs and gently stir with a spatula, moving them slowly.\n4. Remove from heat while still slightly wet — they\'ll finish cooking in the pan.\n5. Serve immediately.',
    prepTime: 5, cookTime: 5, servings: 2,
    tags: ['Breakfast', 'Quick'],
    favorite: false,
    createdAt: new Date().toISOString(),
    sample: true,
  },
  {
    id: '__sample2',
    title: 'Simple Pasta with Olive Oil',
    description: 'A 15-minute pantry staple with garlic, olive oil, and parmesan.',
    ingredients: ['200g pasta', '3 garlic cloves', '3 tbsp olive oil', 'Parmesan to taste', 'Fresh parsley', 'Salt & pepper'],
    instructions: '1. Cook pasta in well-salted boiling water until al dente.\n2. In a pan, gently heat olive oil and sliced garlic until golden — don\'t burn it.\n3. Drain pasta, reserving ½ cup pasta water.\n4. Toss pasta in the pan with garlic oil, adding pasta water to loosen.\n5. Top with parmesan, parsley, and cracked pepper.',
    prepTime: 5, cookTime: 12, servings: 2,
    tags: ['Dinner', 'Quick', 'Vegetarian'],
    favorite: false,
    createdAt: new Date().toISOString(),
    sample: true,
  },
];

export default function Recipes() {
  const { recipes, addRecipe, deleteRecipe, toggleRecipeFavorite, items } = useFridge();
  const [showAdd, setShowAdd] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [filterTag, setFilterTag] = useState('');
  const [search, setSearch] = useState('');

  // Combine user recipes with sample recipes (samples don't persist)
  const allRecipes = useMemo(() => {
    const userIds = new Set(recipes.map(r => r.id));
    const samples = SAMPLE_RECIPES.filter(s => !userIds.has(s.id));
    return [...recipes, ...samples];
  }, [recipes]);

  const filtered = useMemo(() => {
    let list = allRecipes;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (filterTag) list = list.filter(r => r.tags.includes(filterTag));
    return list.sort((a, b) => b.favorite - a.favorite || new Date(b.createdAt) - new Date(a.createdAt));
  }, [allRecipes, search, filterTag]);

  // Check ingredient availability in fridge
  const checkIngredients = (ingredients) => {
    const fridgeNames = items.map(i => i.name.toLowerCase());
    let matched = 0;
    ingredients.forEach(ing => {
      const ingLower = ing.toLowerCase();
      if (fridgeNames.some(n => ingLower.includes(n) || n.includes(ingLower.split(' ')[0]))) {
        matched++;
      }
    });
    return { matched, total: ingredients.length };
  };

  const handleDelete = (recipe) => {
    if (recipe.sample) return;
    deleteRecipe(recipe.id);
    toast.success(`"${recipe.title}" deleted`);
    if (expanded === recipe.id) setExpanded(null);
  };

  const handleFavorite = (recipe) => {
    if (recipe.sample) { toast('Sample recipes can\'t be favorited — save your own!'); return; }
    toggleRecipeFavorite(recipe.id);
  };

  const handleAddToShopping = () => {
    toast.success('Feature: add missing ingredients to shopping list');
  };

  return (
    <div className="recipes">
      {/* Toolbar */}
      <div className="recipes__toolbar">
        <input
          className="recipes__search"
          placeholder="Search recipes…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="recipes__tags">
          <button
            className={`recipes__tag-btn ${!filterTag ? 'recipes__tag-btn--active' : ''}`}
            onClick={() => setFilterTag('')}
          >All</button>
          {TAG_OPTIONS.map(t => (
            <button
              key={t}
              className={`recipes__tag-btn ${filterTag === t ? 'recipes__tag-btn--active' : ''}`}
              onClick={() => setFilterTag(t === filterTag ? '' : t)}
            >{t}</button>
          ))}
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={15} />} onClick={() => setShowAdd(true)}>
          Add recipe
        </Button>
      </div>

      {/* Count */}
      <p className="recipes__count">{filtered.length} recipe{filtered.length !== 1 ? 's' : ''}</p>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          emoji="📖"
          title="No recipes yet"
          description="Add your favourite recipes here and see which ingredients you already have."
          action={<Button variant="primary" icon={<Plus size={15} />} onClick={() => setShowAdd(true)}>Add first recipe</Button>}
        />
      ) : (
        <div className="recipes__list">
          {filtered.map(recipe => {
            const ingMatch = checkIngredients(recipe.ingredients);
            const isOpen = expanded === recipe.id;
            return (
              <div key={recipe.id} className={`recipe-card ${isOpen ? 'recipe-card--open' : ''}`}>
                <div className="recipe-card__header" onClick={() => setExpanded(isOpen ? null : recipe.id)}>
                  <div className="recipe-card__meta-left">
                    <h3 className="recipe-card__title">{recipe.title}</h3>
                    {recipe.description && (
                      <p className="recipe-card__desc">{recipe.description}</p>
                    )}
                    <div className="recipe-card__badges">
                      {recipe.tags.map(t => (
                        <Badge key={t} variant="cookie">{t}</Badge>
                      ))}
                      {recipe.prepTime && (
                        <Badge variant="default"><Clock size={11} /> {recipe.prepTime + (recipe.cookTime || 0)}min</Badge>
                      )}
                      {recipe.servings && (
                        <Badge variant="default"><Users size={11} /> {recipe.servings}</Badge>
                      )}
                      {recipe.sample && <Badge variant="default">Sample</Badge>}
                    </div>
                  </div>
                  <div className="recipe-card__meta-right">
                    <div className="recipe-card__match" title={`${ingMatch.matched}/${ingMatch.total} ingredients in your fridge`}>
                      <div className="recipe-card__match-bar">
                        <div
                          className="recipe-card__match-fill"
                          style={{ width: ingMatch.total > 0 ? `${(ingMatch.matched / ingMatch.total) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="recipe-card__match-label">
                        {ingMatch.matched}/{ingMatch.total} in fridge
                      </span>
                    </div>
                    <div className="recipe-card__actions" onClick={e => e.stopPropagation()}>
                      <button
                        className={`recipe-card__action-btn ${recipe.favorite ? 'recipe-card__action-btn--fav' : ''}`}
                        onClick={() => handleFavorite(recipe)}
                        title="Favourite"
                      >
                        <Heart size={15} fill={recipe.favorite ? 'currentColor' : 'none'} />
                      </button>
                      {!recipe.sample && (
                        <button
                          className="recipe-card__action-btn recipe-card__action-btn--danger"
                          onClick={() => handleDelete(recipe)}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                    {isOpen ? <ChevronUp size={18} className="recipe-card__chevron" /> : <ChevronDown size={18} className="recipe-card__chevron" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="recipe-card__body">
                    <div className="recipe-card__cols">
                      <div className="recipe-card__col">
                        <h4 className="recipe-card__col-title">Ingredients</h4>
                        <ul className="recipe-card__ingredients">
                          {recipe.ingredients.map((ing, i) => {
                            const fridgeNames = items.map(f => f.name.toLowerCase());
                            const ingLower = ing.toLowerCase();
                            const have = fridgeNames.some(n => ingLower.includes(n) || n.includes(ingLower.split(' ')[0]));
                            return (
                              <li key={i} className={`recipe-card__ingredient ${have ? 'recipe-card__ingredient--have' : ''}`}>
                                <span className="recipe-card__ingredient-dot">{have ? '✓' : '○'}</span>
                                {ing}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                      <div className="recipe-card__col">
                        <h4 className="recipe-card__col-title">Instructions</h4>
                        <p className="recipe-card__instructions">{recipe.instructions}</p>
                      </div>
                    </div>
                    <div className="recipe-card__footer">
                      {ingMatch.matched < ingMatch.total && (
                        <Button variant="secondary" size="sm" onClick={handleAddToShopping}>
                          🛒 Add missing to shopping ({ingMatch.total - ingMatch.matched})
                        </Button>
                      )}
                      {ingMatch.matched === ingMatch.total && ingMatch.total > 0 && (
                        <Badge variant="green">🎉 You have all ingredients!</Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add recipe modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add recipe" wide>
        <AddRecipeForm
          onSubmit={(data) => {
            addRecipe(data);
            toast.success(`"${data.title}" saved!`);
            setShowAdd(false);
          }}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>
    </div>
  );
}

// ── Add Recipe Form ────────────────────────────────────────────────────────
function AddRecipeForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: '', description: '', instructions: '',
    prepTime: '', cookTime: '', servings: '',
    ingredientInput: '', ingredients: [],
    tags: [],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addIngredient = () => {
    if (!form.ingredientInput.trim()) return;
    set('ingredients', [...form.ingredients, form.ingredientInput.trim()]);
    set('ingredientInput', '');
  };

  const removeIngredient = (i) => {
    set('ingredients', form.ingredients.filter((_, idx) => idx !== i));
  };

  const toggleTag = (tag) => {
    set('tags', form.tags.includes(tag)
      ? form.tags.filter(t => t !== tag)
      : [...form.tags, tag]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({
      title: form.title,
      description: form.description,
      ingredients: form.ingredients,
      instructions: form.instructions,
      prepTime: form.prepTime ? Number(form.prepTime) : null,
      cookTime: form.cookTime ? Number(form.cookTime) : null,
      servings: form.servings ? Number(form.servings) : null,
      tags: form.tags,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <FormField label="Recipe title" required>
        <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Chicken Stir Fry" required autoFocus />
      </FormField>
      <FormField label="Description">
        <Input value={form.description} onChange={e => set('description', e.target.value)} placeholder="A short description…" />
      </FormField>

      {/* Times & servings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <FormField label="Prep time (min)">
          <Input type="number" min="0" value={form.prepTime} onChange={e => set('prepTime', e.target.value)} placeholder="—" />
        </FormField>
        <FormField label="Cook time (min)">
          <Input type="number" min="0" value={form.cookTime} onChange={e => set('cookTime', e.target.value)} placeholder="—" />
        </FormField>
        <FormField label="Servings">
          <Input type="number" min="1" value={form.servings} onChange={e => set('servings', e.target.value)} placeholder="—" />
        </FormField>
      </div>

      {/* Ingredients */}
      <FormField label="Ingredients">
        <div style={{ display: 'flex', gap: 8 }}>
          <Input
            value={form.ingredientInput}
            onChange={e => set('ingredientInput', e.target.value)}
            placeholder="e.g. 2 cups flour"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addIngredient(); } }}
          />
          <Button type="button" variant="secondary" size="sm" onClick={addIngredient}>Add</Button>
        </div>
        {form.ingredients.length > 0 && (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
            {form.ingredients.map((ing, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                <span style={{ flex: 1 }}>• {ing}</span>
                <button type="button" onClick={() => removeIngredient(i)} style={{ color: 'var(--text-muted)' }}><X size={12} /></button>
              </li>
            ))}
          </ul>
        )}
      </FormField>

      {/* Instructions */}
      <FormField label="Instructions">
        <Textarea
          value={form.instructions}
          onChange={e => set('instructions', e.target.value)}
          placeholder="Step 1: …&#10;Step 2: …"
          rows={5}
        />
      </FormField>

      {/* Tags */}
      <FormField label="Tags">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {TAG_OPTIONS.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => toggleTag(t)}
              style={{
                padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 12,
                border: '1.5px solid',
                borderColor: form.tags.includes(t) ? 'var(--cookie-500)' : 'var(--cream-200)',
                background: form.tags.includes(t) ? 'var(--cookie-300)' : 'white',
                color: form.tags.includes(t) ? 'var(--brown-900)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >{t}</button>
          ))}
        </div>
      </FormField>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary">Save recipe</Button>
      </div>
    </form>
  );
}
