import type { AttackBreakdownExplanation } from "../lib/combat/explainAttackBreakdown";

type Props = {
  explanation: AttackBreakdownExplanation;
};

function Section({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string | number }[];
}) {
  return (
    <div className="result-section">
      <h3>{title}</h3>
      <div className="stats-grid stats-grid--secondary">
        {rows.map((row) => (
          <div key={`${title}-${row.label}`} className="stat-box">
            <span className="stat-label">{row.label}</span>
            <span className="stat-value">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AttackBreakdownSourcesPanel({ explanation }: Props) {
  return (
    <div className="card">
      <h2>Why these numbers?</h2>
      <Section title="Hit calculation" rows={explanation.hit} />
      <Section title="Wound calculation" rows={explanation.wound} />
      <Section title="Save calculation" rows={explanation.save} />
      <Section title="Damage calculation" rows={explanation.damage} />
    </div>
  );
}
