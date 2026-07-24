
"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Check, ChevronDown, Clock3, Flame, Heart, Home, Leaf, ListChecks, Recycle, Search, ShoppingBasket, Sparkles, Users, WalletCards, X } from "lucide-react";
import { days, planningGroups, recipes, type Ingredient, type MealType, type PlanningGroup, type Recipe } from "@/lib/data";

type Tab = "home" | "plan" | "recipes" | "groceries";
type MealSlot = { recipeId: string; servings: number };
type PlanState = Record<string, Record<string, MealSlot | undefined>>;
type GroceryItem = {
  name: string;
  category: Ingredient["category"];
  pantry: boolean;
  unit: Ingredient["unit"];
  amount: number;
  recipes: string[];
  packageAmount?: number;
  packageLabel?: string;
  shelfLifeDays?: number;
  healthySwap?: Ingredient["healthySwap"];
};

type LeftoverIngredient = GroceryItem & {
  family: string;
  purchaseAmount: number;
  leftoverAmount: number;
};

type LeftoverSuggestion = {
  recipe: Recipe;
  matches: LeftoverIngredient[];
  score: number;
};

const storageKey = "around-the-table-v2";
const mealFilters: Array<"All" | MealType> = ["All", "Breakfast", "Lunch", "Dinner"];

function Logo({ compact = false }: { compact?: boolean }) {
  return <div className={`brand ${compact ? "compact" : ""}`}><img src="/favicon.svg" alt="" /><div><strong>Around the Table</strong>{!compact && <span>Plan less. Gather more.</span>}</div></div>;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(value < 1 ? 2 : 1).replace(/\.0$/, "");
}

function displayQuantity(amount: number, unit: Ingredient["unit"]) {
  if (unit === "oz" && amount >= 16) return `${formatNumber(amount / 16)} lb`;
  if (unit === "tsp" && amount >= 48) return `${formatNumber(amount / 48)} cup`;
  if (unit === "tsp" && amount >= 3) return `${formatNumber(amount / 3)} tbsp`;
  if (unit === "tbsp" && amount >= 16) return `${formatNumber(amount / 16)} cup`;
  const label = unit === "each" ? (amount === 1 ? "item" : "items") : unit;
  return `${formatNumber(amount)} ${label}`;
}

function ingredientFamily(name: string) {
  const value = name.toLowerCase();
  if (value.includes("tortilla")) return "tortillas";
  if (value === "sour cream") return "sour cream";
  if (value.includes("plain greek yogurt")) return "plain greek yogurt";
  if (value.includes("shredded cheese") || value.includes("shredded cheddar") || value.includes("shredded swiss")) return "shredded cheese";
  if (value.includes("lettuce") || value === "mixed greens") return "lettuce";
  if (value.includes("spinach")) return "spinach";
  if (value.includes("onion")) return "onion";
  if (value.includes("bell pepper") || value.includes("poblano pepper")) return "peppers";
  if (value === "tomato" || value === "cherry tomatoes") return "tomatoes";
  if (value === "carrot") return "carrots";
  if (value === "celery") return "celery";
  if (value === "zucchini") return "zucchini";
  if (value === "mushrooms") return "mushrooms";
  if (value === "broccoli florets") return "broccoli";
  if (value === "coleslaw mix" || value === "shredded cabbage") return "cabbage";
  if (value === "whole-wheat pita") return "pita";
  if (value === "whole-grain bread") return "bread";
  if (value === "egg") return "eggs";
  if (value === "milk") return "milk";
  if (value === "half-and-half") return "half-and-half";
  return value;
}

function purchaseAmount(item: GroceryItem) {
  if (!item.packageAmount || item.packageAmount <= 0) return item.amount;
  return Math.ceil(item.amount / item.packageAmount) * item.packageAmount;
}

