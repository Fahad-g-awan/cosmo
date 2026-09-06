# Architecture Setup - Cosmediate Frontend

**Version:** 2.0.0  
**Last Updated:** December 11, 2024  
**Status:** In Development

---

## 📋 Overview

Cosmediate frontend follows a **modern monorepo architecture** using Turborepo, with multiple Next.js applications and shared packages. This document outlines the architectural decisions, patterns, and structure of the codebase.

---

## 🏗️ Architecture Pattern

### Monorepo Strategy

**Pattern:** Multi-App Monorepo with Shared Packages

```
┌─────────────────────────────────────────────┐
│          Turborepo Monorepo                 │
├─────────────────────────────────────────────┤
│  Apps Layer (Consumer Layer)                │
│  ├─ web      (Public Website)               │
│  ├─ app      (User Dashboard)               │
│  ├─ auth     (Authentication)               │
│  └─ blog     (Content Platform)             │
├─────────────────────────────────────────────┤
│  Packages Layer (Shared Code)               │
│  ├─ ui               (Component Library)    │
│  ├─ header           (Global Header)        │
│  ├─ footer           (Global Footer)        │
│  ├─ typescript-config (TS Configs)          │
│  └─ eslint-config    (Lint Configs)         │
├─────────────────────────────────────────────┤
│  Backend Integration (API Layer)            │
│  └─ AWS Services via API Gateway            │
└─────────────────────────────────────────────┘
```

**Why Monorepo?**

- **Code Sharing**: Share components, utilities, and configs across apps
- **Atomic Changes**: Update shared code and all consumers in one commit
- **Type Safety**: Full TypeScript support across package boundaries
- **Build Optimization**: Turborepo caches and parallelizes builds
- **Developer Experience**: Single repository, unified tooling

---

## 📁 Project Structure

### High-Level Structure

```
cosmediate/
├── apps/                           # Applications
│   ├── web/                        # Main public website (Port 3000)
│   │   ├── src/
│   │   │   ├── app/                # Next.js App Router
│   │   │   ├── features/           # Feature-based modules
│   │   │   │   └── HomePage/       # Homepage feature
│   │   │   │       ├── components/ # Feature components
│   │   │   │       ├── constants/  # Feature constants
│   │   │   │       ├── styles/     # Feature styles
│   │   │   │       └── index.tsx   # Feature entry
│   │   │   ├── components/         # Global components
│   │   │   ├── hooks/              # Custom hooks
│   │   │   └── lib/                # Utilities
│   │   └── public/                 # Static assets
│   │
│   ├── app/                        # Multi-tenant dashboards (In Development)
│   ├── auth/                       # OAuth 2.0 Identity Provider (Implemented)
│   └── blog/                       # Content platform (Base Setup Complete)
│
├── packages/                       # Shared packages
│   ├── ui/                         # Component library
│   │   └── src/
│   │       ├── components/
│   │       │   ├── ui/             # shadcn components
│   │       │   └── custom/         # Custom components
│   │       ├── lib/                # Utilities
│   │       ├── hooks/              # Custom hooks
│   │       └── styles/             # Global styles
│   │
│   ├── auth/                       # Authentication hooks & utilities
│   ├── api/                        # API client utilities
│   ├── type-utils/                 # Shared TypeScript types
│   ├── header/                     # Global header
│   ├── footer/                     # Global footer
│   ├── typescript-config/          # Shared TS configs
│   └── eslint-config/              # Shared lint configs
│
└── docs/                           # Documentation
    ├── INITIAL_SETUP.md
    └── ARCHITECTURE_SETUP.md
```

---

## 🎯 Application Architecture

### 1. Web App (Public Website)

**Purpose:** Main public-facing website for users to discover treatments and clinics

**Architecture Pattern:** Feature-Based Module Architecture

