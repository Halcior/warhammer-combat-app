type ResolveAttackPanelProps = {
  expectedTotalAttacks: number;
  rolledHits: number;
  rolledWounds: number;
  successfulSaves: number;
  setRolledHits: React.Dispatch<React.SetStateAction<number>>;
  setRolledWounds: React.Dispatch<React.SetStateAction<number>>;
  setSuccessfulSaves: React.Dispatch<React.SetStateAction<number>>;
  resolvedResult: {
    unsavedWounds: number;
    resolvedDamage: number;
    resolvedSlainModels: number;
  };
};

export function ResolveAttackPanel({
  expectedTotalAttacks,
  rolledHits,
  rolledWounds,
  successfulSaves,
  setRolledHits,
  setRolledWounds,
  setSuccessfulSaves,
  resolvedResult,
}: ResolveAttackPanelProps) {
  return (
    <div className="card">
      <h2>Resolve Attack</h2>

      <div className="resolver-inputs">
        <label>
          Rolled hits
          <input
            type="number"
            min={0}
            max={expectedTotalAttacks}
            value={rolledHits}
            onChange={(e) => setRolledHits(Math.max(0, Number(e.target.value) || 0))}
          />
        </label>

        <label>
          Rolled wounds
          <input
            type="number"
            min={0}
            max={rolledHits}
            value={rolledWounds}
            onChange={(e) => setRolledWounds(Math.max(0, Number(e.target.value) || 0))}
          />
        </label>

        <label>
          Successful saves
          <input
            type="number"
            min={0}
            max={rolledWounds}
            value={successfulSaves}
            onChange={(e) => setSuccessfulSaves(Math.max(0, Number(e.target.value) || 0))}
          />
        </label>
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-label">Unsaved wounds</span>
          <span className="stat-value">{resolvedResult.unsavedWounds}</span>
        </div>

        <div className="stat-box stat-box--highlight">
          <span className="stat-label">Resolved damage</span>
          <span className="stat-value">{resolvedResult.resolvedDamage}</span>
        </div>

        <div className="stat-box stat-box--highlight">
          <span className="stat-label">Resolved slain models</span>
          <span className="stat-value">
            {resolvedResult.resolvedSlainModels.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}