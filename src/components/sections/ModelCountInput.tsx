interface ModelCountInputProps {
  value: number;
  onChange: (count: number) => void;
  onPointsChange?: (points: number) => void;
  pointsPerModel?: number;
  disabled?: boolean;
  error?: string;
}

export function ModelCountInput({
  value,
  onChange,
  onPointsChange,
  pointsPerModel = 0,
  disabled = false,
  error,
}: ModelCountInputProps) {
  const handleChange = (newValue: number) => {
    const clamped = Math.max(1, Math.min(100, newValue));
    onChange(clamped);

    if (onPointsChange && pointsPerModel) {
      onPointsChange(clamped * pointsPerModel);
    }
  };

  return (
    <div className="form-field">
      <label className="form-label" htmlFor="model-count">
        Model Count *
      </label>
      <div className="model-count-input">
        <button
          className="model-count-input__btn model-count-input__btn--minus"
          onClick={() => handleChange(value - 1)}
          disabled={disabled || value <= 1}
          aria-label="Decrease model count"
        >
          −
        </button>
        <input
          id="model-count"
          className="model-count-input__input"
          type="number"
          min="1"
          max="100"
          value={value}
          onChange={(e) => handleChange(parseInt(e.target.value) || 1)}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? "model-count-error" : undefined}
        />
        <button
          className="model-count-input__btn model-count-input__btn--plus"
          onClick={() => handleChange(value + 1)}
          disabled={disabled || value >= 100}
          aria-label="Increase model count"
        >
          +
        </button>
      </div>
      {error && (
        <span id="model-count-error" className="form-error">
          {error}
        </span>
      )}
      {pointsPerModel > 0 && (
        <span className="form-hint">
          {value} × {pointsPerModel} pts = {value * pointsPerModel} pts
        </span>
      )}
    </div>
  );
}
