# Next.js Project

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Project Structure

### Folders

- **public** - Static assets (images, icons, etc.) served directly by the web server
- **src** - Main source code directory
  - **app** - Next.js App Router pages and layouts (main application routes)
  - **components** - Reusable React components used throughout the application
  - **config** - Configuration files and settings
    - **menuItems** - Navigation menu configuration
    - **firebaseConfig.tsx** - Firebase service configuration
  - **hooks** - Custom React hooks for shared logic
  - **lib** - Utility libraries and helper functions
    - **axiosinstance.ts** - HTTP client configuration
    - **hooks.ts** - Additional hook utilities
    - **store.ts** - State management store setup
    - **userSlice.ts** - User-related state management
    - **utils.ts** - General utility functions
  - **services** - API service functions and external service integrations
    - **apiService.tsx** - Main API service functions
  - **utils** - Additional utility functions and helpers
- **types** - TypeScript type definitions and interfaces

### Main Files

- **country-codes.json** - List of country codes for form dropdowns/validation
- **dummydata.json** - Mock data for development and testing
- **middleware.ts** - Next.js middleware for request processing
- **.eslintignore** - Files to ignore during ESLint checking
- **.eslintrc.json** - ESLint configuration for code quality
- **.gitignore** - Files to ignore in Git version control
- **.prettierrc** - Code formatting configuration
- **components.json** - Component library configuration (likely shadcn/ui)
- **next-env.d.ts** - Next.js TypeScript declarations
- **next.config.mjs** - Next.js configuration settings
- **package.json** - Project dependencies and scripts
- **postcss.config.js** - PostCSS configuration for CSS processing
- **tailwind.config.ts** - Tailwind CSS configuration
- **tsconfig.json** - TypeScript compiler configuration

## Getting Started

First, run the development server:

### ✅ Setup Husky (optional for Git hooks)

````bash
npm install --save-dev husky
# OR
yarn add --dev husky
bash
Copy
Edit
npx husky install

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
````

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
