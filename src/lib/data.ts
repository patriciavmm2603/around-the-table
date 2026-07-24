
export type Person = { id: string; name: string; initials: string };
export type PlanningGroup = { id: string; name: string; subtitle: string; icon: string; people: Person[]; budget: number };
export type MealType = "Breakfast" | "Lunch" | "Dinner";
export type HealthySwap = {
  name: string;
  note: string;
};

export type Ingredient = {
  name: string;
  amount: number;
  unit: "each" | "oz" | "lb" | "cup" | "tbsp" | "tsp" | "clove" | "can" | "slice";
  category: "Meat" | "Seafood" | "Produce" | "Dairy" | "Bakery" | "Frozen" | "Pantry";
  pantry?: boolean;
  packageAmount?: number;
  packageLabel?: string;
  shelfLifeDays?: number;
  healthySwap?: HealthySwap;
};
export type Recipe = {
  id: string;
  name: string;
  description: string;
  meal: MealType;
  minutes: number;
  cost: number;
  calories: number;
  protein: number;
  image: string;
  ingredients: Ingredient[];
  instructions: string[];
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
  { id: "patricias-house", name: "Patricia's House", subtitle: "You, Alec & your girls", icon: "⌂", people: [people.patricia, people.alec, people.andrea, people.maria], budget: 115 },
  { id: "our-home", name: "Our Home", subtitle: "You, Alec & the three girls", icon: "⌂", people: [people.patricia, people.alec, people.girl1, people.girl2, people.girl3], budget: 150 },
  { id: "everyone", name: "Everyone Together", subtitle: "All seven around the table", icon: "♥", people: Object.values(people), budget: 195 },
];

const I = (name: string, amount: number, unit: Ingredient["unit"], category: Ingredient["category"], pantry = false): Ingredient =>
  ({ name, amount, unit, category, pantry });

function packageGuidance(ingredient: Ingredient): Pick<Ingredient, "packageAmount" | "packageLabel" | "shelfLifeDays"> {
  const name = ingredient.name.toLowerCase();
  const unit = ingredient.unit;

  if (name.includes("tortilla") && unit === "each") return { packageAmount: 10, packageLabel: "10-count package", shelfLifeDays: 10 };
  if (name === "sour cream" && unit === "tbsp") return { packageAmount: 32, packageLabel: "16 oz tub", shelfLifeDays: 10 };
  if (name.includes("plain greek yogurt")) {
    if (unit === "cup") return { packageAmount: 4, packageLabel: "32 oz tub", shelfLifeDays: 10 };
    if (unit === "tbsp") return { packageAmount: 32, packageLabel: "16 oz tub", shelfLifeDays: 10 };
  }
  if ((name.includes("shredded cheese") || name.includes("shredded cheddar") || name.includes("shredded swiss")) && unit === "cup") return { packageAmount: 2, packageLabel: "8 oz bag", shelfLifeDays: 14 };
  if ((name.includes("shredded cheese") || name.includes("shredded cheddar") || name.includes("shredded swiss")) && unit === "tbsp") return { packageAmount: 32, packageLabel: "8 oz bag", shelfLifeDays: 14 };
  if ((name.includes("lettuce") || name === "mixed greens") && unit === "cup") return { packageAmount: 6, packageLabel: "1 head or large bag", shelfLifeDays: 6 };
  if (name.includes("spinach") && unit === "cup") return { packageAmount: 5, packageLabel: "5 oz bag", shelfLifeDays: 5 };
  if (name === "celery" && unit === "each") return { packageAmount: 8, packageLabel: "1 bunch", shelfLifeDays: 12 };
  if (name === "carrot" && unit === "each") return { packageAmount: 8, packageLabel: "1 lb bag", shelfLifeDays: 18 };
  if ((name.includes("bell pepper") || name.includes("poblano pepper")) && unit === "each") return { packageAmount: 3, packageLabel: "3-count pack", shelfLifeDays: 8 };
  if (name.includes("onion") && unit === "each") return { packageAmount: 3, packageLabel: "3 lb bag or 3-count pack", shelfLifeDays: 21 };
  if (name === "zucchini" && unit === "each") return { packageAmount: 3, packageLabel: "3-count pack", shelfLifeDays: 6 };
  if (name === "avocado" && unit === "each") return { packageAmount: 4, packageLabel: "4-count bag", shelfLifeDays: 5 };
  if (name === "tomato" && unit === "each") return { packageAmount: 4, packageLabel: "4-count pack", shelfLifeDays: 6 };
  if (name === "cherry tomatoes" && unit === "cup") return { packageAmount: 2, packageLabel: "1 pint", shelfLifeDays: 7 };
  if (name === "mushrooms" && unit === "cup") return { packageAmount: 4, packageLabel: "8 oz package", shelfLifeDays: 5 };
  if (name === "broccoli florets" && unit === "cup") return { packageAmount: 4, packageLabel: "12 oz bag or 1 large crown", shelfLifeDays: 6 };
  if (name === "green beans" && unit === "cup") return { packageAmount: 4, packageLabel: "12 oz bag", shelfLifeDays: 7 };
  if ((name === "coleslaw mix" || name === "shredded cabbage") && unit === "cup") return { packageAmount: 4, packageLabel: "14 oz bag", shelfLifeDays: 7 };
  if (name === "whole-wheat pita" && unit === "each") return { packageAmount: 6, packageLabel: "6-count package", shelfLifeDays: 7 };
  if (name === "whole-grain bread" && unit === "slice") return { packageAmount: 20, packageLabel: "1 loaf", shelfLifeDays: 7 };
  if (name === "egg" && unit === "each") return { packageAmount: 12, packageLabel: "1 dozen", shelfLifeDays: 28 };
  if (name === "milk" && unit === "cup") return { packageAmount: 8, packageLabel: "1/2 gallon", shelfLifeDays: 10 };
  if (name === "half-and-half" && unit === "cup") return { packageAmount: 2, packageLabel: "1 pint", shelfLifeDays: 7 };
  return {};
}