function suggestedPurchase(item: GroceryItem) {
  if (item.packageAmount && item.packageLabel) {
    const packages = Math.ceil(item.amount / item.packageAmount);
    return `${packages} × ${item.packageLabel}`;
  }
  if (item.unit === "oz") return `${Math.ceil(item.amount / 16)} lb package total`;
  if (item.unit === "lb") return `${Math.ceil(item.amount * 2) / 2} lb total`;
  if (item.unit === "can") return `${Math.ceil(item.amount)} ${Math.ceil(item.amount) === 1 ? "can" : "cans"}`;
  if (item.unit === "each" || item.unit === "slice" || item.unit === "clove") return `${Math.ceil(item.amount)} ${item.unit === "each" ? "items" : item.unit + "s"}`;
  return displayQuantity(item.amount, item.unit);
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
    const map = new Map<string, GroceryItem>();
    selectedMeals.forEach((slot) => {
      const recipe = recipes.find((item) => item.id === slot.recipeId);
      recipe?.ingredients.forEach((ingredient) => {
        const key = `${ingredient.name.toLowerCase()}|${ingredient.unit}`;
        const current = map.get(key) ?? {
          name: ingredient.name,
          category: ingredient.category,
          pantry: Boolean(ingredient.pantry),
          unit: ingredient.unit,
          amount: 0,
          recipes: [],
          packageAmount: ingredient.packageAmount,
          packageLabel: ingredient.packageLabel,
          shelfLifeDays: ingredient.shelfLifeDays,
          healthySwap: ingredient.healthySwap,
        };
        current.amount += ingredient.amount * slot.servings;
        if (!current.recipes.includes(recipe.name)) current.recipes.push(recipe.name);
        map.set(key, current);
      });
    });
    return Array.from(map.values()).sort((a, b) => Number(a.pantry) - Number(b.pantry) || a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  }, [selectedMeals]);

  const leftoverIngredients = useMemo<LeftoverIngredient[]>(() => {
    return groceryItems
      .filter((item) => !item.pantry && item.packageAmount && item.packageLabel && (item.shelfLifeDays ?? 999) <= 14)
      .map((item) => {
        const totalPurchased = purchaseAmount(item);
        return {
          ...item,
          family: ingredientFamily(item.name),
          purchaseAmount: totalPurchased,
          leftoverAmount: Math.max(0, totalPurchased - item.amount),
        };
      })
      .filter((item) => item.leftoverAmount >= Math.max(0.1, (item.packageAmount ?? 1) * 0.1))
      .sort((a, b) => (a.shelfLifeDays ?? 99) - (b.shelfLifeDays ?? 99) || b.leftoverAmount - a.leftoverAmount);
  }, [groceryItems]);

  const leftoverSuggestions = useMemo<LeftoverSuggestion[]>(() => {
    const plannedRecipeIds = new Set(selectedMeals.map((slot) => slot.recipeId));
    const leftoverByFamily = new Map(leftoverIngredients.map((item) => [item.family, item]));

    const ranked = recipes
      .filter((recipe) => !plannedRecipeIds.has(recipe.id))
      .map((recipe) => {
        const matchedFamilies = new Set<string>();
        const matches: LeftoverIngredient[] = [];

        recipe.ingredients.forEach((ingredient) => {
          const family = ingredientFamily(ingredient.name);
          const leftover = leftoverByFamily.get(family);
          if (leftover && !matchedFamilies.has(family)) {
            matchedFamilies.add(family);
            matches.push(leftover);
          }
        });

        const score = matches.reduce((total, item) => {
          const packageShare = item.packageAmount ? item.leftoverAmount / item.packageAmount : 0;
          const urgency = Math.max(0, 15 - (item.shelfLifeDays ?? 15)) / 5;
          return total + 3 + packageShare * 4 + urgency;
        }, 0);

        return { recipe, matches, score };
      })
      .filter((item) => item.matches.length > 0)
      .sort((a, b) => b.matches.length - a.matches.length || b.score - a.score || a.recipe.minutes - b.recipe.minutes);

    const selected: LeftoverSuggestion[] = [];
    const seenFormats = new Set<string>();

    for (const item of ranked) {
      const words = item.recipe.name.split(" ");
      const format = `${item.recipe.meal}-${words.slice(-2).join(" ")}`;
      if (seenFormats.has(format)) continue;
      selected.push(item);
      seenFormats.add(format);
      if (selected.length === 6) break;
    }

    if (selected.length < 6) {
      for (const item of ranked) {
        if (selected.some((choice) => choice.recipe.id === item.recipe.id)) continue;
        selected.push(item);
        if (selected.length === 6) break;
      }
    }
    return selected;
  }, [leftoverIngredients, selectedMeals]);

  function addMeal(day: string, recipe: Recipe, servings = group.people.length) {
    setPlans((current) => ({
      ...current,
      [group.id]: { ...(current[group.id] ?? {}), [day]: { recipeId: recipe.id, servings } },
    }));
    setPickerDay(null);
    setSelectedRecipe(null);
  }

  function addToNextOpenDay(recipe: Recipe, servings = group.people.length) {
    addMeal(days.find((day) => !groupPlan[day]) ?? "Monday", recipe, servings);
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
        <div className="topbar"><GroupSwitcher group={group} onChange={setGroupId} /><button className="avatar">P</button></div>

        {tab === "home" && <HomeView group={group} plannedCost={plannedCost} plannedMeals={selectedMeals.length} onPlan={() => setTab("plan")} onGroceries={() => setTab("groceries")} onRecipes={() => setTab("recipes")} onGroup={setGroupId} />}
        {tab === "plan" && <PlanView group={group} groupPlan={groupPlan} plannedCost={plannedCost} onPick={setPickerDay} onRemove={removeMeal} onServings={updateServings} onView={setSelectedRecipe} />}
        {tab === "recipes" && <RecipesView query={query} setQuery={setQuery} group={group} onAdd={addToNextOpenDay} onView={setSelectedRecipe} />}
        {tab === "groceries" && <GroceriesView group={group} items={groceryItems} checked={checked} setChecked={setChecked} plannedCost={plannedCost} leftovers={leftoverIngredients} suggestions={leftoverSuggestions} onView={setSelectedRecipe} onAdd={addToNextOpenDay} />}
      </main>

      <nav className="bottom-nav">
        <NavButton active={tab === "home"} onClick={() => setTab("home")} icon={<Home size={20} />} label="Home" />
        <NavButton active={tab === "plan"} onClick={() => setTab("plan")} icon={<CalendarDays size={20} />} label="Plan" />
        <NavButton active={tab === "recipes"} onClick={() => setTab("recipes")} icon={<Heart size={20} />} label="Recipes" />
        <NavButton active={tab === "groceries"} onClick={() => setTab("groceries")} icon={<ShoppingBasket size={20} />} label="List" />
      </nav>

      {pickerDay && <RecipePicker day={pickerDay} group={group} onClose={() => setPickerDay(null)} onSelect={(recipe) => addMeal(pickerDay, recipe)} onView={setSelectedRecipe} />}
      {selectedRecipe && <RecipeDetails recipe={selectedRecipe} group={group} onClose={() => setSelectedRecipe(null)} onAdd={(servings) => addToNextOpenDay(selectedRecipe, servings)} />}
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button className={`nav-button ${active ? "active" : ""}`} onClick={onClick}>{icon}<span>{label}</span></button>;
}

