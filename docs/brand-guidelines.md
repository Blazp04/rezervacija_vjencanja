# Brand Guidelines

Design token reference for the Rezervacija Vjenčanja application. All tokens are defined as CSS custom properties and consumed via Tailwind's `@theme inline` block.

---

## Color System

The palette is built entirely in the **OKLCH color space** — a perceptually uniform model where equal changes in chroma/lightness feel equal to the human eye. Hue values cluster tightly around **260–265°** (blue-indigo), giving the UI a focused, professional identity.

### Light Mode

| Token | CSS Variable | OKLCH Value | Role |
|-------|-------------|-------------|------|
| `background` | `--background` | `oklch(0.96 0.01 271)` | Page background |
| `foreground` | `--foreground` | `oklch(0.21 0.03 264)` | Primary text |
| `card` | `--card` | `oklch(0.98 0.01 271)` | Card / surface background |
| `card-foreground` | `--card-foreground` | `oklch(0.21 0.03 264)` | Text on cards |
| `popover` | `--popover` | `oklch(1.00 0 0)` | Dropdown / popover background |
| `popover-foreground` | `--popover-foreground` | `oklch(0.21 0.03 264)` | Text in popovers |
| `primary` | `--primary` | `oklch(0.48 0.20 260)` | Brand blue — buttons, links, focus rings |
| `primary-foreground` | `--primary-foreground` | `oklch(1.00 0 0)` | Text on primary elements |
| `secondary` | `--secondary` | `oklch(0.91 0.02 274)` | Subtle secondary surfaces |
| `secondary-foreground` | `--secondary-foreground` | `oklch(0.37 0.03 260)` | Text on secondary surfaces |
| `muted` | `--muted` | `oklch(0.94 0.02 275)` | Muted / disabled backgrounds |
| `muted-foreground` | `--muted-foreground` | `oklch(0.55 0.02 264)` | Placeholder text, captions |
| `accent` | `--accent` | `oklch(0.95 0.02 260)` | Hover states on ghost elements |
| `accent-foreground` | `--accent-foreground` | `oklch(0.48 0.20 260)` | Text on accent elements |
| `destructive` | `--destructive` | `oklch(0.58 0.22 27)` | Error, delete, danger actions |
| `border` | `--border` | `oklch(0.89 0.02 259)` | Default border colour |
| `input` | `--input` | `oklch(0.90 0.01 267)` | Form input border |
| `ring` | `--ring` | `oklch(0.48 0.20 260)` | Focus ring (matches primary) |

### Dark Mode

| Token | CSS Variable | OKLCH Value | Role |
|-------|-------------|-------------|------|
| `background` | `--background` | `oklch(0.26 0.03 263)` | Page background |
| `foreground` | `--foreground` | `oklch(0.93 0.01 262)` | Primary text |
| `card` | `--card` | `oklch(0.35 0.02 256)` | Card / surface background |
| `card-foreground` | `--card-foreground` | `oklch(0.93 0.01 262)` | Text on cards |
| `popover` | `--popover` | `oklch(0.35 0.02 256)` | Dropdown / popover background |
| `popover-foreground` | `--popover-foreground` | `oklch(0.93 0.01 262)` | Text in popovers |
| `primary` | `--primary` | `oklch(0.56 0.24 261)` | Brand blue — slightly lighter than light mode |
| `primary-foreground` | `--primary-foreground` | `oklch(1.00 0 0)` | Text on primary elements |
| `secondary` | `--secondary` | `oklch(0.35 0.04 261)` | Subtle secondary surfaces |
| `secondary-foreground` | `--secondary-foreground` | `oklch(0.93 0.01 262)` | Text on secondary surfaces |
| `muted` | `--muted` | `oklch(0.30 0.03 261)` | Muted / disabled backgrounds |
| `muted-foreground` | `--muted-foreground` | `oklch(0.71 0.02 261)` | Placeholder text, captions |
| `accent` | `--accent` | `oklch(0.33 0.04 265)` | Hover states on ghost elements |
| `accent-foreground` | `--accent-foreground` | `oklch(0.93 0.01 262)` | Text on accent elements |
| `destructive` | `--destructive` | `oklch(0.64 0.21 25)` | Error, delete, danger actions |
| `border` | `--border` | `oklch(0.35 0.04 261)` | Default border colour |
| `input` | `--input` | `oklch(0.35 0.04 261)` | Form input border |
| `ring` | `--ring` | `oklch(0.56 0.24 261)` | Focus ring (matches primary) |

