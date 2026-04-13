interface Enhancement {
  id: string;
  name: string;
  cost?: number;
}

interface EnhancementSelectorProps {
  value: string | undefined;
  onChange: (enhancementId: string | undefined) => void;
  enhancements: Enhancement[];
  disabled?: boolean;
  error?: string;
}

export function EnhancementSelector({
  value,
  onChange,
  enhancements,
  disabled = false,
  error,
}: EnhancementSelectorProps) {
  const selectedEnhancement = enhancements.find((e) => e.id === value);

  return (
    <div className="form-field">
      <label className="form-label" htmlFor="enhancement-select">
        Enhancement (Optional)
      </label>
      <select
        id="enhancement-select"
        className="form-select"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? "enhancement-error" : undefined}
      >
        <option value="">-- None --</option>
        {enhancements.map((enh) => (
          <option key={enh.id} value={enh.id}>
            {enh.name}
            {enh.cost ? ` (+${enh.cost} pts)` : ""}
          </option>
        ))}
      </select>
      {error && (
        <span id="enhancement-error" className="form-error">
          {error}
        </span>
      )}
      <span className="form-hint">
        {selectedEnhancement
          ? `${selectedEnhancement.name}${selectedEnhancement.cost ? ` (${selectedEnhancement.cost} pts)` : ""}`
          : "No enhancement"}
      </span>
    </div>
  );
}
