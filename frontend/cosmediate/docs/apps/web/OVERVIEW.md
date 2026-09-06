# Web App Overview

**Application**: Public-Facing Website  
**Port**: 3000 (Development)  
**Domain**: `cosmediate.com`  
**Purpose**: Main marketing and discovery platform for cosmetic treatments

---

## 📋 Description

The **Web App** is the primary public-facing website for Cosmediate, serving as the main entry point for users discovering cosmetic treatments, clinics, and specialists. It provides a comprehensive browsing experience with search, filtering, and detailed information about treatments and providers.

### Key Responsibilities

- **Treatment Discovery**: Browse and search cosmetic procedures
- **Clinic Listings**: Find and compare treatment providers
- **Specialist Profiles**: Discover qualified practitioners
- **User Education**: Inform users about treatments and procedures
- **Lead Generation**: Convert visitors into platform users
- **SEO & Marketing**: Optimize for search engines and conversions

---

## 🏗️ Architecture

### Application Type

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4 + shadcn/ui
- **State Management**: React Context API
- **Backend Integration**: REST API for dynamic data

### Feature-Based Architecture

```
┌────────────────────────────────────────┐
│        Web App (cosmediate.com)        │
├────────────────────────────────────────┤
│                                        │
│  Features:                             │
│  ┌────────────────────────────────┐  │
│  │ HomePage                       │  │
│  │ - Hero Section                 │  │
│  │ - Popular Treatments           │  │
│  │ - Popular Clinics              │  │
│  │ - Testimonials                 │  │
│  │ - Blog Section                 │  │
│  │ - Mission Section              │  │
│  └────────────────────────────────┘  │
│                                        │
│  ┌────────────────────────────────┐  │
│  │ Treatments (Planned)           │  │
│  │ - Treatment Listing            │  │
│  │ - Treatment Details            │  │
│  │ - Search & Filters             │  │
│  └────────────────────────────────┘  │
│                                        │
│  ┌────────────────────────────────┐  │
│  │ Clinics (Planned)              │  │
│  │ - Clinic Listing               │  │
│  │ - Clinic Details               │  │
│  │ - Location Maps                │  │
│  └────────────────────────────────┘  │
│                                        │
│  ┌────────────────────────────────┐  │
│  │ Specialists (Planned)          │  │
│  │ - Specialist Listing           │  │
│  │ - Specialist Profiles          │  │
│  │ - Credentials Display          │  │
│  └────────────────────────────────┘  │
└────────────────────────────────────────┘
```

---

## ✅ Current Implementation Status

### Completed Features

#### 1. HomePage Feature

Fully implemented homepage with multiple sections:

**Components**:

- **Hero Section**: Eye-catching landing with CTA
- **Popular Treatments**: Showcase top procedures
- **Popular Clinics**: Featured treatment providers
- **Testimonials**: Customer reviews and ratings
- **Blog Section**: Latest articles preview
- **Banners**: Promotional content
- **Mission Section**: Company values and mission

**Features**:

- Responsive design (mobile, tablet, desktop)
- Custom animations and transitions
- Feature-based component organization
- Reusable UI components from @cosmediate/ui

#### 2. Shared Layout Components

- **Global Header** (@cosmediate/header)
- **Global Footer** (@cosmediate/footer)
- **Provider wrapper** with auth context
- **Theme configuration**

#### 3. Authentication Integration

- OAuth 2.0 client setup
- Auth callback handler (`/auth/processing`)
- Session management via @cosmediate/auth
- Protected route support (ready for implementation)

### 🚧 Planned Features

#### Treatments Section

- [ ] **Treatment listing page** - Grid/list view of all treatments
- [ ] **Search functionality** - Find treatments by name, category
- [ ] **Advanced filters** - Price range, location, type
- [ ] **Treatment details page** - Comprehensive procedure information
  - Description and benefits
  - Before/after photos
  - Pricing information
  - Available clinics
  - Specialist recommendations
  - Patient reviews
  - FAQ section

#### Clinics Section

- [ ] **Clinic listing page** - Browse all registered clinics
- [ ] **Search and filter** - Location, treatments offered, ratings
- [ ] **Clinic detail page** - Complete clinic profile
  - About and credentials
  - Location with map integration
  - Treatments offered
  - Specialists on staff
  - Photo gallery
  - Patient reviews
  - Contact information
  - Booking widget

#### Specialists Section

- [ ] **Specialist listing** - Browse practitioners
- [ ] **Search and filter** - Specialty, location, experience
- [ ] **Specialist profile** - Detailed practitioner info
  - Credentials and education
  - Areas of expertise
  - Years of experience
  - Associated clinics
  - Patient reviews
  - Availability calendar

#### User Features

- [ ] **User accounts** - Sign up and authentication
- [ ] **Favorites/Bookmarks** - Save treatments, clinics, specialists
- [ ] **Appointment booking** - Schedule consultations
- [ ] **Reviews** - Leave feedback and ratings
- [ ] **Comparison tool** - Compare treatments/clinics

