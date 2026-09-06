# Cosmediate Frontend — AI Agent Rules & Project Context

> This file is the single source of truth for AI agents working on this codebase.
> It is automatically loaded by Windsurf/Cascade before every task.

---

## 1. Project Overview

**Cosmediate** is a comprehensive platform connecting users with cosmetic treatment providers (clinics, specialists). This is the **frontend monorepo** containing multiple Next.js applications and shared packages.

- **Company**: AXONYX
- **Status**: Phase 3 — Core Features in Development
- **Node**: >= 20
- **Package Manager**: pnpm 10.4.1
- **Build System**: Turborepo 2.5

---

## 2. Tech Stack

| Layer             | Technology                                                      |
| ----------------- | --------------------------------------------------------------- |
| Framework         | **Next.js 16.1** with App Router                                |
| UI Library        | **React 19.2**                                                  |
| Language          | **TypeScript 5.7** (strict mode)                                |
| Styling           | **Tailwind CSS 4** (utility-first, CSS variables for theming)   |
| Component Library | **shadcn/ui** (new-york style) + **Radix UI** primitives        |
| Icons             | **Lucide React** (primary), **React Icons** (secondary)         |
| Forms             | Custom `@cosmediate/form-core` (Zustand store + Zod validation) |
| Form UI           | `@cosmediate/form-ui` (controlled field components)             |
| State Management  | React Context + `useReducer` pattern, Zustand (form-core)       |
| Data Fetching     | Axios via `@cosmediate/api` package                             |
| Tables            | `@tanstack/react-table` v8                                      |
| Rich Text         | TipTap v3                                                       |
| Date Utilities    | `date-fns`, `luxon`                                             |
| Toasts            | `sonner` (via custom `Toaster` wrapper in UI package)           |
| Maps              | `@vis.gl/react-google-maps`, `@react-google-maps/api`           |
| Theme             | `next-themes` (light/dark, class-based)                         |
| Auth              | Custom OAuth 2.0 (AWS Cognito-backed)                           |
| WebSocket         | Custom `@cosmediate/socket-setup` package                       |
| Charts            | Recharts 2.15                                                   |
| Build             | Turborepo, pnpm workspaces                                      |
| Linting           | ESLint 9 + Prettier                                             |
| React Compiler    | Enabled (babel-plugin-react-compiler 1.0.0)                     |
| Deployment        | **Vercel** (migrated from AWS Amplify, Apr 2026)                |

---

## 3. Monorepo Structure

```
cosmediate/
├── apps/
│   ├── web/          (Port 3000) — Public website, treatment search, clinic/specialist directories
│   ├── app/          (Port 3003) — Multi-tenant dashboards (Admin, Clinic, Specialist, User)
│   ├── auth/         (Port 3002) — OAuth 2.0 Identity Provider (separate deployment)
│   └── blog/         (Port 3001) — Content & resources blog
│
├── packages/
│   ├── ui/               — Shared shadcn/ui + custom components, loaders, styles, globals.css
│   ├── header/           — Global header component with auth actions, profile card
│   ├── footer/           — Global footer component with site links, social, brand
│   ├── auth/             — Auth hooks (useSignIn, useSignUp, useAuth, useSilentAuth, etc.) + AuthProvider
│   ├── api/              — Axios instance, type-safe API functions, request/response types
│   ├── type-utils/       — Shared TypeScript domain types (auth, clinic, treatment, specialist, etc.)
│   ├── browse-manager/   — Headless browse/filter/pagination/sort state management
│   ├── form-core/        — Zustand-based form store with Zod validation
│   ├── form-ui/          — Controlled form field components (TextField, SelectField, etc.)
│   ├── socket-setup/     — WebSocket context provider
│   ├── auth-bff/         — Shared Next.js client-BFF route factories (`apps/app`, `web`, `blog`) + CORS helpers
│   ├── eslint-config/    — Shared ESLint configs (base, next, react-internal)
│   └── typescript-config/ — Shared TS configs (base.json, nextjs.json, react-library.json)
│
├── docs/                 — Architecture, deployment, and feature documentation
├── turbo.json            — Turborepo task config
├── pnpm-workspace.yaml   — Workspace definitions
└── package.json          — Root scripts (dev, build, lint, format)
```

---

## 4. Application Details

### 4.1 Web App (`apps/web/` — Port 3000)

Public-facing website for treatment discovery, clinic/specialist browsing, and profiles.

**Path aliases**: `@web/*` → `./src/*`

```
apps/web/src/
├── app/                    — Next.js App Router pages
│   ├── (pages)/            — Route groups: (legal), (marketing), clinics, specialists, treatments
│   ├── api/                — API routes: auth, places
│   └── auth/               — Auth pages: processing, signin
├── features/               — Feature modules (self-contained)
│   ├── HomePage/           — Hero, PopularClinics, PopularTreatments, Testimonials, BlogSection
│   ├── Clinics/            — Clinic listing + profiles (with tabs, views)
│   ├── Specialists/        — Specialist listing + profiles
│   ├── Treatments/         — Treatment listing + profiles
│   └── Legal/              — Legal pages (privacy, terms)
├── components/             — Shared components: EntityMap, dialogs, profile cards, searchAndFilters
├── context/                — AppContext, FilterOptionsContext, DialogProvider, providers.tsx
├── layout/                 — BrowseLayout (with Content, SubHeader)
├── hooks/                  — Custom hooks
├── lib/                    — Utilities, server config
├── modules/                — Larger reusable modules
├── services/               — Service layer
└── types/                  — App-specific types
```

**Providers hierarchy** (web):
`ThemeProvider` → `AuthProvider` → `WebSocketProvider` → `DialogProvider` → `AppContextProvider` → `HeaderProvider` → `Header` + `{children}` + `Footer`

### 4.2 App Dashboard (`apps/app/` — Port 3003)

Multi-tenant management dashboard with role-based routing.

**Path aliases**: `@app/*` → `./src/*`, `@app/admin/*` → `./src/tenants/Admin/*`, `@app/clinic/*` → `./src/tenants/Clinic/*`, `@app/user/*` → `./src/tenants/User/*`

```
apps/app/src/
├── app/
│   ├── (routes)/
│   │   ├── (admin)/        — Admin routes: clinic-management, blog-management, crm, moderation, etc.
│   │   ├── (clinic)/       — Clinic routes: analytics, requests, reviews, schedule
│   │   └── (shared-routes)/ — Shared: appointments, control-panel, inbox, patients, specialists, treatments, settings
│   ├── api/                — API routes: auth (exchange-code, get-session, logout, set/update-password), user/default-route
│   └── auth/               — Auth pages: processing, signin
│
├── tenants/                — Tenant-specific business logic (THE CORE)
│   ├── Admin/sections/     — Admin sections, each with standardized structure:
│   │   ├── ClinicManagement/
│   │   ├── BlogManagement/
│   │   ├── ControlPanel/
│   │   ├── Patients/
│   │   ├── Settings/
│   │   ├── Specialists/
│   │   ├── TreatmentsManagement/
│   │   ├── ActivityMonitoring/
│   │   ├── AuditTrail/
│   │   └── Moderation/
│   ├── Clinic/sections/    — Clinic-specific sections
│   └── User/sections/      — User-specific sections
│
├── layout/
│   ├── management/         — Management dashboard layout (Header, Navigation, Content, PanelHeader)
│   ├── section/            — SectionLayout with section navigation
│   ├── user/               — User dashboard layout
│   └── BrowseLayout/       — Reusable browse/list/table layout (ControlBar, ContentRenderer, PaginationControls)
│
├── config/
│   └── routes/             — Role-based route configs (admin.routes.ts, manager.routes.ts, middleware.routes.ts)
│
├── components/             — Shared components: ActionMenu, BackButton, ImageUpload, dialogs, treatments, routing
├── context/                — AppContext, WorkspaceContext, FilterOptionsContext, DialogProvider, providers.tsx
├── hooks/                  — Custom hooks
├── lib/                    — Utilities
├── constants/              — App constants
└── types/                  — App-specific types
```