```
apps/web/src/
├── app/                    # Next.js App Router (Routes)
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Homepage route
│   ├── treatments/         # Treatment routes
│   ├── clinics/            # Clinic routes
│   └── specialists/        # Specialist routes
│
├── features/               # Feature Modules (Business Logic)
│   └── HomePage/
│       ├── components/     # Feature-specific components
│       │   ├── HeroSection/
│       │   │   └── SearchCard/
│       │   │       └── components/
│       │   │           ├── Clinic.tsx
│       │   │           └── Treatment.tsx
│       │   └── Banners/
│       │       ├── index.tsx
│       │       ├── BannerContent.tsx
│       │       └── components/
│       ├── constants/      # Feature constants
│       ├── styles/         # Feature-specific styles
│       └── index.tsx       # Feature entry point
│
├── components/             # Global Reusable Components
│   ├── layouts/
│   ├── forms/
│   └── common/
│
├── hooks/                  # Global Custom Hooks
├── lib/                    # Utilities & Helpers
└── providers/              # Context Providers
```

**Key Architectural Decisions:**

1. **Feature-Based Structure**
   - Each feature is self-contained
   - Easy to locate related code
   - Better scalability

2. **Component Colocation**
   - Components live near where they're used
   - Reduces cognitive load
   - Easier refactoring

3. **Path Aliases**
   ```typescript
   "@/*"            → "./src/*"
   "@/features/*"   → "./src/features/*"
   "@/lib/*"        → "./src/lib/*"
   "@cosmediate/ui" → Shared UI package
   ```

### 2. App (Multi-Tenant Dashboard) - In Development

**Purpose:** Role-based dashboards for admin, clinics, specialists, and users

**Status:** Layout system complete, features in development

**Implemented:**

- Multi-tenant layout system with dynamic navigation
- Role-based routing (admin, clinic, specialist, user)
- Parallel routes for shared functionality
- Management layout with header, sidebar, and panel components

**In Development:**

- Admin dashboard (treatments, clinics, specialists CRUD)
- Clinic dashboard (treatment offerings, appointments, messaging)
- User dashboard (appointments, inbox, medical records)

See: [Dashboard App Overview](./apps/app-dashboard/OVERVIEW.md)

### 3. Auth (Identity Provider) - Implemented

**Purpose:** OAuth 2.0 authorization server for Cosmediate ecosystem

**Status:** Fully implemented and production-ready

**Features:**

- Email/password authentication with verification
- Google OAuth integration
- Auto-account linking
- Password management (forgot, reset, update, set)
- OAuth 2.0 server for SP applications
- Session management with SSO support
- Multi-TLD architecture using DynamoDB

See: [Authentication System Documentation](./apps/auth/system-design/AUTH.MD)

### 4. Blog (Content Platform) - Base Setup Complete

**Purpose:** Educational content and resources about cosmetic treatments

**Status:** Auth integration complete, content features planned

**Implemented:**

- OAuth 2.0 client integration
- Auth callback handling
- Base layout and providers

**Planned:**

- MDX content management
- Blog post listing and details
- Categories and tags
- Comment system
- Newsletter signup

See: [Blog App Overview](./apps/blog/OVERVIEW.md)

---

## 📦 Package Architecture

### UI Package (@cosmediate/ui)

**Purpose:** Shared component library for all apps

**Structure:**

```
packages/ui/src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   └── custom/             # Custom components
│       ├── layouts/
│       └── composites/
│
├── lib/
│   ├── utils.ts            # Utility functions
│   └── cn.ts               # Class name merger
│
├── hooks/
│   ├── use-toast.ts
│   └── ...
│
├── styles/
│   └── globals.css         # Global styles & variables
│
└── index.ts                # Package exports
```

**Export Strategy:**

```typescript
// Main export (re-exports all components)
export * from "./components/ui/button";
export * from "./components/ui/card";
// etc.
```

**Design System:**

- **Colors:** OKLCH color space for perceptually uniform colors
- **Theme:** Light (default) + Dark mode support
- **Typography:** Tailwind Typography plugin for prose content
- **Spacing:** Consistent spacing scale
- **Border Radius:** CSS variables for consistent radii

### Configuration Packages

**TypeScript Config (@cosmediate/typescript-config)**

- `base.json` - Shared base configuration
- `nextjs.json` - Next.js-specific extensions
- `react-library.json` - React library extensions

**ESLint Config (@cosmediate/eslint-config)**