### Sidebar Tokens

The sidebar has its own token set to allow independent theming (e.g. a slightly different surface tone). Sidebar tokens mirror the main semantic tokens — use them only inside the sidebar component.

| Token | Light | Dark |
|-------|-------|------|
| `--sidebar` | `oklch(0.97 0 0)` | `oklch(0.26 0.03 263)` |
| `--sidebar-foreground` | same as `--foreground` | same as `--foreground` |
| `--sidebar-primary` | same as `--primary` | same as `--primary` |
| `--sidebar-primary-foreground` | `oklch(1.00 0 0)` | `oklch(1.00 0 0)` |
| `--sidebar-accent` | same as `--accent` | `oklch(0.33 0.04 265)` |
| `--sidebar-accent-foreground` | same as `--primary` | same as `--foreground` |
| `--sidebar-border` | `oklch(0.93 0.01 262)` | `oklch(0.35 0.04 261)` |
| `--sidebar-ring` | same as `--ring` | same as `--ring` |

### Chart / Data Visualisation Palette

Five-colour sequential palette in the same blue-indigo hue family. Use in order (chart-1 first) for series data.

| Token | Light | Dark | Approximate shade |
|-------|-------|------|-------------------|
| `--chart-1` | `oklch(0.48 0.20 260)` | `oklch(0.56 0.24 261)` | Medium blue (primary) |
| `--chart-2` | `oklch(0.56 0.24 261)` | `oklch(0.48 0.20 260)` | Vivid blue |
| `--chart-3` | `oklch(0.40 0.16 260)` | `oklch(0.69 0.17 256)` | Dark/light blue |
| `--chart-4` | `oklch(0.43 0.16 260)` | `oklch(0.43 0.16 260)` | Mid-dark blue |
| `--chart-5` | `oklch(0.29 0.07 261)` | `oklch(0.29 0.07 261)` | Deep navy |

---

## Colour Usage Rules

### Do
- Use `--primary` for all primary actions: submit buttons, selected state, active navigation items, focus rings
- Use `--destructive` **only** for irreversible actions (delete, cancel confirmed booking)
- Use `--muted-foreground` for secondary labels, placeholder text, and metadata (dates, counts)
- Use `--border` for all dividers and outline-style components
- Use `--accent` as the hover background for ghost buttons and list items (never as a standalone colour block)

### Don't
- Don't use raw OKLCH literals in component styles — always reference a semantic token
- Don't use `--primary` as a background for large surface areas (it's too saturated at scale)
- Don't use chart colours outside of charts/data visualisation
- Don't mix sidebar tokens with main tokens — keep each set contained to its context

---

## Typography

| Role | Font Family | CSS Variable | Fallback |
|------|------------|-------------|---------|
| **Sans-serif (UI)** | Inter | `--font-sans` | `sans-serif` |
| **Serif (editorial)** | Source Serif 4 | `--font-serif` | `serif` |
| **Monospace (code)** | IBM Plex Mono | `--font-mono` | `monospace` |

### Font Role Guidelines

**Inter (`--font-sans`)** — default for all UI text: labels, table content, form fields, navigation, buttons, and body copy. Inter's high legibility at small sizes makes it the primary workhorse.

**Source Serif 4 (`--font-serif`)** — for editorial contexts and document headings (e.g. inside generated PDF offers and invoices). Gives printed documents a distinguished, professional feel. Do not use for UI chrome.

**IBM Plex Mono (`--font-mono`)** — for code samples, IDs, technical values, and any fixed-width tabular data where column alignment matters (e.g. reference numbers on invoices).

### Type Scale

Use Tailwind's default type scale with these recommended usages:

| Size | Tailwind class | Use for |
|------|---------------|---------|
| 12px | `text-xs` | Table sub-labels, timestamps, badge text |
| 14px | `text-sm` | Default body, form labels, table rows |
| 16px | `text-base` | Card headings, section labels |
| 18px | `text-lg` | Page sub-headings |
| 24px | `text-2xl` | Page headings, wedding name on detail page |
| 30px | `text-3xl` | Dashboard stat numbers |

Font weights:
- Regular (`font-normal`) — body text, table rows
- Medium (`font-medium`) — labels, navigation items
- Semibold (`font-semibold`) — headings, card titles
- Bold (`font-bold`) — use sparingly, only for emphasis

