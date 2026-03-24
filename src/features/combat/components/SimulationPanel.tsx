import type { SimulationSummary } from "../../../shared/combat-engine/simulation/analyzeSimulation";

export function SimulationPanel(props: {
  mode: "fast" | "accurate";
  setMode: (mode: "fast" | "accurate") => void;
  runs: number;
  setRuns: (runs: number) => void;
  onRun: () => void;
  summary: SimulationSummary | null;
}) {
  const { mode, setMode, runs, setRuns, onRun, summary } = props;

  return (
    <div className="card">
      <h2>Simulation</h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <button
          onClick={() => setMode("fast")}
          style={{ fontWeight: mode === "fast" ? "bold" : "normal" }}
        >
          Fast
        </button>
        <button
          onClick={() => setMode("accurate")}
          style={{ fontWeight: mode === "accurate" ? "bold" : "normal" }}
        >
          Accurate
        </button>
      </div>

      {mode === "accurate" && (
        <>
          <div style={{ marginBottom: 8 }}>
            Runs: {runs}
          </div>
          <input
            type="range"
            min={1000}
            max={20000}
            step={1000}
            value={runs}
            onChange={(e) => setRuns(Number(e.target.value))}
          />

          <div style={{ marginTop: 12 }}>
            <button onClick={onRun}>Run simulation</button>
          </div>
        </>
      )}

      {summary && (
        <div style={{ marginTop: 16 }}>
          <div>Mean: {summary.mean.toFixed(2)}</div>
          <div>Median: {summary.median.toFixed(2)}</div>
          <div>P10: {summary.p10.toFixed(2)}</div>
          <div>P90: {summary.p90.toFixed(2)}</div>
          <div>Kill chance: {(summary.killChance * 100).toFixed(1)}%</div>
          <div>Runs: {summary.runs}</div>
        </div>
      )}
    </div>
  );
}