- Shared linting rules across all apps and packages

---

## 🔄 Data Flow Architecture

### Current State: Direct API Calls

```
┌─────────────┐
│   Web App   │
└──────┬──────┘
       │
       │ fetch/axios
       ↓
┌─────────────────┐
│  API Gateway    │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ Lambda Functions│
└──────┬──────────┘
       │
       ↓
┌─────────────────────────────┐
│  AWS Services               │
│  ├─ Cognito (Auth)          │
│  ├─ DynamoDB (Database)     │
│  ├─ OpenSearch (Search)     │
│  └─ S3 (Images)             │
└─────────────────────────────┘
```

### Future State: API Layer Abstraction

```
┌─────────────┐
│   Web App   │
└──────┬──────┘
       │
       │ React Query / SWR
       ↓
┌─────────────────────┐
│  API Client Layer   │
│  (@cosmediate/api)  │
└──────┬──────────────┘
       │
       │ Typed API calls
       ↓
┌─────────────────────┐
│   API Gateway       │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  Lambda Functions   │
└─────────────────────┘
```

**Planned API Layer Features:**

- Type-safe API client
- Request/response interceptors
- Error handling
- Retry logic
- Caching strategy
- Request deduplication

---

## 🔌 Backend Integration

### API Endpoints

| Service        | Endpoint            | Method | Purpose                       |
| -------------- | ------------------- | ------ | ----------------------------- |
| Authentication | `/auth/signup`      | POST   | User registration             |
| Authentication | `/auth/signin`      | POST   | User login                    |
| Authentication | `/auth/oauth`       | POST   | OAuth authentication          |
| Authentication | `/auth/link-oauth`  | POST   | Link OAuth account            |
| Users          | `/users/{id}`       | GET    | Get user profile              |
| Users          | `/users/{id}`       | PUT    | Update user profile           |
| Clinics        | `/clinics/list`     | POST   | List clinics (OpenSearch)     |
| Clinics        | `/clinics/{id}`     | GET    | Get clinic details            |
| Specialists    | `/specialists/list` | POST   | List specialists (OpenSearch) |
| Specialists    | `/specialists/{id}` | GET    | Get specialist details        |
| Treatments     | `/treatments/list`  | POST   | List treatments (OpenSearch)  |
| Treatments     | `/treatments/{id}`  | GET    | Get treatment details         |
| Reviews        | `/reviews/list`     | POST   | List reviews (OpenSearch)     |
| Reviews        | `/reviews`          | POST   | Create review                 |
| Images         | `/images/upload`    | POST   | Upload image to S3            |

### Authentication Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Sign in/up
     ↓
┌──────────────────┐
│  Auth App/Web    │
└────┬─────────────┘
     │
     │ 2. POST /auth/signin
     ↓
┌──────────────────┐
│  AWS Cognito     │
└────┬─────────────┘
     │
     │ 3. Return JWT tokens
     ↓
┌──────────────────┐
│  Frontend App    │
│  (Store tokens)  │
└────┬─────────────┘
     │
     │ 4. Subsequent requests
     │    (Authorization: Bearer <token>)
     ↓
┌──────────────────┐
│  API Gateway     │
│  (Validate JWT)  │
└──────────────────┘
```

**Auth Strategy:**

- JWT tokens from AWS Cognito
- Stored in HTTP-only cookies (secure)
- Auto-refresh with refresh tokens
- Multi-provider support (Email, Google, Facebook, Apple)

### Search Integration (OpenSearch)

All list endpoints use POST requests with query parameters:

```typescript
// Example: Search clinics
POST /clinics/list
{
  "query": "botox",
  "location": {
    "lat": 40.7128,
    "lon": -74.0060,
    "radius": "10km"
  },
  "filters": {
    "categories": ["cosmetic-surgery"],
    "rating": { "gte": 4.0 }
  },
  "sort": [
    { "rating": "desc" },
    { "_geo_distance": "asc" }
  ],
  "page": 1,
  "size": 20
}
```

---

## 🎨 Design Patterns

### 1. Component Composition

**Pattern:** Compound Components

```typescript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

