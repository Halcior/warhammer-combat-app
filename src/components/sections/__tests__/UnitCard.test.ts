import { describe, expect, it } from "vitest";
import type { Unit } from "../../../types/combat";
import {
  getEnhancementRestrictionLabel,
  stripRuleHtmlText,
  validateWeaponSelections,
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

  it("blocks weapon assignments that exceed model count within a category", () => {
    const validation = validateWeaponSelections(
      [
        { weaponId: "bolter", name: "Bolter", category: "ranged" },
        { weaponId: "flamer", name: "Flamer", category: "ranged" },
        { weaponId: "blade", name: "Blade", category: "melee" },
      ]
    );

    expect(validation.isValid).toBe(true);
    expect(validation.selectedByCategory.ranged).toBe(2);
    expect(validation.selectedByCategory.melee).toBe(1);
  });

  it("requires at least one selected weapon profile", () => {
    const validation = validateWeaponSelections([]);

    expect(validation.isValid).toBe(false);
    expect(validation.messages).toContain(
      "Select at least one weapon or equipment entry before saving."
    );
  });
});
