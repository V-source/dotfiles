---
name: design/atomic-organisms
description: >
  Atomic design organisms — React complex components composed of molecules and atoms.
  Trigger: Building complex UI sections, cards with actions, forms with logic, navigation, tables.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Create React organisms: complex UI sections composed of molecules and atoms. They have business logic and state management.

## When to Load

- User asks to create a card with actions, complete form, navigation, data table, modal, etc.
- File extension is `.tsx` AND the component manages state and has business logic
- Context mentions "organism", "complex component", "section", "feature"

## What Are Organisms

- ProductCard: Image + Title + Price + AddToCart button
- LoginForm: EmailField + PasswordField + SubmitButton + validation
- NavBar: Logo + NavItems + UserMenu + MobileMenu
- DataTable: Header + Rows + Sorting + Pagination
- Modal: Header + Body + Footer + open/close state
- CommentSection: CommentList + CommentForm + LoadMore

### Distinction from Molecules

- Molecules: "Search bar" → Input + Button
- Organisms: "Search with results" → SearchBar + ResultsList + Loading state

## Implementation Pattern

```tsx
// src/components/organisms/{ComponentName}/index.tsx
import { Molecule } from '@/components/molecules/Molecule'

export interface {ComponentName}Props {
  // ... props with clear contracts
}

export function {ComponentName}({ prop1, onAction }: {ComponentName}Props) {
  const [state, setState] = useState()

  // Business logic here
  const handleAction = () => { /* ... */ }

  return (
    <section data-testid="{component-name}">
      <Molecule prop1={prop1} onCustom={handleAction} />
    </section>
  )
}
```

## Rules

1. **State management** — organisms can have useState/useReducer for UI state
2. **Business logic** — can contain validation, data transformation, side effects
3. **Composition** — built from molecules, not atoms directly (prefer molecules for reusability)
4. **Data fetching** — organisms can have useEffect for data loading, but keep it simple
5. **CSS** — organize with CSS modules or scoped styles, composition from molecule CSS

## File Structure

```
src/components/organisms/
  ProductCard/
    index.tsx
    ProductCard.module.css
    ProductCard.test.tsx
  LoginForm/
    ...
```