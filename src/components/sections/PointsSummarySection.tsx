import { useState } from "react";
import type { ArmyPresetV2, PointsBreakdownItem } from "../../types/armyPreset";
import { getPointsStatusColor, formatPoints } from "../../lib/presetUtils";

interface PointsSummarySectionProps {
  preset: ArmyPresetV2;
  breakdown: PointsBreakdownItem[];
}

export function PointsSummarySection({ preset, breakdown }: PointsSummarySectionProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const statusColor = getPointsStatusColor(preset.totalPoints, preset.pointsLimit);
  const percentage = preset.pointsLimit
    ? Math.round((preset.totalPoints / preset.pointsLimit) * 100)
    : 100;

  return (
    <div className="points-summary-section">
      <div className="points-summary__header">
        <h3 className="points-summary__title">Points</h3>
        <span className="points-summary__total">
          {formatPoints(preset.totalPoints)}
          {preset.pointsLimit && ` / ${formatPoints(preset.pointsLimit)}`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="points-summary__progress">
        <div
          className={`points-summary__bar points-summary__bar--${statusColor}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="points-summary__label">
        {preset.pointsLimit ? (
          <span className={`points-summary__label-text points-summary__label-text--${statusColor}`}>
            {percentage}% of {formatPoints(preset.pointsLimit)}
          </span>
        ) : (
          <span className="points-summary__label-text">Unlimited</span>
        )}
      </div>

      {/* Collapsible breakdown */}
      {breakdown.length > 0 && (
        <div className="points-summary__breakdown">
          <button
            className="points-summary__toggle"
            onClick={() => setShowBreakdown(!showBreakdown)}
            aria-expanded={showBreakdown}
          >
            {showBreakdown ? "Hide" : "Show"} Breakdown
            <span className="points-summary__toggle-icon">{showBreakdown ? "▼" : "▶"}</span>
          </button>

          {showBreakdown && (
            <div className="points-summary__list">
              {breakdown.map((item, idx) => (
                <div key={idx} className="points-summary__item">
                  <span className="points-summary__item-name">{item.unitName}</span>
                  <span className="points-summary__item-points">
                    {formatPoints(
                      item.unitTotalPoints +
                        (item.leaderPoints ?? 0) +
                        (item.enhancementPoints ?? 0)
                    )}
                  </span>
                </div>
              ))}
              <div className="points-summary__divider" />
              <div className="points-summary__item points-summary__item--total">
                <span className="points-summary__item-name">TOTAL</span>
                <span className="points-summary__item-points">
                  {formatPoints(preset.totalPoints)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {statusColor === "error" && (
        <div className="points-summary__warning">
          ⚠️ Army exceeds point limit by {preset.totalPoints - (preset.pointsLimit || 0)} points
        </div>
      )}
    </div>
  );
}