function GroupSwitcher({ group, onChange }: { group: PlanningGroup; onChange: (id: string) => void }) {
  return <label className="group-switcher"><span>{group.icon}</span><div><small>Planning for</small><strong>{group.name}</strong></div><ChevronDown size={18} /><select value={group.id} onChange={(event) => onChange(event.target.value)}>{planningGroups.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>;
}

function HomeView({ group, plannedCost, plannedMeals, onPlan, onGroceries, onRecipes, onGroup }: { group: PlanningGroup; plannedCost: number; plannedMeals: number; onPlan: () => void; onGroceries: () => void; onRecipes: () => void; onGroup: (id: string) => void }) {
  return <section className="content home-view">
    <div className="hero"><div><span className="eyebrow">GOOD MORNING, PATRICIA</span><h1>Let’s make this week feel a little easier.</h1><p>Choose your family group, plan meals, and let the app calculate one combined Walmart list.</p><button className="primary" onClick={onPlan}>Plan this week <span>→</span></button></div><div className="hero-art"><div className="plate"><span>♥</span></div><div className="leaf leaf-one"/><div className="leaf leaf-two"/></div></div>
    <div className="section-heading"><div><span className="eyebrow">YOUR FAMILY</span><h2>Who are we planning for?</h2></div><p>Each group keeps its own meal plan, list and budget.</p></div>
    <div className="group-grid">{planningGroups.map((item) => <button key={item.id} className={`group-card ${item.id === group.id ? "selected" : ""}`} onClick={() => onGroup(item.id)}><span className="group-icon">{item.icon}</span><div><h3>{item.name}</h3><p>{item.subtitle}</p><div className="faces">{item.people.map((person) => <span key={person.id}>{person.initials}</span>)}<small>{item.people.length} people</small></div></div>{item.id === group.id && <span className="selected-mark"><Check size={15}/></span>}</button>)}</div>
    <div className="stats-grid">
      <button className="stat-card" onClick={onPlan}><span className="soft-icon"><CalendarDays /></span><div><small>MEALS PLANNED</small><strong>{plannedMeals} <em>of 7</em></strong><p>Plan one dinner or the whole week.</p></div></button>
      <button className="stat-card" onClick={onGroceries}><span className="soft-icon"><ShoppingBasket /></span><div><small>ESTIMATED GROCERIES</small><strong>${plannedCost.toFixed(0)} <em>of ${group.budget}</em></strong><p>Combined from every planned recipe.</p></div></button>
      <button className="stat-card" onClick={onRecipes}><span className="soft-icon"><Users /></span><div><small>RECIPE LIBRARY</small><strong>{recipes.length} <em>recipes</em></strong><p>Breakfasts, lunches and dinners.</p></div></button>
    </div>
  </section>;
}

function PlanView({ group, groupPlan, plannedCost, onPick, onRemove, onServings, onView }: { group: PlanningGroup; groupPlan: Record<string, MealSlot | undefined>; plannedCost: number; onPick: (day: string) => void; onRemove: (day: string) => void; onServings: (day: string, servings: number) => void; onView: (recipe: Recipe) => void }) {
  return <section className="content"><div className="page-title"><div><span className="eyebrow">WEEKLY PLANNER</span><h1>What are we eating this week?</h1><p>{group.name} · Defaulting to {group.people.length} servings</p></div><div className="budget-chip"><WalletCards size={18}/><span><small>Estimated</small><strong>${plannedCost.toFixed(2)}</strong></span></div></div>
    <div className="week-grid">{days.map((day) => { const slot = groupPlan[day]; const recipe = recipes.find((item) => item.id === slot?.recipeId); return <article className={`day-card ${recipe ? "filled" : ""}`} key={day}><div className="day-head"><div><strong>{day}</strong></div>{recipe && <button className="icon-button" onClick={() => onRemove(day)}><X size={16}/></button>}</div>{recipe && slot ? <><button className="meal-photo meal-photo-button" style={{ background: recipe.image }} onClick={() => onView(recipe)}><span>{recipe.meal}</span></button><div className="meal-body"><h3>{recipe.name}</h3><div className="meal-meta"><span><Clock3 size={14}/>{recipe.minutes} min</span><span>${(recipe.cost * slot.servings).toFixed(2)}</span></div><div className="serving-control"><span>Servings</span><button onClick={() => onServings(day, slot.servings - 1)}>−</button><strong>{slot.servings}</strong><button onClick={() => onServings(day, slot.servings + 1)}>+</button></div><button className="text-button" onClick={() => onView(recipe)}>View recipe</button><button className="text-button" onClick={() => onPick(day)}>Change</button></div></> : <button className="empty-meal" onClick={() => onPick(day)}><span>＋</span><strong>Add meal</strong><small>Choose from {recipes.length} detailed recipes</small></button>}</article>; })}</div>
  </section>;
}

function RecipesView({ query, setQuery, group, onAdd, onView }: { query: string; setQuery: (value: string) => void; group: PlanningGroup; onAdd: (recipe: Recipe) => void; onView: (recipe: Recipe) => void }) {
  const [meal, setMeal] = useState<"All" | MealType>("All");
  const [visible, setVisible] = useState(24);
  useEffect(() => setVisible(24), [query, meal]);
  const filtered = recipes.filter((recipe) => {
    const matchesMeal = meal === "All" || recipe.meal === meal;
    const haystack = `${recipe.name} ${recipe.description} ${recipe.ingredients.map((item) => `${item.name} ${item.healthySwap?.name ?? ""}`).join(" ")}`.toLowerCase();
    return matchesMeal && haystack.includes(query.toLowerCase());
  });
  return <section className="content"><div className="page-title"><div><span className="eyebrow">RECIPE LIBRARY</span><h1>{recipes.length} detailed family recipes.</h1><p>Every recipe includes seasonings, sauces, exact per-person quantities and complete instructions.</p></div></div>
    <div className="recipe-toolbar"><label className="search-box"><Search size={19}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search chicken, garlic, pasta…" /></label><div className="meal-filters">{mealFilters.map((option) => <button key={option} className={`filter-chip ${meal === option ? "active" : ""}`} onClick={() => setMeal(option)}>{option}<span>{option === "All" ? recipes.length : recipes.filter((r) => r.meal === option).length}</span></button>)}</div></div>
    <p className="recipe-count">Showing {Math.min(visible, filtered.length)} of {filtered.length} matching recipes</p>
    <div className="recipe-grid">{filtered.slice(0, visible).map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} servings={group.people.length} onAdd={() => onAdd(recipe)} onView={() => onView(recipe)} />)}</div>
    {visible < filtered.length && <div className="load-more-wrap"><button className="load-more" onClick={() => setVisible((value) => value + 24)}>Load 24 more recipes</button></div>}
  </section>;
}