function healthySwapFor(ingredient: Ingredient): Ingredient["healthySwap"] {
  const name = ingredient.name.toLowerCase();

  if (name.includes("tortilla")) return { name: "Whole-wheat or high-fiber tortillas", note: "Adds fiber and can be more filling." };
  if (name === "sour cream") return { name: "Plain Greek yogurt", note: "Similar tang with more protein and less saturated fat." };
  if (name.includes("mayonnaise")) return { name: "Plain Greek yogurt or mashed avocado", note: "Keeps the filling creamy with more protein or unsaturated fat." };
  if (name.includes("chicken thighs")) return { name: "Boneless skinless chicken breast", note: "A leaner protein option." };
  if (name.includes("ground beef") || name.includes("taco beef")) return { name: "93% lean ground turkey or extra-lean beef", note: "Reduces saturated fat while keeping the recipe family-friendly." };
  if (name.includes("italian sausage") || name.includes("breakfast sausage")) return { name: "Chicken or turkey sausage", note: "Usually lower in saturated fat; compare sodium labels." };
  if (name.includes("turkey bacon")) return { name: "Lower-sodium turkey bacon or Canadian bacon", note: "Can reduce sodium and saturated fat." };
  if (name.includes("pork chops") || name.includes("pork loin")) return { name: "Pork tenderloin or chicken breast", note: "Choose a lean cut and trim visible fat." };
  if (name === "butter") return { name: "Olive oil or avocado oil", note: "Provides more unsaturated fat for most cooking methods." };
  if (name === "half-and-half") return { name: "Evaporated low-fat milk", note: "Keeps sauces creamy with less saturated fat." };
  if (name === "milk") return { name: "1% milk or unsweetened fortified milk", note: "A lighter option; choose one with protein and calcium." };
  if (name.includes("shredded cheese") || name.includes("shredded cheddar") || name.includes("swiss cheese") || name.includes("parmesan") || name.includes("feta")) return { name: "Reduced-fat cheese or 25% less cheese", note: "Keeps the flavor while reducing saturated fat and sodium." };
  if (name === "short pasta" || name.includes("small pasta")) return { name: "Whole-wheat or chickpea pasta", note: "Adds fiber; chickpea pasta also adds protein." };
  if (name.includes("rice") && !name.includes("brown")) return { name: "Brown rice, quinoa or cauliflower rice", note: "Adds fiber or lowers the refined-grain portion." };
  if (name === "all-purpose flour") return { name: "Whole-wheat pastry flour", note: "Adds fiber while staying tender in pancakes and baked breakfasts." };
  if (name === "ranch dressing" || name === "caesar dressing") return { name: "Greek-yogurt-based dressing", note: "Can reduce saturated fat while keeping a creamy texture." };
  if (name === "bbq sauce") return { name: "Lower-sugar BBQ sauce", note: "Reduces added sugar; compare labels." };
  if (name === "low-sodium soy sauce") return { name: "Reduced-sodium tamari or coconut aminos", note: "Provides a similar savory flavor; sodium still varies by brand." };
  if (name === "brown sugar" || name === "honey" || name === "maple syrup") return { name: "Use 25% less or sweeten partly with mashed fruit", note: "Reduces added sugar without removing sweetness completely." };
  if (name === "granola") return { name: "Lower-added-sugar granola or chopped nuts", note: "Can reduce sugar and add healthy fats." };
  if (name === "whole-grain croutons") return { name: "Roasted chickpeas", note: "Adds crunch, fiber and protein." };
  if (name === "frozen diced potatoes" || name === "russet potato") return { name: "Sweet potato or half potato, half vegetables", note: "Adds color, fiber and micronutrients." };
  if (name === "neutral oil") return { name: "Avocado or olive oil", note: "A heart-healthier unsaturated-fat option." };
  return undefined;
}

function enrichIngredient(ingredient: Ingredient): Ingredient {
  return {
    ...ingredient,
    ...packageGuidance(ingredient),
    healthySwap: healthySwapFor(ingredient),
  };
}

const palettes = [
  ["#d69b66", "#f3d5b5", "#7f8d58"], ["#c87045", "#f0c77d", "#6d8652"],
  ["#e6c58e", "#f8ead4", "#657b55"], ["#df9b4c", "#f6d79f", "#b55535"],
  ["#b98659", "#e8d6b4", "#7f945d"], ["#8c4934", "#d89362", "#f0d6aa"],
  ["#7f966d", "#d9d8b2", "#c88962"], ["#a85d4c", "#e8b989", "#6d7f61"],
];

const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const image = (index: number) => {
  const p = palettes[index % palettes.length];
  return `linear-gradient(135deg,${p[0]},${p[1]} 52%,${p[2]})`;
};

type Profile = {
  label: string;
  base: Ingredient[];
  seasonings: Ingredient[];
  sauce: Ingredient[];
  calories: number;
  protein: number;
  cost: number;
};

type Format = {
  label: string;
  meal: MealType;
  minutes: number;
  extras: Ingredient[];
  calories: number;
  protein: number;
  cost: number;
  description: string;
  instructions: string[];
};