**Providers hierarchy** (app):
`ThemeProvider` → `AuthProvider` → `WebSocketProvider` → `AppContextProvider` → `WorkspaceProvider` → `HeaderProvider` → `DialogProvider` → `{children}`

**Tenant Section Standard Structure** (each section under `tenants/*/sections/`):

```
SectionName/
├── components/       — Section-specific React components
├── config/           — Browse layout configs, table configs, profile section configs
├── constants/        — Default values, enums, field definitions
├── defaults/         — Default form values
├── pages/            — Page-level components (index.tsx for list, Add*.tsx, Update*.tsx, *Profile.tsx, *Details.tsx)
├── schemas/          — Zod validation schemas (*Form.schema.ts)
└── types/            — Section-specific TypeScript types (*FormValues, *FormProps)
```

### 4.3 Auth App (`apps/auth/` — Port 3002)

OAuth 2.0 Identity Provider — fully implemented.

```
apps/auth/src/
├── app/
│   ├── api/              — Server-side API routes (post-Phase 2 reorg, all under /api/auth/*): signin, signup, confirm-signup (+resend/), forgot-password (+resend/), reset-password, set-password, update-password, logout, token, session. Plus /api/_ping/. See section 13 for full inventory.
│   ├── signin/           — Sign in page
│   ├── signup/           — Sign up page
│   ├── confirm-signup/   — Email verification page
│   ├── forgot-password/  — Forgot password page
│   ├── reset-password/   — Reset password page
│   ├── processing/       — Auth processing page
│   └── oauth/            — OAuth authorize/, clear-session/ (cross-origin GET redirect for IdP cookie cleanup — DO NOT remove, /api/auth/* DELETE cannot replace it)
├── features/             — Feature components (AuthProcessing, ClearSession, ConfirmSignup, ForgotPassword, PasswordReset)
├── components/           — AuthUiTemplate, FieldContainer, SocialAccounts
└── context/              — AppContext, providers
```

### 4.4 Blog App (`apps/blog/` — Port 3001)

Content and resources blog — foundation complete, features in progress.

```
apps/blog/src/
├── app/
│   ├── (pages)/          — Blog listing page, [slug] dynamic route
│   ├── api/auth/         — Auth API routes
│   └── auth/             — Auth pages
├── features/Blog/        — Blog feature (index, BlogDetails, components, lib)
├── components/           — BlogCard, BlogHeader, MoreArticles, searchAndFilters
├── layout/               — BrowseLayout, SubHeader
├── context/              — AppContext, FilterOptionsContext, providers
└── lib/                  — Utilities, routing, server config
```

---

## 5. Shared Packages Deep Dive

### 5.1 `@cosmediate/ui` — UI Component Library

**shadcn/ui config**: new-york style, RSC-compatible, Tailwind CSS variables, Lucide icons.

**Standard shadcn/ui components** (~40+): accordion, alert, alert-dialog, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, combobox, command, dialog, drawer, dropdown-menu, field, form, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner, switch, tabs, textarea, toggle, toggle-group, tooltip.

**Custom components** (in `components/custom/`): site-container, mission-section, toaster, no-data-found, info-message, date-picker, date-time-picker, dual-range-slider, multi-select, primary-tabs, secondary-tabs, bar-graph, toggle-menu, combo-select, image-upload, multi-image-upload, reviews.

**Custom loaders** (in `components/custom/loaders/`): Organized by app context (dashboard/management, dashboard/user, web, blog) — provides skeleton loading states for every page type.

**Rich text**: TipTap editor module at `modules/HtmlRichText/`.

**Exports** (in `package.json`):

- `.` → `src/index.ts` (barrel export of all components)
- `./lib/*` → `src/lib/*.ts` (utilities like `cn()`)
- `./globals.css` → `src/styles/globals.css`
- `./tiptap.css` → `src/styles/tiptap.css`
- `./tabs.css` → `src/styles/tabs.css`
- `./components/*` → `src/components/*.tsx` (direct component imports)
- `./hooks/*` → `src/hooks/*.ts`
- `./modules/HtmlRichText/*` → `src/modules/HtmlRichText/*.tsx`

**Import patterns**:

```tsx
// Barrel import (most common)
import { Button, Card, Toaster } from "@cosmediate/ui";

// Direct component import
import { DefaultToaster } from "@cosmediate/ui/components/sonner";

// Utilities
import { cn } from "@cosmediate/ui/lib/utils";

// Styles (in root layout)
import "@cosmediate/ui/globals.css";
```

### 5.2 `@cosmediate/api` — API Client

**Base URL**: `process.env.NEXT_PUBLIC_BACKEND_URL`
**HTTP Client**: Axios with `withCredentials: true`

**API modules** (`src/apis/`):

- `auth.api.ts` — Authentication
- `users.api.ts` — User management
- `admins.api.ts` — Admin management
- `clinics/clinics.api.ts` — Clinic CRUD + popular + by-treatment
- `clinics/categories.api.ts` — Clinic categories
- `clinics/manager.api.ts` — Clinic managers
- `specialist.api.ts` — Specialist CRUD
- `treatments/treatments.api.ts` — Treatment CRUD + top-searched + selection
- `treatments/categories.api.ts` — Treatment categories
- `treatments/brands.api.ts` — Treatment brands
- `treatments/subTreatments.api.ts` — Sub-treatments
- `treatments/treatmentResults.api.ts` — Before/after results
- `reviews/reviews.api.ts` — Reviews
- `reviews/reviewReply.api.ts` — Review replies
- `leads.api.ts` — CRM leads
- `blogs/blogs.api.ts` — Blog posts
- `blogs/blogCategories.api.ts` — Blog categories
- `imageUpload.api.ts` — S3 image upload

**API function pattern**:

```tsx
export const getEntityApi = async (
  params: GetEntityRequest
): Promise<GetEntityResponse> => {
  try {
    const response = await api.get<GetEntityResponse>(
      `/entity?id=${params.id}`
    );
    return logApiResponse(`/entity [GET]`, response.data);
  } catch (error) {
    return handleApiError(error); // Throws Error with user-friendly message
  }
};

// For list/search endpoints — always POST
export const getEntitiesApi = async (
  data: GetEntitiesRequest
): Promise<GetEntitiesResponse> => {
  try {
    const response = await api.post<GetEntitiesResponse>(`/entity/list`, data);
    return logApiResponse(`/entity/list [POST]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

