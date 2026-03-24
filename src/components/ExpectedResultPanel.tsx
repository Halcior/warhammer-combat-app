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
      <h2>Expected Result</h2>

      <div className="result-section">
        <h3>Main Outcome</h3>
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
          <StatBox
            label="Expected unsaved wounds"
            value={expectedResult.expectedUnsavedWounds.toFixed(2)}
          />
          <StatBox
            label="Expected damage"
            value={expectedResult.expectedDamage.toFixed(2)}
            highlight
          />
          <StatBox
            label="Expected slain models"
            value={expectedResult.expectedSlainModels.toFixed(2)}
            highlight
          />
        </div>
      </div>

      <div className="result-section">
        <h3>Attack Profile</h3>
        <div className="stats-grid stats-grid--secondary">
          <StatBox label="Total attacks" value={expectedResult.totalAttacks} />
          <StatBox label="Effective AP" value={expectedResult.effectiveAp} />
          <StatBox label="Blast bonus" value={expectedResult.blastBonus} />
        </div>
      </div>

      <div className="result-section">
        <h3>Detailed Breakdown</h3>
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
          <StatBox
            label="Critical wounds"
            value={expectedResult.criticalWoundsFromRolls.toFixed(2)}
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