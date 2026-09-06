# Dashboard App Overview

**Application**: Multi-Tenant Management Dashboard  
**Port**: 3001 (Development)  
**Domain**: `app.cosmediate.com`  
**Purpose**: Role-based dashboards for admins, clinics, specialists, and users

---

## 📋 Description

The **Dashboard App** is a comprehensive multi-tenant management platform that serves different user roles with tailored interfaces and functionality. It provides administrative tools for platform management, clinic operations, specialist workflows, and user account management.

### Key Responsibilities

- **Multi-Tenant Architecture**: Separate dashboards for admin, clinic, specialist, and user roles
- **Resource Management**: CRUD operations for treatments, clinics, specialists, and patients
- **Authentication Integration**: OAuth 2.0 client with SSO support
- **Role-Based Access Control**: Granular permissions per tenant and resource
- **Data Visualization**: Analytics and reporting dashboards
- **Responsive Design**: Optimized for desktop and mobile devices

---

## 🏗️ Architecture

### Application Type

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4 + shadcn/ui
- **State Management**: React Context API
- **Backend Integration**: REST API + AWS Services

### Tenant Structure

```
┌─────────────────────────────────────────────┐
│          Dashboard App (app/)               │
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────┐  ┌──────────────────┐   │
│  │ Admin Tenant  │  │ Clinic Tenant    │   │
│  │ (admin/)      │  │ (clinic/)        │   │
│  │               │  │                  │   │
│  │ - Treatments  │  │ - Treatments     │   │
│  │ - Clinics     │  │ - Specialists    │   │
│  │ - Specialists │  │ - Patients       │   │
│  │ - Patients    │  │ - Appointments   │   │
│  │ - Settings    │  │ - Settings       │   │
│  └───────────────┘  └──────────────────┘   │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ Shared Routes (shared-routes/)        │ │
│  │                                       │ │
│  │ - Appointments (@admin, @clinic,      │ │
│  │                @user)                 │ │
│  │ - Inbox (@admin, @clinic, @user)      │ │
│  │ - Patients (@admin, @clinic)          │ │
│  │ - Settings (@admin, @clinic, @user)   │ │
│  │ - Specialists (@admin, @clinic)       │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 👥 User Roles & Tenants

### 1. Admin Tenant

**Role**: `SUPER_ADMIN`, `ADMIN`  
**Access**: Full platform management

**Features** (In Development):

- [ ] Treatments CRUD - Manage all platform treatments
- [ ] Clinics CRUD - Onboard and manage clinics
- [ ] Specialists CRUD - Manage specialist profiles
- [ ] Patients Management - View all patients
- [ ] Analytics Dashboard - Platform-wide metrics
- [ ] Settings - Platform configuration

### 2. Clinic Tenant

**Role**: `CLINIC_MANAGER`, `SPECIALIST`  
**Access**: Clinic-specific management

**Features** (In Development):

- [ ] Treatments Management - Manage clinic's offered treatments
- [ ] Specialists Management - Manage clinic staff
- [ ] Patients Management - View clinic patients
- [ ] Appointments - Schedule and manage appointments
- [ ] Inbox - Patient communications
- [ ] Settings - Clinic profile and preferences

### 3. User (Patient) Dashboard

**Role**: `AUTHENTICATED_USER`  
**Access**: Personal account management

**Features** (In Development):

- [ ] Appointments - View and book appointments
- [ ] Inbox - Messages from clinics
- [ ] Medical Records - Treatment history
- [ ] Settings - Profile and preferences
- [ ] Favorites - Saved clinics and specialists

---

## 🎨 Current Implementation Status

### ✅ Completed Features

#### 1. Management Layout System

- **Multi-tenant layout component** (`layout/management/`)
- **Dynamic navigation** based on user role
- **Responsive sidebar** with collapsible menu
- **Header component** with user profile and notifications
- **Panel header** with breadcrumbs and actions
- **Context providers** for navigation and panel state

#### 2. Authentication Integration

- **OAuth 2.0 client** with auth app integration
- **Silent authentication** on app load
- **Protected routes** via middleware
- **Role-based routing** to appropriate tenant
- **Session management** with auto-refresh

#### 3. Route Structure

- **Admin routes** (`(routes)/(admin)/`)
- **Clinic routes** (`(routes)/(clinic)/`)
- **Shared routes** with parallel routes (`(routes)/(shared-routes)/`)
- **Route groups** for different tenants using `@admin`, `@clinic`, `@user` slots

#### 4. Base Layout

- **Root layout** with providers
- **Tenant-specific layouts** (AdminLayout, ClinicLayout)
- **Global styles** and theme configuration
- **Toast notifications** for user feedback

### 🚧 In Development

#### Upcoming Features

**Admin Dashboard**:

- Treatments management (Create, Read, Update, Delete)
- Clinics management (Onboarding, approval, editing)
- Specialists management (Profile management, verification)
- Patients overview (Platform-wide patient data)
- Analytics dashboard (Metrics, charts, reports)

**Clinic Dashboard**:

- Treatment offering management (Add/remove treatments)
- Specialist management (Staff profiles, schedules)
- Patient management (View clinic patients)
- Appointment scheduling (Calendar view, booking)
- Inbox (Patient messaging)

**User Dashboard**:

- Appointments (Upcoming, past, booking)
- Inbox (Messages from clinics)
- Medical records (Treatment history)
- Profile management (Personal info, preferences)

**Shared Features**:

- Real-time notifications
- Search and filtering
- Data export functionality
- Mobile-optimized views

---

## 🗂️ File Structure

```
apps/app/
├── src/
│   ├── app/
│   │   ├── (routes)/
│   │   │   ├── (admin)/              # Admin-only routes
│   │   │   │   └── layout.tsx        # Admin layout wrapper
│   │   │   ├── (clinic)/             # Clinic-only routes
│   │   │   │   └── layout.tsx        # Clinic layout wrapper
│   │   │   └── (shared-routes)/      # Multi-tenant routes
│   │   │       ├── appointments/
│   │   │       │   ├── @admin/       # Admin view
│   │   │       │   ├── @clinic/      # Clinic view
│   │   │       │   ├── @user/        # User view
│   │   │       │   └── layout.tsx    # Route selector
│   │   │       ├── inbox/
│   │   │       ├── patients/
│   │   │       ├── settings/
│   │   │       └── specialists/
│   │   ├── api/                      # API route handlers
│   │   ├── auth/                     # Auth callback
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Role-based redirect
│   ├── layout/
│   │   └── management/               # Management layout
│   │       ├── Content.tsx           # Main content area
│   │       ├── Header/               # App header
│   │       ├── Navigation/           # Sidebar navigation
│   │       ├── PanelHeader.tsx       # Page header
│   │       ├── context/              # Layout contexts
│   │       └── index.tsx             # Layout wrapper
│   ├── context/
│   │   └── providers.tsx             # Global providers
│   └── lib/
│       └── routing/                  # Route utilities
└── package.json
```

---

## 🔐 Authentication & Authorization

### OAuth Flow

1. User accesses `app.cosmediate.com`
2. Middleware checks for session
3. If no session → redirect to auth app
4. Auth app authenticates → returns with code
5. App exchanges code for session
6. User redirected to role-based default route

### Role-Based Routing

```typescript
// Default routes by role
SUPER_ADMIN → /admin/dashboard
ADMIN → /admin/dashboard
CLINIC_MANAGER → /clinic/dashboard
SPECIALIST → /clinic/dashboard
AUTHENTICATED_USER → /user/dashboard
```

### Parallel Routes (Shared Routes)

Shared routes use Next.js parallel routes to show different content based on tenant:

```typescript
// appointments/layout.tsx selects appropriate slot
<TenantSelector>
  {tenant === 'admin' && <AdminAppointments />}
  {tenant === 'clinic' && <ClinicAppointments />}
  {tenant === 'user' && <UserAppointments />}
