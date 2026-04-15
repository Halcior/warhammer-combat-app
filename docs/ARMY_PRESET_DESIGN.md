# Saved Army Preset Flow - Design Proposal

## Overview

This proposal outlines an MVP-focused approach to saving and reusing army presets with practical setup context, enabling faster army loading in the calculator and battle workspace.

---

## 1. UX Structure & Flow

### Recommended Approach: Single-Form Builder (Not Multi-Step)

**Why single form over wizard:**
- Army building is not linear—users need to see total context
- Easier to modify units without re-stepping
- Points calculation visible at all times
- Less click overhead

**Form Layout (Mobile-responsive grid):**

```
┌─────────────────────────────────────────┐
│ HEADER: Creating/Editing Army           │
└─────────────────────────────────────────┘

┌─ SECTION 1: ARMY HEADER ─────────────────┐
│ • Army Name (text input)                 │
│ • Faction (dropdown - auto-filled)       │
│ • Detachment (dropdown)                  │
│ • Notes (optional text area)             │
└─────────────────────────────────────────┘

┌─ SECTION 2: POINTS SUMMARY ──────────────┐
│ Total Points: 2,000 / 2,000              │
│ [Progress bar showing limit]             │
├─ Breakdown:                              │
│ Unit 1: 450 pts                          │
│ Unit 2: 380 pts                          │
│ ...                                      │
└─────────────────────────────────────────┘

┌─ SECTION 3: UNITS (Repeating rows) ──────┐
│ ┌─ UNIT CARD 1 ────────────────────────┐ │
│ │ Name: Necron Warriors   [Edit] [X]   │ │
│ │ Model Count: 10         Points: 450   │ │
│ │ Weapon: Gauss Flayer                 │ │
│ │ Leader Attached: None                │ │
│ │ Enhancement: None                    │ │
│ └──────────────────────────────────────┘ │
│ ┌─ UNIT CARD 2 ────────────────────────┐ │
│ │ ...                                   │ │
│ └──────────────────────────────────────┘ │
│ [+ Add Unit ]                            │
└─────────────────────────────────────────┘

┌─ SECTION 4: ACTIONS ──────────────────────┐
│ [ Cancel ]  [ Save as Draft ]  [ Save ]  │
└─────────────────────────────────────────┘
```

---

## 2. Form Sections & Fields

### A. Army Header Section

**Required:**
- Army Name (string, 1-50 chars)
- Faction (dropdown, auto-filled from first unit, can override)
- Detachment (dropdown, tied to faction)

**Optional:**
- Notes (text area, for player notes like "Competitive build" or "Fun list")

**Display:**
- If no detachment selected: show warning "No detachment selected" (not blocking)
- Faction can be changed but all units removed if faction changes (confirmation)

---

### B. Points Summary Section

**Display (always visible):**
- Total Points: `[Current] / [Army Limit or "Unlimited"]`
- Progress bar (green when under, yellow warning if over 2000, red if way over)
- Collapsible unit breakdown:
  - Unit 1: 450 pts
  - Unit 2: 380 pts
  - etc.

**Calculation:**
- Per-unit points auto-calculated when units added/edited
- Points source: stored in preset for each unit (see data model section)

---

### C. Units Section (Repeating)

Each unit is displayed as a **collapsible card** or **expandable row**:

**Unit Card (Collapsed View):**
```
┌────────────────────────────────────────┐
│ Unit Name                 [Edit] [Dup] [X] │
│ 10 Models | Gauss Flayer | 450 pts       │
│ Leader: None | Enhancement: None        │
└────────────────────────────────────────┘
```

**Unit Card (Expanded — when editing):**
```''''''
┌────────────────────────────────────────┐
│ Unit Details                    [Close] │
├────────────────────────────────────────┤
│ Unit Type: Necron Warriors              │
│ Model Count:    [10]  (required)        │
│ Weapon Loadout: [Gauss Flayer] ▼       │
│ Leader Attached: [None] ▼              │
│ Enhancement:    [None] ▼               │
│ Points per Model: 45                    │
│ Total Unit Points: 450                  │
├────────────────────────────────────────┤
│ Unit Notes: (optional)                  │
│ ┌──────────────────────────────────────┐│
│ │ e.g. "Focusing fire support"        ││
│ └──────────────────────────────────────┘│
├────────────────────────────────────────┤
│ [Cancel] [Delete Unit] [Save Unit]     │
└────────────────────────────────────────┘
```

