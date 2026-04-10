import type { ExpectedDamageResult } from "../lib/combat/index";

type ExpectedResultPanelProps = {
  expectedResult: ExpectedDamageResult;
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

export function ExpectedResultPanel({
  expectedResult,
}: ExpectedResultPanelProps) {
  return (
    <div className="card">
      <div className="panel-heading">
        <p className="panel-eyebrow">Analytical Pass</p>
        <h2>Combat Breakdown</h2>
        <p className="muted-text">
          A fast read of the current attack profile, thresholds and projected
          output.
        </p>
      </div>

      <div className="result-section">
        <h3>Core thresholds</h3>
        <div className="stats-grid stats-grid--primary">
          <StatBox
            label="Hit on"
            value={
              expectedResult.hitTarget === null
                ? "Auto"
                : `${expectedResult.hitTarget}+`
            }
          />
          <StatBox label="Wound on" value={`${expectedResult.woundTarget}+`} />
          <StatBox label="Save on" value={`${expectedResult.saveTarget}+`} />
          <StatBox label="Effective AP" value={expectedResult.effectiveAp} />
          <StatBox
            label="Damage / failed save"
            value={expectedResult.damagePerFailedSave}
            highlight
          />
        </div>
      </div>

      <div className="result-section">
        <h3>Quick attack math</h3>
        <div className="stats-grid stats-grid--secondary">
          <StatBox label="Attacks / model" value={expectedResult.attacksPerModel} />
          <StatBox label="Total attacks" value={expectedResult.totalAttacks} />
          <StatBox label="Blast bonus" value={expectedResult.blastBonus} />
          <StatBox
            label="Critical hits"
            value={expectedResult.criticalHits.toFixed(2)}
          />
          <StatBox
            label="Extra hits"
            value={expectedResult.extraHitsFromSustained.toFixed(2)}
          />
          <StatBox
            label="Auto wounds"
            value={expectedResult.autoWoundsFromLethalHits.toFixed(2)}
          />
        </div>
      </div>

      <div className="result-section">
        <h3>Analytical preview</h3>
        <div className="stats-grid stats-grid--secondary">
          <StatBox
            label="Expected hits"
            value={expectedResult.expectedHits.toFixed(2)}
          />
          <StatBox
            label="Expected wounds"
            value={expectedResult.expectedWounds.toFixed(2)}
          />
          <StatBox
            label="Expected unsaved"
            value={expectedResult.expectedUnsavedWounds.toFixed(2)}
          />
          <StatBox
            label="Expected damage"
            value={expectedResult.expectedDamage.toFixed(2)}
          />
          <StatBox
            label="Expected slain"
            value={expectedResult.expectedSlainModels.toFixed(2)}
          />
          <StatBox
            label="Mortal wounds"
            value={expectedResult.mortalWoundsFromDevastating.toFixed(2)}
            highlight
          />
        </div>
      </div>
    </div>
  );
}
