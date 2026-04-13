import { describe, expect, it } from "vitest";
import type { Unit } from "../../types/combat";
import {
  calculateUnitTotalPointsFromDefinition,
  formatUnitPointsOptionsSummary,
  getBestPointsOptionForModelCount,
  getEstimatedPointsPerModel,
} from "../presetUtils";

function createUnit(overrides: Partial<Unit> = {}): Unit {
  return {
    id: "unit-1",
    name: "Test Unit",
    faction: "Test Faction",
    toughness: 4,
    save: 3,
    woundsPerModel: 2,
    weapons: [],
    specialRules: [],
    abilities: [],
    keywords: [],
    ...overrides,
  };
}

describe("presetUtils points helpers", () => {
  it("uses the exact points breakpoint when model count matches", () => {
    const unit = createUnit({
      pointsOptions: [
        { description: "5 models", cost: 100, modelCount: 5 },
        { description: "10 models", cost: 190, modelCount: 10 },
      ],
    });

    expect(calculateUnitTotalPointsFromDefinition(unit, 10)).toBe(190);
  });

  it("falls forward to the next valid breakpoint when there is no exact match", () => {
    const unit = createUnit({
      pointsOptions: [
        { description: "5 models", cost: 100, modelCount: 5 },
        { description: "10 models", cost: 190, modelCount: 10 },
      ],
    });

    expect(getBestPointsOptionForModelCount(unit, 7)?.cost).toBe(190);
    expect(calculateUnitTotalPointsFromDefinition(unit, 7)).toBe(190);
  });

  it("falls back to the largest breakpoint when model count exceeds defined tiers", () => {
    const unit = createUnit({
      pointsOptions: [
        { description: "5 models", cost: 100, modelCount: 5 },
        { description: "10 models", cost: 190, modelCount: 10 },
      ],
    });

    expect(getBestPointsOptionForModelCount(unit, 15)?.cost).toBe(190);
  });

  it("estimates per-model points from the first breakpoint", () => {
    const unit = createUnit({
      pointsOptions: [{ description: "5 models", cost: 100, modelCount: 5 }],
    });

    expect(getEstimatedPointsPerModel(unit)).toBe(20);
  });

  it("formats a readable points summary from breakpoints", () => {
    const unit = createUnit({
      pointsOptions: [
        { description: "5 models", cost: 100, modelCount: 5 },
        { description: "10 models", cost: 190, modelCount: 10 },
      ],
    });

    expect(formatUnitPointsOptionsSummary(unit)).toBe("5: 100 pts • 10: 190 pts");
  });
});
