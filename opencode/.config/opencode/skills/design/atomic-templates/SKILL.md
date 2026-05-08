---
name: design/atomic-templates
description: >
  Atomic design templates — React page layouts composed of organisms.
  Trigger: Creating page layouts, wireframes, dashboard skeleton, grid structures.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Create React templates: page-level layouts that define structure but have no business data. They're the skeleton for pages.

## When to Load

- User asks to create a page layout, dashboard skeleton, grid, wireframe
- File extension is `.tsx` AND component is a page wrapper
- Context mentions "template", "layout", "page structure", "skeleton"

## What Are Templates

- DashboardLayout: Header + Sidebar + Content Grid + Footer
- AuthLayout: Logo + Children (login form or register form)
- BlogLayout: Sidebar + MainContent + RelatedPosts
- AdminLayout: Sidebar + TopBar + Content + Notifications
- EcommerceLayout: Header + Filters + ProductGrid + PaginationFooter

### Distinction from Organisms

- Organism: "ProductCard" → image, title, price, add to cart (self-contained)
- Template: "ProductGrid" → just the grid structure, accepts ProductCard as children

Templates are layout containers. Organisms are content components.

## Implementation Pattern

```tsx
// src/templates/{TemplateName}/index.tsx
import { ReactNode } from 'react'

export interface {TemplateName}Props {
  children: ReactNode  // Template accepts any content
  sidebar?: ReactNode
  header?: ReactNode
}

export function {TemplateName}({ children, sidebar, header }: {TemplateName}Props) {
  return (
    <div data-template="{template-name}" className="template">
      {header && <header>{header}</header>}
      <div className="template-body">
        {sidebar && <aside>{sidebar}</aside>}
        <main>{children}</main>
      </div>
    </div>
  )
}
```

## Rules

1. **Layout only** — templates define structure, not content or business logic
2. **Children prop** — accept content via children, don't hardcode organisms
3. **Optional regions** — sidebar, header, footer are optional slots
4. **No business logic** — no data fetching, no state beyond layout state (collapsed sidebar)
5. **CSS** — layout CSS only (grid, flex), no theming or component styles

## File Structure

```
src/templates/
  DashboardLayout/
    index.tsx
    DashboardLayout.module.css
  AuthLayout/
    ...
```