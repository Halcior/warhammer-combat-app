# Army Preset Implementation Reference

## Overview

This guide shows how to implement the new Army Preset system components, with practical examples and code patterns.

---

## 1. Component: ArmyHeaderSection

**Responsibility:** Collect army-level metadata (name, faction, detachment)

### Implementation

```tsx
import { useMemo } from "react";
import type { ArmyPresetV2 } from "../../types/armyPreset";

interface ArmyHeaderSectionProps {
  preset: ArmyPresetV2;
  onNameChange: (name: string) => void;
  onFactionChange: (faction: string) => void;
  onDetachmentChange: (detachmentId: string | undefined) => void;
  onNotesChange?: (notes: string) => void;
  factions: string[];
  detachmentsByFaction: Record<string, Array<{ id: string; name: string }>>;
  validationErrors?: Record<string, string>;
}

export function ArmyHeaderSection({
  preset,
  onNameChange,
  onFactionChange,
  onDetachmentChange,
  onNotesChange,
  factions,
  detachmentsByFaction,
  validationErrors,
}: ArmyHeaderSectionProps) {
  const availableDetachments = useMemo(
    () => detachmentsByFaction[preset.faction] ?? [],
    [preset.faction, detachmentsByFaction]
  );

  return (
    <div className="army-header-section">
      <h2 className="army-header-section__title">Army Details</h2>

      <div className="army-header-section__grid">
        {/* Army Name */}
        <div className="form-field">
          <label className="form-label" htmlFor="army-name">
            Army Name *
          </label>
          <input
            id="army-name"
            className="form-input"
            type="text"
            placeholder="e.g., 'My Necron Army'"
            value={preset.name}
            onChange={(e) => onNameChange(e.target.value)}
            maxLength={50}
            aria-invalid={!!validationErrors?.name}
            aria-describedby={validationErrors?.name ? "army-name-error" : undefined}
          />
          {validationErrors?.name && (
            <span id="army-name-error" className="form-error">
              {validationErrors.name}
            </span>
          )}
          <span className="form-hint">{preset.name.length}/50</span>
        </div>

        {/* Faction */}
        <div className="form-field">
          <label className="form-label" htmlFor="faction">
            Faction *
          </label>
          <select
            id="faction"
            className="form-select"
            value={preset.faction}
            onChange={(e) => {
              onFactionChange(e.target.value);
              onDetachmentChange(undefined); // Reset detachment on faction change
            }}
          >
            <option value="">-- Select Faction --</option>
            {factions.map((faction) => (
              <option key={faction} value={faction}>
                {faction}
              </option>
            ))}
          </select>
        </div>

        {/* Detachment */}
        <div className="form-field">
          <label className="form-label" htmlFor="detachment">
            Detachment
          </label>
          <select
            id="detachment"
            className="form-select"
            value={preset.detachmentId ?? ""}
            onChange={(e) => onDetachmentChange(e.target.value || undefined)}
          >
            <option value="">-- No Detachment --</option>
            {availableDetachments.map((det) => (
              <option key={det.id} value={det.id}>
                {det.name}
              </option>
            ))}
          </select>
          <span className="form-hint">Optional, but recommended</span>
        </div>
      </div>

      {/* Army Notes */}
      {onNotesChange && (
        <div className="form-field">
          <label className="form-label" htmlFor="army-notes">
            Notes (Optional)
          </label>
          <textarea
            id="army-notes"
            className="form-textarea"
            placeholder="e.g., 'Competitive 2000pt list', 'Fun casual build'"
            value={preset.notes ?? ""}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={3}
          />
        </div>
      )}
    </div>
  );
}
```

### CSS Classes Needed

```css
.army-header-section {
  padding: 20px;
  background: var(--surface);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  margin-bottom: 24px;
}

.army-header-section__title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 16px;
}

.army-header-section__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}

.form-input,
.form-select,
.form-textarea {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  background: rgba(255, 255, 255, 0.02);
  color: var(--text);
  font-family: inherit;
  font-size: 0.95rem;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(242, 106, 27, 0.1);
}

.form-error {
  font-size: 0.85rem;
  color: #ffb5a6;
}

.form-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
}
```

---

## 2. Component: PointsSummarySection

**Responsibility:** Display points total and optional breakdown

### Implementation