const dinnerProfiles: Profile[] = [
  { label: "Lemon Herb Chicken", base: [I("Boneless chicken breast",5,"oz","Meat"),I("Broccoli florets",0.5,"cup","Produce"),I("Red onion",0.25,"each","Produce")], seasonings:[I("Garlic powder",0.25,"tsp","Pantry",true),I("Dried oregano",0.25,"tsp","Pantry",true),I("Salt",0.125,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true)], sauce:[I("Lemon juice",1,"tbsp","Produce"),I("Lemon zest",0.25,"tsp","Produce")], calories:220,protein:38,cost:2.2 },
  { label: "Garlic Parmesan Chicken", base:[I("Boneless chicken thighs",5,"oz","Meat"),I("Green beans",0.5,"cup","Produce"),I("Mushrooms",0.5,"cup","Produce")], seasonings:[I("Garlic powder",0.25,"tsp","Pantry",true),I("Italian seasoning",0.25,"tsp","Pantry",true),I("Salt",0.125,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true)], sauce:[I("Grated Parmesan",2,"tbsp","Dairy")], calories:250,protein:33,cost:2.35 },
  { label:"Smoky Paprika Chicken", base:[I("Boneless chicken thighs",5,"oz","Meat"),I("Bell pepper",0.5,"each","Produce"),I("Zucchini",0.5,"each","Produce")], seasonings:[I("Smoked paprika",0.5,"tsp","Pantry",true),I("Garlic powder",0.25,"tsp","Pantry",true),I("Onion powder",0.25,"tsp","Pantry",true),I("Salt",0.125,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true)], sauce:[I("Lime juice",1,"tbsp","Produce")], calories:260,protein:32,cost:2.25 },
  { label:"Honey Mustard Chicken", base:[I("Boneless chicken breast",5,"oz","Meat"),I("Carrot",1,"each","Produce"),I("Broccoli florets",0.5,"cup","Produce")], seasonings:[I("Garlic powder",0.25,"tsp","Pantry",true),I("Dried thyme",0.25,"tsp","Pantry",true),I("Salt",0.125,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true)], sauce:[I("Dijon mustard",1,"tbsp","Pantry"),I("Honey",2,"tsp","Pantry")], calories:230,protein:38,cost:2.35 },
  { label:"Teriyaki Chicken", base:[I("Boneless chicken breast",5,"oz","Meat"),I("Broccoli florets",0.5,"cup","Produce"),I("Carrot",1,"each","Produce")], seasonings:[I("Garlic",0.5,"clove","Produce"),I("Ground ginger",0.25,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true)], sauce:[I("Low-sodium soy sauce",1,"tbsp","Pantry"),I("Brown sugar",1,"tsp","Pantry",true),I("Rice vinegar",1,"tsp","Pantry")], calories:230,protein:37,cost:2.3 },
  { label:"Buffalo Ranch Chicken", base:[I("Boneless chicken breast",5,"oz","Meat"),I("Celery",1,"each","Produce"),I("Carrot",1,"each","Produce")], seasonings:[I("Garlic powder",0.25,"tsp","Pantry",true),I("Onion powder",0.25,"tsp","Pantry",true),I("Dried dill",0.25,"tsp","Pantry",true),I("Salt",0.125,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true)], sauce:[I("Buffalo sauce",2,"tbsp","Pantry"),I("Plain Greek yogurt",2,"tbsp","Dairy")], calories:225,protein:39,cost:2.35 },
  { label:"Cajun Turkey", base:[I("Lean ground turkey",5,"oz","Meat"),I("Bell pepper",0.5,"each","Produce"),I("Celery",1,"each","Produce")], seasonings:[I("Paprika",0.5,"tsp","Pantry",true),I("Garlic powder",0.25,"tsp","Pantry",true),I("Onion powder",0.25,"tsp","Pantry",true),I("Dried thyme",0.125,"tsp","Pantry",true),I("Cayenne pepper",0.0625,"tsp","Pantry",true),I("Salt",0.125,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true)], sauce:[I("Chicken broth",0.25,"cup","Pantry")], calories:240,protein:32,cost:2.15 },
  { label:"Italian Sausage", base:[I("Mild Italian sausage",1,"each","Meat"),I("Bell pepper",0.5,"each","Produce"),I("Yellow onion",0.25,"each","Produce")], seasonings:[I("Garlic",0.5,"clove","Produce"),I("Italian seasoning",0.25,"tsp","Pantry",true),I("Red pepper flakes",0.0625,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true)], sauce:[I("Crushed tomatoes",0.33,"cup","Pantry")], calories:310,protein:20,cost:2.4 },
  { label:"Beef Taco", base:[I("Lean ground beef",4,"oz","Meat"),I("Bell pepper",0.25,"each","Produce"),I("Yellow onion",0.25,"each","Produce")], seasonings:[I("Chili powder",0.5,"tsp","Pantry",true),I("Ground cumin",0.25,"tsp","Pantry",true),I("Garlic powder",0.25,"tsp","Pantry",true),I("Onion powder",0.25,"tsp","Pantry",true),I("Paprika",0.25,"tsp","Pantry",true),I("Salt",0.125,"tsp","Pantry",true)], sauce:[I("Tomato sauce",2,"tbsp","Pantry")], calories:280,protein:27,cost:2.45 },
  { label:"BBQ Pork", base:[I("Pork loin",5,"oz","Meat"),I("Yellow onion",0.25,"each","Produce"),I("Coleslaw mix",0.5,"cup","Produce")], seasonings:[I("Smoked paprika",0.5,"tsp","Pantry",true),I("Garlic powder",0.25,"tsp","Pantry",true),I("Onion powder",0.25,"tsp","Pantry",true),I("Salt",0.125,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true)], sauce:[I("BBQ sauce",0.25,"cup","Pantry")], calories:270,protein:35,cost:2.5 },
  { label:"Mediterranean Chickpea", base:[I("Chickpeas",0.5,"can","Pantry"),I("Cherry tomatoes",0.5,"cup","Produce"),I("Zucchini",0.5,"each","Produce")], seasonings:[I("Dried oregano",0.5,"tsp","Pantry",true),I("Garlic powder",0.25,"tsp","Pantry",true),I("Ground cumin",0.25,"tsp","Pantry",true),I("Salt",0.125,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true)], sauce:[I("Lemon juice",1,"tbsp","Produce"),I("Crumbled feta",2,"tbsp","Dairy")], calories:210,protein:11,cost:1.65 },
  { label:"Coconut Curry Chickpea", base:[I("Chickpeas",0.5,"can","Pantry"),I("Spinach",0.5,"cup","Produce"),I("Bell pepper",0.5,"each","Produce")], seasonings:[I("Curry powder",0.5,"tsp","Pantry",true),I("Ground cumin",0.25,"tsp","Pantry",true),I("Ground turmeric",0.25,"tsp","Pantry",true),I("Garlic",0.5,"clove","Produce"),I("Salt",0.125,"tsp","Pantry",true)], sauce:[I("Light coconut milk",0.33,"cup","Pantry"),I("Lime juice",1,"tbsp","Produce")], calories:220,protein:10,cost:1.8 },
  { label:"Ginger Sesame Tofu", base:[I("Extra-firm tofu",5,"oz","Produce"),I("Broccoli florets",0.5,"cup","Produce"),I("Carrot",1,"each","Produce")], seasonings:[I("Garlic",0.5,"clove","Produce"),I("Ground ginger",0.25,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true)], sauce:[I("Low-sodium soy sauce",1,"tbsp","Pantry"),I("Sesame oil",1,"tsp","Pantry"),I("Honey",1,"tsp","Pantry")], calories:190,protein:18,cost:1.9 },
  { label:"Salsa Verde Chicken", base:[I("Boneless chicken thighs",5,"oz","Meat"),I("Poblano pepper",0.5,"each","Produce"),I("Yellow onion",0.25,"each","Produce")], seasonings:[I("Ground cumin",0.25,"tsp","Pantry",true),I("Garlic powder",0.25,"tsp","Pantry",true),I("Dried oregano",0.25,"tsp","Pantry",true),I("Salt",0.125,"tsp","Pantry",true)], sauce:[I("Salsa verde",0.25,"cup","Pantry"),I("Lime juice",1,"tbsp","Produce")], calories:255,protein:32,cost:2.3 },
  { label:"Tomato Basil Turkey", base:[I("Lean ground turkey",5,"oz","Meat"),I("Spinach",0.5,"cup","Produce"),I("Yellow onion",0.25,"each","Produce")], seasonings:[I("Dried basil",0.5,"tsp","Pantry",true),I("Garlic powder",0.25,"tsp","Pantry",true),I("Italian seasoning",0.25,"tsp","Pantry",true),I("Salt",0.125,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true)], sauce:[I("Crushed tomatoes",0.33,"cup","Pantry")], calories:235,protein:32,cost:2.1 },
  { label:"Maple Dijon Pork", base:[I("Pork chops",5,"oz","Meat"),I("Sweet potato",0.5,"each","Produce"),I("Green beans",0.5,"cup","Produce")], seasonings:[I("Garlic powder",0.25,"tsp","Pantry",true),I("Dried thyme",0.25,"tsp","Pantry",true),I("Salt",0.125,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true)], sauce:[I("Dijon mustard",1,"tbsp","Pantry"),I("Maple syrup",2,"tsp","Pantry")], calories:275,protein:35,cost:2.55 },
  { label:"Garlic Butter Shrimp", base:[I("Raw peeled shrimp",5,"oz","Seafood"),I("Zucchini",0.5,"each","Produce"),I("Cherry tomatoes",0.5,"cup","Produce")], seasonings:[I("Garlic",1,"clove","Produce"),I("Paprika",0.25,"tsp","Pantry",true),I("Salt",0.125,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true),I("Dried parsley",0.25,"tsp","Pantry",true)], sauce:[I("Butter",1,"tbsp","Dairy"),I("Lemon juice",1,"tbsp","Produce")], calories:190,protein:31,cost:3.0 },
  { label:"Southwest Black Bean", base:[I("Black beans",0.5,"can","Pantry"),I("Corn",0.33,"cup","Frozen"),I("Bell pepper",0.5,"each","Produce")], seasonings:[I("Chili powder",0.5,"tsp","Pantry",true),I("Ground cumin",0.25,"tsp","Pantry",true),I("Smoked paprika",0.25,"tsp","Pantry",true),I("Garlic powder",0.25,"tsp","Pantry",true),I("Salt",0.125,"tsp","Pantry",true)], sauce:[I("Salsa",2,"tbsp","Pantry"),I("Lime juice",1,"tbsp","Produce")], calories:200,protein:12,cost:1.55 },
];

