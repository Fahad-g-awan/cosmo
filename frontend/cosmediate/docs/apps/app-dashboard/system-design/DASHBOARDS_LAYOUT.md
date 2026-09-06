# Dashboards Layout Architecture

**Version:** 1.0.0  
**Last Updated:** December 11, 2024  
**Status:** In Development

---

## 📋 Overview

The Dashboard App implements a sophisticated **multi-tenant layout system** that dynamically adapts based on user roles. This document outlines the architecture, component structure, and flow of the management layout used across admin, clinic, specialist, and user dashboards.

---

## 🏗️ Layout Architecture

### Component Hierarchy

```
┌──────────────────────────────────────────────────┐
│                  Root Layout                       │
│                  (app/layout.tsx)                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │         Tenant Layout Wrapper            │  │
│  │  (admin/layout or clinic/layout.tsx)  │  │
│  ├──────────────────────────────────────────┤  │
│  │                                          │  │
│  │  ┌──────────────────────────────────┐  │  │
│  │  │     Management Layout            │  │  │
│  │  │   (layout/management/)          │  │  │
│  │  ├──────────────────────────────────┤  │  │
│  │  │                                  │  │  │
│  │  │  ┌─────────────────────────┐  │  │  │
│  │  │  │  Navigation Provider  │  │  │  │
│  │  │  ├─────────────────────────┤  │  │  │
│  │  │  │                         │  │  │  │
│  │  │  │  ┌──────────────────┐  │  │  │  │
│  │  │  │  │ Panel Provider │  │  │  │  │
│  │  │  │  ├──────────────────┤  │  │  │  │
│  │  │  │  │                  │  │  │  │  │
│  │  │  │  │  ┌────────────┐  │  │  │  │  │
│  │  │  │  │  │   Header   │  │  │  │  │  │
│  │  │  │  │  ├────────────┤  │  │  │  │  │
│  │  │  │  │  │            │  │  │  │  │  │
│  │  │  │  │  │ Navigation │  │  │  │  │  │
│  │  │  │  │  │  Sidebar    │  │  │  │  │  │
│  │  │  │  │  ├────────────┤  │  │  │  │  │
│  │  │  │  │  │            │  │  │  │  │  │
│  │  │  │  │  │  Content   │  │  │  │  │  │
│  │  │  │  │  │   Area     │  │  │  │  │  │
│  │  │  │  │  │            │  │  │  │  │  │
│  │  │  │  │  └────────────┘  │  │  │  │  │
│  │  │  │  └──────────────────┘  │  │  │  │
│  │  │  └─────────────────────────┘  │  │  │
│  │  └──────────────────────────────────┘  │  │
│  └──────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## 📐 Core Components

### 1. Root Layout (`app/layout.tsx`)

**Purpose**: Application-wide wrapper with global providers

**Responsibilities**:

- Montserrat font configuration
- Global metadata (title, description)
- Providers wrapper (AuthProvider, etc.)
- Global CSS imports
- Toast notifications setup

**Implementation**:

```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} antialiased`}>
        <Providers>
          {children}
          <DefaultToaster />
        </Providers>
      </body>
    </html>
  );
}
```

---

### 2. Tenant Layout Wrappers

#### Admin Layout (`(routes)/(admin)/layout.tsx`)

**Purpose**: Wrapper for admin-only routes

**Tenant**: `admin`  
**Roles**: `SUPER_ADMIN`, `ADMIN`

```typescript
export default function AdminLayout({ children }) {
  return <ManagementLayout tenant="admin">{children}</ManagementLayout>;
}
```

#### Clinic Layout (`(routes)/(clinic)/layout.tsx`)

**Purpose**: Wrapper for clinic and specialist routes

**Tenant**: `clinic` or `specialist` (dynamic)  
**Roles**: `CLINIC_MANAGER`, `SPECIALIST`

```typescript
export default async function ClinicLayout({ children }) {
  const role = await getRole();
  const tenant = role === "specialist" ? "specialist" : "clinic";

  return <ManagementLayout tenant={tenant}>{children}</ManagementLayout>;
}
```

**Dynamic Tenant Selection**:

- `CLINIC_MANAGER` → `tenant="clinic"`
- `SPECIALIST` → `tenant="specialist"`
- Different navigation menus based on tenant

---

### 3. Management Layout (`layout/management/index.tsx`)

**Purpose**: Core layout system for all management dashboards

**Props**:

