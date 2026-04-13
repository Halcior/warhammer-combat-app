import type { Unit } from "../../types/combat";

interface LeaderSelectorProps {
  value: string | undefined;
  onChange: (leaderId: string | undefined) => void;
  leaders: Unit[];
  disabled?: boolean;
  error?: string;
}

export function LeaderSelector({
  value,
  onChange,
  leaders,
  disabled = false,
  error,
}: LeaderSelectorProps) {
  return (
    <div className="form-field">
      <label className="form-label" htmlFor="leader-select">
        Leader (Optional)
      </label>
      <select
        id="leader-select"
        className="form-select"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? "leader-error" : undefined}
      >
        <option value="">-- None --</option>
        {leaders.map((leader) => (
          <option key={leader.id} value={leader.id}>
            {leader.name}
          </option>
        ))}
      </select>
      {error && (
        <span id="leader-error" className="form-error">
          {error}
        </span>
      )}
      <span className="form-hint">
        {value
          ? `${leaders.find((l) => l.id === value)?.name || "Unknown"} selected`
          : "No leader attached"}
      </span>
    </div>
  );
}