---

## 3. Required vs Optional Fields

### Required (Block saving if missing)
- ✓ Army Name (at least 1 character)
- ✓ At least 1 unit in the army
- ✓ Model Count per unit (must be ≥ 1)
- ✓ Unit Type (faction + unit base data)

### Required (With default/auto-fill)
- Faction (auto-selected from first unit, can override)
- Weapon Selection (auto-select first weapon, can change)

### Optional (Nice-to-have, no blocking)
- ✗ Detachment (warning if missing, not blocking)
- ✗ Leader Attachment (can be None)
- ✗ Enhancement (can be None)
- ✗ Army Notes (can be empty)
- ✗ Unit Notes (can be empty)

---

## 4. Points Display & Calculation

### Display Strategy

**Top-level summary visible at all times:**
```
Points: 2,340 / 2,500  ████████░ (94%)
```

**Expandable breakdown (per unit):**
```
▼ Points Breakdown
  Necron Warriors (10x 45) .................. 450
  Hexmark Destroyers (5x 38) ............... 190
  Overlord (1x 220) ........................ 220
  ─────────────────────────────────────────
  TOTAL ................................. 860
```

**Point sources:**
- Per-unit base points: stored from unit definition or user input
- Model count: `points_per_model × model_count = unit_total`
- Enhancement/leader: if they have points cost, add to unit total
- Army total: sum of all unit totals

**Calculation happens:**
- When unit added/removed
- When model count changes
- When weapon/enhancement selected (if they have different points)

---

## 5. Data Model Extensions

### Current Structure (To keep):
```ts
export type SavedUnit = {
  unitId: string;
  selectedWeaponId: string;
  nickname?: string;
};

export type ArmyPreset = {
  id: string;
  name: string;
  faction: string;
  units: SavedUnit[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
};
```

### Proposed Extended Structure:

```ts
// Enhanced SavedUnit with preset context
export type SavedUnitInPreset = {
  // Core identification
  unitId: string;
  nickname?: string;

  // Practical setup
  modelCount: number;           // How many models in this unit (10, 5, 3, etc.)
  selectedWeaponId: string;     // Primary weapon choice
  leaderAttachedId?: string;    // Optional attached leader unit ID
  enhancementId?: string;       // Optional enhancement from detachment
  upgrades?: string[];          // Optional wargear/upgrade IDs (future)

  // Points tracking (for snapshot/validation)
  pointsPerModel: number;       // Cached from unit definition
  unitTotalPoints: number;      // Calculated: pointsPerModel × modelCount
  leaderPoints?: number;        // If leader attached
  enhancementPoints?: number;   // If enhancement applied
  
  // Context & notes
  notes?: string;               // "Focusing fire support", etc.
  role?: string;                // Optional: "Striker", "Support", etc.
};

// Enhanced ArmyPreset
export type ArmyPreset = {
  id: string;
  
  // Army-level metadata
  name: string;
  faction: string;
  detachment?: string;          // "Szarekhan Dynasty", etc.
  detachmentId?: string;        // ID of detachment for validation
  
  // Units
  units: SavedUnitInPreset[];
  
  // Points tracking
  totalPoints: number;          // Cached total for display
  pointsBreakdown?: {           // Optional: per-unit breakdown
    [unitId: string]: number;
  };
  
  // Context & notes
  notes?: string;               // Army-level notes
  role?: string;                // Army role: "Competitive", "Casual", "Narrative"
  isPublic?: boolean;           // Future: share with community
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
  tags?: string[];              // Optional: "2000pts", "Competitive", etc.
};
```

### Migration Strategy (MVP)
- Keep old `SavedUnit` type for backward compatibility
- New presets use `SavedUnitInPreset`
- On load, auto-migrate old presets with defaults:
  - `modelCount`: 1 (default, user can correct)
  - `pointsPerModel`: look up from unit definition
  - `unitTotalPoints`: calculate
  - Rest: empty/None

