# Frontend Developer Guide

**Project:** Rezervacija Vjenčanja — Wedding Booking System  
**Stack:** React 19 · TypeScript 6 · Vite 8 · TailwindCSS 4 · shadcn/ui · React Query 5 · Zustand 5 · React Router 7

---

## Quick Start

```bash
cd frontend
npm install
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build
npm run lint       # ESLint check
npm run sync-schema  # Regenerate API types from OpenAPI spec (scripts/syncSchema.mts)
```

The backend must be running at `http://localhost:8080` (see backend guide). The `.env` file sets `VITE_BACKEND_URL=http://localhost:8080` for local dev.

---

## Project Architecture

The app is a single-page admin workspace — not a traditional multi-page app. It implements a **VS Code–style multi-tab, split-pane UI** where each "screen" (page) lives in a tab that can be dragged, reordered, and arranged in two side-by-side panels.

### Entry Point

```
main.tsx → Router.tsx → /admin/* → AppLayout (lazy)
```

All meaningful routing happens inside `AppLayout`. The outer React Router only has three routes:
- `/` → redirect to `/admin`
- `/admin/*` → loads `AppLayout`
- `*` → redirect to `/admin`

### Screen Registry

`src/routes/App/AppLayout/registry.tsx` defines every screen in the app as an array entry:

```tsx
{
  id: "partners",
  pattern: /^\/partners$/,
  label: "Partneri",
  icon: Building2,
  Component: lazy(() => import("../PartnersPage")),
}
```

When a user navigates to a path like `/partners/42`, the registry matches it against `pattern`, extracts named capture groups (e.g. `id = "42"`), and renders the corresponding `Component` with those params.

To add a new screen:
1. Create your page component under `src/routes/App/YourPage/`
2. Add an entry to the `screens` array in `registry.tsx`
3. Optionally add it to `navItems` in `registry.tsx` to appear in the sidebar

### Tab System (Zustand Store)

All tab state lives in `src/services/store/workspaceSlice.ts`, persisted to `localStorage` under key `rv-workspace-v1`.

- Up to **12 tabs** total
- Supports **horizontal or vertical split** (two panels side by side)
- Tabs can be **dragged between panels** (dnd-kit)
- Tabs track a **dirty flag** — prompts confirmation before closing unsaved changes
- Keyboard shortcuts: `Ctrl+W` close, `Ctrl+Tab` next, `Ctrl+\` toggle split, `Ctrl+K` command palette

To navigate to a screen from code:

```tsx
const navigate = useWorkspaceNavigate();
navigate("/partners/42");  // Opens in a tab, or focuses existing tab
```

---

## Folder Structure

```
src/
├── components/         # Shared reusable components
│   ├── ui/             # shadcn/ui primitives (Button, Dialog, Sheet, etc.)
│   ├── DataTable.tsx   # Generic TanStack Table wrapper
│   ├── AppSidebar.tsx  # Sidebar shell
│   ├── Authorize.tsx   # Permission-gated render
│   └── ErrorBoundary.tsx
│
├── routes/
│   └── App/
│       ├── AppLayout/  # Tab system, split panels, command palette
│       ├── DashboardPage/
│       ├── WeddingsPage/
│       ├── WeddingDetailPage/
│       ├── PartnersPage/
│       ├── PartnerDetailPage/
│       ├── CalendarPage/
│       ├── ReportsPage/
│       └── SettingsPage/
│
├── services/
│   ├── apiClient.ts      # Base fetch helper + QueryClient
│   ├── auth.ts           # better-auth hooks (useSession, useLogin, useLogout)
│   ├── partnersService.ts
│   ├── partnerTypesService.ts
│   ├── catalogItemsService.ts
│   ├── pricingRulesService.ts
│   ├── permissions.ts    # Role-based access control
│   ├── system.ts         # Health check
│   └── store/
│       └── workspaceSlice.ts  # Zustand workspace state
│
├── types/
│   └── api.d.ts          # Auto-generated from OpenAPI — do not edit manually
│
└── utils/
    ├── utils.ts          # cn() (clsx + tailwind-merge)
    └── useMobile.ts      # useIsMobile() hook
```

---

## API Integration

### Base Client

`src/services/apiClient.ts` exports two helpers:

```ts
// Low-level: returns raw Response or throws on non-2xx
apiFetch(path: string, options?: RequestInit): Promise<Response>

// High-level: unwraps ApiResponse<T> envelope, throws if error is set
apiRequest<T>(path: string, options?: { method, data }): Promise<T>
```

The base URL is resolved at runtime:
1. `window.__APP_CONFIG__.VITE_BACKEND_URL` (injected by Docker/Nginx at runtime)
2. `import.meta.env.VITE_BACKEND_URL` (from `.env` at build time)
3. Fallback: `http://localhost:8080`

### Service Pattern

Every domain has its own service file that exports React Query hooks:

```ts
// READ — useQuery
export function usePartners(partnerTypeId?: number) {
  return useQuery({
    queryKey: ["partners", partnerTypeId],
    queryFn: () => apiRequest<PartnerListDto[]>(`/api/partners?partnerTypeId=${partnerTypeId ?? ""}`),
  });
}

// WRITE — useMutation
export function useCreatePartner() {
  return useMutation({
    mutationFn: (data: CreatePartnerRequest) =>
      apiRequest<PartnerDto>("/api/partners", { method: "POST", data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partners"] }),
    meta: { successMessage: "Partner kreiran." },
  });
}
```

`meta.successMessage` / `meta.errorMessage` are picked up by a global mutation observer in `QueryClient` setup and displayed as toasts (Sonner).

### Regenerating API Types

When the backend schema changes, run:

```bash
npm run sync-schema
```

This calls `scripts/syncSchema.mts` which fetches `/openapi/v1.json` from the running backend and writes `src/types/api.d.ts`. **Never edit `api.d.ts` manually.**

---

## UI Components

### DataTable

Generic, reusable table component built on `@tanstack/react-table`:

```tsx
<DataTable
  columns={columns}
  data={partners}
  searchKey="name"        // column to filter with the search box
  onRowClick={(row) => navigate(`/partners/${row.id}`)}
/>
```

Define columns using TanStack's `ColumnDef<T>`:

```ts
const columns: ColumnDef<PartnerListDto>[] = [
  { accessorKey: "name", header: "Naziv" },
  { accessorKey: "type", header: "Tip" },
];
```

### shadcn/ui Components

All primitives are in `src/components/ui/`. Import from there directly:

```tsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
```

Use `Sheet` for slide-over panels (create/edit forms), `Dialog` for confirmations.

### Authorize

Wrap content that requires specific permissions:

```tsx
<Authorize permission="partners.write">
  <Button>Dodaj partnera</Button>
</Authorize>
```

### Notifications

Use Sonner's `toast` directly for ad-hoc messages:

```tsx
import { toast } from "sonner";
toast.success("Spremi!");
toast.error("Greška pri spremanju.");
```

Mutation-triggered toasts are handled automatically via `meta.successMessage`.

---

## Styling

- **TailwindCSS v4** with `@tailwindcss/vite` plugin (no `tailwind.config.js` needed)
- **OKLCH color system** — all design tokens defined as CSS variables in `src/index.css`
- Use `cn()` (from `@/utils/utils`) to merge conditional class names:

```tsx
import { cn } from "@/utils/utils";
<div className={cn("base-class", condition && "conditional-class")} />
```

**Color token examples:**
- `bg-primary`, `text-primary-foreground`
- `bg-muted`, `text-muted-foreground`
- `bg-sidebar`, `text-sidebar-foreground`

Do not hardcode colors — always use the design tokens so dark mode works automatically.

### Dark Mode

Controlled by `next-themes`. Theme is toggled from the user menu in the sidebar footer. Use `dark:` Tailwind variant where needed for custom overrides.

---

## State Management

| Concern | Tool |
|---|---|
| Server data (API responses) | React Query (`useQuery` / `useMutation`) |
| Tab/panel/workspace UI state | Zustand (`useWorkspaceStore`) |
| URL-driven filter/search state | `nuqs` (`useQueryState`) |
| Form state | Local `useState` + Zod validation |

**Avoid putting server data into Zustand.** React Query handles all caching, refetching, and invalidation.

---

## Authentication

Authentication uses `better-auth` but is **disabled for the MVP**. The `Authorize` component and `useHasPermission` hook exist in the codebase but currently allow all actions. Do not remove these wrappers — they will be re-enabled when auth is implemented.

---

## Docker / Production

The frontend is served by **Nginx** as a static SPA. The backend URL is injected at container startup via `docker-entrypoint.sh`, which writes `public/env-config.js`:

```js
window.__APP_CONFIG__ = {
  VITE_BACKEND_URL: "https://your-api.example.com"
};
```

To build and run the frontend container, pass `VITE_BACKEND_URL` as an environment variable:

```bash
docker run -e VITE_BACKEND_URL=http://api:8080 frontend-image
```

---

## Path Aliases

All imports use the `@` alias for `src/`:

```ts
import { cn } from "@/utils/utils";
import { usePartners } from "@/services/partnersService";
import { Button } from "@/components/ui/button";
```

---

## Common Gotchas

- **`api.d.ts` is auto-generated** — run `npm run sync-schema` after backend changes, never edit by hand.
- **Workspace state persists in `localStorage`** — if the tab store schema changes, clear `rv-workspace-v1` in browser DevTools.
- **React Router is used minimally** — most "navigation" is tab-based via `useWorkspaceNavigate`, not `useNavigate`.
- **Split panel state** — never have both a horizontal and vertical split at the same time; the store enforces this.
- **Dirty flag** — call `markTabDirty(tabId)` when a form has unsaved changes, `markTabClean(tabId)` after save, so the close confirmation works correctly.
