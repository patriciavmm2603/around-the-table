# Around the Table

**Plan less. Gather more.**

A warm, family-centered meal planner built with Next.js. This first test version is intentionally database-free so the planning flow and design can be tested before adding Supabase and authentication.

## Included

- Patricia's House, Our Home, and Everyone Together planning groups
- Separate weekly plan and grocery list for each group
- Default servings based on each family group
- Editable servings per meal
- Family-friendly sample recipes with estimated price and macros
- Automatically generated grocery list
- "Already have" checkboxes
- Walmart product-search links
- Responsive desktop and mobile layouts
- Around the Table logo, favicon, and app icon
- Local browser saving

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

Import the GitHub repository into Vercel. No environment variables are required for this version.

## Important

The three girls in `Our Home` use temporary labels (`Girl 1`, `Girl 2`, `Girl 3`) in `src/lib/data.ts`. Replace those labels with their names whenever ready.
