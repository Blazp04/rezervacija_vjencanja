# Workspace Split Sustav — Detaljna Dokumentacija

> Lokacija koda: [frontend/src/workspace/](frontend/src/workspace/)  
> Glavna komponenta: [workspace-shell.tsx](frontend/src/workspace/workspace-shell.tsx)  
> Store: [store.ts](frontend/src/workspace/store.ts)

---

## 1. Pregled

Workspace shell je multi-tab sučelje inspirirano VS Codeom. Korisnik može:

- imati više tabova otvorenih simultano (max **12**)
- podijeliti radni prostor na **dva panela** (A i B)
- premještati tabove između panela drag-and-dropom
- otvarati ekrane preko **Ctrl+K command palette-a**

Split podrazumijeva **dva susjedna panela** s podesivim omjerom.  
**Pravilo:** uvijek najviše **jedan smjer splita** (horizontalan ILI vertikalan, nikad oba).

---

## 2. Stanje (Zustand store)

```ts
splitEnabled: boolean           // je li split uključen
splitDirection: 'horizontal' | 'vertical'
splitRatio: number              // 0.2–0.8, default 0.5
focusedPanel: 'A' | 'B'         // koji panel prima keyboard input

panelATabs: string[]            // ordered tab IDs u panelu A
panelAActiveId: string | null
panelBTabs: string[]            // ordered tab IDs u panelu B (prazno kad split off)
panelBActiveId: string | null
```

Persistencija: `localStorage` ključ `rv-workspace-v1` (`focusedPanel` se ne sprema, uvijek se resetira na `A` pri učitavanju).

---

## 3. Smjerovi splita

| Smjer | Layout | Resize handle |
|---|---|---|
| `horizontal` | Panel A **lijevo**, Panel B **desno** | vertikalna linija, cursor `col-resize` |
| `vertical`   | Panel A **gore**,   Panel B **dolje** | horizontalna linija, cursor `row-resize` |