const dinnerFormats: Format[] = [
  { label:"Sheet Pan",meal:"Dinner",minutes:42,extras:[I("Baby potatoes",5,"oz","Produce"),I("Olive oil",0.5,"tbsp","Pantry",true)],calories:260,protein:1,cost:.85,description:"A complete oven-roasted dinner with protein, vegetables, potatoes and a fully measured seasoning blend.",instructions:["Heat the oven to 425°F and line a large rimmed sheet pan.","Cut the vegetables and potatoes into similar-size pieces.","Whisk the oil, sauce ingredients and every listed seasoning in a small bowl.","Coat the protein and vegetables with the mixture and spread everything in one layer.","Roast until the protein is safely cooked and the vegetables are browned, stirring halfway through.","Rest for 5 minutes, taste and adjust salt or acidity before serving."] },
  { label:"One-Pan Skillet",meal:"Dinner",minutes:32,extras:[I("Olive oil",2,"tsp","Pantry",true),I("Yellow onion",0.25,"each","Produce"),I("Chicken or vegetable broth",0.25,"cup","Pantry")],calories:230,protein:1,cost:.7,description:"A fast skillet dinner with vegetables and a flavorful pan sauce.",instructions:["Prepare and measure every ingredient before heating the skillet.","Heat the oil over medium-high heat and brown the protein.","Add the onion and vegetables and cook until they begin to soften.","Stir in every listed seasoning for 30 seconds.","Add the broth and sauce ingredients, scraping up the browned bits.","Simmer until cooked through and lightly saucy, then taste and serve."] },
  { label:"Slow Cooker",meal:"Dinner",minutes:20,extras:[I("Yellow onion",0.25,"each","Produce"),I("Chicken or vegetable broth",0.25,"cup","Pantry"),I("Cornstarch",1,"tsp","Pantry",true)],calories:210,protein:0,cost:.65,description:"A hands-off slow-cooker dinner with a rich sauce and complete seasoning measurements.",instructions:["Add the onion and vegetables to the slow cooker and place the protein on top.","Whisk the broth, sauce ingredients and every listed seasoning.","Pour the mixture over the protein and vegetables.","Cover and cook on low 5 to 7 hours or high 2½ to 4 hours.","Mix the cornstarch with equal cold water and stir it in for the final 15 minutes.","Shred or slice as appropriate, stir, taste and serve."] },
  { label:"Creamy Pasta",meal:"Dinner",minutes:36,extras:[I("Short pasta",3,"oz","Pantry"),I("Olive oil",2,"tsp","Pantry",true),I("Garlic",0.5,"clove","Produce"),I("Half-and-half",0.25,"cup","Dairy"),I("Grated Parmesan",2,"tbsp","Dairy")],calories:390,protein:3,cost:1.1,description:"A cozy pasta dinner with protein, vegetables, aromatics and a seasoned creamy sauce.",instructions:["Cook the pasta in salted water until just tender.","Reserve 1/4 cup pasta water per person and drain.","Heat the oil in a skillet and cook the protein through.","Add garlic, vegetables and every listed seasoning until fragrant.","Stir in the sauce ingredients, half-and-half, Parmesan and enough pasta water for a silky sauce.","Fold in the pasta, simmer briefly, taste and serve."] },
  { label:"Rice Bowl",meal:"Dinner",minutes:34,extras:[I("Long-grain rice",0.33,"cup","Pantry"),I("Olive oil",2,"tsp","Pantry",true),I("Shredded cabbage",0.5,"cup","Produce")],calories:330,protein:2,cost:.95,description:"A build-your-own family bowl with seasoned protein, rice, vegetables and a flavorful drizzle.",instructions:["Cook the rice according to the package directions.","Mix the sauce ingredients with half of the seasonings.","Heat the oil and cook the protein until browned.","Add the vegetables and remaining seasonings and cook until crisp-tender.","Divide rice among bowls and add the protein and vegetables.","Drizzle with sauce, taste and add a fresh garnish if desired."] },
  { label:"Family Tacos",meal:"Dinner",minutes:28,extras:[I("Small tortillas",2,"each","Bakery"),I("Shredded lettuce",0.5,"cup","Produce"),I("Shredded cheese",2,"tbsp","Dairy"),I("Sour cream",2,"tbsp","Dairy"),I("Olive oil",1,"tsp","Pantry",true)],calories:290,protein:2,cost:1.0,description:"Weeknight tacos with a properly seasoned filling and fresh toppings.",instructions:["Warm the tortillas and keep them covered.","Heat the oil and cook the protein until browned.","Add the vegetables and every listed seasoning.","Stir in the sauce ingredients and simmer until moist but not watery.","Fill each tortilla with the mixture, lettuce and cheese.","Serve with extra lime or salsa if desired."] },
  { label:"Hearty Soup",meal:"Dinner",minutes:48,extras:[I("Chicken or vegetable broth",1.5,"cup","Pantry"),I("Carrot",1,"each","Produce"),I("Celery",1,"each","Produce"),I("Yellow onion",0.25,"each","Produce"),I("Olive oil",1,"tsp","Pantry",true),I("Small pasta or rice",0.25,"cup","Pantry")],calories:230,protein:1,cost:.8,description:"A filling soup with vegetables, protein, grains and a complete blend of seasonings.",instructions:["Heat the oil in a soup pot and soften the onion, carrots and celery.","Add the protein and brown it when applicable.","Stir in every listed seasoning for 30 seconds.","Add broth, sauce ingredients and pasta or rice.","Simmer until the grain is tender and the protein is safely cooked.","Taste the broth and adjust salt, pepper or acidity."] },
  { label:"Cheesy Casserole",meal:"Dinner",minutes:55,extras:[I("Cooked rice or pasta",1,"cup","Pantry"),I("Shredded cheese",0.33,"cup","Dairy"),I("Chicken or vegetable broth",0.25,"cup","Pantry"),I("Olive oil",1,"tsp","Pantry",true)],calories:380,protein:3,cost:1.1,description:"A family-size baked casserole with protein, vegetables, grains and a seasoned cheesy topping.",instructions:["Heat the oven to 375°F and grease a casserole dish.","Cook the protein in the oil until browned.","Add vegetables, sauce ingredients and every listed seasoning.","Combine with the cooked grain and half of the cheese.","Transfer to the dish, top with remaining cheese and cover.","Bake 25 minutes, uncover for 10 minutes and rest before serving."] },
  { label:"Stir-Fry",meal:"Dinner",minutes:26,extras:[I("Long-grain rice",0.33,"cup","Pantry"),I("Neutral oil",2,"tsp","Pantry",true),I("Low-sodium soy sauce",1,"tbsp","Pantry"),I("Cornstarch",1,"tsp","Pantry",true)],calories:300,protein:2,cost:.95,description:"A quick stir-fry with crisp vegetables, balanced sauce and explicit aromatics and seasonings.",instructions:["Cook the rice and whisk the sauce ingredients with cornstarch and water.","Heat half the oil and cook the protein; transfer to a plate.","Add remaining oil and cook vegetables over high heat.","Add every listed seasoning and aromatic for 30 seconds.","Return the protein, pour in the sauce and toss until glossy.","Serve immediately over rice."] },
  { label:"Oven-Baked",meal:"Dinner",minutes:46,extras:[I("Brown rice or quinoa",0.33,"cup","Pantry"),I("Olive oil",2,"tsp","Pantry",true),I("Chicken or vegetable broth",0.33,"cup","Pantry")],calories:300,protein:1,cost:.9,description:"A comforting oven-baked dinner with protein, grains, vegetables and a fully seasoned sauce.",instructions:["Heat the oven to 400°F and grease a baking dish.","Spread the rinsed grain in the dish with broth.","Arrange protein and vegetables over the grain.","Whisk oil, sauce ingredients and every listed seasoning and pour over the dish.","Cover tightly and bake until the grain is tender and protein is safely cooked.","Uncover briefly, rest, fluff and taste before serving."] },
];

