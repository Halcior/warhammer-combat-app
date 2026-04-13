# Army Preset Components - Quick Integration Guide

## Component Overview

Three new reusable components have been created in `src/components/sections/`:

1. **ArmyHeaderSection** - Collects army metadata (name, faction, detachment, notes)
2. **PointsSummarySection** - Displays total points with progress bar and breakdown
3. **UnitCard** - Shows unit preview or full edit form

## Quick Import

```tsx
import {
  ArmyHeaderSection,
  PointsSummarySection,
  UnitCard,
} from "@/components/sections";
import type { ArmyPresetV2, SavedUnitInPreset } from "@/types/armyPreset";
import {
  validateArmyPreset,
  generatePointsBreakdown,
  calculateArmyPoints,
  formatPoints,
} from "@/lib/presetUtils";
```

## Component Usage Examples

### ArmyHeaderSection

```tsx
<ArmyHeaderSection
  preset={preset}
  onNameChange={(name) => setPreset({ ...preset, name })}
  onFactionChange={(faction) => setPreset({ ...preset, faction })}
  onDetachmentChange={(detachmentId) =>
    setPreset({ ...preset, detachmentId })
  }
  onNotesChange={(notes) => setPreset({ ...preset, notes })}
  factions={["Necrons", "Space Marines", "Tau", "Death Guard", "Adeptus Custodes"]}
  detachmentsByFaction={detachmentsByFactionMap}
  validationErrors={validation.errors}
/>
```

### PointsSummarySection

```tsx
const breakdown = useMemo(
  () => generatePointsBreakdown(preset, unitDefinitionsMap),
  [preset]
);

<PointsSummarySection
  preset={preset}
  breakdown={breakdown}
/>
```

### UnitCard

```tsx
const unitDef = unitDefinitionsMap.get(unit.unitId);

<UnitCard
  unit={unit}
  unitDefinition={unitDef!}
  onUpdate={(updates) => {
    // Update the unit in your preset
    const updated = { ...unit, ...updates };
    updateUnitInPreset(preset, unit.unitId, updated);
  }}
  onDelete={() => {
    // Remove unit
    removeUnitFromPreset(preset, unit.unitId);
  }}
  onDuplicate={() => {
    // Duplicate unit
    duplicateUnitInPreset(preset, unit.unitId);
  }}
  availableLeaders={leadersList}
  availableEnhancements={enhancementsList}
/>
```

## Styling Notes

All components use CSS variables defined in `App.css`:

- `--accent` (orange): Primary action color
- `--text`: Main text color
- `--text-muted`: Secondary text
- `--border`: Border color
- `--surface`: Background for cards

Color status indicators:
- **Success** (green): #4ade80 - Within points limit
- **Warning** (amber): #fbbf24 - 80-100% of limit
- **Error** (red): #f87171 - Over limit

## Form Input Components

All form inputs use these CSS classes (available globally):

```tsx
// Input field wrapper
<div className="form-field">
  <label className="form-label">Field Label *</label>
  <input className="form-input" type="text" />
  <span className="form-hint">Helper text</span>
  <span className="form-error">Error message</span>
</div>
```

## Integration Patterns

### 1. Controlled Component Pattern
All components are fully controlled. Parent manages state:

```tsx
const [preset, setPreset] = useState<ArmyPresetV2>({
  id: `army-${Date.now()}`,
  name: "",
  faction: "",
  units: [],
  totalPoints: 0,
  pointsLimit: 2000,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});
```

### 2. Callback Handlers
Changes flow via callbacks, not direct mutations:

```tsx
// Good - component calls handler, parent updates state
onNameChange={(name) => setPreset({ ...preset, name })}

// Bad - direct mutation
preset.name = value; // Don't do this
```

### 3. Validation Display
Show validation errors before allowing save:

```tsx
const validation = useMemo(
  () => validateArmyPreset(preset),
  [preset]
);

// Show errors to user
{validation.errors.length > 0 && (
  <div className="validation-errors">
    {validation.errors.map((err) => <p>{err}</p>)}
  </div>
)}

// Disable save button
<button disabled={!validation.isValid}>Save Army</button>
```

### 4. Real-Time Points Calculation
Points update on every change:

```tsx
// In render, useMemo prevents unnecessary recalculations
const totalPoints = useMemo(
  () => calculateArmyPoints(preset),
  [preset]
);

const breakdown = useMemo(
  () => generatePointsBreakdown(preset, unitDefinitionsMap),
  [preset]
);
```

## Common Patterns

### Add Unit to Preset
```tsx
const newUnit: SavedUnitInPreset = {
  unitId,
  nickname: unitDef.name,
  modelCount: 1,
  selectedWeaponId: unitDef.weapons[0]?.id || "",
  leaderAttachedId: undefined,
  enhancementId: undefined,
  pointsPerModel: unitDef.cost || 0,
  unitTotalPoints: unitDef.cost || 0,
  leaderPointsCost: 0,
  enhancementPointsCost: 0,
  notes: "",
  role: "troop",
  addedAt: Date.now(),
};

const updated = addUnitToPreset(preset, newUnit);
setPreset(updated);
```

### Delete Unit
```tsx
const updated = removeUnitFromPreset(preset, unitId);
setPreset(updated);
```

### Duplicate Unit
```tsx
const updated = duplicateUnitInPreset(preset, unitId);
setPreset(updated);
```

### Save Preset
```tsx
// Validate first
const validation = validateArmyPreset(preset);
if (!validation.isValid) return;

// Save to storage or API
const presets = JSON.parse(localStorage.getItem("armyPresets") || "[]");
presets.push(preset);
localStorage.setItem("armyPresets", JSON.stringify(presets));
```

## Mobile Responsiveness

All components are responsive:

- **Desktop**: Full grid layout with all options visible
- **Tablet (< 768px)**: Single column forms, simplified layout
- **Mobile**: Touch-friendly buttons, stacked elements

Responsive CSS is already included and will activate automatically at `max-width: 768px`.

## TypeScript Support

All components have full TypeScript typing:

```tsx
// Imports include type definitions
import type { ArmyPresetV2, SavedUnitInPreset } from "@/types/armyPreset";

// Components are fully typed
interface ArmyHeaderSectionProps {
  preset: ArmyPresetV2;
  onNameChange: (name: string) => void;
  // ...
}

// Type guards available
import { isArmyPresetV2, isSavedUnitInPreset } from "@/types/armyPreset";

if (isArmyPresetV2(data)) {
  // data is definitely ArmyPresetV2
}
```

## Next Components to Build

The following helper components are still needed:

1. **ModelCountInput** - Specialized number input (1-100)
2. **LeaderSelector** - Dropdown for attaching leaders
3. **EnhancementSelector** - Dropdown for enhancements
4. **AddUnitButton** - Opens unit picker modal
5. **ValidationAlert** - Displays validation errors/warnings

## Testing Tips

Test in this order:

1. **Form inputs**: Type in name, select faction, select detachment
2. **Points display**: Add units and watch total update
3. **Unit editing**: Click Edit, change model count, watch points recalculate
4. **Validation**: Try to save with missing name (should show error)
5. **Mobile**: Resize browser to < 768px and verify layout
