# Rezervacija Vjenčanja - Design System

| Item | Value |
|---|---|
| Document | Design System |
| Version | 1.0 |
| Status | Working draft |
| Based on | `docs/brand-guidelines.md` |
| Primary audience | Design, frontend and product contributors |
| Last updated | April 2026 |

## 1. Purpose

This document translates the brand tokens from `docs/brand-guidelines.md` into a practical design system for the Rezervacija Vjenčanja product. It defines how the visual language should be applied across layouts, components, states and themes so the interface stays consistent as the application grows.

The brand guidelines remain the source of truth for raw tokens. This document defines how those tokens are used inside the product.

## 2. Design Principles

### 2.1 Calm Professionalism

The product should feel reliable, organised and operational. The interface is not promotional; it is a working tool for internal agency use. Visual decisions should prioritise clarity over visual noise.

### 2.2 Structured Information First

Most screens in the product are data-heavy: weddings, partners, prices, statuses and documents. Layouts should support quick scanning, comparison and editing without forcing the user to decode the interface.

### 2.3 Semantic Over Decorative

Colours, elevation, spacing and typography should communicate hierarchy and state. Decorative usage is secondary. Primary blue marks action and focus, not large ornamental surfaces.

### 2.4 Consistency Across Modules

The dashboard, partner management, wedding detail pages and document flows should all feel like parts of one system. Reuse the same component patterns, spacing rhythm and state language across modules.

### 2.5 Theme Parity

Light and dark mode should feel like two equal product experiences, not an afterthought. Both must preserve readability, contrast, status semantics and component hierarchy.

## 3. Foundations

### 3.1 Color System

The palette is built in the OKLCH color space and centered around a blue-indigo identity. Token usage is semantic rather than literal.

#### Core semantic colors

| Token | Light | Dark | Primary use |
|---|---|---|---|
| `background` | `oklch(0.96 0.01 271.34)` | `oklch(0.26 0.03 262.67)` | app background |
| `foreground` | `oklch(0.21 0.03 263.61)` | `oklch(0.93 0.01 261.82)` | primary text |
| `card` | `oklch(0.98 0.01 271.41)` | `oklch(0.35 0.02 255.68)` | card and panel surfaces |
| `primary` | `oklch(0.48 0.20 260.47)` | `oklch(0.56 0.24 260.92)` | primary actions, active states, focus |
| `secondary` | `oklch(0.91 0.02 274.06)` | `oklch(0.35 0.04 261.40)` | subtle supporting surfaces |
| `muted` | `oklch(0.94 0.02 274.86)` | `oklch(0.30 0.03 260.51)` | disabled and low-emphasis surfaces |
| `accent` | `oklch(0.95 0.02 260.18)` | `oklch(0.33 0.04 264.63)` | hover surfaces and lightweight emphasis |
| `destructive` | `oklch(0.58 0.22 27.29)` | `oklch(0.64 0.21 25.39)` | destructive and error actions |
| `border` | `oklch(0.89 0.02 259.43)` | `oklch(0.35 0.04 261.40)` | dividers and outlines |
| `ring` | `oklch(0.48 0.20 260.47)` | `oklch(0.56 0.24 260.92)` | keyboard and focus ring |

#### Supporting sets

| Set | Notes |
|---|---|
| Sidebar tokens | mirror the semantic token structure and are reserved for sidebar surfaces and states only |
| Chart tokens | provide five data-visualisation steps in the same blue family and should not be reused as general UI colours |

### 3.2 Colour Usage Rules

#### Do

- Use `--primary` for buttons, active navigation, selected states and focus rings.
- Use `--destructive` only for irreversible or dangerous actions.
- Use `--muted-foreground` for supporting metadata such as dates, counts and helper text.
- Use `--border` as the default divider and outline colour.
- Use `--accent` for hover backgrounds on ghost and list-style interactions.

#### Do not

- Do not use raw OKLCH values directly inside components.
- Do not fill large surfaces with `--primary`.
- Do not use chart tokens outside charts.
- Do not mix sidebar tokens with main content tokens.

### 3.3 Typography

| Role | Font | Variable | Usage |
|---|---|---|---|
| UI sans | Inter | `--font-sans` | app UI, labels, forms, navigation, tables |
| Editorial serif | Source Serif 4 | `--font-serif` | document headings and print-oriented sections |
| Mono | IBM Plex Mono | `--font-mono` | IDs, codes, prices in aligned columns, technical values |

#### Recommended type scale

| Size | Tailwind class | Primary usage |
|---|---|---|
| 12px | `text-xs` | badges, timestamps, secondary table labels |
| 14px | `text-sm` | standard body text, form labels, table rows |
| 16px | `text-base` | section labels, standard card headers |
| 18px | `text-lg` | sub-headings |
| 24px | `text-2xl` | page headings |
| 30px | `text-3xl` | dashboard statistic values |

#### Weight rules

- `font-normal` for body text and tabular content.
- `font-medium` for labels and navigation items.
- `font-semibold` for headings and card titles.
- `font-bold` only when the hierarchy truly needs it.

### 3.4 Radius

| Token | Value | Typical use |
|---|---|---|
| `--radius-sm` | 2px | badges, chips, tiny tags |
| `--radius-md` | 4px | inputs, table cells, dropdowns |
| `--radius-lg` | 6px | buttons, cards, popovers, modals |
| `--radius-xl` | 10px | large panels, sidebar containers, drawers |

The system uses compact rounding. Avoid pill-shaped components unless the element is intentionally badge-like.

### 3.5 Shadows