const breakfastProfiles: Profile[] = [
  { label:"Apple Cinnamon",base:[I("Apple",0.5,"each","Produce")],seasonings:[I("Ground cinnamon",0.5,"tsp","Pantry",true),I("Vanilla extract",0.25,"tsp","Pantry",true),I("Salt",0.0625,"tsp","Pantry",true)],sauce:[I("Maple syrup",2,"tsp","Pantry")],calories:90,protein:1,cost:.8 },
  { label:"Blueberry Lemon",base:[I("Blueberries",0.5,"cup","Produce")],seasonings:[I("Lemon zest",0.25,"tsp","Produce"),I("Vanilla extract",0.25,"tsp","Pantry",true),I("Salt",0.0625,"tsp","Pantry",true)],sauce:[I("Honey",2,"tsp","Pantry"),I("Lemon juice",1,"tsp","Produce")],calories:85,protein:1,cost:1.05 },
  { label:"Banana Peanut Butter",base:[I("Banana",0.5,"each","Produce"),I("Peanut butter",1,"tbsp","Pantry")],seasonings:[I("Ground cinnamon",0.25,"tsp","Pantry",true),I("Vanilla extract",0.25,"tsp","Pantry",true),I("Salt",0.0625,"tsp","Pantry",true)],sauce:[I("Honey",1,"tsp","Pantry")],calories:180,protein:5,cost:.9 },
  { label:"Strawberry Vanilla",base:[I("Strawberries",0.5,"cup","Produce")],seasonings:[I("Vanilla extract",0.5,"tsp","Pantry",true),I("Ground cinnamon",0.0625,"tsp","Pantry",true),I("Salt",0.0625,"tsp","Pantry",true)],sauce:[I("Honey",2,"tsp","Pantry")],calories:80,protein:1,cost:1.05 },
  { label:"Peach Pecan",base:[I("Peach",0.5,"each","Produce"),I("Chopped pecans",1,"tbsp","Pantry")],seasonings:[I("Ground cinnamon",0.5,"tsp","Pantry",true),I("Vanilla extract",0.25,"tsp","Pantry",true),I("Salt",0.0625,"tsp","Pantry",true)],sauce:[I("Brown sugar",2,"tsp","Pantry",true)],calories:150,protein:2,cost:1.15 },
  { label:"Sausage Pepper",base:[I("Breakfast sausage",3,"oz","Meat"),I("Bell pepper",0.5,"each","Produce"),I("Yellow onion",0.25,"each","Produce")],seasonings:[I("Garlic powder",0.25,"tsp","Pantry",true),I("Smoked paprika",0.25,"tsp","Pantry",true),I("Salt",0.125,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true)],sauce:[],calories:250,protein:16,cost:1.8 },
  { label:"Spinach Feta",base:[I("Baby spinach",0.5,"cup","Produce"),I("Crumbled feta",2,"tbsp","Dairy"),I("Cherry tomatoes",0.33,"cup","Produce")],seasonings:[I("Dried oregano",0.25,"tsp","Pantry",true),I("Garlic powder",0.25,"tsp","Pantry",true),I("Salt",0.125,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true)],sauce:[],calories:150,protein:7,cost:1.45 },
  { label:"Ham Cheddar",base:[I("Diced ham",2,"oz","Meat"),I("Shredded cheddar",0.25,"cup","Dairy"),I("Green onion",1,"tbsp","Produce")],seasonings:[I("Dry mustard",0.125,"tsp","Pantry",true),I("Garlic powder",0.125,"tsp","Pantry",true),I("Salt",0.0625,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true)],sauce:[],calories:220,protein:18,cost:1.7 },
  { label:"Turkey Bacon Veggie",base:[I("Turkey bacon",2,"slice","Meat"),I("Mushrooms",0.5,"cup","Produce"),I("Bell pepper",0.25,"each","Produce")],seasonings:[I("Onion powder",0.25,"tsp","Pantry",true),I("Garlic powder",0.25,"tsp","Pantry",true),I("Salt",0.0625,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true)],sauce:[],calories:170,protein:13,cost:1.75 },
  { label:"Mushroom Swiss",base:[I("Mushrooms",0.75,"cup","Produce"),I("Shredded Swiss cheese",0.25,"cup","Dairy"),I("Yellow onion",0.25,"each","Produce")],seasonings:[I("Dried thyme",0.25,"tsp","Pantry",true),I("Garlic powder",0.25,"tsp","Pantry",true),I("Salt",0.125,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true)],sauce:[],calories:160,protein:9,cost:1.5 },
];