---

## 6. React Component Structure

### Hierarchy

```
ArmyBuilder (existing, refactored)
├── ArmyHeaderSection
│   ├── ArmyNameInput
│   ├── FactionSelector
│   └── DetachmentSelector
│
├── PointsSummarySection
│   ├── PointsProgress
│   └── PointsBreakdown (collapsible)
│
├── UnitsSection
│   ├── UnitCard (repeated)
│   │   ├── UnitCardPreview
│   │   └── UnitCardEditor (expanded)
│   │       ├── ModelCountInput
│   │       ├── WeaponSelector
│   │       ├── LeaderSelector
│   │       └── EnhancementSelector
│   └── AddUnitButton
│
└── ActionsSection
    ├── CancelButton
    ├── SaveDraftButton (future)
    └── SaveButton
```

### New Components to Create

1. **ArmyHeaderSection.tsx**
   ```tsx
   interface ArmyHeaderSectionProps {
     name: string;
     setName: (name: string) => void;
     faction: string;
     setFaction: (faction: string) => void;
     detachment: string | undefined;
     setDetachment: (detachment: string | undefined) => void;
     notes?: string;
     setNotes?: (notes: string) => void;
   }
   ```

2. **PointsSummarySection.tsx**
   ```tsx
   interface PointsSummarySectionProps {
     totalPoints: number;
     pointsLimit?: number;
     breakdown: { unitName: string; points: number }[];
   }
   ```

3. **UnitCard.tsx** (Preview & Editor combined)
   ```tsx
   interface UnitCardProps {
     unit: SavedUnitInPreset;
     unitDefinition: Unit;
     isEditing: boolean;
     onEdit: () => void;
     onSave: (unit: SavedUnitInPreset) => void;
     onDelete: () => void;
     onDuplicate: () => void;
     availableLeaders: Unit[];
     availableEnhancements: Enhancement[];
   }
   ```

4. **ModelCountInput.tsx**
   ```tsx
   interface ModelCountInputProps {
     count: number;
     setCount: (count: number) => void;
     min?: number;
     max?: number;
     onCountChange?: (count: number) => void; // For auto-update of points
   }
   ```

5. **WeaponSelector.tsx** (refactored from existing)
   ```tsx
   interface WeaponSelectorProps {
     weapons: Weapon[];
     selectedId: string;
     setSelectedId: (id: string) => void;
   }
   ```

6. **LeaderSelector.tsx**
   ```tsx
   interface LeaderSelectorProps {
     availableLeaders: Unit[];
     selectedId?: string;
     setSelectedId: (id: string | undefined) => void;
   }
   ```

7. **EnhancementSelector.tsx**
   ```tsx
   interface EnhancementSelectorProps {
     availableEnhancements: Enhancement[];
     selectedId?: string;
     setSelectedId: (id: string | undefined) => void;
   }
   ```

8. **ArmyBuilderV2.tsx** (refactored main component)
   - Replaces current ArmyBuilder
   - Uses new sections above
   - Handles state for all fields
   - Calculates points, validates form

---

## 7. MVP Implementation Approach

### Phase 1: Core Preset Builder (THIS PHASE)

**Implement:**
- Expand `ArmyPreset` data model with fields above
- Refactor `ArmyBuilder` to show all new fields
- Add points calculation & display
- Add model count field
- Add detachment selector
- In-form editing (edit unit → expand card)

**NOT implemented yet:**
- Leader/enhancement attachment (checkbox only, stored but not used)
- Auto-detect army points limit (just display, no enforcement)
- Points validation (warning if over, not blocking)
- Unit duplication within preset builder
- Army list import/export

### Phase 2: Integration (Next Phase)

**When ready:**
- Load preset into calculator → auto-fill detachment + points context
- Load preset into workspace → show all units
- Use stored leader attachment to auto-select in calculator
- Show enhancement bonuses in modifier panel
- Validate preset legal in calculator (non-blocking warning)

