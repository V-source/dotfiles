---
name: apple-hig-tokens
description: Referencia completa de tokens CSS, componentes y patrones Apple HIG para web. Diseñado para IAs que generan componentes compatibles con el sistema de diseño Apple HIG sin depender de frameworks específicos.
license: MIT
metadata:
  version: "1.0.0"
  author: "Senior UI Architect"
  pedagogy:
    - "Design Tokens First (Todas las decisiones visuales via CSS Custom Properties)"
    - "Framework Agnostic (CSS puro, vanilla JS, adaptable a React/Vue/Svelte)"
    - "Semantic Over Fixed (colores por propósito, no por hex)"
    - "Accessibility as Requirement (44pt touch targets, reduced motion, Dynamic Type)"
---

# 🍎 Apple HIG Design Tokens — Referencia de Implementación para IA

**Rol:** Arquitecto de UI especializado en el sistema de diseño Apple HIG para web. Tu misión es generar componentes, layouts y patrones utilizando los tokens CSS definidos, asegurando consistencia visual, accesibilidad y fidelidad a los principios HIG.

**Importante:** Los valores hex de colores semánticos son *community-measured*. Apple NO publica valores garantizados. Diseña para el rol semántico, no para el hex fijo.

---

## 1. DESIGN TOKENS — CSS Custom Properties

Declaradas en `:root`. Se sobrescriben en `[data-theme="dark"]`.

### Tipografía

| Token | Valor |
|---|---|
| `--font-sans` | `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif` |
| `--font-mono` | `"SF Mono", SFMono-Regular, ui-monospace, Menlo, Monaco, Consolas, monospace` |

### Type Scale

| Token | Valor | Uso |
|---|---|---|
| `--text-xs` | 10px | Labels, badges, metadata, tablas (th) |
| `--text-sm` | 12px | Caption, celdas de tabla, helper |
| `--text-base` | 13px | Body text, párrafos |
| `--text-md` | 15px | Subheadline, callouts |
| `--text-hl` | 17px | Headline, card titles (semibold) |
| `--text-lg` | 20px | H3 — section headings |
| `--text-xl` | 24px | H2 — page headings |
| `--text-2xl` | 30px | H1 — hero titles |
| `--text-3xl` | 34px | Large Title — landing |

**Regla:** Headlines usan `font-weight: 700` + `tracking-tight`. Body usa `weight-regular` + `leading-normal`. Labels uppercase usan `text-xs` + `tracking-wider` + `semibold`.

### Leading & Tracking

| Token | Valor |
|---|---|
| `--leading-tight` | 1.2 |
| `--leading-normal` | 1.5 |
| `--leading-relaxed` | 1.6 |
| `--tracking-tight` | -0.025em |
| `--tracking-normal` | 0 |
| `--tracking-wide` | 0.025em |
| `--tracking-wider` | 0.05em |

### Font Weights

| Token | Valor |
|---|---|
| `--weight-regular` | 400 |
| `--weight-medium` | 500 |
| `--weight-semibold` | 600 |
| `--weight-bold` | 700 |

### Light Mode Palette

| Nombre | Valor | Propósito |
|---|---|---|
| `--bg-primary` | `#f5f5f7` | Fondo principal |
| `--bg-secondary` | `#ffffff` | Fondo cards |
| `--bg-tertiary` | `#e8e8ed` | Inputs, botones secundarios |
| `--card-bg` | `rgba(255,255,255,0.72)` | Fondo glass cards |
| `--card-border` | `rgba(255,255,255,0.5)` | Borde cards |
| `--text-primary` | `#1d1d1f` | Texto principal |
| `--text-secondary` | `#86868b` | Descripciones |
| `--text-tertiary` | `#a1a1a6` | Placeholders |
| `--accent-color` | `#0071e3` | Acento principal |
| `--accent-hover` | `#0077ed` | Hover acento |
| `--accent-green` | `#34c759` | Success |
| `--accent-red` | `#ff3b30` | Error / Destructivo |
| `--accent-orange` | `#ff9500` | Warning |
| `--accent-purple` | `#af52de` | Purple HIG |