#### API Integration

- [ ] **Treatments API** - Fetch treatment data from backend
- [ ] **Clinics API** - Retrieve clinic information
- [ ] **Specialists API** - Get practitioner details
- [ ] **Reviews API** - Load and submit reviews
- [ ] **Blog API** - Fetch blog posts for homepage

---

## 🗂️ File Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Homepage
│   │   ├── layout.tsx                # Root layout
│   │   ├── treatments/               # Treatment routes (planned)
│   │   │   ├── page.tsx              # Listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Details
│   │   ├── clinics/                  # Clinic routes (planned)
│   │   ├── specialists/              # Specialist routes (planned)
│   │   └── auth/
│   │       └── processing/
│   │           └── page.tsx          # OAuth callback
│   ├── features/
│   │   ├── HomePage/
│   │   │   ├── components/
│   │   │   │   ├── HeroSection/
│   │   │   │   ├── PopularTreatments/
│   │   │   │   ├── PopularClinics/
│   │   │   │   ├── Testimonials/
│   │   │   │   ├── OurBlog/
│   │   │   │   └── Banners/
│   │   │   ├── constants/
│   │   │   │   └── index.tsx         # Homepage constants
│   │   │   ├── styles/
│   │   │   │   └── homepage.styles.css
│   │   │   └── index.tsx             # Homepage entry
│   │   ├── Treatments/               # (Planned)
│   │   ├── Clinics/                  # (Planned)
│   │   ├── Specialists/              # (Planned)
│   │   └── auth/
│   │       └── Processing/
│   ├── components/                   # Shared web-specific components
│   ├── context/
│   │   └── providers.tsx             # Global providers
│   ├── hooks/                        # Custom hooks
│   └── lib/                          # Utilities
└── public/                           # Static assets
    ├── images/
    └── icons/
```

---

## 🎨 Design System

### UI Components

Utilizes shared components from `@cosmediate/ui`:

- **Button**: Primary, secondary, outline variants
- **Card**: Treatment cards, clinic cards
- **Separator**: Section dividers
- **MissionSection**: Company mission display
- **Loaders**: Loading states

### Styling

- **TailwindCSS v4**: Utility-first CSS framework
- **Custom theme**: Brand colors and typography
- **Responsive breakpoints**: Mobile-first approach
- **Animations**: Custom CSS animations for enhanced UX

---

## 🔐 Authentication

### OAuth Integration

- Integrated with auth app (IdP)
- OAuth 2.0 authorization flow
- Session management via @cosmediate/auth
- Silent authentication on app load

### User Features (When Authenticated)

- Save favorites
- Book appointments
- Leave reviews
- Access user dashboard
- Personalized recommendations

---

## 📦 Dependencies

### Core

- `next`: ^15.x
- `react`: ^19.x
- `typescript`: ^5.x

### Shared Packages

- `@cosmediate/ui`: Component library
- `@cosmediate/header`: Global header
- `@cosmediate/footer`: Global footer
- `@cosmediate/auth`: Authentication hooks

### Styling

- `tailwindcss`: ^4.x
- `lucide-react`: Icons

---

## 🚀 Development

### Running Locally

```bash
# From monorepo root
pnpm dev --filter=web

# Access at http://localhost:3000
```

### Environment Variables

```env
NEXT_PUBLIC_APP_NAME=web
NEXT_PUBLIC_AUTH_BASE_URL=https://auth.cosmediate.com
NEXT_PUBLIC_API_BASE_URL=https://api.cosmediate.com

CLIENT_ID=web_client_id
CLIENT_SECRET=hashed_secret
REDIRECT_URI=http://localhost:3000/auth/callback
```

---

## 🔮 Roadmap

### Phase 1: Foundation ✅

- [x] Homepage with all sections
- [x] Responsive layout
- [x] Authentication integration
- [x] Shared component integration

### Phase 2: Core Features (Next)

- [ ] Treatments listing and details
- [ ] Clinics listing and details
- [ ] Specialists listing and details
- [ ] Search functionality
- [ ] Filter system

### Phase 3: User Engagement

- [ ] User accounts and profiles
- [ ] Favorites/bookmarks
- [ ] Reviews and ratings
- [ ] Comparison tool
- [ ] Appointment booking

### Phase 4: Advanced Features

- [ ] AI-powered recommendations
- [ ] Advanced search (NLP)
- [ ] Virtual consultations
- [ ] Before/after galleries
- [ ] Treatment cost calculator

### Phase 5: SEO & Marketing

- [ ] Blog integration
- [ ] Landing pages for treatments
- [ ] Schema.org markup
- [ ] OpenGraph optimization
- [ ] Performance optimization

---

## 📚 Related Documentation

- [Homepage Feature](./features/HOMEPAGE.md)
- [Product Layout Design](./system-design/PRODUCT_LAYOUT.md)
- [Authentication Integration](../auth/system-design/AUTH.MD)
- [API Documentation](../../../../backend/docs/API.md)
