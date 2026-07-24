export type Person = { id: string; name: string; initials: string };
export type PlanningGroup = { id: string; name: string; subtitle: string; icon: string; people: Person[]; budget: number };
export type Recipe = {
  id: string; name: string; description: string; meal: "Breakfast" | "Lunch" | "Dinner";
  minutes: number; cost: number; calories: number; protein: number; image: string;
  ingredients: { name: string; quantity: string; category: string }[];
};

const people = {
  patricia: { id: "patricia", name: "Patricia", initials: "P" },
  alec: { id: "alec", name: "Alec", initials: "A" },
  andrea: { id: "andrea", name: "Andrea", initials: "An" },
  maria: { id: "maria", name: "Maria", initials: "M" },
  girl1: { id: "girl1", name: "Girl 1", initials: "G1" },
  girl2: { id: "girl2", name: "Girl 2", initials: "G2" },
  girl3: { id: "girl3", name: "Girl 3", initials: "G3" },
};

export const planningGroups: PlanningGroup[] = [
  {
    id: "patricias-house",
    name: "Patricia's House",
    subtitle: "You, Alec & your girls",
    icon: "⌂",
    people: [people.patricia, people.alec, people.andrea, people.maria],
    budget: 115,
  },
  {
    id: "our-home",
    name: "Our Home",
    subtitle: "You, Alec & the three girls",
    icon: "⌂",
    people: [people.patricia, people.alec, people.girl1, people.girl2, people.girl3],
    budget: 150,
  },
  {
    id: "everyone",
    name: "Everyone Together",
    subtitle: "All seven around the table",
    icon: "♥",
    people: Object.values(people),
    budget: 195,
  },
];

export const recipes: Recipe[] = [
  {
    id: "sheet-pan-chicken",
    name: "Sheet Pan Chicken & Vegetables",
    description: "Tender seasoned chicken with roasted potatoes and colorful vegetables.",
    meal: "Dinner", minutes: 40, cost: 3.15, calories: 510, protein: 39,
    image: "linear-gradient(135deg,#d69b66,#f3d5b5 55%,#7f8d58)",
    ingredients: [
      { name: "Chicken thighs", quantity: "1 per person", category: "Meat" },
      { name: "Baby potatoes", quantity: "5 oz per person", category: "Produce" },
      { name: "Broccoli", quantity: "1 cup per 2 people", category: "Produce" },
      { name: "Olive oil", quantity: "1 tbsp per 2 people", category: "Pantry" },
    ],
  },
  {
    id: "taco-bowls",
    name: "Easy Taco Bowls",
    description: "Budget-friendly beef, rice, beans and fresh toppings in one bowl.",
    meal: "Dinner", minutes: 30, cost: 2.75, calories: 620, protein: 34,
    image: "linear-gradient(135deg,#c87045,#f0c77d 48%,#6d8652)",
    ingredients: [
      { name: "Ground beef", quantity: "4 oz per person", category: "Meat" },
      { name: "Rice", quantity: "1/3 cup dry per person", category: "Pantry" },
      { name: "Black beans", quantity: "1 can per 4 people", category: "Pantry" },
      { name: "Shredded cheese", quantity: "1/4 cup per person", category: "Dairy" },
      { name: "Salsa", quantity: "2 tbsp per person", category: "Pantry" },
    ],
  },
  {
    id: "creamy-pasta",
    name: "Creamy Garlic Chicken Pasta",
    description: "A cozy weeknight pasta with spinach and a light garlic cream sauce.",
    meal: "Dinner", minutes: 35, cost: 3.45, calories: 690, protein: 43,
    image: "linear-gradient(135deg,#e6c58e,#f8ead4 55%,#657b55)",
    ingredients: [
      { name: "Chicken breast", quantity: "4 oz per person", category: "Meat" },
      { name: "Pasta", quantity: "3 oz dry per person", category: "Pantry" },
      { name: "Spinach", quantity: "1 cup per 2 people", category: "Produce" },
      { name: "Heavy cream", quantity: "1/4 cup per 2 people", category: "Dairy" },
      { name: "Parmesan", quantity: "2 tbsp per person", category: "Dairy" },
    ],
  },
  {
    id: "breakfast-burritos",
    name: "Freezer-Friendly Breakfast Burritos",
    description: "Eggs, potatoes and cheese wrapped for quick school mornings.",
    meal: "Breakfast", minutes: 25, cost: 1.65, calories: 430, protein: 22,
    image: "linear-gradient(135deg,#df9b4c,#f6d79f 52%,#b55535)",
    ingredients: [
      { name: "Eggs", quantity: "2 per person", category: "Dairy" },
      { name: "Flour tortillas", quantity: "1 per person", category: "Bakery" },
      { name: "Frozen potatoes", quantity: "1/2 cup per person", category: "Frozen" },
      { name: "Shredded cheese", quantity: "1/4 cup per person", category: "Dairy" },
    ],
  },
  {
    id: "turkey-sandwiches",
    name: "Turkey Ranch Wraps",
    description: "Fast lunch wraps with turkey, crunchy lettuce and ranch.",
    meal: "Lunch", minutes: 10, cost: 2.20, calories: 390, protein: 25,
    image: "linear-gradient(135deg,#b98659,#e8d6b4 50%,#7f945d)",
    ingredients: [
      { name: "Deli turkey", quantity: "3 oz per person", category: "Meat" },
      { name: "Flour tortillas", quantity: "1 per person", category: "Bakery" },
      { name: "Lettuce", quantity: "1 cup per 2 people", category: "Produce" },
      { name: "Ranch dressing", quantity: "1 tbsp per person", category: "Pantry" },
    ],
  },
  {
    id: "bbq-chicken",
    name: "Slow Cooker BBQ Chicken",
    description: "Set-it-and-forget-it shredded chicken with simple sides.",
    meal: "Dinner", minutes: 15, cost: 2.95, calories: 540, protein: 41,
    image: "linear-gradient(135deg,#8c4934,#d89362 53%,#f0d6aa)",
    ingredients: [
      { name: "Chicken breast", quantity: "5 oz per person", category: "Meat" },
      { name: "BBQ sauce", quantity: "1/4 cup per person", category: "Pantry" },
      { name: "Burger buns", quantity: "1 per person", category: "Bakery" },
      { name: "Coleslaw mix", quantity: "1/2 cup per person", category: "Produce" },
    ],
  },
];

export const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
