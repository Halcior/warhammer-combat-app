import { useState } from "react";
import type {
  AttackBreakdownExplanation,
  BreakdownLine,
  StageBreakdown,
} from "../lib/combat/explainAttackBreakdown";

// ── Types ────────────────────────────────────────────────────────────────────

type Props = {
  explanation: AttackBreakdownExplanation;
};

const STAGES = [
  { key: "hit" as const, label: "HIT", title: "Hit calculation", hint: "skill check" },
  { key: "wound" as const, label: "WOUND", title: "Wound calculation", hint: "vs toughness" },
  { key: "save" as const, label: "SAVE", title: "Save calculation", hint: "armor + AP" },
  { key: "damage" as const, label: "DAMAGE", title: "Damage calculation", hint: "per wound" },
];

type StageKey = (typeof STAGES)[number]["key"];

// ── Sub-components ───────────────────────────────────────────────────────────

function StepConnector() {
  return (
    <span className="pipeline-connector" aria-hidden="true">
      ›
    </span>
  );
}

function CalculationStep({
  stage,
  resolvedValue,
  isActive,
  onSelect,
}: {
  stage: (typeof STAGES)[number];
  resolvedValue: string;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`calc-step${isActive ? " calc-step--active" : ""}`}
      onClick={onSelect}
      aria-pressed={isActive}
    >
      <span className="calc-step__label">{stage.label}</span>
      <span className="calc-step__value">{resolvedValue}</span>
      <span className="calc-step__hint">{stage.hint}</span>
    </button>
  );
}

function CalculationFlow({
  explanation,
  selectedStep,
  onSelect,
}: {
  explanation: AttackBreakdownExplanation;
  selectedStep: StageKey;
  onSelect: (key: StageKey) => void;
}) {
  return (
    <div className="pipeline-bar">
      {STAGES.map((stage, i) => (
        <span key={stage.key} className="pipeline-bar__item">
          {i > 0 && <StepConnector />}
          <CalculationStep
            stage={stage}
            resolvedValue={explanation[stage.key].resolved}
            isActive={selectedStep === stage.key}
            onSelect={() => onSelect(stage.key)}
          />
        </span>
      ))}
    </div>
  );
}

function BreakdownRow({ row }: { row: BreakdownLine }) {
  return (
    <div className={`breakdown-row breakdown-row--${row.type}`}>
      <span className="breakdown-label">{row.label}</span>
      <span className="breakdown-value">{row.value}</span>
    </div>
  );
}

function FinalValue({ row }: { row: BreakdownLine }) {
  return (
    <div className="breakdown-row breakdown-row--final">
      <span className="breakdown-label">{row.label}</span>
      <span className="breakdown-value">{row.value}</span>
    </div>
  );
}

function StepBreakdownPanel({
  stage,
  title,
  showFullTrace,
  onToggleTrace,
}: {
  stage: StageBreakdown;
  title: string;
  showFullTrace: boolean;
  onToggleTrace: () => void;
}) {
  const visibleRows = showFullTrace
    ? stage.rows
    : stage.rows.filter((r) => r.type !== "inactive");

  const bodyRows = visibleRows.filter((r) => r.type !== "final");
  const finalRow = visibleRows.find((r) => r.type === "final");
  const hasInactive = stage.rows.some((r) => r.type === "inactive");

  return (
    <div className="pipeline-detail">
      <p className="pipeline-detail__title">{title}</p>
      <div className="breakdown-list">
        {bodyRows.map((row) => (
          <BreakdownRow key={row.label} row={row} />
        ))}
        {finalRow && <FinalValue row={finalRow} />}
      </div>
      {hasInactive && (
        <button className="pipeline-trace-toggle" onClick={onToggleTrace}>
          {showFullTrace ? "Hide inactive rows" : "Show full trace"}
        </button>
      )}
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────

export function AttackBreakdownSourcesPanel({ explanation }: Props) {
  const [selectedStep, setSelectedStep] = useState<StageKey>("hit");
  const [showFullTrace, setShowFullTrace] = useState(false);

  const activeStage = STAGES.find((s) => s.key === selectedStep)!;

  function handleSelect(key: StageKey) {
    if (key !== selectedStep) {
      setShowFullTrace(false);
    }
    setSelectedStep(key);
  }

  return (
    <div className="card">
      <div className="panel-heading">
        <p className="panel-eyebrow">Attack Resolution</p>
        <h2>Why these numbers?</h2>
        <p className="muted-text">
          Select a stage to inspect how each roll is resolved.
        </p>
      </div>

      <CalculationFlow
        explanation={explanation}
        selectedStep={selectedStep}
        onSelect={handleSelect}
      />

      <StepBreakdownPanel
        key={selectedStep}
        stage={explanation[selectedStep]}
        title={activeStage.title}
        showFullTrace={showFullTrace}
        onToggleTrace={() => setShowFullTrace((v) => !v)}
      />
    </div>
  );
}
