# Cosmediate Frontend

<div align="center">

**A modern, scalable frontend for the Cosmediate platform - connecting users with cosmetic treatment providers**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.5-red?logo=turborepo)](https://turbo.build/)
[![pnpm](https://img.shields.io/badge/pnpm-10.4-orange?logo=pnpm)](https://pnpm.io/)

</div>

---

## 📋 Overview

Cosmediate is a comprehensive platform that bridges the gap between users seeking cosmetic treatments and qualified clinics/specialists. This frontend monorepo houses multiple applications and shared packages built with modern web technologies.

### 🎯 What is Cosmediate?

Cosmediate provides:

- 🔍 **Treatment Discovery** - Search and browse cosmetic treatments, clinics, and specialists
- 📍 **Location-Based Search** - Find nearby clinics and specialists
- ⭐ **Reviews & Ratings** - Read authentic reviews from verified users
- 📅 **Appointment Booking** - Schedule consultations and treatments
- 🔐 **Multi-Auth System** - Email/password + OAuth (Google, Facebook, Apple) with auto-linking
- 👤 **User Profiles** - Manage preferences, bookings, and reviews
- 🏥 **Clinic Management** - Tools for clinics to manage their presence
- 💼 **Specialist Profiles** - Showcase expertise and certifications

---

## 🏗️ Architecture

This is a **monorepo** managed by **Turborepo**, containing multiple Next.js applications and shared packages.

```
cosmediate/
├── apps/                    # Applications
│   ├── web/                # Main public-facing website
│   ├── app/                # User dashboard & booking platform
│   ├── auth/               # Authentication & account management
│   └── blog/               # Content & resources
│
├── packages/               # Shared packages
│   ├── ui/                 # Shared UI components (shadcn/ui)
│   ├── header/             # Global header component
│   ├── footer/             # Global footer component
│   ├── eslint-config/      # Shared ESLint configuration
│   └── typescript-config/  # Shared TypeScript configuration
│
└── turbo.json             # Turborepo configuration
```

---

## 📱 Applications

### 🌐 **Web** (Port 3000)

**Main public-facing website**

- Homepage with hero search
- Treatment catalog and filters
- Clinic/specialist directories
- Public reviews and ratings
- SEO-optimized landing pages

**Status:** 🟡 In Development  
**Current Progress:**

- 🚧 Homepage (in progress)
  - Hero section with search card
  - Banner components
  - Treatment search functionality
  - Clinic search functionality

### 📱 **App** (Port 3001)

**Multi-tenant management dashboards**

- **Admin Dashboard**: Platform-wide management of treatments, clinics, specialists
- **Clinic Dashboard**: Manage offerings, specialists, appointments
- **User Dashboard**: Book appointments, view history, manage profile

**Implemented:**

- ✅ Multi-tenant layout system
- ✅ Role-based routing and navigation
- ✅ OAuth 2.0 client integration
- ✅ Parallel routes for shared functionality

**Status:** 🟡 In Development (Layout complete, features in progress)

### 🔐 **Auth** (Separate deployment)

**OAuth 2.0 Identity Provider**

- Email/password signup with verification
- Google OAuth integration with auto-account linking
- Password management (forgot, reset, update, set)
- OAuth 2.0 authorization server for all Cosmediate apps
- Session management with SSO support
- Multi-TLD architecture

**Status:** 🟢 Fully Implemented

### 📝 **Blog** (Port 3003)

**Content & educational resources**

- Treatment guides and articles (planned)
- Before/after galleries (planned)
- Expert advice and tips (planned)
- SEO-optimized content (planned)

**Implemented:**

- ✅ OAuth 2.0 client integration
- ✅ Base layout and auth handling

**Status:** 🟡 Foundation Complete (Content features planned)

---

## 📦 Shared Packages

### `@cosmediate/ui`

Shared UI component library built with **shadcn/ui**, **Radix UI**, and **Tailwind CSS**.

**Components:**

- Buttons, Inputs, Cards
- Dialogs, Modals, Dropdowns
- Form elements
- Layout components
- Theme provider (light/dark mode)

### `@cosmediate/header`

Global header component with:

- Navigation menu
- Search bar
- Authentication state
- Theme toggle
- Mobile responsive

### `@cosmediate/footer`

Global footer component with:

- Site links
- Social media
- Legal information
- Newsletter signup

### `@cosmediate/auth`

Authentication utilities and hooks:

- OAuth 2.0 client helpers
- Auth hooks (useSignIn, useSignUp, useForgotPassword, etc.)
- AuthProvider context
- Silent authentication
- Session management utilities

### `@cosmediate/api`

API client utilities for backend integration:

- HTTP client configuration
- Request/response interceptors
- Type-safe API calls

### `@cosmediate/type-utils`

Shared TypeScript types and interfaces:

- User types
- Session types
- Role definitions
- Common utility types

### `@cosmediate/eslint-config`

Shared ESLint configuration for consistent code quality across all apps.

### `@cosmediate/typescript-config`

Shared TypeScript configurations:

- `base.json` - Base config
- `nextjs.json` - Next.js specific config
- `react-library.json` - React library config

---

## 🛠️ Tech Stack

### Core Framework

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5.7** - Type safety

### Styling & UI

- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **Radix UI** - Headless UI primitives
- **Lucide Icons** - Modern icon library
- **React Icons** - Additional icon sets
- **next-themes** - Dark mode support

### Development Tools

- **Turborepo** - High-performance monorepo build system
- **pnpm** - Fast, efficient package manager
- **ESLint 9** - Code linting
- **Prettier** - Code formatting
- **React Compiler** - Experimental React optimizations

### Backend Integration

- **AWS Cognito** - User authentication
- **AWS DynamoDB** - NoSQL database
- **AWS OpenSearch** - Full-text search
- **AWS S3** - Image storage
- **REST API** - Lambda functions via API Gateway

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20
- **pnpm** >= 10.4.1

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd cosmediate

# Install dependencies
pnpm install
```

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run specific app
pnpm --filter=web run dev
pnpm --filter app run dev
pnpm --filter auth run dev
pnpm --filter blog run dev

# Build all apps
pnpm build

# Lint all apps
pnpm lint

# Format code
pnpm format

# Type check
pnpm typecheck
```

### Port Configuration

| App  | Port | URL                   | Status               |
| ---- | ---- | --------------------- | -------------------- |
| web  | 3000 | http://localhost:3000 | 🟡 In Development    |
| app  | 3001 | http://localhost:3001 | 🟡 In Development    |
| auth | N/A  | Deployed separately   | 🟢 Fully Implemented |
| blog | 3003 | http://localhost:3003 | 🟡 Foundation Ready  |

---

## 📂 Project Structure

### Web App Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage
│   │   └── ...
│   │
│   ├── features/               # Feature-based modules
│   │   └── HomePage/
│   │       ├── components/     # Feature components
│   │       │   ├── HeroSection/
│   │       │   │   └── SearchCard/
│   │       │   │       └── components/
│   │       │   │           ├── Clinic.tsx
│   │       │   │           └── ...
│   │       │   └── Banners/
│   │       ├── constants/      # Feature constants
│   │       ├── styles/         # Feature styles
│   │       └── index.tsx       # Feature entry point
│   │
│   ├── components/             # Global components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and helpers
│   └── styles/                 # Global styles
│
├── public/                     # Static assets
└── package.json
```

---

## 🎨 Adding Components

### Add shadcn/ui Component

```bash
# Add to the ui package
pnpm dlx shadcn@canary add button
```

Components are automatically added to `packages/ui/src/components`.

### Using Shared Components

```tsx
// Import from UI package (re-exported from src/index.ts)
import { Button, Card } from "@cosmediate/ui";

// Import from shared packages
import { Header } from "@cosmediate/header";
import { Footer } from "@cosmediate/footer";

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Card>
          <Button>Click me</Button>
        </Card>
      </main>
      <Footer />
    </>
  );
}
```

---

## 🔗 Backend Integration

### API Endpoints

The frontend connects to AWS Lambda functions via API Gateway:

| Service        | Endpoint            | Purpose                                  |
| -------------- | ------------------- | ---------------------------------------- |
| Authentication | `/auth/*`           | Sign up, sign in, OAuth, account linking |
| Users          | `/users/*`          | User profile management                  |
| Clinics        | `/clinics/list`     | Clinic listings (POST)                   |
| Specialists    | `/specialists/list` | Specialist listings (POST)               |
| Treatments     | `/treatments/list`  | Treatment catalog (POST)                 |
| Reviews        | `/reviews/list`     | User reviews (POST)                      |
| Search         | `*/list`            | OpenSearch queries via POST requests     |

### Authentication Flow

1. **Email/Password Signup** → Email verification → Confirmed account
2. **OAuth (Google/Facebook/Apple)** → Auto-confirmed account
3. **Account Linking** → Sign up with email, later link OAuth provider (auto-links on first OAuth sign-in)
4. **Multi-Method Sign-In** → Use email+password OR any linked OAuth provider after linking

### Data Models

- **User**: Profile, preferences, permissions, linked providers
- **Clinic**: Location, managers, categories, availability, treatments offered
- **Specialist**: Profile, certifications, working hours, specializations
- **Treatment**: Categories, brands, sub-treatments, pricing, results
- **Review**: Rating, comment, entity (clinic/specialist), verified user

---

## 🔐 Environment Variables

Create `.env.local` files in each app:

```env
# API
NEXT_PUBLIC_API_URL=https://api.cosmediate.com
NEXT_PUBLIC_API_GATEWAY_URL=<your-gateway-url>

# AWS Cognito
NEXT_PUBLIC_COGNITO_USER_POOL_ID=<pool-id>
NEXT_PUBLIC_COGNITO_CLIENT_ID=<client-id>
NEXT_PUBLIC_COGNITO_DOMAIN=<cognito-domain>

# OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google-client-id>
NEXT_PUBLIC_FACEBOOK_APP_ID=<facebook-app-id>
NEXT_PUBLIC_APPLE_CLIENT_ID=<apple-client-id>

# Environment
NEXT_PUBLIC_ENV=development
```

---

## 📝 Development Guidelines

### Code Style

- **TypeScript** for all files
- **Functional components** with hooks
- **Named exports** for components
- **PascalCase** for components
- **camelCase** for functions/variables
- **UPPER_SNAKE_CASE** for constants

### Component Structure

```tsx
// Imports
import { useState } from "react";
import { Button } from "@cosmediate/ui";

// Types
interface Props {
  title: string;
  onSubmit: () => void;
}

// Component
export function MyComponent({ title, onSubmit }: Props) {
  const [state, setState] = useState("");

  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={onSubmit}>Submit</Button>
    </div>
  );
}
```

### File Naming

- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE.ts` or `constants.ts`
- Styles: `styles.module.css` or `className` with Tailwind

