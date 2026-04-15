import { describe, expect, it } from "vitest";
import {
  resolvePriorityUnitFactions,
  type UnitChunkManifestEntry,
} from "../loadAllUnits";

const testManifest: UnitChunkManifestEntry[] = [
  {
    factionName: "Adeptus Custodes",
    slug: "adeptus-custodes",
    fileName: "adeptus-custodes.json",
    unitCount: 31,
  },
  {
    factionName: "Necrons",
    slug: "necrons",
    fileName: "necrons.json",
    unitCount: 64,
  },
  {
    factionName: "Death Guard",
    slug: "death-guard",
    fileName: "death-guard.json",
    unitCount: 71,
  },
  {
    factionName: "World Eaters",
    slug: "world-eaters",
    fileName: "world-eaters.json",
    unitCount: 58,
  },
];

describe("resolvePriorityUnitFactions", () => {
  it("prioritizes last battle factions, workspace armies, then other saved army factions without duplicates", () => {
    const factions = resolvePriorityUnitFactions(
      {
        battleSetup: {
          attackerFaction: "Necrons",
          defenderFaction: "Death Guard",
        },
        uiSession: {
          workspaceArmyA: "army-a",
          workspaceArmyB: "army-b",
        },
        armies: [
          { id: "army-a", faction: "World Eaters" },
          { id: "army-b", faction: "Necrons" },
          { id: "army-c", faction: "Adeptus Custodes" },
        ],
      },
      testManifest
    );

    expect(factions).toEqual([
      "Necrons",
      "Death Guard",
      "World Eaters",
      "Adeptus Custodes",
    ]);
  });

  it("falls back to the first manifest factions when there is no saved context", () => {
    const factions = resolvePriorityUnitFactions(
      {
        fallbackCount: 2,
      },
      testManifest
    );

    expect(factions).toEqual(["Adeptus Custodes", "Necrons"]);
  });
});
