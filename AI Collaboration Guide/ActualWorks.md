# Current Work Tracker

See: [IN_PROGRESS.md](IN_PROGRESS.md) for Sprint 1 & 2 tasks

---

# Plan: Persistence + Army Builder Quality Pass (Previous Sprint ✅)

All items have been implemented.

---

## Completed Changes

### 1. ✅ `src/lib/storage/uiStorage.ts` 
**Status:** Already existed with correct implementation  
- `loadUISession()` function working
- `saveUISession()` function working

### 2. ✅ `src/hooks/useBattleSetup.ts`
**Status:** Already implemented  
- Battle setup persistence active with `loadBattleSetup()` and `saveBattleSetup()`
- Proper validation of saved IDs against current units data
- useEffect for persistence on state changes

### 3. ✅ `src/App.tsx` — Wire UI persistence
**Status:** DONE
- Added import: `import { loadUISession, saveUISession } from "./lib/storage/uiStorage";`
- Changed state initialization:
  ```ts
  const session = loadUISession();
  const [view, setView] = useState<AppView>(session.view ?? "calculator");
  const [workspaceArmyA, setWorkspaceArmyA] = useState<string | null>(session.workspaceArmyA ?? null);
  const [workspaceArmyB, setWorkspaceArmyB] = useState<string | null>(session.workspaceArmyB ?? null);
  ```
- Added persistence useEffect:
  ```ts
  useEffect(() => {
    saveUISession({ view, workspaceArmyA, workspaceArmyB });
  }, [view, workspaceArmyA, workspaceArmyB]);
  ```

### 4. ✅ `src/components/WorkspaceView.tsx` — Fix empty state
**Status:** DONE
- Line 95 updated from: `"Load an army preset above, or use the dropdowns below."`
- To: `"Load an army preset from the dropdown, or go to <strong>My Armies</strong> to create one."`

### 5. ✅ `src/components/ArmiesView.tsx` — Army builder quality
**Status:** DONE

#### a) Faction change confirmation
- Added confirmation dialog before clearing units when faction changes
- Preserves units if user cancels

#### b) 0-unit save guard  
- Save button now disabled when `!state.name.trim() || state.units.length === 0`
- Added hint: "Add at least one unit to save this army."

#### c) Nickname field per unit row
- Replaced static `<span className="army-builder__unit-name">` with editable input
- `<input className="army-builder__nickname-input">` with placeholder showing real unit name
- Updates `su.nickname` on change

### 6. ✅ `src/App.css` — Styles for new features
**Status:** DONE
- Added `.army-builder__nickname-input`:
  - Transparent background
  - Border-bottom styling
  - Focus state with accent color
- Added `.army-builder__units-hint`:
  - Muted text styling
  - 0.78rem font size

### 7. ✅ `src/lib/storage/armyStorage.ts` — Fix duplicate naming
**Status:** DONE
- Implemented `makeCopyName()` function
- Strips existing `" (copy)"` / `" (copy N)"` suffixes
- Increments number for existing copies
- Results: "Test (copy)" → duplicates to "Test (copy 2)" (not "Test (copy) (copy)")

---

## Verification Checklist

- [x] TypeScript compiles with zero errors
- [x] UI session persists on view change
- [x] Battle setup persists faction/unit/weapon/model selections
- [x] Workspace state persists on refresh
- [x] Faction change prompts confirmation
- [x] Empty units army cannot be saved
- [x] Nickname field editable and saves properly
- [x] Duplicate army naming correctly incremented
- [x] Empty state copy fixed
