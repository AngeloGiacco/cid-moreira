# Talk to Cid Moreira 

[![Netlify Status](https://api.netlify.com/api/v1/badges/ce3cd9de-77b1-48ab-8f03-32d3600ff418/deploy-status)](https://app.netlify.com/sites/cidmoreira/deploys)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
pnpm i

# Step 4: Start the development server with auto-reloading and an instant preview.
pnpm run dev
```

generate types with 

```
supabase gen types --project-id pjeinusfyxgbkahsmpmk typescript > src/integrations/supabase/types.ts
```



## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