### Phase 3: Polish (Future)

**Later features:**
- Points validation (warning if over limit)
- Preset templates ("2000pts Necron Szarekhan", etc.)
- Community sharing
- Import from Wahapedia
- Army composition tags

---

## 8. Form Validation Rules (MVP)

**On Save:**
- Army name: required, 1-50 chars
- At least 1 unit required
- Each unit must have:
  - Model count ≥ 1
  - Valid unit type
  - Valid weapon selected

**Warnings (don't block save):**
- No detachment selected
- Army over 2,000 points
- Duplicate units adjacent (can be intentional)

**Error handling:**
- Show field-level errors inline
- Show form-level errors at top
- Disable save button if critical fields invalid

---

## 9. Mobile Considerations

**Responsive Layout:**
- Army header: stacked fields (100% width)
- Points summary: responsive grid (1 col on mobile)
- Unit cards: full-width on mobile, expandable actions
- Selectors: use native `<select>` on mobile (better UX than dropdowns)

**Touch-friendly:**
- Larger touch targets (44px minimum)
- Expand/collapse done with arrows (not hover)
- Actions (edit/delete) as clear buttons, not icons

---

## 10. State Management (Recommended)

### Option A: Local State (Recommended for MVP)
```tsx
const [armyState, setArmyState] = useState<ArmyPreset>({
  name: "",
  faction: "",
  units: [],
  totalPoints: 0,
  // ...
});

// Helper functions
const addUnit = (unit: SavedUnitInPreset) => { ... };
const updateUnit = (unitId: string, updates: Partial<SavedUnitInPreset>) => { ... };
const removeUnit = (unitId: string) => { ... };
const recalculatePoints = () => { ... };
```

### Option B: useReducer (If complex state changes)
```tsx
const [state, dispatch] = useReducer(armyPresetReducer, initialState);

type ArmyAction = 
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_FACTION"; payload: string }
  | { type: "ADD_UNIT"; payload: SavedUnitInPreset }
  | { type: "UPDATE_UNIT"; id: string; payload: Partial<SavedUnitInPreset> }
  | { type: "REMOVE_UNIT"; id: string }
  | { type: "RECALCULATE_POINTS" };
```

---

## Summary: Implementation Checklist

- [ ] Expand `ArmyPreset` TypeScript type with new fields
- [ ] Migrate existing presets (backward compat)
- [ ] Create `ArmyHeaderSection` component
- [ ] Create `PointsSummarySection` component
- [ ] Create `UnitCard` component (preview + editor)
- [ ] Create `ModelCountInput` component
- [ ] Create `LeaderSelector` component (optional, checkbox for MVP)
- [ ] Create `EnhancementSelector` component (optional, checkbox for MVP)
- [ ] Refactor `ArmyBuilder` to use new sections
- [ ] Add points calculation logic
- [ ] Add form validation
- [ ] Add unit edit/delete/duplicate actions
- [ ] Test with localStorage persistence
- [ ] Mobile responsiveness
- [ ] User testing & iteration

---

## Rationale: Why This Approach?

**Single Form (not wizard):**
- Users see full context at once
- Easier to modify—click edit on any unit
- Natural for iterative list building

**Required vs Optional:**
- Don't demand detachment (not all armies use them)
- Required fields only: name, units, model count
- Everything else is context (but stored)

**Points always visible:**
- Helps users make choices (swap units to control points)
- No surprise "army is over points" on save
- Prepares for future validation

**Data model extends, doesn't break:**
- New fields are optional/defaulted
- Old presets migrate automatically
- Stored for future integration (leader bonuses, etc.)

**MVP focus:**
- No complex validation
- No tournament legality checker
- Leader/enhancement stored but not enforced yet
- Room to grow without refactoring core

---

## Questions for Refinement

1. Should army limit be configurable per preset? (e.g., "Create a 1500pt list")
2. Should we show "dead space" when army is under limit? (e.g., "350 points unspent")
3. Should encountering an army over 2000pts show a warning or block save?
4. Should leaders/enhancements be required or optional in first version?
5. Should we support multiple detachments per army? (MVP: no, just one)
