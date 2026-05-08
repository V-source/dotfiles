---
name: design/atomic-molecules
description: >
  Atomic design molecules — React composed components from atoms.
  Trigger: Composing atoms into functional groups, form components, search bar, card header.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Create React molecules: composed components that combine 2+ atoms into a functional unit with clear purpose.

## When to Load

- User asks to create a form, search bar, filter group, card header, nav item, etc.
- File extension is `.tsx` AND the component combines multiple atoms
- Context mentions "molecule", "composed component", "form component"

## What Are Molecules

- SearchBar: Input + Button + Icon
- FormField: Label + Input + Error message
- CardHeader: Avatar + Title + Subtitle
- NavItem: Icon + Text + Badge (optional)
- FilterGroup: Label + Select/Checkbox group
- Pagination: Button + Text + Button

### NOT Molecules (these are organisms)

- Full form with validation and submission
- Complete card with image, content, and actions
- Navigation with multiple items and state
- Data table with columns and rows
- Modal with header, body, footer, and actions

## Implementation Pattern

```tsx
// src/components/molecules/{ComponentName}/index.ts
import { Atom } from '@/components/atoms/Atom'

export interface {ComponentName}Props {
  // ... props that make sense for this composition
}

export function {ComponentName}({ prop1, prop2 }: {ComponentName}Props) {
  return (
    <div data-testid="{component-name}">
      <Atom prop1={prop1} />
      <Atom prop2={prop2} />
    </div>
  )
}
```

## Rules

1. **Composition over creation** — molecules combine existing atoms, not raw HTML
2. **Single purpose** — each molecule does one functional thing
3. **Props flow down** — props passed to atoms, not hardcoded inside
4. **Can have light logic** — only for composition (show/hide, enable/disable), NO business rules
5. **CSS** — use CSS custom properties for theming, compose from atom CSS

## File Structure

```
src/components/molecules/
  SearchBar/
    index.ts
    SearchBar.module.css
    SearchBar.test.tsx
  FormField/
    ...
```