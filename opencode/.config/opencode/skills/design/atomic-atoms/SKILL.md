---
name: design/atomic-atoms
description: >
  Atomic design atoms — React UI primitives (buttons, inputs, labels, icons).
  Trigger: Creating .tsx UI primitives, button, input, label, icon, typography.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Create React atoms: the smallest UI primitives in atomic design. These have NO business logic — only visual presentation and accessibility.

## When to Load

- User asks to create a button, input, label, icon, badge, avatar, etc.
- File extension is `.tsx` AND the component is a UI primitive
- Context mentions "atom", "primitive", "ui component"

## What Are Atoms

- Button, Input, Select, Checkbox, Radio
- Label, Text, Heading, Link
- Icon, Badge, Avatar, Spinner
- Card (only if it's a wrapper, not a composed component)

### NOT Atoms (these are molecules or organisms)

- Form with validation logic
- Card with title, image, and actions
- Navigation bar with multiple links
- Data table with sorting/filtering

## Implementation Pattern

```tsx
// src/components/atoms/{ComponentName}/index.ts

export interface {ComponentName}Props {
  // ... props with defaults where possible
}

export function {ComponentName}({ prop1, prop2 }: {ComponentName}Props) {
  return (
    <element data-testid="{component-name}">
      {/* markup */}
    </element>
  )
}
```

## Rules

1. **No business logic** — atoms are pure presentational
2. **Accessibility first** — use semantic HTML, aria attributes when needed
3. **Composable** — atoms combine to form molecules, not the reverse
4. **CSS** — use CSS custom properties for theming, NOT inline styles or tailwind classes in code
5. **Tests** — at minimum, test render and accessibility (axe-core)

## File Structure

```
src/components/atoms/
  Button/
    index.ts
    Button.module.css
    Button.test.tsx
  Input/
    ...
```