### Glassmorphism & Shadows

| Token | Valor |
|---|---|
| `--glass-bg` | `rgba(255,255,255,0.65)` |
| `--glass-blur` | `saturate(180%) blur(20px)` |
| `--shadow-sm` | `0 2px 8px rgba(0,0,0,0.04)` |
| `--shadow-md` | `0 8px 24px rgba(0,0,0,0.08)` |
| `--shadow-lg` | `0 16px 32px rgba(0,0,0,0.12)` |

### Radii (Apple Continuous Curves)

| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | 8px | Botones, inputs |
| `--radius-md` | 12px | Cards, popovers |
| `--radius-lg` | 18px | Cards principales |
| `--radius-xl` | 24px | Modales, sheets |
| `--radius-pill` | 9999px | Chips, badges |

### Transitions

| Token | Curva |
|---|---|
| `--ease-apple` | `cubic-bezier(0.25,1,0.5,1)` |
| `--transition-fast` | `0.2s var(--ease-apple)` |
| `--transition-smooth` | `0.35s var(--ease-apple)` |

### Dark Mode — Cambios en `[data-theme="dark"]`

| Variable | Light | Dark |
|---|---|---|
| `--bg-primary` | `#f5f5f7` | `#000000` |
| `--bg-secondary` | `#ffffff` | `#1c1c1e` |
| `--bg-tertiary` | `#e8e8ed` | `#2c2c2e` |
| `--text-primary` | `#1d1d1f` | `#f5f5f7` |
| `--accent-color` | `#0071e3` | `#2997ff` |
| `--card-bg` | `rgba(255,255,255,0.72)` | `rgba(28,28,30,0.72)` |
| `--glass-bg` | `rgba(255,255,255,0.65)` | `rgba(30,30,32,0.7)` |

**Regla:** El CSS cambia SOLO valores de variables CSS en `[data-theme="dark"]`. No reemplaza reglas completas. Los componentes heredan automáticamente. Los colores apple (`--apple-*`) son FIJOS y NO cambian en dark mode.

### Apple Color System — Utility Classes

| Nombre | Hex | CSS Prop | Utility Classes |
|---|---|---|---|
| Blue | `#007AFF` | `--apple-blue` | `.bg-apple-blue`, `.text-apple-blue`, `.border-apple-blue` |
| Green | `#34C759` | `--apple-green` | `.bg-apple-green`, `.text-apple-green`, `.border-apple-green` |
| Indigo | `#5856D6` | `--apple-indigo` | `.bg-apple-indigo`, `.text-apple-indigo`, `.border-apple-indigo` |
| Orange | `#FF9500` | `--apple-orange` | `.bg-apple-orange`, `.text-apple-orange`, `.border-apple-orange` |
| Red | `#FF3B30` | `--apple-red` | `.bg-apple-red`, `.text-apple-red`, `.border-apple-red` |
| Purple | `#AF52DE` | `--apple-purple` | `.bg-apple-purple`, `.text-apple-purple`, `.border-apple-purple` |
| Gray | `#8E8E93` | `--apple-gray` | `.bg-apple-gray`, `.text-apple-gray` |
| Light Gray | `#E5E5EA` | `--apple-light-gray` | `.bg-apple-light-gray`, `.border-apple-light-gray` |
| Ultra Light | `#F2F2F7` | `--apple-ultra-light` | `.bg-apple-ultra-light` |

---

## 2. LAYOUT SYSTEM — 8px Grid

Apple HIG usa cuadrícula de 8px como unidad fundamental. Márgenes, paddings y gaps deben ser múltiplos de 8px (o 4px para micro-interacciones).

### Spacing Scale

| Token | Valor | Múltiplo | Uso |
|---|---|---|---|
| `--space-xxs` | 4px | 0.5× | Micro spacing, gap iconos |
| `--space-xs` | 8px | 1× | Icono→texto, padding chips |
| `--space-sm` | 12px | 1.5× | Padding botones horizontal |
| `--space-md` | 16px | 2× | Padding cards, gap estándar |
| `--space-lg` | 24px | 3× | Gap card→card vertical |
| `--space-xl` | 32px | 4× | Separación entre secciones |
| `--space-2xl` | 48px | 6× | Separación mayor de página |
| `--space-3xl` | 64px | 8× | Page-level breathing room |

