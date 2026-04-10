import type { SimulationSummary } from "../lib/combat/simulation/analyzeSimulation";
import type { CalculationMode } from "../lib/combat/simulation/runSimulationByMode";

type SimulationPanelProps = {
  mode: CalculationMode;
  setMode: (mode: CalculationMode) => void;
  runs: number;
  setRuns: (runs: number) => void;
  onRun: () => void;
  summary: SimulationSummary | null;
  error: string | null;
  isRunning: boolean;
};

function StatBox({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className={`stat-box ${highlight ? "stat-box--highlight" : ""}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

export function SimulationPanel({
  mode,
  setMode,
  runs,
  setRuns,
  onRun,
  summary,
  error,
  isRunning,
}: SimulationPanelProps) {
  return (
    <div className="card">
      <div className="panel-heading">
        <p className="panel-eyebrow">Live Preview</p>
        <h2>Simulation</h2>
        <p className="muted-text">
          Wyniki odświeżają się automatycznie po zmianie setupu lub reguł.
        </p>
      </div>

      <div className="mode-toggle">
        <button
          type="button"
          className={`mode-toggle__button ${mode === "fast" ? "mode-toggle__button--active" : ""}`}
          onClick={() => setMode("fast")}
        >
          Fast
        </button>
        <button
          type="button"
          className={`mode-toggle__button ${mode === "accurate" ? "mode-toggle__button--active" : ""}`}
          onClick={() => setMode("accurate")}
        >
          Accurate
        </button>
      </div>

      <p className="muted-text">
        {mode === "fast"
          ? "Fast mode uses analytical expected damage for each roll sequence."
          : "Accurate mode uses full attack sequence Monte Carlo simulation."}
      </p>

      <label>
        Simulation runs
        <input
          type="range"
          min={1000}
          max={20000}
          step={1000}
          value={runs}
          onChange={(e) => setRuns(Number(e.target.value))}
        />
      </label>

      <div className="simulation-toolbar">
        <span className="simulation-runs">
          {isRunning ? "Updating simulation..." : `${runs} runs`}
        </span>
        <button type="button" onClick={onRun}>
          Re-roll sample
        </button>
      </div>

      {error && <p className="simulation-alert simulation-alert--error">{error}</p>}

      {!error && !summary && (
        <p className="simulation-alert">Simulation summary will appear here.</p>
      )}

      {summary && (
        <>
          <div className="result-section">
            <h3>Damage Summary</h3>
            <div className="stats-grid stats-grid--secondary">
              <StatBox label="Mean damage" value={summary.meanDamage.toFixed(2)} highlight />
              <StatBox label="Median damage" value={summary.medianDamage.toFixed(2)} />
              <StatBox label="Low roll (P10)" value={summary.p10Damage.toFixed(2)} />
              <StatBox label="High roll (P90)" value={summary.p90Damage.toFixed(2)} />
              <StatBox label="Min damage" value={summary.minDamage.toFixed(2)} />
              <StatBox label="Max damage" value={summary.maxDamage.toFixed(2)} />
              <StatBox label="Runs" value={summary.runs} />
            </div>
          </div>

          <div className="result-section">
            <h3>Slain Models Summary</h3>
            <div className="stats-grid stats-grid--secondary">
              <StatBox label="Mean slain" value={summary.meanSlainModels.toFixed(2)} highlight />
              <StatBox label="Median slain" value={summary.medianSlainModels.toFixed(2)} />
              <StatBox label="Min slain" value={summary.minSlainModels.toFixed(2)} />
              <StatBox label="Max slain" value={summary.maxSlainModels.toFixed(2)} />
              <StatBox
                label="Kill 1+ chance"
                value={`${(summary.killOneChance * 100).toFixed(1)}%`}
              />
              <StatBox
                label="Wipe chance"
                value={`${(summary.wipeChance * 100).toFixed(1)}%`}
                highlight
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
