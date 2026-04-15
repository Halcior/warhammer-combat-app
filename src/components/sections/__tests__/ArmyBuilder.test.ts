import { describe, expect, it } from "vitest";
import type { ArmyPresetV2 } from "../../../types/armyPreset";
import type { Unit } from "../../../types/combat";
import {
  applyDetachmentSelectionToPreset,
  applyFactionSelectionToPreset,
  getFactionScopedUnits,
} from "../../../lib/armyBuilderUtils";

function createUnit(id: string, name: string, faction: string): Unit {
  return {
    id,
    name,
    faction,
    toughness: 4,
    save: 3,
    woundsPerModel: 2,
    weapons: [
      {
        id: `${id}-weapon`,
        name: "Test Weapon",
        attacks: 1,
        skill: 3,
        strength: 4,
        ap: 0,
        damage: 1,
        type: "ranged",
      },
    ],
  };
}

describe("ArmyBuilder helpers", () => {
  it("returns no selectable units until a faction is chosen", () => {
    const units = [
      createUnit("tau-broadside", "Broadside Battlesuit", "T'au Empire"),
      createUnit("death-guard-marine", "Plague Marines", "Death Guard"),
    ];

    expect(getFactionScopedUnits(units, "")).toEqual([]);
    expect(getFactionScopedUnits(units, "T'au Empire")).toHaveLength(1);
    expect(getFactionScopedUnits(units, "T'au Empire")[0]?.id).toBe("tau-broadside");
  });

  it("resets detachment data and keeps only units from the selected faction", () => {
    const tauUnit = createUnit("tau-broadside", "Broadside Battlesuit", "T'au Empire");
    const deathGuardUnit = createUnit("death-guard-marine", "Plague Marines", "Death Guard");
    const unitDefinitions = new Map<string, Unit>([
      [tauUnit.id, tauUnit],
      [deathGuardUnit.id, deathGuardUnit],
    ]);

    const preset: ArmyPresetV2 = {
      id: "army-1",
      name: "Mixed draft",
      faction: "",
      detachmentId: "old-detachment",
      detachmentName: "Old Detachment",
      units: [
        {
          instanceId: "unit-instance-1",
          unitId: tauUnit.id,
          nickname: tauUnit.name,
          modelCount: 1,
          selectedWeaponId: tauUnit.weapons[0]!.id,
          unitTotalPoints: 120,
          pointsPerModel: 120,
        },
        {
          instanceId: "unit-instance-2",
          unitId: deathGuardUnit.id,
          nickname: deathGuardUnit.name,
          modelCount: 1,
          selectedWeaponId: deathGuardUnit.weapons[0]!.id,
          unitTotalPoints: 90,
          pointsPerModel: 90,
        },
      ],
      totalPoints: 210,
      pointsLimit: 2000,
      createdAt: 1,
      updatedAt: 1,
    };

    const updated = applyFactionSelectionToPreset(preset, "Death Guard", unitDefinitions);

    expect(updated.faction).toBe("Death Guard");
    expect(updated.detachmentId).toBeUndefined();
    expect(updated.detachmentName).toBeUndefined();
    expect(updated.units).toHaveLength(1);
    expect(updated.units[0]?.unitId).toBe("death-guard-marine");
    expect(updated.totalPoints).toBe(90);
    expect(updated.updatedAt).toBeGreaterThan(1);
  });

  it("keeps only enhancements legal for the selected detachment", () => {
    const preset: ArmyPresetV2 = {
      id: "army-2",
      name: "Death Guard draft",
      faction: "Death Guard",
      detachmentId: "old-detachment",
      detachmentName: "Old Detachment",
      units: [
        {
          instanceId: "unit-instance-3",
          unitId: "plague-marines",
          nickname: "Plague Marines",
          modelCount: 5,
          selectedWeaponId: "plasma-gun",
          enhancementId: "old-enhancement",
          enhancementPointsCost: 20,
          unitTotalPoints: 90,
          pointsPerModel: 18,
        },
      ],
      totalPoints: 110,
      pointsLimit: 2000,
      createdAt: 1,
      updatedAt: 1,
    };

    const updated = applyDetachmentSelectionToPreset(
      preset,
      "flyblown-host",
      "Flyblown Host",
      {
        "flyblown-host": [{ id: "new-enhancement", name: "New Enhancement", cost: 15 }],
      }
    );

    expect(updated.detachmentId).toBe("flyblown-host");
    expect(updated.detachmentName).toBe("Flyblown Host");
    expect(updated.units[0]?.enhancementId).toBeUndefined();
    expect(updated.units[0]?.enhancementPointsCost).toBe(0);
    expect(updated.totalPoints).toBe(90);
  });
});
