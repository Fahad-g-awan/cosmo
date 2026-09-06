# Initial Setup - Cosmediate Frontend

**Date:** November 15, 2025  
**Setup Type:** Turborepo Monorepo with shadcn/ui  
**Package Manager:** pnpm 10.4.1

---

## 📋 Overview

This document outlines the complete initial setup process for the Cosmediate frontend monorepo, including all configuration steps, issues encountered, and their resolutions.

---

## 🚀 Installation

### 1. Initialize Project with shadcn/ui

```bash
pnpm dlx shadcn@canary init cosmediate
```

**What this creates:**

- One UI package (`@repo/ui`)
- One default app (`web`)
- Basic Turborepo configuration
- TypeScript setup

---

## 🔧 Configuration Steps

### 2. Rename Package Scope

**Standard naming convention:** All packages use `@cosmediate/*` namespace

Changed from:

```
@repo/ui
@repo/typescript-config
@repo/eslint-config
```

To:

```
@cosmediate/ui
@cosmediate/typescript-config
@cosmediate/eslint-config
```

**Files updated:**

- All `package.json` files across packages and apps
- Import statements throughout the codebase

---

### 3. TypeScript Configuration

This project uses a **shared TypeScript configuration** strategy with three base configs:

1. `base.json` - Common settings for all packages
2. `nextjs.json` - Next.js-specific extensions
3. `react-library.json` - React library-specific extensions

#### 3.1 Base Configuration

**File:** `packages/typescript-config/base.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Default",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "incremental": false,
    "isolatedModules": true,
    "lib": ["es2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleDetection": "force",
    "moduleResolution": "bundler",
    "noUncheckedIndexedAccess": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ES2022"
  }
}
```

**Configuration Explained:**

| Option                     | Value                               | Why?                                                                                     |
| -------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------- |
| `declaration`              | `true`                              | Generate `.d.ts` files for type definitions - essential for shared packages              |
| `declarationMap`           | `true`                              | Generate sourcemaps for `.d.ts` files - helps with IDE navigation                        |
| `esModuleInterop`          | `true`                              | Enables better CommonJS/ES Module interoperability                                       |
| `incremental`              | `false`                             | Disabled for monorepo to avoid caching issues across packages                            |
| `isolatedModules`          | `true`                              | Required by bundlers (Vite, Next.js) - ensures each file can be transpiled independently |
| `lib`                      | `["es2022", "DOM", "DOM.Iterable"]` | Includes ES2022 features + browser APIs                                                  |
| `module`                   | `"ESNext"`                          | Use latest ECMAScript module syntax                                                      |
| `moduleDetection`          | `"force"`                           | Treat all files as modules (prevents global scope pollution)                             |
| `moduleResolution`         | `"bundler"`                         | Modern resolution for bundlers (Turbopack, Vite) - supports package.json exports         |
| `noUncheckedIndexedAccess` | `true`                              | Makes array/object access safer by adding `undefined` to types                           |
| `resolveJsonModule`        | `true`                              | Allows importing JSON files as modules                                                   |
| `skipLibCheck`             | `true`                              | Skip type checking of declaration files - faster builds                                  |
| `strict`                   | `true`                              | Enables all strict type-checking options                                                 |
| `target`                   | `"ES2022"`                          | Compile to ES2022 syntax                                                                 |

**Why these choices?**

- **Modern syntax**: ES2022 provides all necessary features (optional chaining, nullish coalescing, etc.)
- **Bundler-first**: Using `moduleResolution: "bundler"` optimizes for modern build tools
- **Type safety**: `strict` and `noUncheckedIndexedAccess` catch more bugs at compile time
- **Monorepo optimized**: `declaration` and `declarationMap` enable proper type sharing

#### 3.2 Next.js Configuration

**File:** `packages/typescript-config/nextjs.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Next.js",
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowJs": true,
    "jsx": "preserve",
    "noEmit": true
  }
}
```

**Next.js-Specific Options:**

| Option    | Value                  | Why?                                                    |
| --------- | ---------------------- | ------------------------------------------------------- |
| `plugins` | `[{ "name": "next" }]` | Next.js TypeScript plugin for enhanced IDE support      |
| `allowJs` | `true`                 | Allow JavaScript files (for gradual migration)          |
| `jsx`     | `"preserve"`           | Keep JSX syntax intact - Next.js handles transformation |
| `noEmit`  | `true`                 | Don't emit compiled files - Next.js handles compilation |