function RecipeCard({ recipe, servings, onAdd, onView }: { recipe: Recipe; servings: number; onAdd: () => void; onView: () => void }) {
  return <article className="recipe-card"><button className="recipe-image recipe-image-button" style={{ background: recipe.image }} onClick={onView}><span>{recipe.meal}</span><span className="favorite-button"><Heart size={18}/></span></button><div className="recipe-body"><button className="recipe-title-button" onClick={onView}><h3>{recipe.name}</h3></button><p>{recipe.description}</p><div className="recipe-facts"><span><Clock3 size={15}/>{recipe.minutes} min</span><span>${(recipe.cost * servings).toFixed(2)}</span><span>{recipe.ingredients.length} ingredients</span></div><div className="recipe-actions"><button className="secondary secondary-outline" onClick={onView}>View recipe</button><button className="secondary" onClick={onAdd}>Add to plan</button></div></div></article>;
}

function RecipeDetails({ recipe, group, onClose, onAdd }: { recipe: Recipe; group: PlanningGroup; onClose: () => void; onAdd: (servings: number) => void }) {
  const [servings, setServings] = useState(group.people.length);
  const categories = Array.from(new Set(recipe.ingredients.map((item) => item.category)));
  const swapCount = recipe.ingredients.filter((item) => item.healthySwap).length;
  return <div className="recipe-detail-backdrop" role="dialog" aria-modal="true"><div className="recipe-detail-sheet">
    <div className="recipe-detail-hero" style={{ background: recipe.image }}><button className="recipe-back" onClick={onClose}><ArrowLeft size={20}/></button><span className="recipe-detail-tag">{recipe.meal}</span></div>
    <div className="recipe-detail-content"><span className="eyebrow">{group.name.toUpperCase()}</span><h1>{recipe.name}</h1><p className="recipe-detail-description">{recipe.description}</p>
      <div className="recipe-detail-stats"><span><Clock3 size={18}/><strong>{recipe.minutes}</strong><small>minutes</small></span><span><Flame size={18}/><strong>{recipe.calories}</strong><small>calories</small></span><span><Sparkles size={18}/><strong>{recipe.protein}g</strong><small>protein</small></span><span><WalletCards size={18}/><strong>${(recipe.cost * servings).toFixed(2)}</strong><small>estimated</small></span></div>
      <div className="recipe-serving-bar"><div><small>SERVINGS</small><strong>{servings} people</strong></div><div><button onClick={() => setServings((v) => Math.max(1, v - 1))}>−</button><span>{servings}</span><button onClick={() => setServings((v) => v + 1)}>+</button></div></div>
      <section className="recipe-detail-section"><div className="detail-heading"><div><h2>Ingredients</h2><p>Quantities below are calculated for {servings} servings. Healthy swaps are optional.</p></div><span>{swapCount ? `${swapCount} swaps` : `${recipe.ingredients.length} items`}</span></div>{categories.map((category) => <div className="ingredient-category" key={category}><h3>{category}</h3><div className="ingredient-list">{recipe.ingredients.filter((item) => item.category === category).map((ingredient) => <div key={`${ingredient.name}-${ingredient.unit}`}><span className="ingredient-dot"/><div><strong>{ingredient.name}</strong><small>{displayQuantity(ingredient.amount * servings, ingredient.unit)}{ingredient.pantry ? " · pantry staple" : ""}</small>{ingredient.healthySwap && <span className="healthy-swap"><Leaf size={15}/><span><b>Healthier option:</b> {ingredient.healthySwap.name}<small>{ingredient.healthySwap.note}</small></span></span>}</div></div>)}</div></div>)}</section>
      <section className="recipe-detail-section"><div className="detail-heading"><div><h2>Instructions</h2><p>Read through once before you begin.</p></div><span>{recipe.instructions.length} steps</span></div><ol className="instruction-list">{recipe.instructions.map((step, index) => <li key={`${index}-${step}`}><span>{index + 1}</span><p>{step}</p></li>)}</ol></section>
    </div>
    <div className="recipe-detail-actions"><button className="secondary secondary-outline" onClick={onClose}>Close</button><button className="primary recipe-add-button" onClick={() => onAdd(servings)}>Add {servings} servings</button></div>
  </div></div>;
}