---

## 🧪 Testing

_Coming soon_

---

## 📈 Roadmap

### Phase 1: Foundation ✅

- ✅ Monorepo setup with Turborepo
- ✅ Shared component library (@cosmediate/ui)
- ✅ Shared packages (header, footer, auth, api, type-utils)
- ✅ OAuth 2.0 Identity Provider (auth app)
- ✅ Multi-tenant dashboard layout system
- ✅ Homepage implementation (web app)

### Phase 2: Authentication & User Management ✅

- ✅ Email/password authentication
- ✅ Google OAuth integration
- ✅ Account linking system
- ✅ Password management (forgot, reset, update)
- ✅ OAuth 2.0 server for multi-app SSO
- ✅ Session management across apps

### Phase 3: Core Features (Current)

- 🚧 Admin dashboard (treatments, clinics, specialists CRUD)
- 🚧 Clinic dashboard (offerings, appointments, messaging)
- ⏳ Treatment catalog and search
- ⏳ Clinic/specialist listings
- ⏳ Advanced search and filters (OpenSearch)
- ⏳ Review and rating system

### Phase 4: User Features

- ⏳ User dashboard (appointments, inbox, history)
- ⏳ Appointment booking system
- ⏳ Favorites and wishlists
- ⏳ Treatment cost calculator
- ⏳ Virtual consultations

