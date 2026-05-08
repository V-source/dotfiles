---
name: design-system
description: >
  Creates accessible, scalable design systems with CSS custom properties, theme support, and WCAG-compliant color palettes.
  Trigger: When user asks to set up a design system, create CSS themes, generate color palettes, ensure WCAG contrast, or implement design tokens.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## When to Use
- User requests new design system or theme setup
- Implementing dark/light mode or multi-theme support
- Creating semantic CSS custom properties (design tokens)
- Validating WCAG contrast ratios for accessibility
- Generating cohesive color palettes for UI components
- Refactoring hardcoded CSS values to reusable tokens

## Critical Patterns
- Use semantic token names (e.g., `--color-bg-primary`) over value-based names (e.g., `--color-soft-blue`)
- Define all tokens in `:root` with theme overrides via `[data-theme="theme-name"]` selectors
- Enforce WCAG AA contrast (4.5:1 normal text, 3:1 large text) between background and text tokens
- Never hardcode hexadecimal values in component CSS; always reference token variables
- Maintain consistent color temperature across all themes for cohesion
- Use `prefers-color-scheme` media queries for OS-level theme integration
- Keep theme blocks structurally identical: same token names, only values differ

## Code Examples
Minimal themed design system with semantic tokens:

```css
:root {
  /* Default light theme */
  --color-bg-primary: #ffffff;
  --color-text-primary: #1a1a1a;
  --color-accent: #0066cc;
  --shadow-color: rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
  --color-bg-primary: #1a1a1a;
  --color-text-primary: #ffffff;
  --color-accent: #3399ff;
  --shadow-color: rgba(0, 0, 0, 0.3);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --color-bg-primary: #1a1a1a;
    --color-text-primary: #ffffff;
  }
}

/* Component usage */
.card {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  box-shadow: 0 2px 4px var(--shadow-color);
}
```

## Commands
```bash
# Find hardcoded hex color values in CSS files to refactor into tokens
grep -rE "#[0-9a-fA-F]{3,8}" src/styles/
```
