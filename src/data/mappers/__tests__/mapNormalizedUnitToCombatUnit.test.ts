import { describe, expect, it } from "vitest";
import { mapNormalizedUnitToCombatUnit } from "../mapNormalizedUnitToCombatUnit";
import type { NormalizedUnit } from "../../../types/wahapedia";

function buildUnit(models: NormalizedUnit["models"]): NormalizedUnit {
  return {
    id: "unit-1",
    name: "Test Unit",
    factionId: "f-1",
    factionName: "Test Faction",
    models,
    weapons: [],
    keywords: [],
    abilities: [],
  };
}

describe("mapNormalizedUnitToCombatUnit primary model selection", () => {
  it("prefers rank-and-file profile over superior/leader variant", () => {
    const unit = buildUnit([
      {
        id: "m1",
        name: "REPENTIA SUPERIOR",
        toughness: 3,
        save: 4,
        wounds: 2,
      },
      {
        id: "m2",
        name: "SISTERS REPENTIA",
        toughness: 3,
        save: 7,
        wounds: 1,
      },
    ]);

    const mapped = mapNormalizedUnitToCombatUnit(unit);

    expect(mapped.save).toBe(7);
    expect(mapped.woundsPerModel).toBe(1);
  });

  it("selects non-leader profile when underseer is present", () => {
    const unit = buildUnit([
      {
        id: "m1",
        name: "Servitor Underseer",
        toughness: 3,
        save: 4,
        wounds: 2,
      },
      {
        id: "m2",
        name: "Combat Servitors and Gun Servitors",
        toughness: 3,
        save: 5,
        wounds: 1,
      },
    ]);

    const mapped = mapNormalizedUnitToCombatUnit(unit);

    expect(mapped.save).toBe(5);
    expect(mapped.woundsPerModel).toBe(1);
  });

  it("falls back to source order when all profiles look like variants", () => {
    const unit = buildUnit([
      {
        id: "m1",
        name: "Zeta Champion",
        toughness: 5,
        save: 3,
        wounds: 4,
      },
      {
        id: "m2",
        name: "Alpha Captain",
        toughness: 4,
        save: 2,
        wounds: 5,
      },
    ]);

    const mapped = mapNormalizedUnitToCombatUnit(unit);

    expect(mapped.toughness).toBe(5);
    expect(mapped.woundsPerModel).toBe(4);
  });
});