function GroceriesView({ group, items, checked, setChecked, plannedCost, leftovers, suggestions, onView, onAdd }: { group: PlanningGroup; items: GroceryItem[]; checked: Record<string, boolean>; setChecked: React.Dispatch<React.SetStateAction<Record<string, boolean>>>; plannedCost: number; leftovers: LeftoverIngredient[]; suggestions: LeftoverSuggestion[]; onView: (recipe: Recipe) => void; onAdd: (recipe: Recipe) => void }) {
  const buyItems = items.filter((item) => !item.pantry);
  const pantryItems = items.filter((item) => item.pantry);
  const remaining = items.filter((item) => !checked[`${group.id}-${item.name}-${item.unit}`]).length;
  return <section className="content"><div className="page-title"><div><span className="eyebrow">CALCULATED GROCERY LIST</span><h1>Everything needed for the week.</h1><p>Duplicate ingredients are combined, servings are calculated, and likely package leftovers become recipe suggestions.</p></div><div className="budget-chip"><ShoppingBasket size={18}/><span><small>Estimated meals</small><strong>${plannedCost.toFixed(2)}</strong></span></div></div>
    {!items.length ? <div className="empty-state"><ShoppingBasket size={38}/><h2>Your list is waiting.</h2><p>Add meals to the weekly planner and the exact combined ingredients will appear here.</p></div> :
    <>
      <div className="grocery-layout"><div className="grocery-list grocery-list-calculated"><CalculatedSection title="Buy at Walmart" subtitle="Fresh food, meat, dairy, bakery and packaged ingredients." items={buyItems} group={group} checked={checked} setChecked={setChecked} /><CalculatedSection title="Check your pantry" subtitle="Seasonings, oils and staples—mark the ones you already have." items={pantryItems} group={group} checked={checked} setChecked={setChecked} /></div>
        <aside className="grocery-summary"><ListChecks size={24}/><h3>Weekly total</h3><p>Calculated from all recipes currently on {group.name}’s weekly plan.</p><div><span>{remaining}</span><small>items left</small></div><div className="summary-breakdown"><p><strong>{buyItems.length}</strong> Walmart items</p><p><strong>{pantryItems.length}</strong> pantry checks</p><p><strong>{leftovers.length}</strong> likely leftovers</p></div></aside>
      </div>
      <LeftoverSuggestions leftovers={leftovers} suggestions={suggestions} servings={group.people.length} onView={onView} onAdd={onAdd} />
    </>}
  </section>;
}

