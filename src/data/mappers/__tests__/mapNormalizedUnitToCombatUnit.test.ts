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

  it("maps parsable datasheet abilities into toggle-ready unit abilities", () => {
    const unit = buildUnit([
      {
        id: "m1",
        name: "Blightlord Terminator",
        toughness: 6,
        save: 2,
        wounds: 3,
      },
    ]);

    unit.abilities = [
      {
        id: "a1",
        name: "Rust-Hung Ferocity",
        description: "This unit has Lance and Feel No Pain 5+.",
      },
    ];

    const mapped = mapNormalizedUnitToCombatUnit(unit);

    expect(mapped.specialRules).toEqual([]);
    expect(mapped.abilities).toHaveLength(1);
    expect(mapped.abilities?.[0].supportLevel).toBe("implemented");
    expect(mapped.abilities?.[0].modifiers).toEqual([
      { type: "LANCE" },
      { type: "FEEL_NO_PAIN", value: 5 },
    ]);
  });

  it("parses common datasheet reroll and modifier-ignore language into toggles", () => {
    const unit = buildUnit([
      {
        id: "m1",
        name: "Captain-General",
        toughness: 6,
        save: 2,
        wounds: 7,
      },
    ]);

    unit.abilities = [
      {
        id: "a1",
        name: "Captain-General",
        description:
          "While this model is leading a unit, each time a model in this unit makes an attack, you can ignore any or all modifiers to that attack's Ballistic skill or Weapon skill characteristics and/or all modifiers to the Hit roll.",
      },
      {
        id: "a2",
        name: "Perfect Coordination",
        description:
          "Each time a model in this unit makes an attack, re-roll a Hit roll of 1 and re-roll a Wound roll of 1.",
      },
      {
        id: "a3",
        name: "Martial Tempo",
        description:
          "Until the end of the phase, an unmodified Hit roll of 5+ scores a Critical Hit.",
      },
    ];

    const mapped = mapNormalizedUnitToCombatUnit(unit);

    expect(mapped.abilities?.[0].modifiers).toEqual([
      { type: "IGNORE_HIT_MODIFIERS", requiresAttachedUnit: true },
    ]);
    expect(mapped.abilities?.[1].modifiers).toEqual([
      { type: "REROLL_HITS_ONES" },
      { type: "REROLL_WOUNDS_ONES" },
    ]);
    expect(mapped.abilities?.[2].modifiers).toEqual([
      { type: "CRITICAL_HITS_ON", value: 5 },
    ]);
  });

  it("splits selectable datasheet ability modes into exclusive toggle options", () => {
    const unit = buildUnit([
      {
        id: "m1",
        name: "Trajann Valoris",
        toughness: 6,
        save: 2,
        wounds: 7,
      },
    ]);

    unit.weapons = [
      {
        id: "w1",
        name: "Watcher's Axe",
        range: "Melee",
        type: "melee",
        attacks: 6,
        skill: 2,
        strength: 10,
        ap: -2,
        damage: 3,
        keywords: [],
      },
    ];

    unit.abilities = [
      {
        id: "a1",
        name: "Moment Shackle",
        description:
          "Once per battle, at the start of the Fight phase, you can select one of the following to take effect until the end of the phase:<br><ul><li>This model's Watcher's Axe melee weapon has an Attacks characteristic of 12.</li><li>This model has a 2+ invulnerable save.</li></ul>",
      },
    ];

    const mapped = mapNormalizedUnitToCombatUnit(unit);

    expect(mapped.abilities).toHaveLength(2);
    expect(mapped.abilities?.[0].selectionGroup).toBe("a1");
    expect(mapped.abilities?.[1].selectionGroup).toBe("a1");
    expect(mapped.abilities?.[0].modifiers).toEqual([
      {
        type: "ATTACKS_MODIFIER",
        value: 6,
        attackType: "melee",
        requiresWeaponNameIncludes: ["watchers axe"],
      },
    ]);
    expect(mapped.abilities?.[1].modifiers).toEqual([
      { type: "INVULNERABLE_SAVE", value: 2 },
    ]);
  });

  it("parses stealth and lone operative style defensive abilities into toggles", () => {
    const unit = buildUnit([
      {
        id: "m1",
        name: "Lurking Operative",
        toughness: 4,
        save: 3,
        wounds: 5,
      },
    ]);

    unit.abilities = [
      {
        id: "a1",
        name: "Stealth",
        description: "This unit has the Stealth ability.",
      },
      {
        id: "a2",
        name: "Lone Operative",
        description: "This model has the Lone Operative ability.",
      },
    ];

    const mapped = mapNormalizedUnitToCombatUnit(unit);

    expect(mapped.abilities?.[0].modifiers).toEqual([
      { type: "HIT_MODIFIER", value: -1, attackType: "ranged" },
    ]);
    expect(mapped.abilities?.[1].modifiers).toEqual([
      { type: "TARGETING_RANGE_LIMIT", value: 12, attackType: "ranged" },
    ]);
  });

  it("parses generic attacks and strength boosts from ability text", () => {
    const unit = buildUnit([
      {
        id: "m1",
        name: "Plague Champion",
        toughness: 5,
        save: 3,
        wounds: 4,
      },
    ]);

    unit.abilities = [
      {
        id: "a1",
        name: "Virulent Surge",
        description:
          "Until the end of the phase, add 1 to the Attacks characteristic and add 1 to the Strength characteristic of this model's melee weapons.",
      },
    ];

    const mapped = mapNormalizedUnitToCombatUnit(unit);

    expect(mapped.abilities?.[0].modifiers).toEqual([
      { type: "ATTACKS_MODIFIER", value: 1, attackType: "melee" },
      { type: "STRENGTH_MODIFIER", value: 1, attackType: "melee" },
    ]);
  });

  it("parses exact weapon strength and damage characteristic overrides", () => {
    const unit = buildUnit([
      {
        id: "m1",
        name: "Malignant Plaguecaster",
        toughness: 5,
        save: 3,
        wounds: 4,
      },
    ]);

    unit.weapons = [
      {
        id: "w1",
        name: "Plague Wind",
        range: "18",
        type: "ranged",
        attacks: 1,
        skill: 3,
        strength: 5,
        ap: -1,
        damage: 1,
        keywords: [],
      },
    ];

    unit.abilities = [
      {
        id: "a1",
        name: "Bilemaw Surge",
        description:
          "Until the end of the phase, this model's Plague Wind weapon has a Strength characteristic of 8 and a Damage characteristic of 3.",
      },
    ];

    const mapped = mapNormalizedUnitToCombatUnit(unit);

    expect(mapped.abilities?.[0].modifiers).toEqual([
      {
        type: "STRENGTH_MODIFIER",
        value: 3,
        attackType: "ranged",
        requiresWeaponNameIncludes: ["plague wind"],
      },
      {
        type: "DAMAGE_MODIFIER",
        value: 2,
        attackType: "ranged",
        requiresWeaponNameIncludes: ["plague wind"],
      },
    ]);
  });

  it("parses ranged targeting limit defensive text into toggles", () => {
    const unit = buildUnit([
      {
        id: "m1",
        name: "Deathshroud Bodyguard",
        toughness: 6,
        save: 2,
        wounds: 3,
      },
    ]);

    unit.abilities = [
      {
        id: "a1",
        name: "Shrouded Form",
        description:
          "While this model is leading a unit, models in that unit cannot be targeted by ranged attacks unless the attacking model is within 18\".",
      },
    ];

    const mapped = mapNormalizedUnitToCombatUnit(unit);

    expect(mapped.abilities?.[0].modifiers).toEqual([
      {
        type: "TARGETING_RANGE_LIMIT",
        value: 18,
        attackType: "ranged",
        requiresAttachedUnit: true,
      },
    ]);
  });

  it("normalizes faction names with smart apostrophes to the app's canonical form", () => {
    const unit = buildUnit([
      {
        id: "m1",
        name: "Hammerhead Gunship",
        toughness: 10,
        save: 3,
        wounds: 14,
      },
    ]);

    unit.factionName = "T’au Empire";

    const mapped = mapNormalizedUnitToCombatUnit(unit);

    expect(mapped.faction).toBe("T'au Empire");
  });
});