**Benefits:**

- Flexible composition
- Clear component hierarchy
- Easy to customize

### 2. Custom Hooks

**Pattern:** Logic Extraction

```typescript
// Custom hook for API calls
function useClinicList(filters) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch logic
  }, [filters]);

  return { data, loading, error };
}
```

**Benefits:**

- Reusable logic
- Testable in isolation
- Clean component code

### 3. Feature Modules

**Pattern:** Vertical Slicing

```
features/HomePage/
├── components/     # UI components
├── hooks/          # Feature hooks
├── utils/          # Feature utilities
├── constants/      # Feature constants
└── types/          # Feature types
```

**Benefits:**

- High cohesion
- Low coupling
- Easy to navigate

### 4. Provider Pattern

**Pattern:** Context Composition

```typescript
<ThemeProvider>
  <AuthProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </AuthProvider>
</ThemeProvider>
```

**Benefits:**

- Centralized state
- Easy prop drilling prevention
- Composable contexts

---

## 🚀 Performance Architecture

### Build Optimization

**Turborepo Configuration:**

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Features:**

- Parallel builds across packages
- Remote caching (future)
- Incremental builds
- Smart task scheduling

### Next.js Optimizations

**Current:**

- App Router (React Server Components)
- Automatic code splitting
- Image optimization
- Font optimization

**Planned:**

- Static generation for public pages
- ISR (Incremental Static Regeneration)
- Dynamic imports for heavy components
- Bundle analysis and optimization

---

## 🔐 Security Architecture

### Current Security Measures

1. **Authentication:**
   - JWT tokens from AWS Cognito
   - HTTP-only cookies
   - Token refresh mechanism

2. **API Security:**
   - CORS configuration
   - Rate limiting (AWS level)
   - Input validation

3. **Content Security:**
   - XSS prevention (React default)
   - CSRF protection
   - Secure headers

### Planned Security Enhancements

1. **CSP (Content Security Policy)**
2. **Permission-based access control**
3. **Audit logging**
4. **Security headers (HSTS, X-Frame-Options)**

---

## 📈 Scalability Architecture

### Current Scalability

**Horizontal Scalability:**

- Stateless Next.js apps (easy to scale)
- CDN for static assets
- AWS auto-scaling for backend

**Code Scalability:**

- Monorepo structure
- Feature-based modules
- Shared packages

### Future Scalability Plans

1. **Micro-Frontends (if needed)**
   - Module Federation
   - Independent deployments
   - Team autonomy

2. **Edge Computing**
   - Edge functions for API routes
   - Edge middleware for auth
   - Geo-distributed content

3. **Caching Strategy**
   - React Query for client-side caching
   - Redis for server-side caching
   - CDN caching for static content

---

## 🧪 Testing Architecture

### Planned Testing Strategy

```
┌─────────────────────────────────┐
│  E2E Tests (Playwright)         │
│  - User flows                   │
│  - Critical paths               │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│  Integration Tests              │
│  - API integration              │
│  - Component interaction        │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│  Unit Tests (Jest/Vitest)       │
│  - Components                   │
│  - Hooks                        │
│  - Utilities                    │
└─────────────────────────────────┘
```

**Testing Pyramid:**

- 70% Unit tests
- 20% Integration tests
- 10% E2E tests

---

## 🔄 State Management Architecture

### Current State Management

**Local State:**

- `useState` for component state
- `useReducer` for complex state

**Server State:**

- Direct API calls with `fetch`

**Global State:**

- Context API for theme
- Context API for auth (planned)

### Future State Management

**Planned:**

- React Query / SWR for server state
- Zustand for complex global state
- Context API for simple global state

**Architecture:**

```
┌──────────────────────────────┐
│  Server State                │
│  (React Query)               │
│  - API data                  │
│  - Caching                   │
│  - Optimistic updates        │
└──────────────────────────────┘

┌──────────────────────────────┐
│  Global State                │
│  (Zustand)                   │
│  - User preferences          │
│  - UI state                  │
└──────────────────────────────┘

┌──────────────────────────────┐
│  Local State                 │
│  (useState/useReducer)       │
│  - Component-specific state  │
└──────────────────────────────┘
```