Implementacija: [`react-resizable-panels`](https://www.npmjs.com/package/react-resizable-panels) v4 (`Group` + `Panel` + `Separator`).  
`PanelGroup` se **remountira** pri promjeni smjera (key `${splitEnabled}-${splitDirection}`) — to garantira da nikad ne ostaje "duh" prethodnog layouta.

**Nikad oba smjera istovremeno.** Akcija `enableSplit(direction)` postavlja jedinstveni `splitDirection`; ne postoji stanje "horizontalno + vertikalno".

---

## 4. Akcije splita

### `enableSplit(direction)`
- Postavlja `splitEnabled = true`, `splitDirection = direction`.
- No-op ako nema otvorenih tabova (`tabs.length === 0`) — split nema smisla bez sadržaja.
- Aktivni tab u fokusiranom panelu ostaje gdje je. Panel B inicijalno je **prazan** (empty state).

### `disableSplit()`
- Premješta sve tabove iz Panela B na **kraj** Panela A (čuva redoslijed).
- `panelBTabs = []`, `panelBActiveId = null`, `splitEnabled = false`, `focusedPanel = 'A'`.

### `swapPanels()`
- Zamjenjuje `panelATabs ↔ panelBTabs` i `panelAActiveId ↔ panelBActiveId`.
- `focusedPanel` ostaje isti (sad pokazuje na suprotan sadržaj).

### `setSplitRatio(ratio)`
- Klempa između `0.2` i `0.8`.
- Pozivi su **debouncani** 300ms iz `onResize` callbacka da ne flooda store.

---

## 5. Toggle ponašanje (UI dugmad i tipkovnica)

Dugmad u global tab baru i tipkovnička kratica `Ctrl+\` / `Ctrl+Shift+\` rade kao **toggle**:

| Trenutno stanje | Akcija "Horizontalno" | Akcija "Vertikalno" |
|---|---|---|
| split off | uključi horizontalno | uključi vertikalno |
| horizontal | **isključi** | prebaci na vertikalno |
| vertical | prebaci na horizontalno | **isključi** |

Time se osigurava da uvijek postoji točno jedan smjer ili nijedan.

---

## 6. Drag & drop u splitu

### 6.1 Reorder unutar panela
- `dnd-kit` `SortableContext` po panelu.
- `onDragEnd` poziva `reorderTabs(panel, fromIndex, toIndex)`.

### 6.2 Premještaj između panela
- Drop na **tab strip drugog panela** → `moveTabToPanel(tabId, targetPanel)`.
- Drop na pojedinačni tab u drugom panelu → isto, `moveTabToPanel`.

### 6.3 Edge drop (auto-split)
Tijekom drag operacije se prikazuju **četiri rubne drop zone**:

| Edge | Smjer | Cilj |
|---|---|---|
| left   | horizontal | Panel A |
| right  | horizontal | Panel B |
| top    | vertical   | Panel A |
| bottom | vertical   | Panel B |

Pravila:
- Ako split **nije** aktivan → `enableSplit(direction)` + tab se premjesti u target panel.  
  Ako je target Panel A: ostali tabovi iz A se prebace u B (tako da target tab dobiva zasebnu sekciju).
- Ako je split aktivan u **istom** smjeru, a tab je iz drugog panela → samo `moveTabToPanel`.
- Ako je split aktivan u **suprotnom** smjeru → smjer se mijenja preko `enableSplit(newDirection)` i tab se postavlja u target panel. **Nije moguće imati oba smjera istovremeno.**

---

## 7. Auto-collapse (zatvaranje splita)

`closeTabForced(id)` automatski "skuplja" workspace kad se panel isprazni:

| Stanje nakon zatvaranja | Rezultat |
|---|---|
| oba panela prazna | `splitEnabled = false`, focus → A, oba activeId-a `null` |
| Panel A prazan, B ima tabove | tabovi iz B se premještaju u A, split se gasi |
| Panel B prazan, A ima tabove | split se gasi, A ostaje |
| oba panela imaju tabove | split ostaje |

Ovo znači da **kad zatvoriš sve tabove, layout se sam vrati u jedinstveni prazan panel** — ne ostaje vizualni "duh" praznog splita.

---

## 8. Empty state

Kad panel ima 0 tabova (npr. nakon ručnog zatvaranja zadnjeg taba u jednom panelu dok drugi još radi), prikazuje se [`PanelEmptyState`](frontend/src/workspace/panel-tab-strip.tsx) s instrukcijom `Ctrl+K` za otvaranje command palette-a.

---

## 9. Keyboard shortcuts

Listener je montiran u [workspace-shell.tsx](frontend/src/workspace/workspace-shell.tsx). Aktivira se globalno; ignorira događaje kad je fokus u `<input>`, `<textarea>` ili `contenteditable` elementu (osim Ctrl+K koji radi i tu).

| Shortcut | Akcija |
|---|---|
| `Ctrl+K` | Toggle command palette |
| `Ctrl+W` | Zatvori aktivni tab u fokusiranom panelu (dirty → confirm dialog) |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | Sljedeći / prethodni tab (circular) |
| `Ctrl+1` … `Ctrl+9` | Aktiviraj N-ti tab u fokusiranom panelu |
| `Ctrl+\` | Toggle horizontalni split |
| `Ctrl+Shift+\` | Toggle vertikalni split |
| `Ctrl+Shift+F` | Prebaci fokus između panela (samo kad split aktivan) |

---

## 10. Validacija pri mountu

`validate()` se poziva jednom na mount [`WorkspaceShell`](frontend/src/workspace/workspace-shell.tsx):

- uklanja sirotske ID-ove iz `panelATabs` / `panelBTabs` koji nemaju odgovarajući `Tab` u `tabs`
- resetira `panelAActiveId` / `panelBActiveId` ako pokazuje na nepostojeći tab
- klempa `splitRatio` u raspon `0.2–0.8`

---

## 11. Pisanje stranica (kao da nema tabova)

Kod stranica je **agnostičan** prema tab sustavu — komponente se pišu kao obične React stranice:

```tsx
// frontend/src/workspace/screens/my-screen.tsx
export default function MyScreen() {
  return <div>...</div>
}
```

Registracija u [registry.tsx](frontend/src/workspace/registry.tsx):

```ts
{
  pattern: /^\/my-route$/,
  title: "Moj ekran",
  icon: HomeIcon,
  Component: MyScreen,
}
```

Tab sustav (lifecycle, scroll preserve, dirty tracking) se primjenjuje **kroz layout** ([panel-content.tsx](frontend/src/workspace/panel-content.tsx) drži sve tabove montirane preko `display:none`).  
Stranice koje žele opcionalno koristiti tab API mogu pozvati hook `useWorkspaceTab()`:

```tsx
const { setDirty, rename, close } = useWorkspaceTab()
```

Hook vraća `null` polja ako stranica nije renderirana unutar taba (npr. preview), pa funkcionira oba načina.

---

## 12. Performansne smjernice

- Selectori iz `useWorkspaceStore` koriste **stabilne reference**: `useTabsForPanel`, `useActiveTab`, `usePanelTabIds` koriste `useMemo` da ne triggeraju render loop kod Zustand v5 strict equality (`Object.is`).
- `TabItem` je `React.memo`.
- `PanelContent` ne unmountira neaktivne tabove — koristi `display: none` da očuva component state i scroll poziciju unutar sesije.
- `setSplitRatio` je debouncan 300ms.