| Token | Use |
|---|---|
| `--shadow-2xs`, `--shadow-xs` | barely elevated or interactive-flat elements |
| `--shadow-sm` | default cards |
| `--shadow` | active buttons and selected cards |
| `--shadow-md` | dropdowns and elevated transient elements |
| `--shadow-lg` | modals and dialogs |
| `--shadow-xl` | full-screen overlays or drawers |
| `--shadow-2xl` | toast and highest priority floating surfaces |

### 3.6 Spacing

Use a 4px base spacing rhythm.

| Context | Recommended value |
|---|---|
| Page horizontal padding | `px-6` desktop, `px-4` mobile |
| Card padding | `p-6` |
| Section gap | `gap-4` or `gap-6` |
| Form field gap | `gap-4` |
| Table cell padding | `px-4 py-3` |
| Sidebar width | `w-64` |

## 4. Theme Architecture

### 4.1 Source of Truth

The source of truth is a semantic CSS variable system defined in `:root` and `.dark`, then exposed to Tailwind through `@theme inline`.

### 4.2 Theme Structure

| Layer | Responsibility |
|---|---|
| `:root` | light theme token defaults |
| `.dark` | dark theme overrides |
| `@theme inline` | maps CSS variables into Tailwind token aliases |

### 4.3 Implementation Rule

Components should consume semantic tokens such as `bg-card`, `text-foreground`, `border-border`, `shadow-sm` and `text-muted-foreground`. They should not depend on hardcoded color values.

## 5. Component System

### 5.1 Buttons

| Variant | Token use | Notes |
|---|---|---|
| Primary | `primary` + `primary-foreground` | single main action per surface |
| Secondary | `secondary` + `secondary-foreground` | supporting action |
| Ghost | transparent + `accent` on hover | list rows, low-emphasis actions |
| Destructive | `destructive` + light foreground | delete and cancellation only |

Rules:

- Primary buttons carry the main action only.
- Disabled buttons should rely on muted states and clear visual inactivity.
- Focus must use the semantic ring token.

### 5.2 Cards and Panels

- Use `card`, `card-foreground`, `border` and `shadow-sm` by default.
- Reserve stronger elevation for overlays and temporary surfaces.
- Keep surface hierarchy shallow; not every container needs a shadow.

### 5.3 Forms

- Inputs use `input`, `border`, `foreground` and `muted-foreground`.
- Labels should remain visible and not rely on placeholders.
- Helper text uses muted foreground.
- Error states use destructive semantics.

### 5.4 Tables

- Tables should prioritise readability over heavy decoration.
- Use compact row rhythm with clear cell padding.
- Header rows should use subtle secondary or muted surface treatment.
- Numeric values and IDs should use tabular or monospaced presentation when alignment matters.

### 5.5 Status Badges

#### Wedding statuses

| Status | Visual intent | Label |
|---|---|---|
| `PREPARATION` | primary tint background + primary text | U pripremi |
| `CONFIRMED` | green success style | Potvrđeno |
| `COMPLETED` | muted neutral style | Završeno |
| `CANCELLED` | destructive tint background + destructive text | Otkazano |

#### Wedding-partner statuses

| Status | Visual intent | Label |
|---|---|---|
| `PROPOSED` | neutral muted | Predloženo |
| `OFFERED` | amber / warning style | Ponuđeno |
| `CONFIRMED` | green success style | Potvrđeno |
| `CANCELLED` | destructive style | Otkazano |

### 5.6 Sidebar and Navigation

- Sidebar surfaces use sidebar-specific tokens only.
- Active navigation items should use sidebar primary semantics.
- Hover states should use sidebar accent semantics.
- Sidebar width should remain stable at `w-64` unless there is a product reason to change it.

### 5.7 Modals, Sheets and Popovers

- Use `popover` surfaces and larger radius tokens.
- Use `shadow-lg` or above depending on elevation level.
- Maintain clear action hierarchy: one primary action, one secondary path, destructive separated.

### 5.8 Toasts and Feedback

- Toasts should use elevated surfaces, short message lines and clear semantic colouring.
- Success, warning and error states should rely on semantic colours, not arbitrary hues.

### 5.9 Charts

- Use chart tokens in order from `chart-1` to `chart-5`.
- Do not use chart colours as general-purpose interface accents.
- Ensure labels, legends and supporting text still use standard foreground and muted foreground tokens.

## 6. Interaction Rules

- Focus states must use the semantic ring token.
- Hover states should be subtle and mostly based on accent surfaces.
- Selected states should rely on primary semantics.
- Disabled states should reduce emphasis without losing readability.
- Destructive actions should be visually separated from standard actions.

## 7. Documentation and Engineering Rules

- Brand tokens live in `docs/brand-guidelines.md`.
- Product-facing usage guidance lives in this document.
- New components should be added to the design system before they are repeated across modules.
- UI reviews should check token usage, spacing rhythm, state clarity and status consistency.

## 8. Recommended Review Checklist

- Does the component use semantic tokens instead of raw values?
- Does the surface hierarchy feel consistent with the rest of the product?
- Is the main action visually obvious?
- Are status colours and labels consistent with system rules?
- Is typography aligned with the defined scale and weight roles?
- Does the component work in both light and dark mode?

## 9. Relationship to Brand Guidelines

This design system is derived directly from `docs/brand-guidelines.md`.

Use the brand guidelines when you need:

- exact OKLCH token values
- the raw CSS variable source
- Tailwind token mapping details

Use this design system when you need:

- component usage guidance
- layout and interaction rules
- a consistent interpretation of the brand tokens inside the product