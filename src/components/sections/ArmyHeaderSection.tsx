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