```tsx
import { useState } from "react";
import type { ArmyPresetV2 } from "../../types/armyPreset";
import { getPointsStatusColor, formatPoints } from "../../lib/presetUtils";

interface PointsSummarySectionProps {
  preset: ArmyPresetV2;
  breakdown: Array<{ unitName: string; points: number }>;
}

export function PointsSummarySection({ preset, breakdown }: PointsSummarySectionProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const statusColor = getPointsStatusColor(preset.totalPoints, preset.pointsLimit);
  const percentage = preset.pointsLimit
    ? Math.round((preset.totalPoints / preset.pointsLimit) * 100)
    : 100;

  return (
    <div className="points-summary-section">
      <div className="points-summary__header">
        <h3 className="points-summary__title">Points</h3>
        <span className="points-summary__total">
          {formatPoints(preset.totalPoints)}
          {preset.pointsLimit && ` / ${formatPoints(preset.pointsLimit)}`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="points-summary__progress">
        <div
          className={`points-summary__bar points-summary__bar--${statusColor}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="points-summary__label">
        {preset.pointsLimit ? (
          <span className={`points-summary__label-text points-summary__label-text--${statusColor}`}>
            {percentage}% of {formatPoints(preset.pointsLimit)}
          </span>
        ) : (
          <span className="points-summary__label-text">Unlimited</span>
        )}
      </div>

      {/* Collapsible breakdown */}
      {breakdown.length > 0 && (
        <div className="points-summary__breakdown">
          <button
            className="points-summary__toggle"
            onClick={() => setShowBreakdown(!showBreakdown)}
            aria-expanded={showBreakdown}
          >
            {showBreakdown ? "Hide" : "Show"} Breakdown
            <span className="points-summary__toggle-icon">{showBreakdown ? "▼" : "▶"}</span>
          </button>

          {showBreakdown && (
            <div className="points-summary__list">
              {breakdown.map((item, idx) => (
                <div key={idx} className="points-summary__item">
                  <span className="points-summary__item-name">{item.unitName}</span>
                  <span className="points-summary__item-points">{formatPoints(item.points)}</span>
                </div>
              ))}
              <div className="points-summary__divider" />
              <div className="points-summary__item points-summary__item--total">
                <span className="points-summary__item-name">TOTAL</span>
                <span className="points-summary__item-points">
                  {formatPoints(preset.totalPoints)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {statusColor === "error" && (
        <div className="points-summary__warning">
          ⚠️ Army exceeds point limit by {preset.totalPoints - (preset.pointsLimit || 0)} points
        </div>
      )}
    </div>
  );
}
```

### CSS Classes Needed

```css
.points-summary-section {
  padding: 16px;
  background: rgba(242, 106, 27, 0.05);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(242, 106, 27, 0.2);
  margin-bottom: 24px;
}

.points-summary__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.points-summary__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.points-summary__total {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--accent);
}

.points-summary__progress {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
  margin-bottom: 8px;
}

.points-summary__bar {
  height: 100%;
  transition: width 0.3s ease;
}

.points-summary__bar--success {
  background: #4ade80;
}

.points-summary__bar--warning {
  background: #fbbf24;
}

.points-summary__bar--error {
  background: #f87171;
}

.points-summary__label {
  font-size: 0.85rem;
  margin-bottom: 12px;
}

.points-summary__label-text {
  font-weight: 600;
}

.points-summary__label-text--success {
  color: #4ade80;
}

.points-summary__label-text--warning {
  color: #fbbf24;
}

.points-summary__label-text--error {
  color: #f87171;
}

.points-summary__breakdown {
  margin-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 12px;
}

.points-summary__toggle {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  font-family: inherit;
}

.points-summary__toggle:hover {
  text-decoration: underline;
}

.points-summary__toggle-icon {
  transition: transform 0.2s ease;
}

.points-summary__list {
  margin-top: 8px;
  padding-left: 0;
}

.points-summary__item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  padding: 6px 0;
}

.points-summary__item--total {
  font-weight: 600;
  padding-top: 8px;
}

.points-summary__item-name {
  color: var(--text);
}

.points-summary__item-points {
  color: var(--text-muted);
  font-weight: 500;
}

.points-summary__divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 6px 0;
}

.points-summary__warning {
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(248, 113, 113, 0.1);
  border-radius: var(--radius-xs);
  border-left: 3px solid #f87171;
  color: #ffb5a6;
  font-size: 0.9rem;
}
```

---

## 3. Component: UnitCard (Preview + Edit)

**Responsibility:** Display unit and allow inline editing

### Implementation

```tsx
import { useState } from "react";
import type { SavedUnitInPreset } from "../../types/armyPreset";
import type { Unit } from "../../types/combat";

interface UnitCardProps {
  unit: SavedUnitInPreset;
  unitDefinition: Unit;
  onUpdate: (updates: Partial<SavedUnitInPreset>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  availableLeaders: Unit[];
  availableEnhancements: Array<{ id: string; name: string }>;
}

export function UnitCard({
  unit,
  unitDefinition,
  onUpdate,
  onDelete,
  onDuplicate,
  availableLeaders,
  availableEnhancements,
}: UnitCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localUnit, setLocalUnit] = useState<SavedUnitInPreset>(unit);