**Why these choices?**

- **Next.js optimized**: Plugin integration provides better IntelliSense and error checking
- **JSX preservation**: Next.js compiler (SWC/Turbopack) handles JSX transformation more efficiently
- **No emit**: Build process is handled by Next.js, not TypeScript directly

#### 3.3 React Library Configuration

**File:** `packages/typescript-config/react-library.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "React Library",
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

**React Library Options:**

| Option | Value         | Why?                                                  |
| ------ | ------------- | ----------------------------------------------------- |
| `jsx`  | `"react-jsx"` | Use React 17+ JSX transform (no need to import React) |

**Why this choice?**

- **Modern React**: React 17+ doesn't require importing React in JSX files
- **Smaller bundles**: Automatic JSX runtime reduces bundle size

#### 3.4 UI Package TypeScript Config

**File:** `packages/ui/tsconfig.json`

```json
{
  "extends": "@cosmediate/typescript-config/react-library.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@cosmediate/ui/*": ["./src/*"]
    }
  },
  "include": ["."],
  "exclude": ["node_modules", "dist"]
}
```

**Custom Options:**

| Option    | Value                               | Why?                                     |
| --------- | ----------------------------------- | ---------------------------------------- |
| `baseUrl` | `"."`                               | Set base for path resolution             |
| `paths`   | `{"@cosmediate/ui/*": ["./src/*"]}` | Alias for internal imports               |
| `include` | `["."]`                             | Include all files in package             |
| `exclude` | `["node_modules", "dist"]`          | Exclude build artifacts and dependencies |

**Why these choices?**

- **Path aliases**: Cleaner imports within the UI package
- **Include all**: Ensures all source files are type-checked
- **Exclude build**: Prevents duplicate type checking of compiled files

#### 3.5 Web App TypeScript Config

**File:** `apps/web/tsconfig.json`

```json
{
  "extends": "@cosmediate/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@cosmediate/ui/*": ["../../packages/ui/src/*"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    "next.config.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

**App-Specific Options:**

| Option    | Value                                      | Why?                                                  |
| --------- | ------------------------------------------ | ----------------------------------------------------- |
| `paths`   | `{"@/*": ["./src/*"]}`                     | Local app imports                                     |
| `paths`   | `{"@cosmediate/ui/*": [...]}`              | Direct path to UI package source (better IDE support) |
| `include` | `["next-env.d.ts", "next.config.ts", ...]` | Include Next.js types and all TS/TSX files            |
| `include` | `[".next/types/**/*.ts"]`                  | Include Next.js generated types                       |

**Applied to all apps:**

- `apps/web`
- `apps/app`
- `apps/auth`
- `apps/blog`

#### 3.6 Root TypeScript Config

**File:** `tsconfig.json` (workspace root)

```json
{
  "extends": "@cosmediate/typescript-config/base.json"
}
```

**Purpose:** Provides IDE with base TypeScript configuration for workspace-level operations.

---

### 3.7 Future TypeScript Configurations

As the project evolves, we will need to add these configurations:

#### Performance Optimization Options

```json
{
  "compilerOptions": {
    // Build Performance
    "incremental": true, // Enable incremental compilation (once monorepo stabilizes)
    "tsBuildInfoFile": "./.tsbuildinfo", // Specify cache file location

    // Type Checking Performance
    "skipDefaultLibCheck": true, // Skip type checking of default lib files
    "disableSourceOfProjectReferenceRedirect": true // Faster builds in monorepos
  }
}
```

**When to add:**

- `incremental: true` - After initial setup stabilizes (currently disabled to avoid caching issues)
- Project references - When you need better build performance across packages

#### Stricter Type Checking

```json
{
  "compilerOptions": {
    // Additional Strictness
    "noImplicitReturns": true, // Error on functions without return statements
    "noFallthroughCasesInSwitch": true, // Error on switch fallthrough
    "noUnusedLocals": true, // Error on unused local variables
    "noUnusedParameters": true, // Error on unused parameters
    "noImplicitOverride": true, // Require explicit override keyword
    "exactOptionalPropertyTypes": true, // Stricter optional property types
    "noPropertyAccessFromIndexSignature": true, // Require bracket notation for index signatures

    // Null Safety
    "strictNullChecks": true, // Already enabled via "strict"
    "strictFunctionTypes": true, // Already enabled via "strict"
    "strictBindCallApply": true, // Already enabled via "strict"
    "strictPropertyInitialization": true // Already enabled via "strict"
  }
}
```

**When to add:**

- During code quality improvement phases
- When the team is comfortable with current strictness level
- For critical modules that require extra safety

#### Path Alias Expansions

```json
{
  "compilerOptions": {
    "paths": {
      // Additional shared packages
      "@cosmediate/utils/*": ["../../packages/utils/src/*"],
      "@cosmediate/types/*": ["../../packages/types/src/*"],
      "@cosmediate/hooks/*": ["../../packages/hooks/src/*"],
      "@cosmediate/api/*": ["../../packages/api/src/*"],
      "@cosmediate/constants/*": ["../../packages/constants/src/*"],

      // App-specific aliases
      "@/components/*": ["./src/components/*"],
      "@/features/*": ["./src/features/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/config/*": ["./src/config/*"],
      "@/api/*": ["./src/api/*"],
      "@/assets/*": ["./src/assets/*"]
    }
  }
}
```

**When to add:**

- As you create new shared packages
- To improve import clarity and prevent deep relative imports

#### Testing Configuration

```json
{
  "compilerOptions": {
    // Testing Support
    "types": ["jest", "node", "@testing-library/jest-dom"],
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  },
  "include": [
    "src/**/*",
    "tests/**/*",
    "__tests__/**/*",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx"
  ]
}
```

**When to add:**

- When setting up Jest, Vitest, or other testing frameworks
- May need separate `tsconfig.test.json` for test-specific settings

#### Build Output Customization

```json
{
  "compilerOptions": {
    // Output Configuration
    "outDir": "./dist", // Output directory
    "rootDir": "./src", // Root of source files
    "declarationDir": "./dist/types", // Separate directory for .d.ts files
    "sourceMap": true, // Generate source maps
    "removeComments": false, // Keep comments in output
    "importHelpers": true, // Use tslib helpers to reduce bundle size

    // Module Output
    "module": "ESNext", // For modern bundlers
    // OR
    "module": "CommonJS" // For Node.js compatibility
  }
}
```

**When to add:**

- When building standalone packages for npm
- When you need different module formats (ESM + CJS)

#### Experimental Features

```json
{
  "compilerOptions": {
    // Decorators (if using MobX, TypeORM, etc.)
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,

    // Stage 3 Proposals
    "useDefineForClassFields": true
  }
}
```

**When to add:**

- If using libraries that require decorators
- When adopting new ECMAScript proposals

#### Monorepo Project References

```json
{
  "extends": "@cosmediate/typescript-config/base.json",
  "compilerOptions": {
    "composite": true, // Enable project references
    "rootDir": "./src"
  },
  "references": [
    { "path": "../ui" },
    { "path": "../utils" },
    { "path": "../types" }
  ]
}
```

**When to add:**

- For better build performance in large monorepos
- To enable incremental builds across packages
- When build times become a bottleneck

#### Configuration for Different Environments

**Development:**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "sourceMap": true,
    "removeComments": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false
  }
}
```

**Production:**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "sourceMap": false,
    "removeComments": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**When to add:**

- When you need different settings for dev vs production builds
- Use with `tsconfig.dev.json` and `tsconfig.prod.json`

---

### 3.8 TypeScript Configuration Best Practices

#### 1. **Layer Your Configs**

```
base.json          → Common settings
  ├── nextjs.json  → Next.js apps
  └── library.json → Shared packages