const breakfastFormats: Format[] = [
  { label:"Overnight Oats",meal:"Breakfast",minutes:10,extras:[I("Old-fashioned oats",0.5,"cup","Pantry"),I("Milk",0.5,"cup","Dairy"),I("Plain Greek yogurt",0.25,"cup","Dairy"),I("Chia seeds",1,"tsp","Pantry")],calories:260,protein:12,cost:.65,description:"A make-ahead breakfast with exact fruit, spice and sweetener measurements.",instructions:["Add oats, milk, yogurt and chia seeds to a covered container.","Stir in all listed seasonings and sauce ingredients.","Fold in half of the fruit or savory filling.","Cover and refrigerate at least 6 hours.","Stir and loosen with a splash of milk if needed.","Top with remaining filling and serve."] },
  { label:"Baked Oatmeal",meal:"Breakfast",minutes:42,extras:[I("Old-fashioned oats",0.5,"cup","Pantry"),I("Milk",0.5,"cup","Dairy"),I("Egg",0.5,"each","Dairy"),I("Baking powder",0.25,"tsp","Pantry",true),I("Butter",1,"tsp","Dairy")],calories:280,protein:11,cost:.7,description:"A sliceable baked breakfast with complete measurements and seasonings.",instructions:["Heat the oven to 350°F and grease a baking dish.","Mix oats, baking powder and every listed seasoning.","Whisk milk, egg, butter and sauce ingredients.","Combine wet and dry mixtures and fold in the filling.","Bake 28 to 34 minutes until set and lightly golden.","Cool 10 minutes before slicing."] },
  { label:"Fluffy Pancakes",meal:"Breakfast",minutes:25,extras:[I("All-purpose flour",0.5,"cup","Pantry"),I("Milk",0.5,"cup","Dairy"),I("Egg",0.5,"each","Dairy"),I("Baking powder",1,"tsp","Pantry",true),I("Butter",0.5,"tbsp","Dairy")],calories:300,protein:10,cost:.75,description:"Family pancakes with measured flavorings, fruit and pantry staples.",instructions:["Whisk flour, baking powder, seasonings and salt.","Whisk milk, egg, melted butter and sauce ingredients separately.","Stir wet into dry just until combined.","Fold in the filling, reserving some for topping.","Cook 1/4-cup portions on a greased skillet until bubbles form, then flip.","Serve warm with reserved topping."] },
  { label:"French Toast",meal:"Breakfast",minutes:24,extras:[I("Whole-grain bread",2,"slice","Bakery"),I("Egg",1,"each","Dairy"),I("Milk",0.25,"cup","Dairy"),I("Butter",1,"tsp","Dairy")],calories:290,protein:13,cost:.8,description:"Golden French toast with a detailed custard and fruit or savory topping.",instructions:["Whisk egg, milk, seasonings and sauce ingredients in a shallow dish.","Dip each bread slice briefly on both sides.","Melt butter in a skillet over medium heat.","Cook bread 2 to 3 minutes per side until golden.","Warm or sauté the filling separately when needed.","Serve immediately with the filling on top."] },
  { label:"Breakfast Bowls",meal:"Breakfast",minutes:15,extras:[I("Plain Greek yogurt",0.75,"cup","Dairy"),I("Granola",0.25,"cup","Pantry"),I("Chia seeds",1,"tsp","Pantry")],calories:240,protein:17,cost:.75,description:"A quick breakfast bowl with measured toppings, spices and protein.",instructions:["Stir the yogurt with sauce ingredients and seasonings.","Divide among bowls.","Add the filling and any nuts or cheese.","Sprinkle with granola and chia seeds.","Taste and adjust sweetness or salt.","Serve immediately."] },
  { label:"Breakfast Burritos",meal:"Breakfast",minutes:28,extras:[I("Egg",2,"each","Dairy"),I("Large flour tortilla",1,"each","Bakery"),I("Frozen diced potatoes",0.33,"cup","Frozen"),I("Salsa",2,"tbsp","Pantry")],calories:330,protein:18,cost:.9,description:"A freezer-friendly breakfast burrito with a fully seasoned filling.",instructions:["Cook potatoes until crisp and cook the filling until tender.","Whisk eggs with every listed seasoning and scramble gently.","Warm tortillas so they fold without tearing.","Layer potatoes, eggs, filling and sauce in each tortilla.","Fold in sides and roll tightly.","Serve now or wrap and freeze."] },
  { label:"Family Frittata",meal:"Breakfast",minutes:34,extras:[I("Egg",2,"each","Dairy"),I("Milk",1,"tbsp","Dairy"),I("Olive oil",1,"tsp","Pantry",true),I("Shredded cheese",2,"tbsp","Dairy")],calories:250,protein:18,cost:.85,description:"A family-size egg breakfast with vegetables and measured herbs and spices.",instructions:["Heat the oven to 375°F.","Cook the filling in an oven-safe skillet with oil.","Whisk eggs, milk and every listed seasoning.","Pour into the skillet and stir once.","Top with cheese and bake 12 to 16 minutes until just set.","Rest 5 minutes, slice and serve."] },
];

