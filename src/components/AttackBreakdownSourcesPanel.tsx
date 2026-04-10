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
      <div className="breakdown-list">
        {rows.map((row) => (
          <div key={`${title}-${row.label}`} className="breakdown-row">
            <span className="breakdown-label">{row.label}</span>
            <span className="breakdown-value">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AttackBreakdownSourcesPanel({ explanation }: Props) {
  return (
    <div className="card">
      <details className="rules-section rules-section--collapsible" open={false}>
        <summary className="rules-section__summary">
          <span>Why these numbers?</span>
          <span className="rules-section__chevron" aria-hidden="true">
            +
          </span>
        </summary>

        <div className="rules-section__content">
          <Section title="Hit calculation" rows={explanation.hit} />
          <Section title="Wound calculation" rows={explanation.wound} />
          <Section title="Save calculation" rows={explanation.save} />
          <Section title="Damage calculation" rows={explanation.damage} />
        </div>
      </details>
    </div>
  );
}
