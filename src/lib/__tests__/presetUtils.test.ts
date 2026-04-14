import { describe, expect, it } from "vitest";
import type { ArmyPresetV2 } from "../../types/armyPreset";
import type { Unit } from "../../types/combat";
import {
  buildDefaultSelectedWeapons,
  calculateUnitTotalPointsFromDefinition,
  createPresetUnitInstanceId,
  createAttachedLeaderFromUnit,
  deriveLegacyWeaponSelection,
  duplicateUnitInPreset,
  formatUnitPointsOptionsSummary,
  getBestPointsOptionForModelCount,
  getEstimatedPointsPerModel,
  removeUnitFromPreset,
  resolveEditedUnitPoints,
  updateUnitInPreset,
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

  it("creates instance ids for preset units", () => {
    expect(createPresetUnitInstanceId()).toContain("unit_");
    expect(createPresetUnitInstanceId()).not.toBe(createPresetUnitInstanceId());
  });

  it("derives legacy weapon fields from a flexible selectedWeapons array", () => {
    const unit = createUnit({
      weapons: [
        {
          id: "plasma",
          name: "Plasma Gun",
          attacks: 1,
          skill: 3,
          strength: 8,
          ap: -2,
          damage: 2,
          type: "ranged",
        },
        {
          id: "blade",
          name: "Power Blade",
          attacks: 3,
          skill: 3,
          strength: 5,
          ap: -2,
          damage: 2,
          type: "melee",
        },
      ],
    });

    const selectedWeapons = buildDefaultSelectedWeapons(unit);
    const legacy = deriveLegacyWeaponSelection(selectedWeapons, unit);

    expect(legacy.selectedWeapons).toHaveLength(2);
    expect(legacy.selectedWeaponId).toBe("plasma");
    expect(legacy.selectedRangedWeaponId).toBe("plasma");
    expect(legacy.selectedMeleeWeaponId).toBe("blade");
  });

  it("resolves unit, leader, and enhancement points as separate subtotals", () => {
    const unit = createUnit({
      pointsOptions: [{ description: "5 models", cost: 100, modelCount: 5 }],
      weapons: [
        {
          id: "plasma",
          name: "Plasma Gun",
          attacks: 1,
          skill: 3,
          strength: 8,
          ap: -2,
          damage: 2,
          type: "ranged",
        },
      ],
    });
    const leader = createUnit({
      id: "leader-1",
      name: "Captain",
      points: 85,
      weapons: [
        {
          id: "captain-blade",
          name: "Captain Blade",
          attacks: 5,
          skill: 2,
          strength: 6,
          ap: -2,
          damage: 2,
          type: "melee",
        },
      ],
    });

    const attachedLeader = createAttachedLeaderFromUnit(leader);
    const resolved = resolveEditedUnitPoints(
      unit,
      5,
      buildDefaultSelectedWeapons(unit),
      attachedLeader,
      attachedLeader?.selectedWeapons,
      15
    );

    expect(resolved.baseUnitPoints).toBe(100);
    expect(resolved.leaderPoints).toBe(85);
    expect(resolved.enhancementPoints).toBe(15);
    expect(resolved.totalPoints).toBe(200);
  });

  it("updates, duplicates, and removes units by instanceId", () => {
    const preset: ArmyPresetV2 = {
      id: "army-1",
      name: "Test Army",
      faction: "Test Faction",
      units: [
        {
          instanceId: "unit-instance-1",
          unitId: "shared-unit",
          nickname: "Alpha",
          modelCount: 5,
          selectedWeaponId: "weapon-a",
          pointsPerModel: 20,
          unitTotalPoints: 100,
        },
        {
          instanceId: "unit-instance-2",
          unitId: "shared-unit",
          nickname: "Beta",
          modelCount: 10,
          selectedWeaponId: "weapon-b",
          pointsPerModel: 19,
          unitTotalPoints: 190,
        },
      ],
      totalPoints: 290,
      pointsLimit: 2000,
      createdAt: 1,
      updatedAt: 1,
    };

    const updated = updateUnitInPreset(preset, "unit-instance-1", { modelCount: 6 });
    expect(updated.units[0]?.modelCount).toBe(6);
    expect(updated.units[1]?.modelCount).toBe(10);

    const duplicated = duplicateUnitInPreset(preset, "unit-instance-1");
    expect(duplicated.units).toHaveLength(3);
    expect(duplicated.units[2]?.unitId).toBe("shared-unit");
    expect(duplicated.units[2]?.instanceId).not.toBe("unit-instance-1");

    const removed = removeUnitFromPreset(preset, "unit-instance-1");
    expect(removed.units).toHaveLength(1);
    expect(removed.units[0]?.nickname).toBe("Beta");
  });
});
