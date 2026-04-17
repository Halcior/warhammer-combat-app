import { describe, expect, it } from "vitest";
import type { Unit } from "../../types/combat";
import {
  exportArmyPreset,
  importArmyPreset,
  type ArmyPresetExport,
} from "../presetExportImport";

function createUnit(overrides: Partial<Unit> = {}): Unit {
  return {
    id: "tau-hammerhead",
    name: "Hammerhead Gunship",
    faction: "T'au Empire",
    toughness: 10,
    save: 3,
    woundsPerModel: 14,
    weapons: [],
    specialRules: [],
    abilities: [],
    keywords: [],
    ...overrides,
  };
}

describe("presetExportImport faction normalization", () => {
  it("exports canonical faction names", () => {
    const unit = createUnit();
    const unitDefinitions = new Map<string, Unit>([[unit.id, unit]]);

    const exported = exportArmyPreset(
      {
        id: "army-1",
        name: "Tau Test",
        faction: "Tau Empire",
        units: [
          {
            instanceId: "unit-1",
            unitId: unit.id,
            nickname: unit.name,
            modelCount: 1,
            selectedWeaponId: "railgun",
            unitTotalPoints: 145,
            pointsPerModel: 145,
          },
        ],
        totalPoints: 145,
        pointsLimit: 2000,
        createdAt: 1,
        updatedAt: 1,
      },
      unitDefinitions
    );

    expect(exported.faction).toBe("T'au Empire");
  });

  it("imports legacy faction aliases into canonical names", () => {
    const unit = createUnit();
    const unitDefinitions = new Map<string, Unit>([[unit.id, unit]]);

    const exportData: ArmyPresetExport = {
      version: "1.0",
      type: "damageforge_army_preset",
      exportedAt: new Date(0).toISOString(),
      armyName: "Imported Tau",
      faction: "Tâ€™au Empire",
      detachmentId: "kauyon",
      detachmentName: "Kauyon",
      totalPoints: 145,
      units: [
        {
          instanceId: "unit-1",
          unitId: unit.id,
          nickname: unit.name,
          modelCount: 1,
          selectedWeaponId: "railgun",
          unitTotalPoints: 145,
          pointsPerModel: 145,
          unitName: unit.name,
          resolvedPoints: 145,
        },
      ],
    };

    const imported = importArmyPreset(exportData, unitDefinitions);

    expect(imported.faction).toBe("T'au Empire");
  });
});
