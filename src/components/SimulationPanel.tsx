import type { SimulationSummary } from "../lib/combat/simulation/analyzeSimulation";

export type CalculationMode = "fast" | "accurate";

type SimulationPanelProps = {
  mode: CalculationMode;
  setMode: (mode: CalculationMode) => void;
  runs: number;
  setRuns: (runs: number) => void;
  onRun: () => void;
  summary: SimulationSummary | null;
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
}: SimulationPanelProps) {
  return (
    <div className="card">
      <h2>Simulation</h2>

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

      {mode === "fast" ? (
        <p className="muted-text">
          Fast mode uses analytical expected damage. Switch to Accurate to run Monte Carlo simulation.
        </p>
      ) : (
        <>
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
            <span className="simulation-runs">{runs} runs</span>
            <button type="button" onClick={onRun}>
              Run simulation
            </button>
          </div>
        </>
      )}

      {summary && (
        <div className="result-section">
          <h3>Monte Carlo Summary</h3>
          <div className="stats-grid stats-grid--secondary">
            <StatBox label="Mean damage" value={summary.mean.toFixed(2)} highlight />
            <StatBox label="Median damage" value={summary.median.toFixed(2)} />
            <StatBox label="Low roll (P10)" value={summary.p10.toFixed(2)} />
            <StatBox label="High roll (P90)" value={summary.p90.toFixed(2)} />
            <StatBox label="Min damage" value={summary.min.toFixed(2)} />
            <StatBox label="Max damage" value={summary.max.toFixed(2)} />
            <StatBox label="Kill chance" value={`${(summary.killChance * 100).toFixed(1)}%`} highlight />
            <StatBox label="Runs" value={summary.runs} />
          </div>
        </div>
      )}
    </div>
  );
}