### Phase 5: Content & SEO

- 🚧 Blog platform (foundation complete)
- ⏳ Treatment guides and articles
- ⏳ Expert advice content
- ⏳ SEO optimization
- ⏳ Structured data implementation

### Phase 6: Advanced Features

- ⏳ Real-time notifications (WebSocket)
- ⏳ Chat/messaging system
- ⏳ Advanced analytics dashboard
- ⏳ AI-powered treatment recommendations
- ⏳ Mobile app (React Native)

---

## 🤝 Contributing

_Guidelines coming soon_

---

## 📄 License

_License information coming soon_

---

## 📞 Contact

For questions or support, please contact the development team.

---

## 📚 Documentation

- [Architecture Setup](./docs/ARCHITECTURE_SETUP.md)
- [Initial Setup Guide](./docs/INITIAL_SETUP.md)
- [Auth App Overview](./docs/apps/auth/OVERVIEW.md)
- [Authentication System](./docs/apps/auth/system-design/AUTH.MD)
- [Dashboard App Overview](./docs/apps/app-dashboard/OVERVIEW.md)
- [Dashboard Layout](./docs/apps/app-dashboard/system-design/DASHBOARDS_LAYOUT.md)
- [Web App Overview](./docs/apps/web/OVERVIEW.md)
- [Homepage Feature](./docs/apps/web/features/HOMEPAGE.md)
- [Blog App Overview](./docs/apps/blog/OVERVIEW.md)

---

**Last Updated:** December 11, 2024  
**Version:** 2.0.0  
**Status:** Phase 3 - Core Features in Development

<div align="center">

**Built with ❤️ by the Cosmediate team**

</div>