const lunchProfiles: Profile[] = [
  { label:"Turkey Ranch",base:[I("Deli turkey",3,"oz","Meat"),I("Romaine lettuce",1,"cup","Produce"),I("Tomato",0.5,"each","Produce"),I("Shredded cheddar",2,"tbsp","Dairy")],seasonings:[I("Dried dill",0.125,"tsp","Pantry",true),I("Garlic powder",0.0625,"tsp","Pantry",true),I("Black pepper",0.0625,"tsp","Pantry",true)],sauce:[I("Ranch dressing",1,"tbsp","Pantry")],calories:190,protein:23,cost:2.0 },
  { label:"Chicken Caesar",base:[I("Cooked chicken breast",4,"oz","Meat"),I("Romaine lettuce",1.5,"cup","Produce"),I("Grated Parmesan",2,"tbsp","Dairy")],seasonings:[I("Garlic powder",0.0625,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true)],sauce:[I("Caesar dressing",1.5,"tbsp","Pantry"),I("Lemon juice",1,"tsp","Produce")],calories:220,protein:33,cost:2.25 },
  { label:"Buffalo Chicken",base:[I("Cooked chicken breast",4,"oz","Meat"),I("Shredded lettuce",1,"cup","Produce"),I("Celery",1,"each","Produce")],seasonings:[I("Garlic powder",0.0625,"tsp","Pantry",true),I("Dried dill",0.0625,"tsp","Pantry",true)],sauce:[I("Buffalo sauce",1.5,"tbsp","Pantry"),I("Plain Greek yogurt",1,"tbsp","Dairy")],calories:210,protein:34,cost:2.2 },
  { label:"Mediterranean Chickpea",base:[I("Chickpeas",0.5,"can","Pantry"),I("Cucumber",0.5,"each","Produce"),I("Cherry tomatoes",0.5,"cup","Produce"),I("Crumbled feta",2,"tbsp","Dairy")],seasonings:[I("Dried oregano",0.25,"tsp","Pantry",true),I("Garlic powder",0.0625,"tsp","Pantry",true),I("Salt",0.0625,"tsp","Pantry",true),I("Black pepper",0.0625,"tsp","Pantry",true)],sauce:[I("Olive oil",2,"tsp","Pantry",true),I("Lemon juice",1,"tbsp","Produce")],calories:240,protein:11,cost:1.65 },
  { label:"Taco Beef",base:[I("Cooked lean ground beef",4,"oz","Meat"),I("Shredded lettuce",1,"cup","Produce"),I("Corn",0.33,"cup","Frozen"),I("Shredded cheese",2,"tbsp","Dairy")],seasonings:[I("Chili powder",0.25,"tsp","Pantry",true),I("Ground cumin",0.125,"tsp","Pantry",true),I("Garlic powder",0.0625,"tsp","Pantry",true)],sauce:[I("Salsa",2,"tbsp","Pantry"),I("Lime juice",1,"tsp","Produce")],calories:270,protein:26,cost:2.3 },
  { label:"Ham Swiss",base:[I("Deli ham",3,"oz","Meat"),I("Swiss cheese",1,"slice","Dairy"),I("Spinach",0.5,"cup","Produce"),I("Tomato",0.5,"each","Produce")],seasonings:[I("Black pepper",0.125,"tsp","Pantry",true),I("Garlic powder",0.0625,"tsp","Pantry",true)],sauce:[I("Dijon mustard",1,"tbsp","Pantry")],calories:220,protein:24,cost:2.1 },
  { label:"Tuna Dill",base:[I("Tuna",0.5,"can","Seafood"),I("Celery",1,"each","Produce"),I("Romaine lettuce",1,"cup","Produce")],seasonings:[I("Dried dill",0.25,"tsp","Pantry",true),I("Onion powder",0.125,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true),I("Salt",0.0625,"tsp","Pantry",true)],sauce:[I("Mayonnaise or Greek yogurt",1.5,"tbsp","Pantry"),I("Lemon juice",1,"tsp","Produce")],calories:180,protein:28,cost:1.75 },
  { label:"BBQ Chicken",base:[I("Cooked chicken breast",4,"oz","Meat"),I("Coleslaw mix",1,"cup","Produce"),I("Red onion",0.125,"each","Produce")],seasonings:[I("Smoked paprika",0.125,"tsp","Pantry",true),I("Black pepper",0.0625,"tsp","Pantry",true)],sauce:[I("BBQ sauce",2,"tbsp","Pantry")],calories:230,protein:32,cost:2.15 },
  { label:"Hummus Veggie",base:[I("Hummus",0.25,"cup","Pantry"),I("Cucumber",0.5,"each","Produce"),I("Bell pepper",0.5,"each","Produce"),I("Spinach",0.5,"cup","Produce")],seasonings:[I("Dried oregano",0.25,"tsp","Pantry",true),I("Smoked paprika",0.125,"tsp","Pantry",true),I("Black pepper",0.0625,"tsp","Pantry",true)],sauce:[I("Lemon juice",1,"tsp","Produce")],calories:190,protein:8,cost:1.55 },
  { label:"Egg Avocado",base:[I("Hard-boiled egg",2,"each","Dairy"),I("Avocado",0.5,"each","Produce"),I("Spinach",0.5,"cup","Produce"),I("Tomato",0.5,"each","Produce")],seasonings:[I("Garlic powder",0.125,"tsp","Pantry",true),I("Smoked paprika",0.125,"tsp","Pantry",true),I("Salt",0.0625,"tsp","Pantry",true),I("Black pepper",0.125,"tsp","Pantry",true)],sauce:[I("Lime juice",1,"tsp","Produce")],calories:290,protein:16,cost:1.9 },
];