### Internal Component Padding

| Componente | Padding |
|---|---|
| Cards | `--space-md` H × `--space-lg` V |
| Botones | `--space-md` H × `--space-xs` V |
| Inputs / Text Fields | `--space-md` H × `--space-sm` V |
| Modales | `--space-xl` H × V |
| Bottom Sheet | `--space-lg` H × `--space-md` V |
| Table / List Items | `--space-md` H × `--space-sm` V |
| Chips / Tags / Badges | `--space-xs` H × `--space-xxs` V |
| Tab Items | `--space-md` H × `--space-xs` V |

### Component-to-Component Spacing

| Relación | Gap |
|---|---|
| Entre cards en grid | 24px (`--space-lg`) |
| Entre secciones de página | 48px (`--space-2xl`) |
| Entre heading y contenido | 16px (`--space-md`) |
| Entre label y su input | 8px (`--space-xs`) |
| Entre items de lista/table | 12px (`--space-sm`) |
| Entre botones adyacentes | 12px (`--space-sm`) |
| Entre icono y texto inline | 8px (`--space-xs`) |
| Entre párrafos de texto | 12px (`--space-sm`) |

### Stacking Context (z-index)

| Capa | z-index | Elementos |
|---|---|---|
| Base | auto | Page content, cards, tablas |
| Sticky | 10 | Sidebar, headers |
| Sticky Nav | 50 | Navigation bars |
| Dropdown / Popover | 100 | Popovers, tooltips, dropdown |
| Modal Overlay | 1000 | Backdrop de modales, sheets |
| Modal Panel | 1001 | Modal cards, sheets |
| Toast | 1100 | Toast notifications |
| Context Menu | 1200 | Menús contextuales |

**Regla:** Todos los modales deben portearse al `<body>` para evitar conflictos de stacking context con `position: relative` en ancestros.

### Safe Areas — CSS

```css
:root {
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-left: env(safe-area-inset-left, 0px);
  --safe-area-right: env(safe-area-inset-right, 0px);
}
```

Usar `max(margin_deseada, env(safe-area-inset))` para soportar dispositivos con y sin notch.

### Content Margins Responsivos

| Viewport | Margen horizontal | Max reading width |
|---|---|---|
| Mobile (<768px) | 16pt | — |
| Tablet (768-1024px) | 20pt | — |
| Desktop (>1024px) | 48pt | 672pt |

---

## 3. APPLE DESIGN PRINCIPLES

Tres principios que gobiernan el diseño de interfaz Apple. Aplican a UI nativa y web.

1. **Clarity:** El contenido es lo primero. Jerarquía visual con peso y spacing, no con ruido visual. Texto legible con `--text-hl` para headlines, `--text-base` para body.
2. **Deference:** La UI se aparta para que el contenido brille. Fondos sutiles (`--bg-primary`), glass translúcido, tipografía neutral. Chrome (barras, bordes) mínimo.
3. **Depth:** Capas visuales y movimiento realista comunican jerarquía. Sombras (`--shadow-*`), glass, animaciones con `--ease-apple`. La profundidad es funcional, no decorativa.

---

## 4. SEMANTIC COLOR SYSTEM

Apple define colores por PROPÓSITO, no por valor Hex. Diseña para el rol semántico.

### Label Hierarchy (Foreground)

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--label` | `#1d1d1f` | `#f5f5f7` | Texto principal, headlines |
| `--secondary-label` | `rgba(60,60,67,0.6)` | `rgba(235,235,245,0.6)` | Subtítulos, metadata |
| `--tertiary-label` | `rgba(60,60,67,0.3)` | `rgba(235,235,245,0.3)` | Placeholders, deshabilitado |
| `--quaternary-label` | `rgba(60,60,67,0.18)` | `rgba(235,235,245,0.18)` | Bordes muy sutiles |
| `--link` | `#007AFF` | `#0A84FF` | Links, texto interactivo |