```

#### 2. **Use Strict Mode**

Always keep `strict: true` - it catches bugs early.

#### 3. **Avoid Disabling Strict Checks**

```typescript
// ❌ Bad
// @ts-ignore
// @ts-nocheck

// ✅ Good - fix the underlying issue or use proper type assertion
const value = data as ExpectedType;
```

#### 4. **Enable Editor Integration**

Ensure your IDE uses the workspace TypeScript version:

```json
// .vscode/settings.json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

#### 5. **Validate Configs**

```bash
# Check for configuration errors
npx tsc --showConfig

# Validate specific config
npx tsc --project apps/web/tsconfig.json --noEmit
```

---

### 4. shadcn/ui Configuration

#### 4.1 UI Package components.json

**File:** `packages/ui/components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@cosmediate/ui/components",
    "utils": "@cosmediate/ui/lib/utils",
    "hooks": "@cosmediate/ui/hooks",
    "lib": "@cosmediate/ui/lib",
    "ui": "@cosmediate/ui/components"
  }
}
```

**Configuration details:**

- **Style:** `new-york` (shadcn design variant)
- **RSC:** `true` (React Server Components support)
- **Base color:** `neutral`
- **CSS Variables:** Enabled for theming
- **Icon library:** Lucide React

#### 4.2 App components.json