function CalculatedSection({ title, subtitle, items, group, checked, setChecked }: { title: string; subtitle: string; items: GroceryItem[]; group: PlanningGroup; checked: Record<string, boolean>; setChecked: React.Dispatch<React.SetStateAction<Record<string, boolean>>> }) {
  const categories = Array.from(new Set(items.map((item) => item.category)));
  return <section className="calculated-section"><div className="grocery-section-heading"><div><h2>{title}</h2><p>{subtitle}</p></div><span>{items.length}</span></div>{categories.map((category) => <div className="grocery-category" key={category}><h3>{category}</h3>{items.filter((item) => item.category === category).map((item) => { const key = `${group.id}-${item.name}-${item.unit}`; const search = `${item.name} ${suggestedPurchase(item)}`; const extra = item.packageAmount ? purchaseAmount(item) - item.amount : 0; return <div className={`grocery-row grocery-row-calculated ${checked[key] ? "done" : ""}`} key={key}><button className="check-button" onClick={() => setChecked((current) => ({ ...current, [key]: !current[key] }))}>{checked[key] && <Check size={16}/>}</button><div className="grocery-item-copy"><strong>{item.name}</strong><span className="grocery-total">{displayQuantity(item.amount, item.unit)} needed</span><small>Suggested purchase: {suggestedPurchase(item)}</small>{extra > 0.09 && (item.shelfLifeDays ?? 999) <= 14 && <small className="leftover-note">Likely extra: {displayQuantity(extra, item.unit)} · use within about {item.shelfLifeDays} days</small>}<small className="recipe-sources">Used in: {item.recipes.join(", ")}</small>{item.healthySwap && <small className="healthy-grocery-swap"><Leaf size={13}/> Healthier option: {item.healthySwap.name}</small>}</div><a target="_blank" rel="noreferrer" href={`https://www.walmart.com/search?q=${encodeURIComponent(search)}`}>Find at Walmart</a></div>; })}</div>)}</section>;
}

