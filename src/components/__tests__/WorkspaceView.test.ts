import { describe, expect, it } from "vitest";
import type { ArmyPresetV2 } from "../../types/armyPreset";
import type { Unit } from "../../types/combat";
import { buildWorkspaceSelectableEntries } from "../WorkspaceView";

describe("WorkspaceView helpers", () => {
  it("includes attached leaders as selectable workspace entries", () => {
    const army: ArmyPresetV2 = {
      id: "army-1",
      name: "Death Guard",
      faction: "Death Guard",
      units: [
        {
          instanceId: "unit-1",
          unitId: "deathshroud-terminators",
          nickname: "Deathshroud",
          modelCount: 3,
          selectedWeaponId: "plaguespurt-gauntlet",
          selectedWeapons: [
            {
              weaponId: "plaguespurt-gauntlet",
              name: "Plaguespurt Gauntlet",
              category: "ranged",
              quantity: 3,
            },
          ],
          unitTotalPoints: 120,
          pointsPerModel: 40,
          leaderAttachedId: "lord-of-contagion",
          attachedLeader: {
            unitId: "lord-of-contagion",
            unitName: "Lord of Contagion",
            modelCount: 1,
            selectedWeapons: [
              {
                weaponId: "plaguereaper",
                name: "Plaguereaper",
                category: "melee",
                quantity: 1,
              },
            ],
            selectedWeaponId: "plaguereaper",
            selectedMeleeWeaponId: "plaguereaper",
            pointsTotal: 80,
          },
          leaderPointsCost: 80,
          enhancementPointsCost: 10,
        },
      ],
      totalPoints: 210,
      createdAt: 1,
      updatedAt: 1,
    };

    const unitDefinitions: Unit[] = [
      {
        id: "deathshroud-terminators",
        name: "Deathshroud Terminators",
        faction: "Death Guard",
        toughness: 6,
        save: 2,
        woundsPerModel: 4,
        weapons: [
          {
            id: "plaguespurt-gauntlet",
            name: "Plaguespurt Gauntlet",
            type: "ranged",
            attacks: 1,
            skill: 2,
            strength: 3,
            ap: 0,
            damage: 1,
          },
        ],
        keywords: ["INFANTRY"],
      },
      {
        id: "lord-of-contagion",
        name: "Lord of Contagion",
        faction: "Death Guard",
        toughness: 6,
        save: 2,
        woundsPerModel: 6,
        weapons: [
          {
            id: "plaguereaper",
            name: "Plaguereaper",
            type: "melee",
            attacks: 5,
            skill: 2,
            strength: 8,
            ap: -2,
            damage: 2,
          },
        ],
        keywords: ["CHARACTER"],
      },
    ];

    const entries = buildWorkspaceSelectableEntries(army, unitDefinitions);

    expect(entries).toHaveLength(2);
    expect(entries[0]?.source).toBe("unit");
    expect(entries[1]?.source).toBe("attachedLeader");
    expect(entries[1]?.displayName).toBe("Lord of Contagion");
    expect(entries[1]?.parentLabel).toBe("Deathshroud");
    expect(entries[1]?.primaryWeaponId).toBe("plaguereaper");
    expect(entries[0]?.weaponOptions[0]?.label).toBe("Plaguespurt Gauntlet");
    expect(entries[1]?.weaponOptions[0]?.label).toBe("Plaguereaper");
  });

  it("reconstructs weapon options for legacy preset units that only store selectedWeaponId", () => {
    const army: ArmyPresetV2 = {
      id: "army-legacy",
      name: "Tau Legacy",
      faction: "T'au Empire",
      units: [
        {
          instanceId: "unit-legacy-1",
          unitId: "hammerhead-gunship",
          nickname: "Hammerhead",
          modelCount: 1,
          selectedWeaponId: "railgun",
          unitTotalPoints: 145,
          pointsPerModel: 145,
        },
      ],
      totalPoints: 145,
      createdAt: 1,
      updatedAt: 1,
    };

    const unitDefinitions: Unit[] = [
      {
        id: "hammerhead-gunship",
        name: "Hammerhead Gunship",
        faction: "T'au Empire",
        toughness: 10,
        save: 3,
        woundsPerModel: 14,
        weapons: [
          {
            id: "railgun",
            name: "Railgun",
            type: "ranged",
            attacks: 1,
            skill: 4,
            strength: 20,
            ap: -5,
            damage: 6,
          },
        ],
        keywords: ["VEHICLE"],
      },
    ];

    const entries = buildWorkspaceSelectableEntries(army, unitDefinitions);

    expect(entries).toHaveLength(1);
    expect(entries[0]?.primaryWeaponId).toBe("railgun");
    expect(entries[0]?.weaponLabel).toBe("Railgun");
    expect(entries[0]?.weaponOptions).toEqual([
      { weaponId: "railgun", label: "Railgun" },
    ]);
  });
});
