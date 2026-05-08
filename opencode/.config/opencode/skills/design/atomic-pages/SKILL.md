---
name: design/atomic-pages
description: >
  Atomic design pages — React complete pages using templates and organisms.
  Trigger: Creating full pages, routes, views, route components, page implementations.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Create React pages: complete route-level components that wire together templates, organisms, and data.

## When to Load

- User asks to create a page for a route (/home, /dashboard, /profile)
- File is in `pages/`, `app/`, or `src/routes/` directory
- Context mentions "page", "route", "view", "route component"

## What Are Pages

- HomePage: Hero + Features + Testimonials (all organisms)
- DashboardPage: DashboardLayout + StatsCards + RecentActivity
- ProfilePage: ProfileLayout + UserInfo + SettingsForm
- ProductListPage: EcommerceLayout + ProductGrid + Filters
- CheckoutPage: CheckoutLayout + CartSummary + PaymentForm

### Distinction from Templates

- Template: "This is how all admin pages look" (structure only)
- Page: "This is the /admin/users page" (specific content for specific route)

Pages are the highest level of atomic design — they compose templates with real organisms and data.

## Implementation Pattern

```tsx
// src/pages/{PageName}/index.tsx
import { DashboardLayout } from '@/templates/DashboardLayout'
import { StatsCard } from '@/components/organisms/StatsCard'
import { RecentActivity } from '@/components/organisms/RecentActivity'
import { useStats } from '@/hooks/useStats'  // Data hook

export default function {PageName}() {
  const { data, loading, error } = useStats()

  return (
    <DashboardLayout
      header={<AdminHeader />}
      sidebar={<AdminSidebar />}
    >
      <div className="page-content">
        <StatsCard data={data} loading={loading} />
        <RecentActivity items={data?.activity} />
      </div>
    </DashboardLayout>
  )
}
```

## Rules

1. **Route component** — page is the entry point for a URL
2. **Data fetching** — pages connect to hooks/services for data
3. **Error handling** — show loading and error states
4. **SEO** — pages should have proper title, meta, semantic structure
5. **Composition** — pages use templates for layout, organisms for content

## File Structure

```
src/pages/
  HomePage/
    index.tsx
    HomePage.test.tsx
    HomePage.module.css (only if page-specific styles needed)
  DashboardPage/
    ...
```

## When NOT to Load

- Creating reusable UI components (use atoms/molecules/organisms skills)
- Creating component libraries (use component-lib skill)
- Building design system foundations (use foundations skill)