</TenantSelector>
```

---

## 📦 Dependencies

### Core

- `next`: ^15.x
- `react`: ^19.x
- `typescript`: ^5.x

### UI & Styling

- `@cosmediate/ui`: Shared component library
- `@cosmediate/header`: Global header
- `@cosmediate/footer`: Global footer
- `tailwindcss`: ^4.x
- `lucide-react`: Icons

### Authentication

- `@cosmediate/auth`: Auth hooks and utilities

### Utilities

- `@cosmediate/type-utils`: Shared TypeScript types
- `@cosmediate/api`: API client utilities

---

## 🚀 Development

### Running Locally

```bash
# From monorepo root
pnpm dev --filter=app

# Access at http://localhost:3001
```

### Environment Variables

```env
NEXT_PUBLIC_APP_NAME=app
NEXT_PUBLIC_AUTH_BASE_URL=https://auth.cosmediate.com
NEXT_PUBLIC_API_BASE_URL=https://api.cosmediate.com

CLIENT_ID=app_client_id
CLIENT_SECRET=hashed_secret
REDIRECT_URI=http://localhost:3001/auth/callback
```

---

## 🔮 Roadmap

### Phase 1: Foundation ✅

- [x] Multi-tenant layout system
- [x] Authentication integration
- [x] Role-based routing
- [x] Base navigation structure

### Phase 2: Admin Dashboard (In Progress)

- [ ] Treatments CRUD
- [ ] Clinics management
- [ ] Specialists management
- [ ] Patients overview
- [ ] Analytics dashboard

### Phase 3: Clinic Dashboard

- [ ] Treatment offerings
- [ ] Specialist profiles
- [ ] Patient management
- [ ] Appointment scheduling
- [ ] Messaging inbox

### Phase 4: User Dashboard

- [ ] Appointment booking
- [ ] Inbox messages
- [ ] Medical records
- [ ] Profile settings
- [ ] Favorites management

### Phase 5: Advanced Features

- [ ] Real-time notifications
- [ ] Advanced search
- [ ] Data export
- [ ] Mobile app (React Native)
- [ ] Offline support

---

## 📚 Related Documentation

- [Dashboard Layout Architecture](./system-design/DASHBOARDS_LAYOUT.md)
- [Authentication Integration](../auth/system-design/AUTH.MD)
- [API Documentation](../../../../backend/docs/API.md)