**File:** `apps/web/components.json` (and other apps)

```json
{
  "aliases": {
    "components": "@/src/components",
    "src": "@/src",
    "context": "@/src/context",
    "hooks": "@/src/hooks",
    "lib": "@/src/lib",
    "utils": "@cosmediate/ui/lib/utils",
    "ui": "@cosmediate/ui/components"
  }
}
```

**Key aliases:**

- Local app imports: `@/src/*`
- Shared UI components: `@cosmediate/ui/components`
- Shared utilities: `@cosmediate/ui/lib/utils`

---

### 5. UI Package Exports

**File:** `packages/ui/package.json`

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./lib/*": "./src/lib/*.ts",
    "./globals.css": "./src/styles/globals.css",
    "./postcss.config": "./postcss.config.mjs",
    "./components/*": "./src/components/*.tsx",
    "./hooks/*": "./src/hooks/*.ts"
  }
}
```

**Import examples:**

```tsx
// Main entry point (re-exported components)
import { Button, Card } from "@cosmediate/ui";

// Direct component import
import { Button } from "@cosmediate/ui/components/button";

// Utilities
import { cn } from "@cosmediate/ui/lib/utils";

// Hooks
import { useToast } from "@cosmediate/ui/hooks/use-toast";

// Global styles
import "@cosmediate/ui/globals.css";
```

---

### 6. Next.js Configuration

**File:** `apps/web/next.config.ts` (and other Next.js apps)

```ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@cosmediate/ui"],
  images: {
    domains: [
      "cosmediate.s3.amazonaws.com",
      "media.istockphoto.com",
      "plus.unsplash.com",
      "img.clerk.com",
      "cdn.sanity.io",
    ],
  },
};

export default nextConfig;
```

**Key configurations:**

- ✅ `transpilePackages`: Required for monorepo shared packages
- ✅ `images.domains`: Allowed external image sources

---

### 7. Applications Setup

#### 7.1 Delete Default Web App

Deleted the default `web` app that came with shadcn initialization.

#### 7.2 Create Four Fresh Next.js Apps

Created new Next.js apps with latest configuration:

```bash
# For each app (web, app, auth, blog)
pnpx create-next-app@latest <app-name>
```

**Setup options chosen:**

- ✅ TypeScript
- ✅ `src/` directory
- ✅ App Router
- ✅ Tailwind CSS
- ✅ ESLint

**Apps created:**

1. **web** (Port 3000)
   - Main public website
   - Homepage, treatment search, listings

2. **app** (TBD)
   - User dashboard
   - Booking platform

3. **auth** (TBD)
   - Authentication flows
   - Account management

4. **blog** (TBD)
   - Content platform
   - Treatment guides

---

### 8. Styling Setup

#### 8.1 Global CSS Configuration

**File:** `packages/ui/src/styles/globals.css`

This file uses **Tailwind CSS v4** syntax with modern features:

```css
@import "tailwindcss";
@source "../../../apps/**/*.{ts,tsx}";
@source "../**/*.{ts,tsx}";
@source "./**/*.{js,ts,jsx,tsx}";

@plugin "@tailwindcss/typography";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));
```

**Configuration Breakdown:**

| Directive                           | Purpose                | Why?                                               |
| ----------------------------------- | ---------------------- | -------------------------------------------------- |
| `@import "tailwindcss"`             | Import Tailwind CSS v4 | Modern import syntax (no separate directives)      |
| `@source`                           | Define content sources | Tells Tailwind where to scan for classes           |
| `@plugin "@tailwindcss/typography"` | Typography plugin      | Rich text styling for blog/content (prose classes) |
| `@import "tw-animate-css"`          | Animation library      | Additional animation utilities                     |
| `@custom-variant dark`              | Dark mode variant      | Custom dark mode implementation                    |

**Why Tailwind Typography Plugin?**

- Provides beautiful default styles for prose content
- Essential for blog posts, treatment descriptions, guides
- Classes like `prose`, `prose-lg`, `prose-headings:text-primary`
- Automatically styles markdown-rendered content

**Usage example:**

```tsx
<article className="prose prose-lg dark:prose-invert">
  <h1>Treatment Guide</h1>
  <p>Detailed description...</p>