---

## 📊 Monitoring & Analytics (Planned)

### Application Monitoring

1. **Error Tracking**
   - Sentry for error reporting
   - Source map support
   - User context

2. **Performance Monitoring**
   - Core Web Vitals tracking
   - API response times
   - Bundle size monitoring

3. **User Analytics**
   - Google Analytics / Plausible
   - User flow tracking
   - Conversion tracking

---

## 🛠️ Development Workflow

### Local Development

```bash
# Start all apps
pnpm dev

# Start specific app
pnpm --filter web run dev

# Add package to specific app
pnpm --filter web add <package>

# Add UI component
cd packages/ui
pnpm dlx shadcn@canary add <component>
```

### Code Quality

1. **Linting:** ESLint with shared config
2. **Formatting:** Prettier (planned)
3. **Type Checking:** TypeScript strict mode
4. **Git Hooks:** Husky for pre-commit checks (planned)

### Deployment Pipeline (Planned)

```
Developer → Git Push → CI/CD
                        ├─ Lint
                        ├─ Type Check
                        ├─ Test
                        ├─ Build
                        └─ Deploy
                            ├─ Staging
                            └─ Production
```

---

## 🔮 Future Architecture Plans

### Short Term (1-3 months)

1. **API Layer Package**
   - Create `@cosmediate/api` package
   - Type-safe API client
   - React Query integration

2. **Shared Types Package**
   - Create `@cosmediate/types` package
   - Shared TypeScript types
   - API response types

3. **Authentication Flow**
   - Complete auth app
   - Implement OAuth flows
   - Account linking

4. **State Management**
   - Implement React Query
   - Add Zustand for global state

### Medium Term (3-6 months)

1. **Testing Infrastructure**
   - Unit tests for components
   - E2E tests for critical flows
   - CI/CD integration

2. **Performance Optimization**
   - Bundle analysis
   - Code splitting
   - Image optimization

3. **SEO Infrastructure**
   - Sitemap generation
   - Meta tags
   - Structured data

### Long Term (6+ months)

1. **Micro-Frontend Architecture** (if needed)
2. **Edge Computing** optimization
3. **Advanced Caching** strategies
4. **Real-time Features** (WebSocket integration)

---

## 📝 Architecture Decision Records (ADRs)

### ADR-001: Turborepo for Monorepo Management

**Status:** Accepted  
**Date:** November 2025

**Context:**
Need to manage multiple apps and shared packages efficiently.

**Decision:**
Use Turborepo for monorepo management.

**Consequences:**

- ✅ Fast builds with caching
- ✅ Easy task orchestration
- ✅ Great developer experience
- ❌ Learning curve for team

### ADR-002: Feature-Based Architecture

**Status:** Accepted  
**Date:** November 2025

**Context:**
Need scalable code organization as features grow.

**Decision:**
Organize code by features rather than technical layers.

**Consequences:**

- ✅ High cohesion, low coupling
- ✅ Easy to locate related code
- ✅ Better scalability
- ❌ Some code duplication possible

### ADR-003: shadcn/ui for Component Library

**Status:** Accepted  
**Date:** November 2025

**Context:**
Need a flexible, customizable component library.

**Decision:**
Use shadcn/ui with Tailwind CSS v4.

**Consequences:**

- ✅ Full ownership of components
- ✅ Easy customization
- ✅ No runtime overhead
- ❌ Manual component updates

---

## 📚 Additional Resources

- [Initial Setup Documentation](./INITIAL_SETUP.md)
- [TypeScript Configuration Guide](./INITIAL_SETUP.md#typescript-configuration)
- [Component Development Guide](./COMPONENT_GUIDE.md) (planned)
- [API Integration Guide](./API_GUIDE.md) (planned)

---

**Document Maintainers:**

- Development Team
- Last Updated: December 11, 2024

**Version History:**

- v2.0.0 (Dec 11, 2024) - Updated with auth system, dashboard layout, current implementations
- v1.0.0 (Nov 15, 2024) - Initial architecture documentation