### System Backgrounds

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--system-background` | `#ffffff` | `#000000` | Fondo primario |
| `--secondary-system-bg` | `#f2f2f7` | `#1c1c1e` | Fondo de grupos |
| `--tertiary-system-bg` | `#ffffff` | `#2c2c2e` | Fondo celdas agrupadas |

### System Fills

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--system-fill` | `rgba(120,120,128,0.2)` | `rgba(120,120,128,0.36)` | Toggles, sliders |
| `--secondary-system-fill` | `rgba(120,120,128,0.16)` | `rgba(120,120,128,0.32)` | Botones secundarios |
| `--tertiary-system-fill` | `rgba(118,118,128,0.12)` | `rgba(118,118,128,0.24)` | Text fields, search |

### Separators

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--separator` | `rgba(60,60,67,0.29)` | `rgba(84,84,88,0.6)` | Separador translúcido |
| `--opaque-separator` | `#c6c6c8` | `#38383a` | Separador opaco (modales) |

---

## 5. MATERIALS & LIQUID GLASS (iOS 26+)

Para web se implementa manualmente con `backdrop-filter`. Solo aplicar cuando se apunte a iOS 26+ o "Apple look 2025".

### HIG Material → CSS

| Material | CSS `backdrop-filter` | Uso |
|---|---|---|
| `.ultraThinMaterial` | `blur(12px) saturate(150%)` | Overlays ligeros |
| `.thinMaterial` | `blur(20px) saturate(180%)` | Cards glass, popovers |
| `.regularMaterial` | `blur(30px) saturate(190%)` | Nav bars, sidebars |
| `.thickMaterial` | `blur(40px) saturate(200%)` | Modales, sheets |
| `.ultraThickMaterial` | `blur(60px) saturate(220%)` | Alertas, drag & drop |

### CSS Implementation

```css
.liquid-glass {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

@media (prefers-color-scheme: dark) {
  .liquid-glass {
    background: rgba(30, 30, 30, 0.5);
    border-color: rgba(255, 255, 255, 0.08);
  }
}

@supports not (backdrop-filter: blur(1px)) {
  .liquid-glass { background: var(--bg-secondary); }
}

@media (prefers-reduced-transparency: reduce) {
  .liquid-glass { background: var(--bg-secondary); backdrop-filter: none; }
}
```

---

## 6. SF SYMBOLS & ICONOGRAFÍA

SF Symbols están licenciados solo para Apple. Para web cross-platform: Lucide, Phosphor, Heroicons.

### Symbol Weights

| Peso | Font Weight | Uso |
|---|---|---|
| Ultralight | 100 | Decorativo |
| Thin | 200 | Fondo |
| Light | 300 | Iconos grandes |
| Regular | 400 | Default |
| Medium | 500 | Toolbars |
| Semibold | 600 | Botones, nav bars |
| Bold | 700 | Headers |
| Heavy | 800 | Badges, tab selected |
| Black | 900 | Extremos |

### Reglas
- **Match weight** con texto adyacente (Regular 400 junto a Body 400, Semibold 600 junto a Headline 600)
- **Tamaños:** 16pt (inline), 20pt (botones), 28pt (toolbar), 40-60pt (empty states)
- **Estados:** fill para selected, outline para default. No usar solo color para estado.
- **Accesibilidad:** decorativos → `aria-hidden="true"`. Funcionales → `aria-label`.

---

## 7. MOTION & ANIMATION

Sistema de duraciones y curves con soporte integrado de `prefers-reduced-motion` a nivel de tokens.

### Duration Scale

| Token | Valor | Uso |
|---|---|---|
| `--dur-instant` | 50ms | Feedback inmediato (< 100ms = manipulación directa) |
| `--dur-fast` | 120ms | Hover, tooltips, micro-interacciones |
| `--dur-base` | 200ms | Transiciones UI estándar (100-300ms = natural) |
| `--dur-slow` | 350ms | Modales, sheets entrando |
| `--dur-slower` | 500ms | Page transitions, hero (> 300ms = lento, reservar) |