function LeftoverSuggestions({ leftovers, suggestions, servings, onView, onAdd }: { leftovers: LeftoverIngredient[]; suggestions: LeftoverSuggestion[]; servings: number; onView: (recipe: Recipe) => void; onAdd: (recipe: Recipe) => void }) {
  if (!leftovers.length || !suggestions.length) return null;
  return <section className="leftover-section">
    <div className="leftover-heading"><span className="leftover-icon"><Recycle size={22}/></span><div><span className="eyebrow">USE IT BEFORE IT GOES BAD</span><h2>Meals that use what you’ll probably have left.</h2><p>These suggestions compare the amount your plan needs with common package sizes. Actual Walmart package sizes may vary.</p></div></div>
    <div className="leftover-chips">{leftovers.slice(0, 8).map((item) => <span key={`${item.family}-${item.unit}`}><strong>{displayQuantity(item.leftoverAmount, item.unit)}</strong> {item.name}<small>about {item.shelfLifeDays} days</small></span>)}</div>
    <div className="leftover-recipe-grid">{suggestions.map(({ recipe, matches }) => <article className="leftover-recipe-card" key={recipe.id}><button className="leftover-recipe-image" style={{ background: recipe.image }} onClick={() => onView(recipe)}><span>{recipe.meal}</span></button><div><span className="reuse-label">USES {matches.length} LEFTOVER {matches.length === 1 ? "ITEM" : "ITEMS"}</span><h3>{recipe.name}</h3><p>{matches.map((item) => item.name).join(" · ")}</p><small>{recipe.minutes} min · ${(recipe.cost * servings).toFixed(2)} for {servings}</small><div className="leftover-actions"><button className="secondary secondary-outline" onClick={() => onView(recipe)}>View</button><button className="secondary" onClick={() => onAdd(recipe)}>Add to plan</button></div></div></article>)}</div>
  </section>;
}

function RecipePicker({ day, group, onClose, onSelect, onView }: { day: string; group: PlanningGroup; onClose: () => void; onSelect: (recipe: Recipe) => void; onView: (recipe: Recipe) => void }) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(30);
  const filtered = recipes.filter((recipe) => `${recipe.name} ${recipe.ingredients.map((item) => `${item.name} ${item.healthySwap?.name ?? ""}`).join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal picker-modal" onMouseDown={(e) => e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">CHOOSE A MEAL</span><h2>{day}</h2><p>{recipes.length} recipes · prices shown for {group.people.length} servings</p></div><button className="icon-button" onClick={onClose}><X/></button></div><label className="search-box picker-search"><Search size={18}/><input value={query} onChange={(e) => { setQuery(e.target.value); setVisible(30); }} placeholder="Search meals or ingredients…" /></label><div className="picker-list">{filtered.slice(0, visible).map((recipe) => <div className="picker-row" key={recipe.id}><button className="picker-view" onClick={() => onView(recipe)}><span className="picker-image" style={{ background: recipe.image }}/><div><strong>{recipe.name}</strong><small>{recipe.meal} · {recipe.minutes} min · ${(recipe.cost * group.people.length).toFixed(2)}</small></div></button><button className="picker-add" onClick={() => onSelect(recipe)}>＋</button></div>)}</div>{visible < filtered.length && <button className="load-more picker-load-more" onClick={() => setVisible((v) => v + 30)}>Load more</button>}</div></div>;
}
