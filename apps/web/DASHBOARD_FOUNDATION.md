# Dashboard Foundation Structure

This document outlines the role-based dashboard architecture for the multi-apartment management platform.

## Overview

The dashboard supports three user roles with distinct layouts and permissions:
- **Admin**: Full system access with analytics and management
- **Staff**: Operational focus for daily tasks
- **Customer (Guest Portal)**: Customer-facing portal for personal account management

## Architecture

### 1. **Role System** (`src/types/roles.ts`)

Defines three roles:
```typescript
enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  CUSTOMER = 'customer',
}
```

Each role has specific permissions controlled in `rolePermissions` object:
- Can view analytics
- Can manage rooms, customers, contracts, billing
- Can access AI tools
- Can access system settings

### 2. **Sidebar Configuration** (`src/config/sidebar.config.ts`)

Role-based navigation items are configured separately for each role:

**Admin Sidebar:**
- Dashboard, Property / Building Management, Room Management, Customer Management, Contracts, Revenue & Billing, Sales & Commission, AI Tools, System Settings

**Staff Sidebar:**
- Dashboard, Rooms, Customers, Contracts, Payments, Support Requests

**Customer Sidebar:**
- Home, My Room, Payments, Support, Account

Configuration uses:
- Icon from `lucide-react`
- Badge support for notifications
- Submenu capability for nested navigation

### 3. **Role Context Provider** (`src/context/RoleContext.tsx`)

Global state management for the current user and role:
```typescript
const { user, role, isLoading, setUser } = useRole();
```

Provides hooks:
- `useRole()` - Get full role context
- `useUserRole()` - Get only the role
- `useUser()` - Get only the user object

### 4. **Layout Components** (`src/components/layouts/`)

#### DashboardLayout
Main wrapper component that combines all layout elements:
```tsx
<DashboardLayout>
  {/* Your page content */}
</DashboardLayout>
```

#### Sidebar
Responsive navigation:
- Collapsible on desktop (keyboard toggle)
- Mobile overlay with toggle
- Shows/hides labels based on collapse state
- Active item highlighting
- Badge notifications support

#### Header
Top navigation bar with:
- Menu toggle button (mobile)
- Global search functionality
- Notification bell (with badge)
- Settings access
- Profile dropdown with logout

## Usage

### 1. Setting Up a Authenticated Layouts

First, wrap your app with the RoleProvider:

```tsx
// app/layout.tsx
import { RoleProvider } from '@/context/RoleContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <RoleProvider initialUser={null}>
          {children}
        </RoleProvider>
      </body>
    </html>
  );
}
```

### 2. Creating Role-Based Pages

For Admin dashboard:
```tsx
// app/admin/page.tsx
'use client';
import { DashboardLayout } from '@/components/layouts';

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Your admin dashboard content */}
      </div>
    </DashboardLayout>
  );
}
```

### 3. Accessing User Role

```tsx
'use client';
import { useUserRole, useUser } from '@/context/RoleContext';

export function MyComponent() {
  const role = useUserRole();
  const user = useUser();

  if (role === 'admin') {
    // Show admin features
  }
  
  return <div>{user?.name}</div>;
}
```

### 4. Getting Sidebar Config

```tsx
import { getSidebarConfig } from '@/config/sidebar.config';
import { UserRole } from '@/types/roles';

const sidebarItems = getSidebarConfig(UserRole.ADMIN);
```

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   └── page.tsx
│   ├── staff/
│   │   └── page.tsx
│   └── guest-portal/
│       └── page.tsx
├── components/
│   └── layouts/
│       ├── DashboardLayout.tsx
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── index.ts
├── config/
│   └── sidebar.config.ts
├── context/
│   └── RoleContext.tsx
└── types/
    └── roles.ts
```

## Styling Approach

- **TailwindCSS** for all styling
- **Color palette**: Soft blues, grays, and neutrals
- **Rounded corners**: `rounded-lg` for small, `rounded-2xl` for cards
- **Spacing**: Used Tailwind's full spacing scale
- **Hover states**: Subtle shadow and color shifts
- **Responsive**: Mobile-first with `sm:`, `lg:`, `xl:` breakpoints

## Requirements Mapping (PRD Alignment)

Based on the official requirements, the dashboard components must satisfy the following:
- **DASH-01**: Display total rooms, rented rooms, vacant rooms, expiring soon, and maintenance rooms.
- **DASH-02**: Display occupancy rate over time (day, month, quarter, custom range).
- **DASH-03 & 04**: Display current guests renting across the platform and guest volume trends over time (new, leaving, current).
- **DASH-05**: Display revenue over time with filtering (day, month, quarter, year, custom).
- **DASH-06**: Display total outstanding debt (unpaid amounts: room fees, utilities, extras).
- **DASH-07**: Show a list of overdue payments and their associated customers (Warnings/Alerts).
- **DASH-08**: Enable drill-down functionality (clicking on a metric widget opens the detailed data list).

## Next Steps

1. ✅ Role types and permissions defined
2. ✅ Sidebar configuration by role
3. ✅ Base layout components built
4. ✅ Route structure created
5. ⏳ Implement detailed Admin dashboard with widgets
6. ⏳ Implement Staff dashboard workflow UI
7. ⏳ Implement Guest Portal with customer features
8. ⏳ Add authentication and role routing
9. ⏳ Create reusable dashboard widgets
10. ⏳ Add charts and data visualization

## Component Customization

### Changing Sidebar Colors
Edit `Sidebar.tsx` hover and active states

### Modifying Header Layout
Edit `Header.tsx` layout and spacing

### Adding New Roles
1. Add role to `UserRole` enum
2. Add permissions to `rolePermissions`
3. Add sidebar config to `sidebarByRole`
4. Create new route folder

### Adding Navigation Items
Edit `src/config/sidebar.config.ts` and add items to the appropriate role config array.

---

**Note**: The foundation is intentionally kept simple and modular. Dashboard content (widgets, tables, charts) will be built on top of this base layer.