</article>
```

#### 8.2 CSS Variables & Theming

**Light Mode Variables:**

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --radius: 0.625rem;
  /* ... additional variables ... */
}
```

**Dark Mode Variables:**

```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --border: oklch(0.269 0 0);
  /* ... additional variables ... */
}
```

**Why OKLCH Color Space?**

- More perceptually uniform than HSL/RGB
- Better color interpolation
- Consistent brightness across hues
- Future-proof color format

#### 8.3 Custom Color Variables

**File:** `packages/ui/src/styles/globals.css` (within `@theme inline`)

```css
@theme inline {
  /* Brand Colors */
  --color-primary-accent: #6968ec;
  --color-primary-accent-lite: #f2f5ff;
  --color-primary-accent-soft: #ebeeff;
  --color-primary-accent-dark: #6262df;

  /* Background Colors */
  --color-ghost-white: #f3f6ff;
  --color-ghost-blue: #f9faff;
  --color-gray-card: #f9f9fb;

  /* Utility Colors */
  --color-danger: #f88080;
  --color-stroke: #dadafc;
  --color-cloud: #f7f8f966;

  /* Grayscale Palette */
  --color-100: #f1f2f3;
  --color-200: #e3e5ec;
  --color-300: #aeb2bf;
  --color-400: #8f95a9;
  --color-500: #71788e;
  --color-600: #585c6a;
  --color-700: #3e4147;
  --color-800: #444753;
  --color-900: #282828;
}
```

**Custom color usage:**

```tsx
<div className="bg-[var(--color-primary-accent)] text-white">
  <p>Brand colored section</p>
</div>
```

#### 8.4 Custom Utility Classes

**Scrollbar Styling:**

```css
.overflowY::-webkit-scrollbar {
  width: 5px;
  height: 5px;
  background-color: transparent;
}

.overflowY::-webkit-scrollbar-thumb {
  background-color: rgb(232, 232, 233);
  border-radius: 10px;
}
```

**Gradient Classes:**

```css
.bg-gradient-lite-violet {
  background: linear-gradient(0deg, #f2f5ff 0%, #f6f8ff 80.5%, #f2f5ff 100%);
}

.hero-gradient {
  background: linear-gradient(87deg, #fee7e7 0%, #e7eff7 49.5%, #e4deff 100%);
}

.banner-gradient {
  background: linear-gradient(180deg, rgba(32, 31, 149, 0) 0%, #282754 100%);
}
```

**Features:**

- Custom scrollbar styling for better UX
- Pre-defined gradient backgrounds
- Reusable utility classes

#### 8.2 Theme Setup

**Theme system:**

- Using `next-themes` for theme management
- Default theme: **Light mode**
- Toggle available for dark mode
- Theme persisted in localStorage

---

### 9. Component Library Setup

#### 9.1 Install shadcn/ui Components

**Installation command:**

```bash
# Navigate to UI package
cd packages/ui

# Add components
pnpm dlx shadcn@canary add <component-name>
```

**Components added:**

- `button`
- `card`
- `input`
- `dialog`
- `dropdown-menu`
- `form`
- `label`
- `select`
- `textarea`
- `toast`
- And more...

#### 9.2 Custom Components

**Location:** `packages/ui/src/components/custom/`

Created custom components for specific app requirements:

- Custom layouts
- Specialized form elements
- Composite components
- App-specific UI elements

**Structure:**

```
packages/ui/src/components/
├── ui/           # shadcn components
└── custom/       # Custom components
```

---

### 10. Provider Setup

#### 10.1 Initial Provider

Created a basic provider setup for:

- Theme provider (light/dark mode)
- Future: Auth context
- Future: App state management

**Location:** `apps/web/src/providers/`

**Current providers:**

```tsx
// Theme provider
import { ThemeProvider } from "next-themes";
```

---

## ⚠️ Issues Encountered & Resolutions

### Issue 1: TypeScript Path Resolution

