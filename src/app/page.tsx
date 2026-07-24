"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Check, ChevronDown, Clock3, Flame, Heart, Home, ListChecks, Search, ShoppingBasket, Sparkles, Users, WalletCards, X } from "lucide-react";
import { days, planningGroups, recipes, type PlanningGroup, type Recipe } from "@/lib/data";

type Tab = "home" | "plan" | "recipes" | "groceries";
type MealSlot = { recipeId: string; servings: number };
type PlanState = Record<string, Record<string, MealSlot | undefined>>;

const storageKey = "around-the-table-v1";

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "compact" : ""}`}>
      <img src="/favicon.svg" alt="" />
      <div><strong>Around the Table</strong>{!compact && <span>Plan less. Gather more.</span>}</div>
    </div>
  );
}

export default function Page() {
  const [tab, setTab] = useState<Tab>("home");
  const [groupId, setGroupId] = useState(planningGroups[0].id);
  const [plans, setPlans] = useState<PlanState>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [pickerDay, setPickerDay] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);

  const group = planningGroups.find((item) => item.id === groupId) ?? planningGroups[0];
  const groupPlan = plans[group.id] ?? {};

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPlans(parsed.plans ?? {});
        setChecked(parsed.checked ?? {});
        setGroupId(parsed.groupId ?? planningGroups[0].id);
      } catch {}
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(storageKey, JSON.stringify({ plans, checked, groupId }));
  }, [plans, checked, groupId, ready]);

  useEffect(() => {
    document.body.style.overflow = selectedRecipe || pickerDay ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedRecipe, pickerDay]);

  const selectedMeals = useMemo(() => Object.values(groupPlan).filter(Boolean) as MealSlot[], [groupPlan]);
  const plannedCost = selectedMeals.reduce((sum, slot) => {
    const recipe = recipes.find((item) => item.id === slot.recipeId);
    return sum + (recipe?.cost ?? 0) * slot.servings;
  }, 0);

  const groceryItems = useMemo(() => {
    const map = new Map<string, { name: string; category: string; details: string[] }>();
    selectedMeals.forEach((slot) => {
      const recipe = recipes.find((item) => item.id === slot.recipeId);
      recipe?.ingredients.forEach((ingredient) => {
        const key = `${ingredient.category}-${ingredient.name}`;
        const current = map.get(key) ?? { name: ingredient.name, category: ingredient.category, details: [] };
        current.details.push(`${ingredient.quantity} × ${slot.servings} servings`);
        map.set(key, current);
      });
    });
    return Array.from(map.values()).sort((a, b) => a.category.localeCompare(b.category));
  }, [selectedMeals]);

  function addMeal(day: string, recipe: Recipe) {
    setPlans((current) => ({
      ...current,
      [group.id]: { ...(current[group.id] ?? {}), [day]: { recipeId: recipe.id, servings: group.people.length } },
    }));
    setPickerDay(null);
    setSelectedRecipe(null);
  }

  function addToNextOpenDay(recipe: Recipe) {
    const nextDay = days.find((day) => !groupPlan[day]) ?? "Monday";
    addMeal(nextDay, recipe);
  }

  function removeMeal(day: string) {
    setPlans((current) => ({ ...current, [group.id]: { ...(current[group.id] ?? {}), [day]: undefined } }));
  }

  function updateServings(day: string, servings: number) {
    const slot = groupPlan[day];
    if (!slot) return;
    setPlans((current) => ({ ...current, [group.id]: { ...(current[group.id] ?? {}), [day]: { ...slot, servings: Math.max(1, servings) } } }));
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo />
        <nav>
          <NavButton active={tab === "home"} onClick={() => setTab("home")} icon={<Home size={19} />} label="Home" />
          <NavButton active={tab === "plan"} onClick={() => setTab("plan")} icon={<CalendarDays size={19} />} label="Plan" />
          <NavButton active={tab === "recipes"} onClick={() => setTab("recipes")} icon={<Heart size={19} />} label="Recipes" />
          <NavButton active={tab === "groceries"} onClick={() => setTab("groceries")} icon={<ShoppingBasket size={19} />} label="Groceries" />
        </nav>
        <div className="sidebar-note"><Sparkles size={18} /><span>Built for real families, busy weeks and more time together.</span></div>
      </aside>

      <main>
        <header className="mobile-header"><Logo compact /><button className="avatar">P</button></header>
        <div className="topbar">
          <GroupSwitcher group={group} onChange={setGroupId} />
          <button className="avatar">P</button>
        </div>

        {tab === "home" && <HomeView group={group} plannedCost={plannedCost} plannedMeals={selectedMeals.length} onPlan={() => setTab("plan")} onGroceries={() => setTab("groceries")} onGroup={setGroupId} />}
        {tab === "plan" && <PlanView group={group} groupPlan={groupPlan} plannedCost={plannedCost} onPick={setPickerDay} onRemove={removeMeal} onServings={updateServings} onView={setSelectedRecipe} />}
        {tab === "recipes" && <RecipesView query={query} setQuery={setQuery} group={group} onAdd={addToNextOpenDay} onView={setSelectedRecipe} />}
        {tab === "groceries" && <GroceriesView group={group} items={groceryItems} checked={checked} setChecked={setChecked} plannedCost={plannedCost} />}
      </main>

      <nav className="bottom-nav">
        <NavButton active={tab === "home"} onClick={() => setTab("home")} icon={<Home size={20} />} label="Home" />
        <NavButton active={tab === "plan"} onClick={() => setTab("plan")} icon={<CalendarDays size={20} />} label="Plan" />
        <NavButton active={tab === "recipes"} onClick={() => setTab("recipes")} icon={<Heart size={20} />} label="Recipes" />
        <NavButton active={tab === "groceries"} onClick={() => setTab("groceries")} icon={<ShoppingBasket size={20} />} label="List" />
      </nav>

      {pickerDay && <RecipePicker day={pickerDay} group={group} onClose={() => setPickerDay(null)} onSelect={(recipe) => addMeal(pickerDay, recipe)} onView={setSelectedRecipe} />}
      {selectedRecipe && <RecipeDetails recipe={selectedRecipe} group={group} onClose={() => setSelectedRecipe(null)} onAdd={() => addToNextOpenDay(selectedRecipe)} />}
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button className={`nav-button ${active ? "active" : ""}`} onClick={onClick}>{icon}<span>{label}</span></button>;
}

function GroupSwitcher({ group, onChange }: { group: PlanningGroup; onChange: (id: string) => void }) {
  return (
    <label className="group-switcher"><span>{group.icon}</span><div><small>Planning for</small><strong>{group.name}</strong></div><ChevronDown size={18} />
      <select value={group.id} onChange={(event) => onChange(event.target.value)}>{planningGroups.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
    </label>
  );
}

function HomeView({ group, plannedCost, plannedMeals, onPlan, onGroceries, onGroup }: { group: PlanningGroup; plannedCost: number; plannedMeals: number; onPlan: () => void; onGroceries: () => void; onGroup: (id: string) => void }) {
  return (
    <section className="content home-view">
      <div className="hero">
        <div><span className="eyebrow">GOOD MORNING, PATRICIA</span><h1>Let’s make this week feel a little easier.</h1><p>Choose where you’re planning, add the meals that fit your week, and we’ll build the grocery list.</p><button className="primary" onClick={onPlan}>Plan this week <span>→</span></button></div>
        <div className="hero-art"><div className="plate"><span>♥</span></div><div className="leaf leaf-one"/><div className="leaf leaf-two"/></div>
      </div>

      <div className="section-heading"><div><span className="eyebrow">YOUR FAMILY</span><h2>Who are we planning for?</h2></div><p>Each group keeps its own meal plan, grocery list and budget.</p></div>
      <div className="group-grid">{planningGroups.map((item) => <button key={item.id} className={`group-card ${item.id === group.id ? "selected" : ""}`} onClick={() => onGroup(item.id)}><span className="group-icon">{item.icon}</span><div><h3>{item.name}</h3><p>{item.subtitle}</p><div className="faces">{item.people.map((person) => <span key={person.id}>{person.initials}</span>)}<small>{item.people.length} people</small></div></div>{item.id === group.id && <span className="selected-mark"><Check size={15}/></span>}</button>)}</div>

      <div className="stats-grid">
        <button className="stat-card" onClick={onPlan}><span className="soft-icon"><CalendarDays /></span><div><small>MEALS PLANNED</small><strong>{plannedMeals} <em>of 7 dinners</em></strong><p>{plannedMeals ? "Your week is taking shape." : "Start with one easy dinner."}</p></div></button>
        <button className="stat-card" onClick={onGroceries}><span className="soft-icon"><ShoppingBasket /></span><div><small>ESTIMATED GROCERIES</small><strong>${plannedCost.toFixed(0)} <em>of ${group.budget}</em></strong><p>${Math.max(0, group.budget - plannedCost).toFixed(0)} left in this week’s budget.</p></div></button>
        <button className="stat-card" onClick={onPlan}><span className="soft-icon"><Users /></span><div><small>DEFAULT SERVINGS</small><strong>{group.people.length} <em>people</em></strong><p>Adjust any meal when plans change.</p></div></button>
      </div>
    </section>
  );
}

function PlanView({ group, groupPlan, plannedCost, onPick, onRemove, onServings, onView }: { group: PlanningGroup; groupPlan: Record<string, MealSlot | undefined>; plannedCost: number; onPick: (day: string) => void; onRemove: (day: string) => void; onServings: (day: string, servings: number) => void; onView: (recipe: Recipe) => void }) {
  return (
    <section className="content"><div className="page-title"><div><span className="eyebrow">WEEKLY PLANNER</span><h1>What are we eating this week?</h1><p>{group.name} · Defaulting to {group.people.length} servings</p></div><div className="budget-chip"><WalletCards size={18}/><span><small>Estimated</small><strong>${plannedCost.toFixed(2)}</strong></span></div></div>
      <div className="week-grid">{days.map((day, index) => { const slot = groupPlan[day]; const recipe = recipes.find((item) => item.id === slot?.recipeId); return <article className={`day-card ${recipe ? "filled" : ""}`} key={day}><div className="day-head"><div><span>{index + 27 > 31 ? index - 4 : index + 27}</span><strong>{day}</strong></div>{recipe && <button className="icon-button" onClick={() => onRemove(day)}><X size={16}/></button>}</div>{recipe && slot ? <><button className="meal-photo meal-photo-button" style={{ background: recipe.image }} onClick={() => onView(recipe)} aria-label={`View ${recipe.name}`}><span>{recipe.meal}</span></button><div className="meal-body"><h3>{recipe.name}</h3><div className="meal-meta"><span><Clock3 size={14}/>{recipe.minutes} min</span><span>${(recipe.cost * slot.servings).toFixed(2)}</span></div><div className="serving-control"><span>Servings</span><button onClick={() => onServings(day, slot.servings - 1)}>−</button><strong>{slot.servings}</strong><button onClick={() => onServings(day, slot.servings + 1)}>+</button></div><button className="text-button" onClick={() => onView(recipe)}>View recipe</button><button className="text-button" onClick={() => onPick(day)}>Change meal</button></div></> : <button className="empty-meal" onClick={() => onPick(day)}><span>＋</span><strong>Add dinner</strong><small>Choose from affordable family favorites</small></button>}</article>; })}</div>
    </section>
  );
}

function RecipesView({ query, setQuery, group, onAdd, onView }: { query: string; setQuery: (value: string) => void; group: PlanningGroup; onAdd: (recipe: Recipe) => void; onView: (recipe: Recipe) => void }) {
  const filtered = recipes.filter((recipe) => `${recipe.name} ${recipe.description}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="content"><div className="page-title"><div><span className="eyebrow">RECIPE LIBRARY</span><h1>Simple meals your family will actually eat.</h1><p>Reasonably priced, easy to scale, and ready for busy weeks.</p></div></div><label className="search-box"><Search size={19}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search chicken, pasta, quick meals…" /></label><div className="recipe-grid">{filtered.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} servings={group.people.length} onAdd={() => onAdd(recipe)} onView={() => onView(recipe)} />)}</div></section>;
}

