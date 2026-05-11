---
name: react-guidelines
description: React coding conventions for this project. Use when writing, editing, or reviewing any frontend code — components, services, tables, forms, or hooks. Covers TanStack Query, TanStack Table, shadcn/ui, and the service layer workflow.
---

# React Guidelines

Project-specific conventions for the `frontend/` workspace.

## 1. Service Layer — Always Sync Schema First

Before creating or modifying anything in `src/services/`, run:

```bash
npm run sync-schema
```

This regenerates `src/types/api.ts` from the backend OpenAPI spec. Always derive request/response types from the generated schema:

```ts
// Good
import type { components } from "@/types/api";
export type PartnerDto = components["schemas"]["PartnerDto"];

// Bad — never hand-write API types
export type PartnerDto = { id: number; name: string };
```

### Service file structure

Follow the pattern in `src/services/partnersService.ts`:

1. Export derived types at the top
2. Define `queryOptions` / `mutationOptions` objects (reusable, cache-key consistent)
3. Export one hook per operation: `useXxx`, `useCreateXxx`, `useUpdateXxx`, `useDeleteXxx`
4. Attach `meta.successMessage` to mutations — the `MutationCache` in `apiClient.ts` handles toasts automatically

```ts
export function useCreatePartner() {
  return useMutation({
    mutationFn: (data: CreatePartnerRequest) =>
      apiRequest<PartnerDto>("/api/partners", { method: "POST", data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partners"] }),
    meta: { successMessage: "Partner kreiran." },
  });
}
```

## 2. Data Fetching — React Query Only, No useEffect

**Never use `useEffect` to fetch data.** Use `useQuery` / `useMutation` from `@tanstack/react-query` exclusively.

```tsx
// Good
const { data: partners, isLoading } = usePartners();

// Bad
useEffect(() => {
  fetch("/api/partners").then(r => r.json()).then(setPartners);
}, []);
```

- Prefer `queryOptions()` helper for reusable, shareable query definitions
- Pass `isLoading` from the query hook down to `<DataTable isLoading={...} />`
- Use `queryClient.invalidateQueries` in `onSuccess` for cache invalidation

## 3. Tables — TanStack Table via DataTable

Use the shared `<DataTable>` component (`src/components/DataTable.tsx`) for all tabular data. Define columns as a typed `ColumnDef<T>[]` array, co-located with the route/feature file.

```tsx
const columns: ColumnDef<PartnerListDto>[] = [
  { accessorKey: "name", header: "Naziv" },
  { accessorKey: "partnerTypeName", header: "Tip" },
  {
    id: "actions",
    cell: ({ row }) => <ActionsMenu partner={row.original} />,
  },
];

// In component:
<DataTable
  columns={columns}
  data={partners ?? []}
  searchKey="name"
  isLoading={isLoading}
  onRowClick={(row) => navigate(`/partners/${row.id}`)}
/>
```

- Do **not** build raw `<table>` elements — always go through `<DataTable>`
- If `<DataTable>` lacks a needed feature, extend it rather than creating a parallel implementation

## 4. UI — shadcn/ui Only, Minimal Tailwind

**Use only shadcn components** from `src/components/ui/`. Do not reach for third-party UI libraries.


### Tailwind usage

The global theme (`index.css`) handles ~90% of visual design via CSS variables and base styles. Apply Tailwind utility classes **only when necessary** — spacing adjustments, layout, or one-off overrides that the theme does not cover.

```tsx
// Good — theme handles colors, typography; only layout added
<Card className="mt-4">
  <CardContent className="flex gap-2">
    <Button>Spremi</Button>
    <Button variant="outline">Odustani</Button>
  </CardContent>
</Card>

// Bad — redundant color/style overrides the theme already defines
<Card className="mt-4 bg-white text-gray-900 rounded-lg shadow-md border border-gray-200">
```

Rule of thumb: if you're adding more than 3–4 utility classes to a single element, stop and check whether the theme or a shadcn variant already covers it.

### Toasts

Use `toast` from `sonner` (re-exported via `src/components/ui/sonner.tsx`). Mutations trigger toasts automatically via `MutationCache` — only call `toast` manually for non-mutation feedback.