**Problem:** Import errors with `@cosmediate/ui/*` paths

**Solution:**

- Updated `tsconfig.json` with proper path mappings
- Set `moduleResolution: "bundler"`
- Set `module: "esnext"`

### Issue 2: Package Scope Conflicts

**Problem:** Default `@repo` scope causing confusion

**Solution:**

- Renamed all packages to `@cosmediate/*` namespace
- Updated all imports across codebase
- Updated `package.json` dependencies

### Issue 3: Component Imports

**Problem:** Inconsistent import paths for UI components

**Solution:**

- Configured proper exports in `packages/ui/package.json`
- Standardized on `@cosmediate/ui` imports
- Updated aliases in `components.json`

### Issue 4: Next.js Transpilation

**Problem:** Monorepo packages not being transpiled

**Solution:**

- Added `transpilePackages: ["@cosmediate/ui"]` to `next.config.ts`
- Applied to all Next.js apps

---

## 📝 Important Notes

### Adding New shadcn Components

**Always run from UI package directory:**

```bash
cd packages/ui
pnpm dlx shadcn@canary add <component-name>
```

Components are automatically added to `packages/ui/src/components/ui/`

### Import Pattern

**Recommended:**

```tsx
import { Button, Card } from "@cosmediate/ui";
```

**Alternative (direct):**

```tsx
import { Button } from "@cosmediate/ui/components/button";
```

### Package Management

**Adding dependencies:**

```bash
# To UI package
pnpm --filter @cosmediate/ui add <package>

# To specific app
pnpm --filter web add <package>

# To workspace root
pnpm add -w <package>
```

---

## 🔮 Future Enhancements

### Planned Additions

#### 1. **Context & State Management**

- User authentication context
- Global app state
- Notification system

#### 2. **SEO Setup**

- Sitemap generation
- `generateStaticParams` for dynamic routes
- Meta tags optimization
- Schema.org structured data
- Open Graph tags

#### 3. **Additional Providers**

- Auth provider (AWS Cognito)
- API client provider
- Analytics provider
- Toast/notification provider

#### 4. **Performance Optimizations**

- Image optimization setup
- Code splitting strategies
- Lazy loading components
- Bundle analysis

#### 5. **Testing Infrastructure**

- Unit tests (Jest/Vitest)
- Component tests (React Testing Library)
- E2E tests (Playwright)
- Visual regression tests

#### 6. **Development Tools**

- Storybook for component development
- API mocking (MSW)
- Development seed data
- Debug utilities

---

## 📦 Package Structure Summary

```
cosmediate/
├── apps/
│   ├── web/          # Main website (port 3000)
│   ├── app/          # User dashboard
│   ├── auth/         # Authentication
│   └── blog/         # Content platform
│
├── packages/
│   ├── ui/           # Shared components (@cosmediate/ui)
│   ├── header/       # Global header
│   ├── footer/       # Global footer
│   ├── eslint-config/
│   └── typescript-config/
│
└── docs/            # Documentation
```

---

## ✅ Verification Checklist

- [x] All packages renamed to `@cosmediate/*`
- [x] TypeScript paths configured correctly
- [x] shadcn components.json configured
- [x] UI package exports defined
- [x] Four apps created and configured
- [x] Next.js config updated with transpilePackages
- [x] Global CSS with custom variables
- [x] Theme provider setup (default: light)
- [x] Initial shadcn components installed
- [x] Custom components directory created
- [x] Basic provider structure in place

---

## 🚀 Quick Start Reminder

```bash
# Install dependencies
pnpm install

# Run all apps
pnpm dev

# Run specific app
pnpm --filter web run dev

# Add shadcn component
cd packages/ui
pnpm dlx shadcn@canary add <component>

# Build all apps
pnpm build
```

---

**Setup completed:** November 15, 2025  
**Next steps:** Continue homepage development and implement authentication flows

---

## 📞 Troubleshooting

If you encounter issues:

1. **Clear node_modules and reinstall:**

   ```bash
   rm -rf node_modules **/node_modules
   pnpm install
   ```

2. **Clear Next.js cache:**

   ```bash
   rm -rf apps/web/.next
   ```

3. **Verify TypeScript:**

   ```bash
   pnpm typecheck
   ```

4. **Check import paths:**
   - Ensure `@cosmediate/ui` imports work
   - Verify path mappings in `tsconfig.json`
