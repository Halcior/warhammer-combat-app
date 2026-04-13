import type { ArmyPreset } from "../types/army";

interface ArmySelectorProps {
  armies: ArmyPreset[];
  selectedId: string | null;
  onChange: (armyId: string) => void;
  label: string;
  placeholder: string;
}

export function ArmySelector({
  armies,
  selectedId,
  onChange,
  label,
  placeholder,
}: ArmySelectorProps) {
  return (
    <div className="army-selector">
      <label className="army-selector__label">{label}</label>
      <select
        className="army-selector__select"
        value={selectedId ?? ""}
        onChange={(e) => e.target.value && onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {armies.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name} ({a.faction})
          </option>
        ))}
      </select>
    </div>
  );
}
