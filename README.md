# Rezervacija Vjenčanja

Aplikacija za upravljanje rezervacijama vjenčanja. Multi-tab workspace sučelje inspirirano VS Codeom — više ekrana simultano, split panel, drag & drop tabovi.

---

## Pokretanje

```bash
# backend
cd backend && npm install && npm run dev

# frontend
cd frontend && npm install && npm run dev
```

Frontend: `http://localhost:5173` → direktno otvara admin workspace (nema login).  
Backend API: `http://localhost:3000`.

---

## Struktura projekta

```
frontend/src/
├── workspace/               ← cijeli workspace shell sustav
│   ├── store.ts             ← Zustand store — jedini izvor istine za tabove/panele
│   ├── registry.tsx         ← registar screena i sidebar nav itemsa
│   ├── workspace-shell.tsx  ← root layout (tabovi, split paneli, DnD)
│   ├── global-tab-bar.tsx   ← gornja tab traka
│   ├── panel-content.tsx    ← renderira aktivan screen unutar panela
│   ├── panel-tab-strip.tsx  ← mini tab traka za split view
│   ├── tab-item.tsx         ← jedna tab kartica (drag, rename, context menu)
│   ├── command-palette.tsx  ← Ctrl+K spotlight pretražnik
│   ├── use-workspace-navigate.ts  ← hook za otvaranje screena u tabu
│   ├── use-workspace-tab.ts       ← hook za dirty state i rename unutar screena
│   ├── use-workspace-hotkeys.ts   ← keyboard shortcuts (react-hotkeys-hook)
│   └── screens/             ← plain React komponente, NE znaju za tabove
│       ├── dashboard-screen.tsx
│       ├── weddings-list-screen.tsx
│       ├── wedding-detail-screen.tsx
│       ├── partners-list-screen.tsx
│       ├── calendar-screen.tsx
│       ├── reports-screen.tsx
│       ├── settings-screen.tsx
│       └── not-found-screen.tsx
│
├── components/
│   ├── ui/                  ← shadcn komponente (ne diraj direktno)
│   ├── data-table.tsx       ← generički @tanstack/react-table wrapper
│   ├── app-sidebar.tsx      ← sidebar s navigacijom
│   └── nav-main.tsx         ← nav items u sidebaru
│
└── pages/
    └── admin-layout.tsx     ← SidebarProvider + WorkspaceShell mount
```

---

## Kako dodati novi screen

### 1. Kreiraj screen komponentu

```tsx
// src/workspace/screens/moj-screen.tsx
export default function MojScreen() {
  return <div className="p-6">Moj screen</div>
}
```

Screen je **obična React komponenta** — nema nikakve workspace logike u njoj.  
Props koje prima ako ima URL parametre:

```tsx
export default function MojScreen({ params }: { params: Record<string, string> }) {
  const { id } = params // npr. za rutu /moj-screen/:id
}
```

### 2. Registriraj u registry.tsx

```ts
// src/workspace/registry.tsx

import MojScreen from "./screens/moj-screen"
import { StarIcon } from "lucide-react"

// Dodaj u screens niz:
{
  pattern: /^\/moj-screen$/,
  title: "Moj screen",
  icon: StarIcon,
  Component: MojScreen,
},

// Za dinamičke rute s parametrima:
{
  pattern: /^\/moj-screen\/(?<id>[^/]+)$/,
  title: (p) => `Stavka #${p.id}`,
  icon: StarIcon,
  Component: MojScreen,
},
```

### 3. (Opcionalno) Dodaj u sidebar

```ts
// src/workspace/registry.tsx — navItems niz:
{ title: "Moj screen", path: "/moj-screen", icon: StarIcon },
```

To je sve. Nema router konfiguracije, nema `<Route>` komponenti.

---

## Navigacija između screena

U svakoj komponenti (screen, tablica, gumb) koristi `useWorkspaceNavigate`:

```tsx
import { useWorkspaceNavigate } from "@/workspace/use-workspace-navigate"

function MojaKomponenta() {
  const navigate = useWorkspaceNavigate()

  return (
    <button onClick={() => navigate({ path: "/weddings/42", title: "Ana & Marko", icon: "Heart" })}>
      Otvori vjenčanje
    </button>
  )
}
```

**Nikad nemoj koristiti** `useNavigate` iz react-router za otvaranje sadržaja unutar workspacea — to koristi samo auth redirecte.

---

## Dirty state (nesačuvane promjene)

Ako screen ima formu, javi workspaceu kad postoje nesačuvane promjene. Tab dobiva narančastu točku i blokira zatvaranje bez potvrde:

```tsx
import { useWorkspaceTab } from "@/workspace/use-workspace-tab"

export default function MojFormScreen() {
  const { setDirty } = useWorkspaceTab()

  useEffect(() => {
    return () => setDirty(false) // cleanup pri unmountu
  }, [setDirty])

  return (
    <input onChange={() => setDirty(true)} />
  )
}
```

---

## Tablice

Koristi `DataTable` komponentu koja wrappa `@tanstack/react-table`:

```tsx
import { DataTable } from "@/components/data-table"
import { type ColumnDef } from "@tanstack/react-table"

const columns: ColumnDef<MojTip>[] = [
  { accessorKey: "name", header: "Naziv" },
  { accessorKey: "status", header: "Status" },
]

<DataTable
  columns={columns}
  data={data}
  searchKey="name"           // opcionalno — dodaje search input
  searchPlaceholder="Traži..."
  onRowClick={(row) => navigate({ path: `/stavke/${row.id}`, title: row.name })}
/>
```

Podržava: sortiranje po stupcima (klik na header), filtriranje, paginacija (automatski kad > `pageSize` redaka).

---

## Keyboard shortcuts

| Shortcut | Akcija |
|---|---|
| `Ctrl+K` | Command palette — pretraži i otvori bilo koji screen |
| `Ctrl+W` | Zatvori aktivni tab |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | Sljedeći / prethodni tab |
| `Ctrl+1…9` | Skoči na N-ti tab |
| `Ctrl+\` | Toggle horizontalni split |
| `Ctrl+Shift+\` | Toggle vertikalni split |
| `Ctrl+Shift+F` | Prebaci fokus između panela |

---

## UI konvencije

- **Komponente** — shadcn/ui iz `@/components/ui/`. Nikad ne editaj direktno, override-aj kroz Tailwind klase.
- **Ikone** — Lucide React (`lucide-react`). Veličina `h-4 w-4` za inline, `h-5 w-5` za headere.
- **Boje** — koristi semantičke tokene: `text-muted-foreground`, `bg-primary/10`, `bg-card`, itd. Ne koristi hardkodirane hex vrijednosti.
- **Spacing** — page padding `p-6`, gap između sekcija `space-y-4` ili `space-y-6`.
- **Page header pattern**:
  ```tsx
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
      <IkonaIcon className="h-5 w-5" />
    </div>
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Naslov</h1>
      <p className="text-sm text-muted-foreground">Podnaslov</p>
    </div>
  </div>
  ```

---

## Korisne komande

```bash
npm run dev          # dev server na :5173
npm run build        # produkcijski build
npm run lint         # ESLint provjera
npm run sync-schema  # sinkronizacija OpenAPI tipova s backenda
```