  if (isEditing) {
    return (
      <div className="unit-card unit-card--editing">
        <div className="unit-card__header">
          <h4 className="unit-card__title">Edit Unit</h4>
          <button
            className="unit-card__close-btn"
            onClick={() => setIsEditing(false)}
            aria-label="Close editor"
          >
            ✕
          </button>
        </div>

        <div className="unit-card__editor">
          {/* Model Count */}
          <div className="form-field">
            <label className="form-label">Model Count *</label>
            <input
              type="number"
              min="1"
              max="100"
              value={localUnit.modelCount}
              onChange={(e) => {
                const count = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
                setLocalUnit({
                  ...localUnit,
                  modelCount: count,
                  unitTotalPoints: count * localUnit.pointsPerModel,
                });
              }}
              className="form-input"
            />
          </div>

          {/* Weapon */}
          <div className="form-field">
            <label className="form-label">Weapon *</label>
            <select
              value={localUnit.selectedWeaponId}
              onChange={(e) =>
                setLocalUnit({ ...localUnit, selectedWeaponId: e.target.value })
              }
              className="form-select"
            >
              {unitDefinition.weapons.map((weapon) => (
                <option key={weapon.id} value={weapon.id}>
                  {weapon.name}
                </option>
              ))}
            </select>
          </div>

          {/* Leader */}
          <div className="form-field">
            <label className="form-label">Leader (Optional)</label>
            <select
              value={localUnit.leaderAttachedId ?? ""}
              onChange={(e) =>
                setLocalUnit({
                  ...localUnit,
                  leaderAttachedId: e.target.value || undefined,
                })
              }
              className="form-select"
            >
              <option value="">-- None --</option>
              {availableLeaders.map((leader) => (
                <option key={leader.id} value={leader.id}>
                  {leader.name}
                </option>
              ))}
            </select>
          </div>

          {/* Enhancement */}
          <div className="form-field">
            <label className="form-label">Enhancement (Optional)</label>
            <select
              value={localUnit.enhancementId ?? ""}
              onChange={(e) =>
                setLocalUnit({
                  ...localUnit,
                  enhancementId: e.target.value || undefined,
                })
              }
              className="form-select"
            >
              <option value="">-- None --</option>
              {availableEnhancements.map((enh) => (
                <option key={enh.id} value={enh.id}>
                  {enh.name}
                </option>
              ))}
            </select>
          </div>

          {/* Points Display */}
          <div className="unit-card__points-display">
            <div className="unit-card__points-row">
              <span>Unit Points:</span>
              <span>{localUnit.unitTotalPoints} pts</span>
            </div>
            {localUnit.leaderAttachedId && (
              <div className="unit-card__points-row">
                <span>Leader Points:</span>
                <span>{localUnit.leaderPointsCost || 0} pts</span>
              </div>
            )}
            {localUnit.enhancementId && (
              <div className="unit-card__points-row">
                <span>Enhancement Points:</span>
                <span>{localUnit.enhancementPointsCost || 0} pts</span>
              </div>
            )}
            <div className="unit-card__points-row unit-card__points-row--total">
              <span>Total:</span>
              <span>
                {localUnit.unitTotalPoints +
                  (localUnit.leaderPointsCost || 0) +
                  (localUnit.enhancementPointsCost || 0)}{" "}
                pts
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="unit-card__actions">
            <button
              className="button-link button-link--secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button
              className="button-link button-link--danger"
              onClick={() => {
                onDelete();
                setIsEditing(false);
              }}
            >
              Delete Unit
            </button>
            <button
              className="button-link button-link--primary"
              onClick={() => {
                onUpdate(localUnit);
                setIsEditing(false);
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="unit-card">
      <div className="unit-card__header">
        <div className="unit-card__info">
          <h4 className="unit-card__title">{unit.nickname || unitDefinition.name}</h4>
          <p className="unit-card__subtitle">
            {unit.modelCount} Models | {unit.unitTotalPoints} pts
          </p>
        </div>
        <div className="unit-card__actions-compact">
          <button
            className="unit-card__btn unit-card__btn--compact"
            onClick={() => setIsEditing(true)}
            title="Edit unit"
          >
            Edit
          </button>
          <button
            className="unit-card__btn unit-card__btn--compact"
            onClick={onDuplicate}
            title="Duplicate unit"
          >
            Dup
          </button>
          <button
            className="unit-card__btn unit-card__btn--compact unit-card__btn--danger"
            onClick={onDelete}
            title="Delete unit"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="unit-card__details">
        <p className="unit-card__detail">
          <span className="unit-card__detail-label">Weapon:</span>
          <span className="unit-card__detail-value">
            {unitDefinition.weapons.find((w) => w.id === unit.selectedWeaponId)?.name}
          </span>
        </p>
        {unit.leaderAttachedId && (
          <p className="unit-card__detail">
            <span className="unit-card__detail-label">Leader:</span>
            <span className="unit-card__detail-value">{unit.leaderAttachedId}</span>
          </p>
        )}
        {unit.enhancementId && (
          <p className="unit-card__detail">
            <span className="unit-card__detail-label">Enhancement:</span>
            <span className="unit-card__detail-value">{unit.enhancementId}</span>
          </p>
        )}
      </div>
    </div>
  );
}
```

---

## 4. Usage Example: ArmyBuilder Integration

This shows how all pieces fit together in the main builder:

```tsx
import { useState, useCallback, useMemo } from "react";
import { ArmyHeaderSection } from "./ArmyHeaderSection";
import { PointsSummarySection } from "./PointsSummarySection";
import { UnitCard } from "./UnitCard";
import { validateArmyPreset, generatePointsBreakdown, addUnitToPreset } from "../../lib/presetUtils";
import type { ArmyPresetV2 } from "../../types/armyPreset";

interface ArmyBuilderV2Props {
  initial?: ArmyPresetV2;
  onSave: (preset: ArmyPresetV2) => void;
  onCancel: () => void;
}

export function ArmyBuilderV2({ initial, onSave, onCancel }: ArmyBuilderV2Props) {
  const [preset, setPreset] = useState<ArmyPresetV2>(
    initial ?? {
      id: `army-${Date.now()}`,
      name: "",
      faction: "",
      units: [],
      totalPoints: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  );

  const validation = useMemo(() => validateArmyPreset(preset), [preset]);
  const breakdown = useMemo(
    () => generatePointsBreakdown(preset, unitDefinitionsMap),
    [preset]
  );

  const handleSave = useCallback(() => {
    if (validation.isValid) {
      onSave(preset);
    }
  }, [preset, validation.isValid, onSave]);

  return (
    <div className="army-builder">
      {/* Errors */}
      {validation.errors.length > 0 && (
        <div className="form-errors">
          <h4>Errors</h4>
          <ul>
            {validation.errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <div className="form-warnings">
          {validation.warnings.map((warn, idx) => (
            <p key={idx}>⚠️ {warn}</p>
          ))}
        </div>
      )}

      {/* Header */}
      <ArmyHeaderSection
        preset={preset}
        onNameChange={(name) => setPreset({ ...preset, name })}
        onFactionChange={(faction) => setPreset({ ...preset, faction })}
        onDetachmentChange={(detachmentId) =>
          setPreset({ ...preset, detachmentId })
        }
        onNotesChange={(notes) => setPreset({ ...preset, notes })}
        factions={factionList}
        detachmentsByFaction={detachments}
        validationErrors={validation.errors}
      />

      {/* Points Summary */}
      <PointsSummarySection preset={preset} breakdown={breakdown} />

      {/* Units */}
      <div className="army-builder__units">
        <h3>Units</h3>
        {preset.units.map((unit) => {
          const unitDef = unitDefinitionsMap.get(unit.unitId);
          return (
            <UnitCard
              key={unit.unitId}
              unit={unit}
              unitDefinition={unitDef!}
              onUpdate={(updates) => {
                // Handle update
              }}
              onDelete={() => {
                // Handle delete
              }}
              onDuplicate={() => {
                // Handle duplicate
              }}
              availableLeaders={leadersList}
              availableEnhancements={enhancementsList}
            />
          );
        })}
        <button onClick={() => {
          // Show unit picker to add unit
        }}>
          + Add Unit
        </button>
      </div>

      {/* Actions */}
      <div className="army-builder__actions">
        <button className="button-link button-link--secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="button-link button-link--primary"
          onClick={handleSave}
          disabled={!validation.isValid}
        >
          {initial ? "Save Changes" : "Create Army"}
        </button>
      </div>
    </div>
  );
}
```

---

## Key Implementation Patterns

### 1. **Separate Edit from Display**
- Collapsed: Show preview with key info
- Expanded: Show full editor form
- OnSave: Update parent, collapse

### 2. **Points Always Calculated**
- Every change (model count, weapon, leader) recalculates
- Display updates immediately
- No "Calculate" button needed

### 3. **Async Operations**
- Loading unit definitions
- Loading detachments and enhancements
- Use loading states during fetch

### 4. **Validation**
- Real-time field validation
- Critical errors block save
- Warnings appear but don't block

### 5. **State Lifting**
- Parent holds preset state
- Components call callbacks for updates
- Prevents prop drilling

---

## Summary

These components provide a complete, practical army preset builder that:
- Captures practical setup context
- Calculates and displays points clearly
- Validates without overwhelming
- Integrates easily with existing codebase
- Scales for future features
