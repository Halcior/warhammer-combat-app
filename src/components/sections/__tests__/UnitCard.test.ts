import { describe, expect, it } from "vitest";
import type { Unit } from "../../../types/combat";
import {
  getEnhancementRestrictionLabel,
  stripRuleHtmlText,
} from "../UnitCard";

function createUnit(overrides: Partial<Unit> = {}): Unit {
  return {
    id: "unit-1",
    name: "Canoness",
    faction: "Adepta Sororitas",
    toughness: 3,
    save: 3,
    woundsPerModel: 4,
    weapons: [],
    keywords: ["CHARACTER", "INFANTRY", "ADEPTA", "SORORITAS", "CANONESS"],
    ...overrides,
  };
}

describe("UnitCard helpers", () => {
  it("strips html from rules text for user-facing hints", () => {
    expect(stripRuleHtmlText("<span class='kwb'>CANONESS</span> model only.<br>Test"))
      .toBe("CANONESS model only. Test");
  });

  it("does not warn when enhancement restriction matches the unit", () => {
    const unit = createUnit();
    const warning = getEnhancementRestrictionLabel(unit, {
      id: "enh-1",
      name: "Litanies of Faith",
      description: "CANONESS or PALATINE model only. Gain 1 Miracle dice.",
      cost: 10,
    });

    expect(warning).toBeUndefined();
  });

  it("warns when enhancement restriction appears incompatible with the unit", () => {
    const unit = createUnit({ name: "Battle Sisters Squad", keywords: ["INFANTRY", "ADEPTA", "SORORITAS"] });
    const warning = getEnhancementRestrictionLabel(unit, {
      id: "enh-2",
      name: "Litanies of Faith",
      description: "CANONESS or PALATINE model only. Gain 1 Miracle dice.",
      cost: 10,
    });

    expect(warning).toBe("Restricted to: CANONESS or PALATINE");
  });
});