- `tenant`: `"admin" | "clinic" | "specialist"`
- `children`: Page content

**Architecture**:

```typescript
export const ManagementLayout = ({ tenant, children }) => {
  return (
    <NavigationProvider tenant={tenant}>
      <PanelHeaderProvider>
        <ManagementLayoutContent>{children}</ManagementLayoutContent>
      </PanelHeaderProvider>
    </NavigationProvider>
  );
};
```

**Context Providers**:

1. **NavigationProvider**: Manages navigation state and menu items
2. **PanelHeaderProvider**: Controls panel header content and actions

---

### 4. Management Layout Content (`layout/management/Content.tsx`)

**Purpose**: Visual layout structure with header, sidebar, and content area

**Structure**:

```typescript
<div className="flex h-screen">
  {/* Sidebar Navigation */}
  <Navigation />

  {/* Main Content Area */}
  <div className="flex-1 flex flex-col">
    {/* Top Header */}
    <Header />

    {/* Page Content */}
    <main className="flex-1 overflow-auto">
      {/* Panel Header (Breadcrumbs, Actions) */}
      <PanelHeader />

      {/* Page Children */}
      {children}
    </main>
  </div>
</div>
```

**Responsive Behavior**:

- **Desktop**: Sidebar always visible
- **Mobile**: Sidebar collapses, hamburger menu appears
- **Tablet**: Sidebar can be toggled

---

## 🧐 Context System

### Navigation Context (`layout/management/context/NavigationContext.tsx`)

**Purpose**: Manage navigation state and menu items

**State**:

```typescript
interface NavigationState {
  tenant: Tenant;
  menuItems: MenuItem[];
  activeRoute: string;
  isCollapsed: boolean;
  isMobileMenuOpen: boolean;
}
```

**Actions**:

- `toggleSidebar()`: Collapse/expand sidebar
- `toggleMobileMenu()`: Open/close mobile menu
- `setActiveRoute(route)`: Update active route

**Menu Items by Tenant**:

**Admin**:

```typescript
[
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Treatments", path: "/admin/treatments", icon: Syringe },
  { label: "Clinics", path: "/admin/clinics", icon: Building },
  { label: "Specialists", path: "/admin/specialists", icon: UserMd },
  { label: "Patients", path: "/admin/patients", icon: Users },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];
```

**Clinic**:

```typescript
[
  { label: "Dashboard", path: "/clinic/dashboard", icon: LayoutDashboard },
  { label: "Treatments", path: "/clinic/treatments", icon: Syringe },
  { label: "Specialists", path: "/clinic/specialists", icon: UserMd },
  { label: "Patients", path: "/clinic/patients", icon: Users },
  { label: "Appointments", path: "/clinic/appointments", icon: Calendar },
  { label: "Inbox", path: "/clinic/inbox", icon: Mail },
  { label: "Settings", path: "/clinic/settings", icon: Settings },
];
```

### Panel Header Context (`layout/management/context/PanelHeaderContext.tsx`)

**Purpose**: Control panel header content dynamically

**State**:

```typescript
interface PanelHeaderState {
  title: string;
  breadcrumbs: Breadcrumb[];
  actions: ReactNode[];
}
```

**Usage in Pages**:

```typescript
const { setTitle, setBreadcrumbs, setActions } = usePanelHeader();

useEffect(() => {
  setTitle("Treatments Management");
  setBreadcrumbs([
    { label: "Admin", path: "/admin" },
    { label: "Treatments", path: "/admin/treatments" },
  ]);
  setActions([
    <Button onClick={handleAdd}>Add Treatment</Button>
  ]);
}, []);
```

---

## 📱 Layout Components

### Header (`layout/management/Header/index.tsx`)

**Purpose**: Top application header

**Components**:

- **Logo**: Brand identity
- **Search**: Global search (future)
- **Notifications**: Bell icon with badge
- **User Menu**: Profile dropdown
  - Profile settings
  - Account preferences
  - Logout

**Responsive**:

- **Desktop**: Full header with all elements
- **Mobile**: Hamburger menu + minimal header

### Navigation (`layout/management/Navigation/index.tsx`)

**Purpose**: Sidebar navigation menu

**Features**:

- **Tenant-specific menu items** (from NavigationContext)
- **Active route highlighting**
- **Icon + label** for each item
- **Collapsible sidebar**
  - Expanded: Icons + labels
  - Collapsed: Icons only
- **Mobile drawer**: Slide-in menu on mobile

**States**:

- Expanded (default desktop)
- Collapsed (toggle on desktop)
- Mobile drawer (slide from left)

### Panel Header (`layout/management/PanelHeader.tsx`)

**Purpose**: Page-level header with breadcrumbs and actions

**Structure**:

```typescript
<div className="panel-header">
  <div className="breadcrumbs">
    {breadcrumbs.map((crumb, i) => (
      <>
        <Link href={crumb.path}>{crumb.label}</Link>
        {i < breadcrumbs.length - 1 && <ChevronRight />}
      </>
    ))}
  </div>

  <h1>{title}</h1>

  <div className="actions">
    {actions.map(action => action)}
  </div>
</div>
```

**Usage Example**:

```
Admin > Treatments > Create New
[+ Add Treatment Button]
```

---

## 🔄 Routing Flow

### 1. Initial Load

```
User lands on app.cosmediate.com/
  │
  └──> Root page (page.tsx)
       │
       └──> Fetch default route by role
            │
            ├──> SUPER_ADMIN/ADMIN → /admin/dashboard
            ├──> CLINIC_MANAGER → /clinic/dashboard
            ├──> SPECIALIST → /clinic/dashboard
            └──> AUTHENTICATED_USER → /user/dashboard
```

### 2. Tenant Layout Selection

```
/admin/* routes
  │
  └──> (admin)/layout.tsx
       │
       └──> ManagementLayout tenant="admin"

/clinic/* routes
  │
  └──> (clinic)/layout.tsx
       │
       └──> ManagementLayout tenant="clinic" or "specialist"
```

### 3. Shared Routes (Parallel Routes)

```
/appointments
  │
  ├──> Check user role
  │
  ├──> ADMIN → @admin/page.tsx
  ├──> CLINIC_MANAGER → @clinic/page.tsx
  └──> AUTHENTICATED_USER → @user/page.tsx
```

**Parallel Route Structure**:

- `/appointments/@admin/page.tsx` - Admin view
- `/appointments/@clinic/page.tsx` - Clinic view
- `/appointments/@user/page.tsx` - User view
- `/appointments/layout.tsx` - Route selector

---

## 🎨 Styling & Theming

### Tailwind Configuration

- **Colors**: Custom brand palette
- **Spacing**: Consistent spacing scale
- **Typography**: Montserrat font family
- **Breakpoints**: Mobile-first responsive

### Component Styling

- **Navigation**: Sidebar with hover states
- **Header**: Fixed header with shadow
- **Content**: Scrollable area with padding
- **Mobile**: Drawer animation for sidebar

---

## 🔒 Access Control

### Route Protection

**Server-Side**:

```typescript
// layout.tsx
export default async function AdminLayout({ children }) {
  const role = await getRole();

  if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
    redirect('/unauthorized');
  }

  return <ManagementLayout tenant="admin">{children}</ManagementLayout>;
}
```

**Client-Side**:

```typescript
// useAuth hook
const { userRole, isAuthenticated } = useAuth();

if (!isAuthenticated) {
  return <Navigate to="/signin" />;
}

if (!hasPermission(userRole, 'treatments', 'read')) {
  return <AccessDenied />;
}
```

---

## 🛠️ Future Enhancements

1. **Breadcrumb Auto-Generation**: Generate breadcrumbs from route
2. **Theme Switcher**: Light/dark mode toggle
3. **Customizable Navigation**: User can reorder menu items
4. **Multi-Level Menu**: Nested navigation items
5. **Quick Actions**: Keyboard shortcuts
6. **Recent Items**: Quick access to recent pages
7. **Favorites**: Bookmark frequently used pages
8. **Search**: Global search across all resources

---

## 📚 Related Files

**Layouts**:

- `apps/app/src/app/layout.tsx` - Root layout
- `apps/app/src/app/(routes)/(admin)/layout.tsx` - Admin wrapper
- `apps/app/src/app/(routes)/(clinic)/layout.tsx` - Clinic wrapper
- `apps/app/src/layout/management/index.tsx` - Management layout
- `apps/app/src/layout/management/Content.tsx` - Layout structure

**Components**:

- `apps/app/src/layout/management/Header/` - Header component
- `apps/app/src/layout/management/Navigation/` - Sidebar navigation
- `apps/app/src/layout/management/PanelHeader.tsx` - Panel header

**Context**:

- `apps/app/src/layout/management/context/NavigationContext.tsx`
- `apps/app/src/layout/management/context/PanelHeaderContext.tsx`