const lunchFormats: Format[] = [
  { label:"Wrap",meal:"Lunch",minutes:12,extras:[I("Large flour tortilla",1,"each","Bakery")],calories:210,protein:5,cost:.55,description:"A quick wrap with a complete filling, sauce and seasoning list.",instructions:["Prepare and measure all filling ingredients.","Mix the sauce ingredients and seasonings.","Lay the tortilla flat and spread the sauce evenly.","Layer the filling down the center.","Fold in the sides and roll tightly.","Slice in half and serve or wrap for later."] },
  { label:"Grain Bowl",meal:"Lunch",minutes:22,extras:[I("Cooked brown rice or quinoa",1,"cup","Pantry"),I("Olive oil",1,"tsp","Pantry",true)],calories:260,protein:5,cost:.7,description:"A filling lunch bowl with grains, protein, vegetables and a measured dressing.",instructions:["Cook or reheat the grain.","Whisk sauce ingredients with seasonings.","Prepare the vegetables and protein.","Divide grain among bowls.","Arrange the filling over the grain.","Drizzle with sauce, toss and serve."] },
  { label:"Chopped Salad",meal:"Lunch",minutes:15,extras:[I("Mixed greens",2,"cup","Produce"),I("Whole-grain croutons",0.25,"cup","Bakery")],calories:140,protein:3,cost:.65,description:"A substantial chopped salad with protein, crunchy vegetables and a detailed dressing.",instructions:["Wash and thoroughly dry the greens.","Chop the vegetables and protein into bite-size pieces.","Whisk the sauce ingredients with every seasoning.","Combine greens and filling in a large bowl.","Toss with dressing just before serving.","Top with croutons and serve."] },
  { label:"Sandwich",meal:"Lunch",minutes:10,extras:[I("Whole-grain bread",2,"slice","Bakery")],calories:190,protein:7,cost:.55,description:"A practical sandwich with clearly measured filling, spread and seasonings.",instructions:["Toast the bread if desired.","Mix spread ingredients with seasonings.","Prepare the protein and vegetables.","Spread both bread slices evenly.","Layer the filling and close the sandwich.","Slice and serve or wrap tightly."] },
  { label:"Pita Pocket",meal:"Lunch",minutes:13,extras:[I("Whole-wheat pita",1,"each","Bakery")],calories:180,protein:6,cost:.6,description:"A portable pita lunch with a flavorful, fully seasoned filling.",instructions:["Warm the pita briefly so it opens without tearing.","Mix the sauce and seasonings.","Prepare the protein and vegetables.","Spread sauce inside the pita.","Fill evenly without overpacking.","Serve immediately or wrap for later."] },
  { label:"Loaded Baked Potato",meal:"Lunch",minutes:18,extras:[I("Russet potato",1,"each","Produce"),I("Shredded cheddar",2,"tbsp","Dairy")],calories:230,protein:7,cost:.7,description:"A hearty loaded potato with protein, vegetables and measured seasonings.",instructions:["Pierce the potato and microwave until tender.","Prepare or warm the filling.","Mix sauce ingredients and seasonings.","Split the potato and fluff the inside.","Add the filling, sauce and cheese.","Return to microwave briefly to melt cheese, then serve."] },
  { label:"Lunch Quesadilla",meal:"Lunch",minutes:16,extras:[I("Large flour tortilla",1,"each","Bakery"),I("Shredded cheese",0.25,"cup","Dairy"),I("Sour cream",2,"tbsp","Dairy"),I("Olive oil",1,"tsp","Pantry",true)],calories:260,protein:10,cost:.75,description:"A crisp quesadilla with a fully seasoned filling and simple dipping sauce.",instructions:["Prepare the filling and stir in all seasonings.","Spread filling and cheese over half of the tortilla.","Fold the tortilla in half.","Heat oil in a skillet over medium heat.","Cook 2 to 3 minutes per side until crisp and melted.","Rest briefly, slice and serve with the sauce."] },
];

function buildRecipes(): Recipe[] {
  const result: Recipe[] = [];
  const addGroup = (profiles: Profile[], formats: Format[]) => {
    formats.forEach((format) => profiles.forEach((profile) => {
      const name = `${profile.label} ${format.label}`;
      result.push({
        id: slug(name),
        name,
        description: format.description,
        meal: format.meal,
        minutes: format.minutes,
        cost: Number((profile.cost + format.cost).toFixed(2)),
        calories: profile.calories + format.calories,
        protein: profile.protein + format.protein,
        image: image(result.length),
        ingredients: [...format.extras, ...profile.base, ...profile.seasonings, ...profile.sauce].map(enrichIngredient),
        instructions: format.instructions,
      });
    }));
  };
  addGroup(dinnerProfiles, dinnerFormats);
  addGroup(breakfastProfiles, breakfastFormats);
  addGroup(lunchProfiles, lunchFormats);
  return result;
}

export const recipes: Recipe[] = buildRecipes();
export const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
