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

### ✅ Git Hooks with Husky (pre-commit lint)

This repo uses [Husky](https://typicode.github.io/husky) to run ESLint on commits, aligned with `/.github/workflows/lint-check.yml` (max 5 warnings).

#### 1) Prerequisites
- **Git** installed.
- **Node.js 18+** and **pnpm**.
- Windows users: run commands in **Git Bash** (preferred) or ensure Git’s sh is available.
  - If you prefer npm, use the npm commands below.

#### 2) Install Husky
```bash
# pnpm
pnpm add -D husky

# npm
npm install --save-dev husky
```

Ensure `package.json` has the prepare script (already added in this repo):
```json
{
  "scripts": { "prepare": "husky" }
}
```

Then install hooks:
```bash
# pnpm
pnpm install
pnpm run prepare

# npm
npm install
npm run prepare
```

#### 3) Pre-commit hook
The hook is stored at `/.husky/pre-commit` and runs:
```sh
# pnpm
pnpm exec eslint . --ext .ts,.tsx --max-warnings 5

# npm (Node 18+)
npm exec eslint . --ext .ts,.tsx --max-warnings 5
# or using npx
npx eslint . --ext .ts,.tsx --max-warnings 5
```

Make sure it’s executable (macOS/Linux):
```bash
chmod +x .husky/pre-commit
```
On Windows, no chmod is needed; use Git Bash to run shell hooks.

#### 4) Verify
```bash
git add -A
git commit -m "test: trigger husky pre-commit"
```
Commit will fail if ESLint errors exist or warnings > 5.

#### Optional: Lint only staged files
```bash
# pnpm
pnpm add -D lint-staged

# npm
npm install --save-dev lint-staged
```
Add to `package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": "eslint --max-warnings 5"
  }
}
```
Update `/.husky/pre-commit` to:
```sh
# pnpm
pnpm exec lint-staged

# npm (Node 18+)
npm exec lint-staged
# or using npx
npx lint-staged
```

```bash
pnpm dev
```

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