### Easing Curves

| Token | Curva | Cuándo usar |
|---|---|---|
| `--ease-out` | `cubic-bezier(0,0,0.2,1)` | Elementos entrando |
| `--ease-in` | `cubic-bezier(0.4,0,1,1)` | Elementos saliendo |
| `--ease-in-out` | `cubic-bezier(0.4,0,0.2,1)` | Opacidad, color, dark mode |
| `--ease-spring` | `linear()` 30+ puntos | Overshoot natural (botones, cards) |
| `--ease-apple` | `cubic-bezier(0.25,1,0.5,1)` | Curva Apple estándar |

### Micro-interacciones

```css
/* Button Press */
button:active { transform: scale(0.97); transition: transform var(--dur-fast) var(--ease-out); }

/* Card Hover Lift */
.card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); transition: all var(--dur-fast); }

/* Reduce Motion — anula TODAS las animaciones en una regla */
@media (prefers-reduced-motion: reduce) {
  :root {
    --dur-instant: 0ms !important;
    --dur-fast: 0ms !important;
    --dur-base: 0ms !important;
    --dur-slow: 0ms !important;
    --dur-slower: 0ms !important;
    --transition-fast: 0s !important;
    --transition-smooth: 0s !important;
  }
}
```

---

## 8. COMPONENTES — API de Uso

### Dynamic Island
```html
<div class="dynamic-island"><div class="di-content">Contenido</div></div>
```
CSS: `.di-pulse` animación continua. Sin JS requerido.

### Botones HIG
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-tinted">Tinted</button>
```
Estados CSS `:hover`, `:active`, `:disabled`. Sin JS requerido.

### Segmented Control
```html
<div class="segmented-control">
  <button class="segmented-btn active">Día</button>
  <button class="segmented-btn">Semana</button>
  <button class="segmented-btn">Mes</button>
</div>
```
JS: click → remove `.active` de todos, add al clickeado.

### Activity Rings
```html
<div class="activity-ring-container">
  <svg class="ring-svg" viewBox="0 0 120 120">
    <circle class="ring-circle-move" ... stroke-dasharray="280" stroke-dashoffset="60" />
  </svg>
</div>
```
SVG animado vía `stroke-dashoffset` con CSS `@keyframes` o JS.

### Switch / Toggle
```html
<label class="switch">
  <input type="checkbox">
  <span class="slider-toggle"></span>
</label>
```
CSS puro: `input:checked + .slider-toggle` cambia background + translateX. Sin JS.

### Skeleton Loading
```html
<div class="skeleton">
  <div class="skeleton-text"></div>
  <div class="skeleton-avatar"></div>
</div>
```
Animación CSS shimmer con `@keyframes shimmer`. Sin JS. Se oculta al renderizar contenido real.

### Modales
```html
<div class="modal-overlay">
  <div class="modal-card">
    <h2>Título</h2>
    <p>Contenido</p>
    <button class="btn btn-primary">Aceptar</button>
  </div>
</div>
```
- Click en overlay o Escape → cierra
- Body `overflow: hidden` mientras abierto
- Portear al `<body>` para evitar z-index issues

### Bottom Sheet
```html
<div class="bottom-sheet-overlay">
  <div class="bottom-sheet">
    <div class="sheet-handle"></div>
    <!-- contenido -->
  </div>
</div>
```
Slide-up desde abajo. Cierra con click overlay o swipe down.

### Toast Notifications
```html
<div class="toast-fixed-container">
  <div class="toast-item toast-success">Mensaje</div>
</div>
```
Slide-down + fade-in desde top-right. Auto-destrucción 3s. 4 variantes: `toast-success` (verde), `toast-error` (rojo), `toast-warning` (naranja), `toast-info` (azul).

### Pull to Refresh
```html
<div class="ptr-container">
  <div class="ptr-indicator">
    <div class="ptr-spinner"></div>
    <span>Suelta para actualizar</span>
  </div>
  <div class="ptr-item">Item 1</div>