---

## Border Radius

| Token | Value | Tailwind Equivalent | Use for |
|-------|-------|---------------------|---------|
| `--radius-sm` | `calc(0.375rem - 4px)` = `0.125rem` ≈ 2px | `rounded-sm` | Badges, chips, small tags |
| `--radius-md` | `calc(0.375rem - 2px)` = `0.25rem` ≈ 4px | `rounded` | Inputs, dropdowns, table cells |
| `--radius-lg` | `0.375rem` ≈ 6px | `rounded-md` | Cards, modals, popovers, buttons |
| `--radius-xl` | `calc(0.375rem + 4px)` = `0.625rem` ≈ 10px | `rounded-xl` | Sidebar, large panels, sheet drawers |

The base `--radius` is deliberately compact (6px) — avoid rounding components to pill shapes unless they are small badges.

---

## Shadows

All shadows use a black base in OKLCH (`oklch(0.00 0 0)`) with low opacity to stay neutral across both themes. Dark mode uses the same shadow values — they're subtle enough to work on dark surfaces.

| Token | CSS Value | Use for |
|-------|-----------|---------|
| `--shadow-2xs` | single layer, 5% opacity | Barely-visible depth on flat surfaces |
| `--shadow-xs` | single layer, 5% opacity | Same as 2xs — lightest interactive state |
| `--shadow-sm` | dual layer, 10% opacity | Default card elevation |
| `--shadow` | dual layer, 10% opacity | Buttons, active cards |
| `--shadow-md` | dual layer, 10% (spread 4px) | Dropdowns, date pickers, select menus |
| `--shadow-lg` | dual layer, 10% (spread 6px) | Modals, dialogs, floating panels |
| `--shadow-xl` | dual layer, 10% (spread 10px) | Full-screen overlays, side drawers |
| `--shadow-2xl` | single layer, 25% opacity | Toasts, tooltips, highest elevation |

**Elevation hierarchy:** default card → `shadow-sm`. Hover state → `shadow-md`. Modal → `shadow-lg`. Toast → `shadow-2xl`.

---

## Spacing & Layout

Use Tailwind's 4px base spacing scale. Recommended page structure values:

| Context | Value |
|---------|-------|
| Page horizontal padding | `px-6` (24px) on desktop, `px-4` (16px) on mobile |
| Card inner padding | `p-6` (24px) |
| Section gap (between cards) | `gap-4` or `gap-6` |
| Form field gap | `gap-4` |
| Table cell padding | `px-4 py-3` |
| Sidebar width | `w-64` (256px) |

---

## Component Status Colours

Standardised colours for status badges across weddings and wedding-partner records. All are semantic token references — do not use hardcoded colours.

### Wedding Status

| Status | Background token | Text token | Label (HR) |
|--------|-----------------|------------|------------|
| `PREPARATION` | `--primary` at 10% opacity | `--primary` | U pripremi |
| `CONFIRMED` | green-100 / green-900 | green-700 / green-300 | Potvrđeno |
| `COMPLETED` | `--muted` | `--muted-foreground` | Završeno |
| `CANCELLED` | `--destructive` at 10% opacity | `--destructive` | Otkazano |

### Wedding-Partner Status

| Status | Colour intent | Label (HR) |
|--------|--------------|------------|
| `PROPOSED` | Neutral grey (`--muted`) | Predloženo |
| `OFFERED` | Amber / yellow | Ponuđeno |
| `CONFIRMED` | Green | Potvrđeno |
| `CANCELLED` | `--destructive` | Otkazano |

---

## CSS Variable Reference

Full token source to paste into `globals.css`:

```css
:root {
  --background: oklch(0.96 0.01 271.34);
  --foreground: oklch(0.21 0.03 263.61);
  --card: oklch(0.98 0.01 271.41);
  --card-foreground: oklch(0.21 0.03 263.61);
  --popover: oklch(1.00 0 0);
  --popover-foreground: oklch(0.21 0.03 263.61);
  --primary: oklch(0.48 0.20 260.47);
  --primary-foreground: oklch(1.00 0 0);
  --secondary: oklch(0.91 0.02 274.06);
  --secondary-foreground: oklch(0.37 0.03 259.73);
  --muted: oklch(0.94 0.02 274.86);
  --muted-foreground: oklch(0.55 0.02 264.41);
  --accent: oklch(0.95 0.02 260.18);
  --accent-foreground: oklch(0.48 0.20 260.47);
  --destructive: oklch(0.58 0.22 27.29);
  --border: oklch(0.89 0.02 259.43);
  --input: oklch(0.90 0.01 266.73);
  --ring: oklch(0.48 0.20 260.47);
  --chart-1: oklch(0.48 0.20 260.47);
  --chart-2: oklch(0.56 0.24 260.92);
  --chart-3: oklch(0.40 0.16 259.61);
  --chart-4: oklch(0.43 0.16 259.82);
  --chart-5: oklch(0.29 0.07 261.20);
  --sidebar: oklch(0.97 0 0);
  --sidebar-foreground: oklch(0.21 0.03 263.61);
  --sidebar-primary: oklch(0.48 0.20 260.47);
  --sidebar-primary-foreground: oklch(1.00 0 0);
  --sidebar-accent: oklch(0.95 0.02 260.18);
  --sidebar-accent-foreground: oklch(0.48 0.20 260.47);
  --sidebar-border: oklch(0.93 0.01 261.82);
  --sidebar-ring: oklch(0.48 0.20 260.47);

  --font-sans: Inter, sans-serif;
  --font-serif: Source Serif 4, serif;
  --font-mono: IBM Plex Mono, monospace;

  --radius: 0.375rem;

  --shadow-2xs: 0 1px 3px 0px oklch(0.00 0 0 / 0.05);
  --shadow-xs:  0 1px 3px 0px oklch(0.00 0 0 / 0.05);
  --shadow-sm:  0 1px 3px 0px oklch(0.00 0 0 / 0.10), 0 1px 2px -1px oklch(0.00 0 0 / 0.10);
  --shadow:     0 1px 3px 0px oklch(0.00 0 0 / 0.10), 0 1px 2px -1px oklch(0.00 0 0 / 0.10);
  --shadow-md:  0 1px 3px 0px oklch(0.00 0 0 / 0.10), 0 2px 4px -1px oklch(0.00 0 0 / 0.10);
  --shadow-lg:  0 1px 3px 0px oklch(0.00 0 0 / 0.10), 0 4px 6px -1px oklch(0.00 0 0 / 0.10);
  --shadow-xl:  0 1px 3px 0px oklch(0.00 0 0 / 0.10), 0 8px 10px -1px oklch(0.00 0 0 / 0.10);
  --shadow-2xl: 0 1px 3px 0px oklch(0.00 0 0 / 0.25);
}

.dark {
  --background: oklch(0.26 0.03 262.67);
  --foreground: oklch(0.93 0.01 261.82);
  --card: oklch(0.35 0.02 255.68);
  --card-foreground: oklch(0.93 0.01 261.82);
  --popover: oklch(0.35 0.02 255.68);
  --popover-foreground: oklch(0.93 0.01 261.82);
  --primary: oklch(0.56 0.24 260.92);
  --primary-foreground: oklch(1.00 0 0);
  --secondary: oklch(0.35 0.04 261.40);
  --secondary-foreground: oklch(0.93 0.01 261.82);
  --muted: oklch(0.30 0.03 260.51);
  --muted-foreground: oklch(0.71 0.02 261.33);
  --accent: oklch(0.33 0.04 264.63);
  --accent-foreground: oklch(0.93 0.01 261.82);
  --destructive: oklch(0.64 0.21 25.39);
  --border: oklch(0.35 0.04 261.40);
  --input: oklch(0.35 0.04 261.40);
  --ring: oklch(0.56 0.24 260.92);
  --chart-1: oklch(0.56 0.24 260.92);
  --chart-2: oklch(0.48 0.20 260.47);
  --chart-3: oklch(0.69 0.17 255.59);
  --chart-4: oklch(0.43 0.16 259.82);
  --chart-5: oklch(0.29 0.07 261.20);
  --sidebar: oklch(0.26 0.03 262.67);
  --sidebar-foreground: oklch(0.93 0.01 261.82);
  --sidebar-primary: oklch(0.56 0.24 260.92);
  --sidebar-primary-foreground: oklch(1.00 0 0);
  --sidebar-accent: oklch(0.33 0.04 264.63);
  --sidebar-accent-foreground: oklch(0.93 0.01 261.82);
  --sidebar-border: oklch(0.35 0.04 261.40);
  --sidebar-ring: oklch(0.56 0.24 260.92);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);
}
```