// For mutations with file upload — use FormData + Bearer token
export const createEntityApi = async (
  formData: FormData,
  accessToken: string
): Promise<CreateEntityResponse> => {
  try {
    const response = await api.post<CreateEntityResponse>("/entity", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return logApiResponse("/entity [POST]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};
```

**Standard API response shape**:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  item?: T; // Single item responses
  items?: T[]; // List responses
  total?: number; // Total count for pagination
  nextToken?: string; // Cursor-based pagination token
}
```

**API type files** (`src/types/`): Each entity has dedicated request/response types following the naming pattern `Get{Entity}Request`, `Get{Entity}Response`, `Create{Entity}Request`, etc.

### 5.3 `@cosmediate/auth` — Authentication Package

**Exports**: AuthProvider, useAuth, useSignIn, useSignUp, useConfirmSignup, useForgotPassword, useResetPassword, useSetNewPassword, useUpdatePassword, useSilentAuth, useSocialAccountsSignin, handleUnauthorizedAccess, ensureApiUnauthorizedInterceptor. Browser IdP redirects use **`getAuthClearSessionUrlClient()`** / **`getAuthSigninUrlClient()`** from **`@cosmediate/config`** (`auth-urls-client.ts`).

**AuthProvider** uses `useReducer` pattern with: `sessionUser`, `userRole`, `session` state. Provides: `handleLogout`, `handleSetSessionUser`, `isSessionLoading`, `isAuthenticated`, `isAuthContextAvailable`.

**Auth flow**: OAuth 2.0 with silent auth (cookie-based sessions), JWT tokens (access, refresh, id), multi-provider linking (email, Google, Facebook, Apple).

### 5.4 `@cosmediate/type-utils` — Domain Types

**Modules**: auth, shared, treatments, clinic, specialist, review, blog, lead, appointment.

**Key types**:

- `UserRole`: `"ADMIN" | "MANAGER" | "SPECIALIST" | "USER"`
- `SessionUser`: `User | Admin | ClinicManager | Specialist`
- `EntityMetadata`: `{ id, entityType, createdAt, updatedAt, deleted?, deletedAt? }`
- `EntitySharedData`: extends `Location, ContactInfo` — includes overview, htmlAbout, faqs, tags, workingHours, certificates, reviews, available, status, pricing, ratings
- `Location`: `{ country, state, city, postalCode, completeAddress }`
- `Clinic`: extends `EntityMetadata, EntitySharedData` — logo, name, images, categories, managers, treatments, specialists
- `Treatment`: extends `EntityMetadata` — categoryId, name, image, overview, published, faqs, tags
- `SelectedTreatment`: extends `EntityMetadata` — treatment + clinic context + subTreatments + treatmentResults
- `Specialist`: extends `EntityMetadata, EntitySharedData` — name, experience, workingType, clinics, treatments
- `Review`: ratings, comments

### 5.5 `@cosmediate/browse-manager` — Browse State Management

Headless state management for browsing, filtering, pagination, and sorting.

**Providers & hooks**:

- `FiltersProvider` / `useFilters` — Search + filter state
- `PreferencesProvider` / `usePreferences` — Sort, view mode (table/grid/list), items per page, table preferences
- `PaginationProvider` / `usePagination` — Cursor-based pagination with page cache
- `useDataFetch` — Coordinator that ties filters/preferences/pagination together and triggers API calls

**Utilities**: `useUrlState`, `useLocalPreferences`, storage helpers, location helpers.

### 5.6 `@cosmediate/form-core` — Form State Management

Zustand-based form store with Zod validation.

**Usage pattern**:

```tsx
const store = createFormStore({
  initialValues: defaultValues,
  schema: MyZodSchema,
});

<FormProvider store={store}>
  <MyForm />
</FormProvider>;
```

**Hooks**: `useFormValue`, `useFormError`, `useFormValues`, `useFormErrors`, `useFormSetValue`, `useFormValidate`, `useFormReset`, `useFormTouch`, `useFormSubmitting`, `useFormCommitAll`, `useFormCommitRegister`, `useFormIsDirty`.

### 5.7 `@cosmediate/form-ui` — Form UI Components

**Controlled fields**: `ControlledTextField`, `ControlledSelectField`, `ControlledSwitchField`, `ControlledDatePickerField`, `ControlledTextareaField`.

**Primitives**: `FormSection`, `FormGrid`, `FieldError`.

### 5.8 `@cosmediate/config` — URL & Env Architecture (Phase 4, May 2026)

Single source of truth for cross-app, cross-TLD URL construction, cookie names/parsers, and proxy session helpers. Per-app **`lib/server/config.ts`** / **`lib/routing/utils.ts`** were **removed in Phase 8** (May 2026); import **`@cosmediate/config`** (and **`@cosmediate/auth-bff`** for CORS) directly. **`apps/auth`** IdP **`lib/server/utils.ts`** uses **`generateAllowedOrigins()`** from **`@cosmediate/config`** (no separate **`config.ts`**).

**Modules** (`packages/config/src/`):

- `tlds.ts` — `COSMEDIATE_TLDS` (`com`, `nl`, `be`, `de`, `fr`, `gr`, `it`), `CLIENT_APPS`, `APP_PORTS`, `APP_SUBDOMAINS`, `generateAllowedOrigins()`.
- `auth-urls.ts` — `getAuthProviderUrl()`, `getAuthSelfUrl()`, `getAuthSigninUrl()`, `getAuthClearSessionUrl()`, `getAuthAuthorizeUrl()`, `getAuthTokenUrl()`, `getAuthLogoutUrl()`, `getAuthRefreshUrl()` (each `getAuth*Url` = origin + **endpoint** path). IdP path overrides: **`AUTH_APP_*_ENDPOINT`** only (sensible defaults if unset).
- `auth-urls-client.ts` — `getAuthProviderOriginClient()`, `getAuthSigninUrlClient()`, `getAuthClearSessionUrlClient()` for **`window.location`** (optional **`NEXT_PUBLIC_AUTH_PROVIDER_URL`**; localhost + prod **`https://auth.cosmediate.com`** fallbacks).
- `client-urls.ts` — `getOrigin(request)`, `getRequestHostname(request)`, `getClientAppUrl(app, request)` (TLD-derived), `getAuthCallbackUrl(request)`.
- `session-refresh-fetch.ts` — `fetchSameOriginSessionRefresh`, `getSetCookieHeaderLines` (proxy merges **`Set-Cookie`** from **`POST /api/auth/refresh`**).
- `proxy-session-gate.ts` — `runProxySessionGate` (**`dashboard`** vs **`public`** semantics), `shouldBypassProxyInfrastructure`, `shouldBypassProxyAuthFlow` — shared **`apps/*/src/proxy.ts`** session + refresh branch.
- `idp-refresh-response.ts` — `parseIdpRefreshSuccessPayload` (client BFF parses IdP refresh JSON).

**Env contract**: `AUTH_PROVIDER_URL` (clients) / `AUTH_SELF_URL` (auth IdP). All `apps/*` URL construction MUST go through this package — direct `process.env.AUTH_PROVIDER_URL` reads in `apps/` are not allowed.

### 5.9 `@cosmediate/auth-bff` — Shared client BFF (Phase 8, May 2026)

**Scope**: **`apps/app`**, **`apps/web`**, **`apps/blog`** only — not the auth IdP (`apps/auth` stays IdP-local).

**Exports**: `createCorsHelpers`, `createExchangeCodeRouteHandlers`, `createGetSessionRouteHandlers`, `createLogoutRouteHandlers`, `createRefreshRouteHandlers`, `createSetPasswordRouteHandlers`, `createUpdatePasswordRouteHandlers`, `getPasswordFlowCredentials`. Depends on **`@cosmediate/config`**, **`@cosmediate/type-utils`**, **`@cosmediate/api`**.

Client apps keep thin **`route.ts`** files (factory + config); **`apps/*/src/lib/server/cors.ts`** re-exports **`createCorsHelpers(generateAllowedOrigins())`** for **`/auth/signin`** and other routes outside this package.

---

## 6. Design System & Theming

### 6.1 Color System

**Primary brand color**: `#6968EC` (purple/violet)

| Token                | Light     | Dark      |
| -------------------- | --------- | --------- |
| `--primary`          | `#6968EC` | `#6968EC` |
| `--background`       | `#FFFFFF` | `#282828` |
| `--foreground`       | `#282828` | `#F1F2F3` |
| `--card`             | `#FFFFFF` | `#3E4147` |
| `--secondary`        | `#F2F5FF` | `#444753` |
| `--muted`            | `#F3F6FF` | `#444753` |
| `--muted-foreground` | `#71788E` | `#AEB2BF` |
| `--border`           | `#DADAFC` | `#585C6A` |
| `--destructive`      | `#FF6262` | `#FF6262` |

**Custom color scale** (grayscale): `--color-100` through `--color-900` (lightest to darkest)
**Custom accent colors**: `primary-accent`, `primary-accent-lite`, `primary-accent-soft`, `primary-accent-dark`, `ghost-white`, `ghost-blue`, `ghost-blue-2`, `gray-card`, `danger`, `stroke`, `cloud`

### 6.2 Typography

- **Primary font**: Montserrat (`--font-montserrat`)
- **Secondary font**: Raleway (`--font-raleway`) — used in app dashboard
- **Applied via**: `font-montserrat` Tailwind class on `<body>`

### 6.3 Scrollbar Styling

Custom scrollbar classes: default (5px purple), `.overflow-lite` (thin), `.overflow-transparent` (hidden)

### 6.4 Gradient Classes

- `.hero-gradient` — Homepage hero section gradient
- `.bg-gradient-lite-violet` — Subtle violet gradient
- `.banner-gradient` — Dark overlay gradient

---

## 7. Code Conventions & Patterns

### 7.1 File & Naming Conventions

| Type            | Convention                | Example                       |
| --------------- | ------------------------- | ----------------------------- |
| Components      | PascalCase.tsx            | `ClinicCard.tsx`              |
| Pages (Next.js) | page.tsx, layout.tsx      | `page.tsx`                    |
| Feature index   | index.tsx                 | `features/HomePage/index.tsx` |
| Hooks           | use\*.ts                  | `useHomePageData.ts`          |
| API files       | entity.api.ts             | `clinics.api.ts`              |
| Type files      | entity.types.ts           | `clinic.types.ts`             |
| Schema files    | entityForm.schema.ts      | `clinicForm.schema.ts`        |
| Default values  | entity.defaults.ts        | `clinic.defaults.ts`          |
| Constants       | entity.constants.ts       | `clinic.constants.ts`         |
| Config files    | descriptiveName.config.ts | `browseLayout.config.ts`      |
| Styles          | \*.styles.css             | `homepage.styles.css`         |
| Context files   | \*Context.tsx             | `AppContext.tsx`              |
| Providers       | providers.tsx             | `context/providers.tsx`       |

### 7.2 Component Patterns

```tsx
// Standard component pattern
"use client"; // Only when needed (hooks, browser APIs, interactivity)

import { useState } from "react";
import { Button } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

interface MyComponentProps {
  title: string;
  onSubmit: () => void;
}

export function MyComponent({ title, onSubmit }: MyComponentProps) {
  const [state, setState] = useState("");

  return (
    <div className={cn("base-classes", conditionalClass && "conditional")}>
      <h1>{title}</h1>
      <Button onClick={onSubmit}>Submit</Button>
    </div>
  );
}
```

### 7.3 Context Pattern (useReducer)

Every context in this project follows a consistent pattern:

```tsx
"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";

// 1. State interface
interface MyState { /* ... */ }

// 2. Action interface
interface MyAction {
  type: string;
  payload?: /* ... */;
}

// 3. Context type (what consumers get)
interface MyContextType {
  // Setters
  setX: (value: X) => void;
  // State
  x: X;
}

// 4. Initial state
const initialState: MyState = { /* ... */ };

// 5. Context
export const MyContext = createContext<MyContextType | undefined>(undefined);

// 6. Reducer
const reducer = (state: MyState, action: MyAction): MyState => {
  switch (action.type) {
    case "SET_X":
      return { ...state, x: action.payload as X };
    default:
      return state;
  }
};

// 7. Hook that builds context value (named *Comp)
const MyComp = (): MyContextType => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setX = (value: X) => dispatch({ type: "SET_X", payload: value });

  return { setX, x: state.x };
};

// 8. Provider
const MyProvider = ({ children }: { children: ReactNode }) => {
  const contextValue = MyComp();
  return <MyContext.Provider value={contextValue}>{children}</MyContext.Provider>;
};

// 9. Hook
export const useMy = (): MyContextType => {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error("useMy must be used within a MyProvider");
  }
  return context;
};

export default MyProvider;
```

### 7.4 Feature Module Pattern (web app)

```
features/FeatureName/
├── index.tsx           — Main feature component (default export)
├── components/         — Sub-components
├── hooks/              — Feature-specific hooks
├── constants/          — Feature constants
├── styles/             — Feature CSS files
└── lib/                — Feature utilities
```

### 7.5 Tenant Section Pattern (app dashboard)

```
tenants/{Role}/sections/{SectionName}/
├── pages/              — Page components (index.tsx = list, Add*.tsx, Update*.tsx, *Profile.tsx)
├── components/         — Section-specific components
├── config/             — browseLayout.config.ts, tables.config.tsx, profileSections.config.ts
├── schemas/            — Zod schemas (*Form.schema.ts)
├── defaults/           — Default form values (*. defaults.ts)
├── constants/          — Field definitions, enums (*.constants.ts)
└── types/              — Section types (*FormValues, *FormProps)
```

### 7.6 Browse/List Page Pattern

Pages that list entities use `@cosmediate/browse-manager` with `BrowseContent` layout:

```tsx
const MyListPage = () => {
  const { setConfig: setPrefsConfig, viewMode } = usePreferences();
  const { setConfig: setFiltersConfig } = useFilters();
  const { setScope, refetch } = usePagination();

  const config = useMemo(() => buildMyBrowseLayoutConfig(), []);

  const handleFetch = useCallback(
    async (params: FetchParams): Promise<FetchResponse<MyEntity>> => {
      const res = await getEntitiesApi({
        pagination: params.pagination,
        search: params.search,
        filters: params.filters,
        sort: params.sort,
      });
      return {
        items: res.items,
        total: res.total || 0,
        nextToken: res.nextToken,
      };
    },
    []
  );

  useEffect(() => {
    setFiltersConfig(config.filters);
    setPrefsConfig(config.preferences);
    setScope(config.filters.scope);
  }, [config]);

  return (
    <BrowseContent
      columns={MyColumns(handleDelete, viewMode)}
      fetchData={handleFetch}
    />
  );
};
```

### 7.7 Form Page Pattern

```tsx
// Schema: schemas/entityForm.schema.ts
export const EntityFormSchema = z.object({
  /* ... */
});

// Types: types/entity.types.ts
export type EntityFormValues = z.infer<typeof EntityFormSchema>;
export interface EntityFormProps {
  initialData?: Partial<Entity>;
  onSubmit: (data: Partial<EntityFormValues>) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  mode?: "create" | "update";
}

// Defaults: defaults/entity.defaults.ts
export const defaultEntityFormValues: EntityFormValues = {
  /* ... */
};

// Usage in form page
const store = createFormStore({
  initialValues: defaultEntityFormValues,
  schema: EntityFormSchema,
});
<FormProvider store={store}>
  {" "}
  <EntityForm />{" "}
</FormProvider>;
```

### 7.8 Toast Pattern

```tsx
import { Toaster } from "@cosmediate/ui";
Toaster("Title", "success" | "error" | "info", "Description", options?);
```

### 7.9 Dialog Pattern

```tsx
import { useDialog } from "@app/context/dialog/DialogProvider";
const { openDialog, closeDialog, updateDialogPayload } = useDialog();

openDialog({
  dialogType: "delete",
  payload: {
    onConfirm: async () => {
      /* ... */
    },
  },
});
```

---

## 8. Import Conventions

### 8.1 Path Aliases

| App/Package | Alias                      | Maps to                           |
| ----------- | -------------------------- | --------------------------------- |
| web         | `@web/*`                   | `./src/*`                         |
| app         | `@app/*`                   | `./src/*`                         |
| app         | `@app/admin/*`             | `./src/tenants/Admin/*`           |
| app         | `@app/clinic/*`            | `./src/tenants/Clinic/*`          |
| app         | `@app/user/*`              | `./src/tenants/User/*`            |
| all apps    | `@cosmediate/ui/*`         | `../../packages/ui/src/*`         |
| all apps    | `@cosmediate/auth/*`       | `../../packages/auth/src/*`       |
| all apps    | `@auth-core/*`             | `../../packages/auth/src/*`       |
| all apps    | `@cosmediate/api/*`        | `../../packages/api/src/*`        |
| all apps    | `@cosmediate/type-utils/*` | `../../packages/type-utils/src/*` |
| all apps    | `@cosmediate/header/*`     | `../../packages/header/src/*`     |
| all apps    | `@cosmediate/footer/*`     | `../../packages/footer/src/*`     |

### 8.2 Import Order Convention

1. React / Next.js imports
2. Third-party library imports
3. `@cosmediate/*` package imports
4. App-level alias imports (`@web/*`, `@app/*`, `@app/admin/*`, etc.)
5. Relative imports
6. Style imports (last)

---

## 9. Backend Integration

### 9.1 AWS Services

| Service        | Purpose                                  |
| -------------- | ---------------------------------------- |
| AWS Cognito    | User authentication, OAuth               |
| AWS DynamoDB   | NoSQL database (single-table)            |
| AWS OpenSearch | Full-text search, autocomplete           |
| AWS S3         | Image/file storage                       |
| AWS Lambda     | Serverless API functions                 |
| API Gateway    | REST API proxy                           |
| Vercel         | Frontend deployment (all 4 Next.js apps) |

### 9.2 API Endpoints Pattern

| Method | Pattern                  | Purpose                 |
| ------ | ------------------------ | ----------------------- |
| GET    | `/{entity}?id={id}`      | Get single item         |
| POST   | `/{entity}/list`         | Search/filter/paginate  |
| POST   | `/{entity}`              | Create (often FormData) |
| PUT    | `/{entity}`              | Update (often FormData) |
| DELETE | `/{entity}?id={id}`      | Delete                  |
| GET    | `/{entity}/popular`      | Popular items           |
| GET    | `/{entity}/top-searched` | Top searched items      |

### 9.3 Authentication

- OAuth 2.0 with custom Identity Provider (auth app)
- Cookie-based sessions with silent auth refresh
- JWT tokens: `accessToken`, `refreshToken`, `idToken`
- Protected API calls require `Authorization: Bearer {accessToken}` header
- Role-based access: ADMIN, MANAGER, SPECIALIST, USER

---

## 10. Environment Variables

Key env vars used across apps (defined in `.env.local`, `.env.development`, `.env.production`):

- `NEXT_PUBLIC_BACKEND_URL` — API base URL
- `NEXT_PUBLIC_COGNITO_APP_CLIENT_ID` — Cognito OAuth client ID
- `NEXT_PUBLIC_COGNITO_DOMAIN` — Cognito hosted UI domain
- `NEXT_PUBLIC_COGNITO_OAUTH_REDIRECT_URI` — OAuth callback URL
- `NEXT_PUBLIC_COGNITO_OAUTH_PATH` — OAuth path
- `NEXT_PUBLIC_SOCKET_URL` — WebSocket server URL
- `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` — Google Maps API key
- `NEXT_PUBLIC_AUTH_EXCHANGE_CODE_PATH` — Auth code exchange path
- `AUTH_SELF_URL` — Auth app's own public URL (auth IdP only, server-side)
- `AUTH_PROVIDER_URL` — URL where the auth IdP lives (client apps only, server-side)
- `NEXT_PUBLIC_AUTH_PROVIDER_URL` — Optional; mirrors **`AUTH_PROVIDER_URL`** when browser redirects need an explicit IdP origin (otherwise localhost / **`https://auth.cosmediate.com`** defaults apply via **`getAuthClearSessionUrlClient()`**).
- `AUTH_CLIENT_ID` / `AUTH_CLIENT_SECRET` — OAuth client credentials (server-side)
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` — AWS credentials (auth app server-side)
- `DYNAMODB_AUTH_TABLE_NAME`, `DYNAMODB_CLIENT_TABLE_NAME` — DynamoDB tables (auth app)

---

## 11. Commands

```bash
# Development
pnpm dev                         # Run all apps
pnpm --filter=web run dev        # Run web app (port 3000)
pnpm --filter=app run dev        # Run app dashboard (port 3003)
pnpm --filter=auth run dev       # Run auth server (port 3002)
pnpm --filter=blog run dev       # Run blog app (port 3001)

# Build & Quality
pnpm build                       # Build all apps
pnpm lint                        # Lint all apps
pnpm format                      # Format with Prettier

# Add shadcn/ui component (to shared UI package)
pnpm dlx shadcn@canary add <component-name>
```

---

## 12. Rules for AI Agents

### DO

- Use TypeScript for all files — strict mode is enabled
- Use functional components with hooks
- Use named exports for components
- Use the `@cosmediate/ui` package for all UI components — never install shadcn/ui directly in apps
- Use `@cosmediate/api` for all backend API calls — never create axios instances in apps
- Use `@cosmediate/type-utils` for shared domain types
- Use `@cosmediate/form-core` + `@cosmediate/form-ui` for forms with Zod schemas
- Use `@cosmediate/browse-manager` for list/browse/filter/pagination pages
- Follow the established context pattern (useReducer + createContext + _Comp function + Provider + use_ hook)
- Follow the tenant section structure for new dashboard sections
- Follow the feature module structure for new web features
- Use `cn()` from `@cosmediate/ui/lib/utils` for conditional class merging
- Use Tailwind CSS utilities — never write raw CSS unless for animations/gradients
- Use `Toaster()` from `@cosmediate/ui` for toast notifications
- Use `sonner` for low-level toast control (dismiss, etc.)
- Use PascalCase for components, camelCase for functions/variables, UPPER_SNAKE_CASE for constants
- Add `"use client"` directive only when the component uses hooks, browser APIs, or interactivity
- Use the standard import order convention
- Prefer `workspace:*` for internal package dependencies
- Use `console.error("[ContextTag] Message")` pattern for error logging with context tags

### DON'T

- Don't install component libraries directly in apps — add to `@cosmediate/ui` package
- Don't create new axios instances — use the shared one from `@cosmediate/api`
- Don't define domain types in apps — add to `@cosmediate/type-utils`
- Don't use inline styles — use Tailwind classes
- Don't use `useState` for complex state — use `useReducer` pattern in contexts
- Don't hardcode API URLs — use environment variables
- Don't skip the loading/error states — every async page needs loader skeletons
- Don't add new colors outside the design system — use CSS variables
- Don't use default exports for non-page components (pages use default export by convention)
- Don't forget `"use client"` when using hooks in components
- Don't put business logic in route files (`page.tsx`) — delegate to feature/tenant components

---

## 13. Authentication System Reference (Phase 1 + 2 complete, Apr 2026)

> Full deep dive in `AUTH_SYSTEM_MASTER_PLAN.md`. This section is the AI lookup table — read this first instead of grepping.

### 13.1 High-level flow

User hits client app (`web` / `app` / `blog`) → unauthenticated request to client's `/auth/signin` route (**`@cosmediate/header`** adds **`?return_to=<path>`** from the current URL when users click **Sign In**, so they return after OAuth) → 302 to **auth IdP** (`apps/auth`, separate Vercel deployment, `auth.cosmediate.com`) → IdP validates credentials against AWS Cognito → IdP issues `oauthCode` (one-time) + sets **`cos_idp_*`** session scalars on auth domain → 302 back to client's `/auth/processing` page with `?code=…` → client's `/api/auth/exchange-code` POSTs to IdP `/api/auth/token` → IdP returns scalars + **`redirect_to`** → client sets **`cos_*`** session scalars → browser navigates to **`redirect_to`** (derived from **`return_to`**, **`safePostAuthRedirect`** guards open redirects).

**Dashboard (`apps/app`)** unauthenticated **`proxy.ts`** redirects already pass **`return_to`** as **`pathname + search`** (`runProxySessionGate`).

Silent re-auth on each page load: `useSilentAuth` hits client's `/api/auth/get-session` (BFF) which reads **`cos_*`** cookies and returns the session. If expired, the hook calls `handle-unauthorized-access` → best-effort POST `/api/auth/logout` with **`access_token`** → hard-redirect to IdP **`/oauth/clear-session`** (`getAuthClearSessionUrlClient()`), then **`/signin`** by default.

Voluntary **`AuthProvider.handleLogout`**: same BFF POST + IdP **`/oauth/clear-session`** chain (Phase 9).

### 13.2 Cookies

All session state is **six httpOnly scalars** per surface — see **`CLIENT_SESSION_COOKIE`** / **`IDP_SESSION_COOKIE`** in **`packages/config/src/auth-cookies.ts`**. No JSON blob cookies and **no** legacy `session_*` / `idp_session_*` names in active code paths.

| Cookie names | Domain | Set by | Read by | Purpose |
| ------------ | ------ | ------ | ------- | ------- |
| **`cos_session_id`**, **`cos_user_id`**, **`cos_user_role`**, **`cos_access_token`**, **`cos_token_exp`**, **`cos_refresh_exp`** | client (`web` / `app` / `blog`) | `/api/auth/exchange-code`, `/api/auth/refresh` | BFF routes, **`proxy.ts`**, **`useSilentAuth`** (via get-session) | Client session gate + API bearer (`cos_access_token`). |
| **`cos_idp_session_id`**, **`cos_idp_user_id`**, **`cos_idp_user_role`**, **`cos_idp_access_token`**, **`cos_idp_token_exp`**, **`cos_idp_refresh_exp`** | auth IdP | `/api/auth/signin`, `/api/auth/refresh`, logout clears | `/oauth/authorize` (SSO), `/api/auth/session` | IdP session + SSO fast path. |
| **`cos_oauth_code`** | auth IdP | `/oauth/authorize` | `/api/auth/signin`, `/api/auth/token` | One-time OAuth code (N1 rename from `auth_context_id`). |
| **`client_auth_ctx`** | auth IdP | `/oauth/authorize` | `/api/auth/token` | OAuth context pointer (**N2**: rename/remove **`cos_oauth_request`** deferred). |

**Historical**: Phase 1 split large IdP user JSON into plain **`userId`/`userRole`** for authorize; Phase 6 replaced blobs with these **`cos_*`** / **`cos_idp_*`** scalars everywhere (legacy shim removal **P12-6**, May 2026).

### 13.3 OAuth URL params (contract)

| Param               | Direction                                                  | Carries                                   | Notes                                                                          |
| ------------------- | ---------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------ |
| `code`              | IdP → client `/auth/processing`                            | One-time OAuth code                       | OAuth-spec mandated name. JS var: `oauthCode` (renamed from `authCode` in N1). |
| `return_to`         | client → IdP `/oauth/authorize` → echoed in token exchange | Post-auth redirect target                 | Renamed from `redirect_after_auth` (N3). JS var: `returnTo`.                   |
| `error_description` | IdP → client signin / clear-session                        | Human-readable error                      |                                                                                |
| `mode`              | various                                                    | Flow context (e.g. unauthorized, expired) | Used by `ClearSession.tsx`.                                                    |

### 13.4 Auth IdP routes (`apps/auth/src/app/`)

All API routes are under `/api/auth/*` after Phase 2 Step 8 (Apr 26, 2026). Old paths (`/api/signin`, `/api/oauth/token`, `/api/logout`, etc.) **DO NOT EXIST** anymore.

| Route                              | Method | Purpose                                                                                                                                 | Called by                                                                 |
| ---------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `/api/auth/signin`                 | POST   | Authenticate creds, issue IdP cookies + `cos_oauth_code`                                                                                | `useSignIn` hook (auth UI)                                                |
| `/api/auth/signup`                 | POST   | Create Cognito user                                                                                                                     | `useSignUp`                                                               |
| `/api/auth/confirm-signup`         | POST   | Verify email code                                                                                                                       | `useConfirmSignup`                                                        |
| `/api/auth/confirm-signup/resend`  | POST   | Resend email code                                                                                                                       | `useResendSignupCode`                                                     |
| `/api/auth/forgot-password`        | POST   | Send reset email                                                                                                                        | `useForgotPassword`                                                       |
| `/api/auth/forgot-password/resend` | POST   | Resend reset email                                                                                                                      | `useResendForgotPasswordCode`                                             |
| `/api/auth/reset-password`         | POST   | Apply reset code + new password                                                                                                         | `useResetPassword`                                                        |
| `/api/auth/set-password`           | POST   | First-time password set (federated → password user)                                                                                     | client BFF `/api/auth/set-password`                                       |
| `/api/auth/update-password`        | POST   | Authenticated password change                                                                                                           | client BFF `/api/auth/update-password`                                    |
| `/api/auth/logout`                 | POST   | **Bearer `access_token`**; body may omit **`redirect_uri`** (IdP defaults to **`${AUTH_SELF_URL}/signin`** for backend). Clears IdP cookies on response.                                                 | client BFFs `/api/auth/logout`                                            |
| `/api/auth/token`                  | POST   | OAuth token exchange (`code` → JWTs + user)                                                                                             | client BFFs `/api/auth/exchange-code`                                     |
| `/api/auth/session`                | GET    | Read IdP session from cookies                                                                                                           | `useSilentAuth` (when running in auth app context)                        |
| `/api/auth/refresh`                | POST   | Rotate access token from backend using `sessionId` (body or cookies); updates IdP **`cos_idp_*`** when applicable                       | client BFFs `/api/auth/refresh`, **`apps/*/proxy.ts`** same-origin refresh |
| `/api/_ping`                       | GET    | Health check                                                                                                                            | Vercel uptime                                                             |
| `/oauth/authorize`                 | GET    | OAuth authorize endpoint (SSO fast path if IdP cookies exist)                                                                           | client `/auth/signin` redirect                                            |
| `/oauth/clear-session`             | GET    | **Cross-origin browser-redirect cookie cleanup** — clears **`cos_idp_*`** session scalars (+ flow cookies) on auth domain via `Set-Cookie` deletion in redirect response; optional same-origin **`return_to`** path (default **`/signin`**) | `handle-unauthorized-access` (`window.location.href`), `AuthProvider.handleLogout`, `ClearSession.tsx` |

**DO NOT** add a `DELETE /api/auth/session` to replace `/oauth/clear-session` — DELETE cannot be invoked via `<a href>` / `window.location`, which is required for cross-origin browser cookie clearing. (Phase 2 master plan said to merge them; that part of the plan was wrong, see Step 8 deviation note.)

### 13.5 Client BFF routes (`apps/{web,app,blog}/src/app/api/auth/`)

These are server-side proxies on the client domain. They read **`cos_*`** cookies, call the IdP server-to-server, and translate responses.

| Route                       | Method | Purpose                                                                                               |
| --------------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| `/api/auth/exchange-code`   | POST   | Receives `code`, calls IdP `/api/auth/token`, sets **`cos_*`** scalars, returns **`redirect_to`**.                 |
| `/api/auth/get-session`     | GET    | Reads **`cos_*`** cookies, returns session. (To be renamed `session` in P2-4 — separate task.) |
| `/api/auth/refresh`       | POST   | Proxies to IdP `/api/auth/refresh`; refreshes **`cos_*`** token scalars on success. Called server-side from **`proxy.ts`** when access expired but refresh window valid. |
| `/api/auth/logout`          | POST   | Body **`{ access_token }`** (camelCase **`accessToken`** accepted). Calls IdP with **Bearer** + empty JSON body; clears client **`cos_*`** cookies; returns **`{ success: true }`**.                                      |
| `/api/auth/set-password`    | POST   | (`apps/app` only) Proxies to IdP `/api/auth/set-password` with `accessToken` from cookies.            |
| `/api/auth/update-password` | POST   | (`apps/app` only) Proxies to IdP `/api/auth/update-password`.                                         |

### 13.6 Hooks (`packages/auth/src/hooks/`)

| Hook                          | Fetches                                                       | Used in                                                                         |
| ----------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `useSignIn`                   | `/api/auth/signin` (relative — auth domain)                   | auth UI signin form                                                             |
| `useSignUp`                   | `/api/auth/signup`                                            | auth UI signup form                                                             |
| `useConfirmSignup`            | `/api/auth/confirm-signup`                                    | auth UI confirm-signup                                                          |
| `useResendSignupCode`         | `/api/auth/confirm-signup/resend`                             | auth UI confirm-signup                                                          |
| `useForgotPassword`           | `/api/auth/forgot-password`                                   | auth UI forgot-password                                                         |
| `useResendForgotPasswordCode` | `/api/auth/forgot-password/resend`                            | auth UI                                                                         |
| `useResetPassword`            | `/api/auth/reset-password`                                    | auth UI reset-password                                                          |
| `useSetNewPassword`           | `/api/auth/set-password` (relative — client domain BFF)       | `apps/app` first-time password flow                                             |
| `useUpdatePassword`           | `/api/auth/update-password` (relative — client domain BFF)    | `apps/app` change-password UI                                                   |
| `useSilentAuth`               | `/api/auth/get-session` (relative — whichever app it runs in) | `AuthProvider` (every app)                                                      |
| `useSocialAccountsSignin`     | Cognito federation URLs                                       | auth UI social buttons (Google live, Facebook/Apple stubs deferred to Phase 13) |

`AuthProvider.handleLogout` and `lib/handle-unauthorized-access.ts` POST **`{ access_token }`** to `/api/auth/logout` (client BFF), then hard-redirect to **`getAuthClearSessionUrlClient()`** (`NEXT_PUBLIC_AUTH_PROVIDER_URL` optional).

### 13.7 Auth env var contract

| Var                                                        | Used by                                | Value example                                                        |
| ---------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| `AUTH_SELF_URL`                                            | auth IdP only                          | `https://auth.cosmediate.com` (prod) / `http://localhost:3002` (dev) |
| `AUTH_PROVIDER_URL`                                        | client apps (web/app/blog)             | Same host as `AUTH_SELF_URL`                                         |
| `NEXT_PUBLIC_AUTH_PROVIDER_URL`                            | browser (`AuthProvider`, unauthorized) | Optional override when auth origin differs from localhost / prod default **`https://auth.cosmediate.com`** |
| `AUTH_CLIENT_ID` / `AUTH_CLIENT_SECRET`                    | client apps                            | Per-app OAuth creds (different per app, different per env)           |
| `AUTH_REDIRECT_PATH`                                       | client apps                            | `/auth/processing` (where IdP redirects back to with `?code=`)       |
| `AUTH_APP_TOKEN_ENDPOINT`                                  | client apps                            | `/api/auth/token` (override; default in code if unset) |
| `AUTH_APP_LOGOUT_ENDPOINT`                                 | client apps                            | `/api/auth/logout` (override; default in code if unset) |
| `AUTH_APP_AUTHORIZE_ENDPOINT`                               | client apps                            | `/oauth/authorize` (override; default in code if unset) |
| `AUTH_APP_REFRESH_ENDPOINT`                                | client apps                            | `/api/auth/refresh` (override; default in code if unset) |
| `NEXT_PUBLIC_AUTH_HEARTBEAT`                               | browser (`useSilentAuth`)              | `"true"` enables optional 5‑minute session refetch interval                             |
| `DEBUG_AUTH`                                               | all apps (in `turbo.json` `globalEnv`) | `true` enables verbose `debugAuth()` logs                            |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | auth IdP only                          | AWS creds for Cognito calls                                          |
| `DYNAMODB_AUTH_TABLE_NAME`, `DYNAMODB_CLIENT_TABLE_NAME`   | auth IdP only                          | Auth tables (sessions + OAuth contexts)                              |

Cognito-related `NEXT_PUBLIC_COGNITO_*` vars (client id, domain, OAuth path, redirect URI) are also in client `.env.*` files for federated provider buttons — but the actual OAuth flow goes through the auth IdP, not Cognito's hosted UI directly.

### 13.8 Phase status

> Single source of truth: master plan §1.A. Snapshot below is a quick lookup for AI agents.

| Phase | Title                          | Status   | Notes                                                                                                             |
| ----- | ------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------- |
| 1     | Kill the Redirect Loop         | ✅ done  | Cookie split on IdP for authorize fast-read (historical); superseded by **`cos_idp_*`** / **`cos_*`** scalars (P6 + P12-6). Apr 2026.                                          |
| 2     | Standardize names/routes/env   | ✅ done  | All 8 steps. Apr 26, 2026. See §13.8.1 below for the highlights.                                                  |
| 3     | Error Handling Standardization | ✅ done  | One contract (`AuthErrorCode`, `authError`, `authSuccess`, `parseAuthResponse`, `AuthHookResult`). May 4, 2026.   |
| 4     | Config & URL Architecture      | ✅ done  | `@cosmediate/config` package; all `apps/*` URL construction routed through it. May 4, 2026.                       |
| 5     | Data Layer Refactor            | ✅ done  | `AuthTokens.expiresAt` now `number` (canonical). `SessionTokens` slim subset added. May 4, 2026.                  |
| 6     | Cookie & Session Redesign      | ✅ done  | Six scalar cookies (4+2), IdP `cos_idp_*`, snake_case token boundary, `@cosmediate/config` cookie module. Legacy cookie reads/DDB nested mapper removed (**P12-6**, May 2026 pre-prod). |
| 7     | Refresh Tokens                 | ✅ done  | Silent `/api/auth/refresh` (IdP + client BFFs), proxy merge `Set-Cookie`, `getAuthRefreshUrl`, visibility refetch + optional `NEXT_PUBLIC_AUTH_HEARTBEAT`, `ensureApiUnauthorizedInterceptor`. May 2026. Backend must honor `POST /auth/tokens/refresh` or `/auth/refresh` fallback (see IdP `refresh-tokens.ts`). |
| 8     | Shared Auth-BFF Package        | ✅ done  | `@cosmediate/auth-bff`: client route factories + CORS; tri-app **`lib/server/{config,utils}`** + **`lib/routing/utils`** removed. IdP unchanged. May 2026. Optional follow-up: **`/auth/signin` GET** factory, route renames **`exchange-code`→`exchange`**. |
| 9     | Logout — Unified               | ✅ done  | Unified BFF **`access_token`** body; IdP optional **`redirect_uri`** (defaults **`${AUTH_SELF_URL}/signin`**); **`logoutUrl`** removed; **`getAuthClearSessionUrlClient`**; legacy **`packages/auth/src/lib/utils.ts`** deleted; **`mode=clear_session`** dropped from client **`/auth/signin`**. May 2026. |
| 10    | Client Route Protection        | ✅ scoped | **Web/blog**: intentionally **public only** — no middleware route guards. **`return_to`** after OAuth: **`@cosmediate/header`** Sign In links append current path + query (**May 2026**); **`apps/app`** **`proxy.ts`** already passes **`pathname + search`** when redirecting unauthenticated dashboard traffic (`runProxySessionGate`). Future member-only areas → extend **`proxy.ts`** / config list. |
| 11    | OAuth Hardening & Security      | ✅ partial | **P11 core (May 2026):** IdP **`claimOAuthContextForTokenExchange`** + crypto **`oauthCode`** + **`redirect_uri`/`client_id`** binding + **`invalid_grant` 400**. **Open:** **`state`**, **PKCE**, optional reCAPTCHA server verify (**P11-7**). See **`AUTH_SYSTEM_MASTER_PLAN.md`** §13. |
| 12    | Scalability & Cleanup          | ✅ done  | **`generateAllowedOrigins()`** + doc sync + legacy shim removal (**P12-1…P12-6**). May 2026. See **`AUTH_SYSTEM_MASTER_PLAN.md`** §14. |
| 13    | Social Login                   | ⬜       | Last — backend Cognito work required first.                                                                       |

#### 13.8.1 Phase 2 highlights (kept for grep)

1. ✅ A2 unauthorized-access flow (`handle-unauthorized-access.ts`)
2. ✅ N5 `refiredtToAuthSignin` → `redirectToSignin`
3. ✅ Cleanup sweep (audit items A8, L1-L7, M1-M8 — 13 items)
4. ✅ N3 `redirect_after_auth` → `return_to` (URL param + JS var + DynamoDB attr)
5. ✅ N1 `authCode` → `oauthCode` + cookie `auth_context_id` → `cos_oauth_code`
6. ✅ N4 env split: `AUTH_BASE_URL` → `AUTH_SELF_URL` (auth) + `AUTH_PROVIDER_URL` (clients)
7. ✅ F2/F3 `processing/` → `Processing/` (PascalCase) + `apps/app` features dir created
8. ✅ Auth route reorg under `/api/auth/*` (10 routes moved)

#### 13.8.2 Still deferred

- **A6** → **✅ resolved by product scope (May 2026):** **`web`**/**`blog`** remain fully public — no **`proxy.ts`** auth gate. **`return_to`** for marketing UX is handled via **`@cosmediate/header`** (`buildSignInHref`) + existing OAuth **`redirect_to`** chain; **`apps/app`** dashboard gate unchanged (`runProxySessionGate` **`mode: "dashboard"`**).
- **M2** (Facebook / Apple stubs) → Phase 13.
- **P2-4** (client app `get-session` → `session` rename) → standalone task.
- **P2-5** — **`AUTH_APP_*_ENDPOINT`** only for IdP path overrides (**`AUTH_APP_*_PATH`** removed from code and `turbo.json` May 2026).
- **N2** (`client_auth_ctx` → `cos_oauth_request`) → still open; revisit with P11 / session cookie redesign follow-ups.

### 13.9 Known non-blocking polish items

Still TODO but doesn't block any phase:

- Log strings in moved auth routes still say `[auth:/api/signin]` instead of `[auth:/api/auth/signin]` (debugging-only, functional code is correct).
- ~~Middleware honouring **`return_to`**~~ — **`✅ May 2026`**: **`@cosmediate/header`** Sign In URLs include **`return_to`** (path + query); IdP token payload **`redirect_to`** already consumed by **`/auth/processing`**. Dashboard **`proxy.ts`** continues to set **`return_to`** on forced sign-in redirects.
- **`apps/{app,web,blog}`** deprecated **`lib/server/config.ts`** / **`lib/server/utils.ts`** / **`lib/routing/utils.ts`** — **removed Phase 8** (May 2026). Use **`@cosmediate/config`** + **`apps/*/src/lib/server/cors.ts`** (`createCorsHelpers`). **`apps/auth`** keeps **`lib/server/utils.ts`** only (IdP CORS — **`generateAllowedOrigins()`** from **`@cosmediate/config`**); **`lib/server/config.ts`** removed **P12-6**.

### 13.10 Bug fixes bundled into Phase 2

- `apps/auth/src/features/ClearSession.tsx` was calling non-existent `/api/oauth/clear-session`; fixed to `/oauth/clear-session` in Step 8.
- Token route + signin route had `client_secret` and full `oAuthContext` leaking to logs; gated behind `DEBUG_AUTH=true` in Step 3 (L1).
- Signin route used unsafe `signInResponse?.user.id` after `success:true`; now properly asserts (L5).
- `/api/signin` no longer fabricates `/dashboard` redirect when `auth_context_id` is missing — returns `400 invalid_request` (M6).