</div>
```
Scroll up > 60px → ready state. Soltar (pullDistance > 60) → refresh + spinner.

### Accordion
```html
<div class="accordion-panel">
  <button class="accordion-header">
    Título <span class="accordion-triangle">▶</span>
  </button>
  <div class="accordion-content">
    <div class="accordion-inner">Contenido</div>
  </div>
</div>
```
Click header expande/colapsa vía max-height animation. Triángulo rota 180°.

### Rating (Stars)
```html
<div class="rating-stars">
  <button class="star-filled">★</button>
  <button class="star-empty">☆</button>
</div>
```
Hover preview ilumina estrellas hasta la posición. Click fija rating.

### Tabs
```html
<div class="tabs-container">
  <button class="tab active">General</button>
  <button class="tab">Detalles</button>
</div>
<div class="tab-panel active">Panel 1</div>
<div class="tab-panel">Panel 2</div>
```
Click en `.tab` marca activo y muestra panel correspondiente.

### Tag Input
```html
<div class="tag-input-wrapper">
  <span class="tag-chip-ios">tag1 <button>×</button></span>
  <input class="tag-input-field" placeholder="Escribe y presiona Enter">
</div>
```
Enter o coma → chip. × elimina. Backspace en vacío elimina último chip.

### Pagination
```html
<div class="pagination">
  <button class="pagination-btn" disabled>‹</button>
  <button class="pagination-btn active">1</button>
  <button class="pagination-btn">2</button>
  <button class="pagination-btn">›</button>
</div>
```
Anterior/Siguiente deshabilitados en extremos. Elipsis para rangos grandes.

### Context Menu
```html
<div class="context-menu-area">
  <div class="context-menu" style="left: Xpx; top: Ypx">
    <button class="context-menu-item">Opción</button>
    <div class="context-menu-separator"></div>
    <button class="context-menu-item">Eliminar</button>
  </div>
</div>
```
Click derecho posiciona menú en coordenadas mouse. Click fuera o Escape cierra.

### Data Tables

Estructura base:
```html
<div class="overflow-x-auto">
  <table class="data-table">
    <thead><tr><th>Col</th></tr></thead>
    <tbody><tr><td>Dato</td></tr></tbody>
  </table>
</div>
```

**Reglas:**
- Celdas: `padding: 14px 16px` (`py-3.5 px-4`)
- NO usar zebra striping (Apple no lo usa modernamente). En su lugar, `hover` en fila
- Cabecera sticky opcional: `position: sticky; top: 0; z-index: 10`
- Texto: left. Monedas/números: right. Acciones/checkboxes: center
- Min-width por columna + `overflow-x-auto` en wrapper
- En mobile extremo: convertir filas a cards stack

---

## 9. ACCESIBILIDAD HIG

| Requerimiento | Valor |
|---|---|
| Tamaño mínimo táctil | **44×44pt** (excede WCAG AAA) |
| Recomendado | 48×48pt |
| Espaciado entre targets | 8pt mínimo |
| Contraste texto normal | WCAG AA 4.5:1 mínimo |
| Contraste texto grande | 3:1 (>18pt bold o >24pt) |

- `--secondary-label` y `--tertiary-label` tienen bajo contraste por diseño — no usar para info crítica
- Unidades `rem`/`em`, no `px` fijos (Dynamic Type). UI debe funcionar al 300% de tamaño base
- Animaciones decorativas respetan `prefers-reduced-motion` (manejado globalmente vía tokens)
- Glass se vuelve sólido con `prefers-reduced-transparency`
- Iconos decorativos: `aria-hidden="true"`. Funcionales: `aria-label`
- `focus-visible` visible en todos los controles
- No depender solo del color para identificar botones (usar icono + label)

---

## 10. FRAMEWORK RECOMMENDATIONS

Este sistema funciona con **CSS puro** y no requiere ningún framework. Para producción:

- Usar las clases CSS directamente (no requieren Tailwind)
- Implementar comportamientos con vanilla JS o cualquier framework (React, Vue, Svelte, Alpine, etc.)
- Si usas Tailwind, registra los colores en `tailwind.config.theme.extend.colors.apple`
