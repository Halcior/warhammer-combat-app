import type { ExpectedDamageResult } from "../lib/combat/index";

type ExpectedResultPanelProps = {
  expectedResult: ExpectedDamageResult;
};

export function ExpectedResultPanel({
  expectedResult,
}: ExpectedResultPanelProps) {
  return (
    <div className="card">
      <h2>Expected Result</h2>

      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-label">Total attacks</span>
          <span className="stat-value">{expectedResult.totalAttacks}</span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Hit on</span>
          <span className="stat-value">
            {expectedResult.hitTarget === null ? "Auto" : `${expectedResult.hitTarget}+`}
          </span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Wound on</span>
          <span className="stat-value">{expectedResult.woundTarget}+</span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Save on</span>
          <span className="stat-value">{expectedResult.saveTarget}+</span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Expected hits</span>
          <span className="stat-value">{expectedResult.expectedHits.toFixed(2)}</span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Expected wounds</span>
          <span className="stat-value">{expectedResult.expectedWounds.toFixed(2)}</span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Expected unsaved wounds</span>
          <span className="stat-value">
            {expectedResult.expectedUnsavedWounds.toFixed(2)}
          </span>
        </div>

        <div className="stat-box stat-box--highlight">
          <span className="stat-label">Expected damage</span>
          <span className="stat-value">{expectedResult.expectedDamage.toFixed(2)}</span>
        </div>

        <div className="stat-box stat-box--highlight">
          <span className="stat-label">Expected slain models</span>
          <span className="stat-value">
            {expectedResult.expectedSlainModels.toFixed(2)}
          </span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Blast bonus</span>
          <span className="stat-value">{expectedResult.blastBonus}</span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Critical hits</span>
          <span className="stat-value">
            {expectedResult.criticalHits.toFixed(2)}
          </span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Extra hits</span>
          <span className="stat-value">
            {expectedResult.extraHitsFromSustained.toFixed(2)}
          </span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Auto wounds</span>
          <span className="stat-value">
            {expectedResult.autoWoundsFromLethalHits.toFixed(2)}
          </span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Critical wounds</span>
          <span className="stat-value">
            {expectedResult.criticalWoundsFromRolls.toFixed(2)}
          </span>
        </div>

        <div className="stat-box stat-box--highlight">
          <span className="stat-label">Mortal wounds</span>
          <span className="stat-value">
            {expectedResult.mortalWoundsFromDevastating.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}