function RecipeCard({ recipe, servings, onAdd, onView }: { recipe: Recipe; servings: number; onAdd: () => void; onView: () => void }) {
  return <article className="recipe-card"><button className="recipe-image recipe-image-button" style={{ background: recipe.image }} onClick={onView} aria-label={`View ${recipe.name}`}><span>{recipe.meal}</span><span className="favorite-button"><Heart size={18}/></span></button><div className="recipe-body"><button className="recipe-title-button" onClick={onView}><h3>{recipe.name}</h3></button><p>{recipe.description}</p><div className="recipe-facts"><span><Clock3 size={15}/>{recipe.minutes} min</span><span>${(recipe.cost * servings).toFixed(2)}</span><span>{recipe.protein}g protein</span></div><div className="recipe-actions"><button className="secondary secondary-outline" onClick={onView}>View recipe</button><button className="secondary" onClick={onAdd}>Add to plan</button></div></div></article>;
}

function RecipeDetails({ recipe, group, onClose, onAdd }: { recipe: Recipe; group: PlanningGroup; onClose: () => void; onAdd: () => void }) {
  const [servings, setServings] = useState(group.people.length);
  return <div className="recipe-detail-backdrop" role="dialog" aria-modal="true" aria-label={recipe.name}>
    <div className="recipe-detail-sheet">
      <div className="recipe-detail-hero" style={{ background: recipe.image }}>
        <button className="recipe-back" onClick={onClose} aria-label="Close recipe"><ArrowLeft size={20}/></button>
        <span className="recipe-detail-tag">{recipe.meal}</span>
      </div>
      <div className="recipe-detail-content">
        <span className="eyebrow">{group.name.toUpperCase()}</span>
        <h1>{recipe.name}</h1>
        <p className="recipe-detail-description">{recipe.description}</p>
        <div className="recipe-detail-stats">
          <span><Clock3 size={18}/><strong>{recipe.minutes}</strong><small>minutes</small></span>
          <span><Flame size={18}/><strong>{recipe.calories}</strong><small>calories</small></span>
          <span><Sparkles size={18}/><strong>{recipe.protein}g</strong><small>protein</small></span>
          <span><WalletCards size={18}/><strong>${(recipe.cost * servings).toFixed(2)}</strong><small>estimated</small></span>
        </div>
        <div className="recipe-serving-bar"><div><small>SERVINGS</small><strong>{servings} people</strong></div><div><button onClick={() => setServings((value) => Math.max(1, value - 1))}>−</button><span>{servings}</span><button onClick={() => setServings((value) => value + 1)}>+</button></div></div>
        <section className="recipe-detail-section"><h2>Ingredients</h2><div className="ingredient-list">{recipe.ingredients.map((ingredient) => <div key={`${ingredient.category}-${ingredient.name}`}><span className="ingredient-dot"/><div><strong>{ingredient.name}</strong><small>{ingredient.quantity} · scaled for {servings}</small></div></div>)}</div></section>
        <section className="recipe-detail-section"><h2>Instructions</h2><ol className="instruction-list">{recipe.instructions.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol></section>
      </div>
      <div className="recipe-detail-actions"><button className="secondary secondary-outline" onClick={onClose}>Close</button><button className="primary recipe-add-button" onClick={onAdd}>Add to next open day</button></div>
    </div>
  </div>;
}

function GroceriesView({ group, items, checked, setChecked, plannedCost }: { group: PlanningGroup; items: { name: string; category: string; details: string[] }[]; checked: Record<string, boolean>; setChecked: React.Dispatch<React.SetStateAction<Record<string, boolean>>>; plannedCost: number }) {
  const categories = Array.from(new Set(items.map((item) => item.category)));
  return <section className="content"><div className="page-title"><div><span className="eyebrow">GROCERY LIST</span><h1>Everything you need for {group.name}.</h1><p>Check off what you already have before shopping.</p></div><div className="budget-chip"><ShoppingBasket size={18}/><span><small>Estimated</small><strong>${plannedCost.toFixed(2)}</strong></span></div></div>{!items.length ? <div className="empty-state"><ShoppingBasket size={38}/><h2>Your list is waiting.</h2><p>Add meals to the weekly planner and the ingredients will appear here automatically.</p></div> : <div className="grocery-layout"><div className="grocery-list">{categories.map((category) => <section key={category}><h3>{category}</h3>{items.filter((item) => item.category === category).map((item) => { const key = `${group.id}-${item.category}-${item.name}`; return <div className={`grocery-row ${checked[key] ? "done" : ""}`} key={key}><button className="check-button" onClick={() => setChecked((current) => ({ ...current, [key]: !current[key] }))}>{checked[key] && <Check size={16}/>}</button><div><strong>{item.name}</strong><small>{item.details.join(" · ")}</small></div><a target="_blank" rel="noreferrer" href={`https://www.walmart.com/search?q=${encodeURIComponent(item.name)}`}>Find at Walmart</a></div>; })}</section>)}</div><aside className="grocery-summary"><ListChecks size={24}/><h3>Before you shop</h3><p>Mark items you already have. Your Walmart links open searches in the Walmart site or app, where you can add the exact product to your signed-in cart.</p><div><span>{items.filter((item) => !checked[`${group.id}-${item.category}-${item.name}`]).length}</span><small>items left</small></div></aside></div>}</section>;
}

function RecipePicker({ day, group, onClose, onSelect, onView }: { day: string; group: PlanningGroup; onClose: () => void; onSelect: (recipe: Recipe) => void; onView: (recipe: Recipe) => void }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={(e) => e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">CHOOSE A MEAL</span><h2>{day} dinner</h2><p>Prices shown for {group.people.length} servings.</p></div><button className="icon-button" onClick={onClose}><X/></button></div><div className="picker-list">{recipes.filter((recipe) => recipe.meal === "Dinner").map((recipe) => <div className="picker-row" key={recipe.id}><button className="picker-view" onClick={() => onView(recipe)}><span className="picker-image" style={{ background: recipe.image }}/><div><strong>{recipe.name}</strong><small>{recipe.minutes} min · ${(recipe.cost * group.people.length).toFixed(2)} · {recipe.protein}g protein</small></div></button><button className="picker-add" onClick={() => onSelect(recipe)} aria-label={`Add ${recipe.name}`}>＋</button></div>)}</div></div></div>;
}
