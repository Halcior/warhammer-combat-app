import { describe, expect, it } from "vitest";
import {
  ATTACKER_EXCLUSIVE_RULE_TYPES,
  DEFENDER_EXCLUSIVE_RULE_TYPES,
  guardAttackerModifiers,
  guardDefenderModifiers,
} from "../combatRoleGuards";
import type { SpecialRule } from "../../../types/combat";

// ---------------------------------------------------------------------------
// guardDefenderModifiers
// ---------------------------------------------------------------------------

describe("guardDefenderModifiers", () => {
  it("removes all attacker-exclusive types from a defender modifier list", () => {
    const rules: SpecialRule[] = [
      { type: "REROLL_HITS" },
      { type: "LETHAL_HITS" },
      { type: "DEVASTATING_WOUNDS" },
      { type: "SUSTAINED_HITS", value: 1 },
      { type: "TWIN_LINKED" },
      { type: "TORRENT" },
      { type: "EXTRA_ATTACKS" },
      { type: "IGNORE_HIT_MODIFIERS" },
      { type: "FIXED_HIT_ROLL", value: 2 },
      { type: "CRITICAL_HITS_ON", value: 5 },
    ];

    const result = guardDefenderModifiers(rules);

    expect(result).toHaveLength(0);
  });

  it("passes through defender-beneficial types unchanged", () => {
    const rules: SpecialRule[] = [
      { type: "FEEL_NO_PAIN", value: 5 },
      { type: "INVULNERABLE_SAVE", value: 4 },
      { type: "DAMAGE_REDUCTION", value: 1 },
      { type: "SET_SAVE_CHARACTERISTIC", value: 2 },
    ];

    const result = guardDefenderModifiers(rules);

    expect(result).toHaveLength(4);
    expect(result.map((r) => r.type)).toEqual([
      "FEEL_NO_PAIN",
      "INVULNERABLE_SAVE",
      "DAMAGE_REDUCTION",
      "SET_SAVE_CHARACTERISTIC",
    ]);
  });

  it("passes through HIT_MODIFIER (valid for Stealth-style defender rules)", () => {
    const rules: SpecialRule[] = [{ type: "HIT_MODIFIER", value: -1 }];
    expect(guardDefenderModifiers(rules)).toHaveLength(1);
  });

  it("passes through TOUGHNESS_MODIFIER (defender toughness buff)", () => {
    const rules: SpecialRule[] = [{ type: "TOUGHNESS_MODIFIER", value: 1 }];
    expect(guardDefenderModifiers(rules)).toHaveLength(1);
  });

  it("strips REROLL_WOUNDS and REROLL_WOUNDS_ONES (always attacker-only)", () => {
    const rules: SpecialRule[] = [
      { type: "REROLL_WOUNDS" },
      { type: "REROLL_WOUNDS_ONES" },
      { type: "REROLL_ATTACKS" },
      { type: "REROLL_HITS_ONES" },
    ];

    expect(guardDefenderModifiers(rules)).toHaveLength(0);
  });

  it("filters mixed list correctly, keeping only defender-valid rules", () => {
    const rules: SpecialRule[] = [
      { type: "REROLL_HITS" },             // attacker exclusive — strip
      { type: "FEEL_NO_PAIN", value: 5 },  // keep
      { type: "LETHAL_HITS" },             // attacker exclusive — strip
      { type: "INVULNERABLE_SAVE", value: 4 }, // keep
      { type: "HIT_MODIFIER", value: -1 }, // valid defender rule — keep
    ];

    const result = guardDefenderModifiers(rules);

    expect(result.map((r) => r.type)).toEqual([
      "FEEL_NO_PAIN",
      "INVULNERABLE_SAVE",
      "HIT_MODIFIER",
    ]);
  });

  it("covers every ATTACKER_EXCLUSIVE_RULE_TYPES member", () => {
    for (const ruleType of ATTACKER_EXCLUSIVE_RULE_TYPES) {
      const rule = minimalRule(ruleType);
      const result = guardDefenderModifiers([rule]);
      expect(result, `${ruleType} should be stripped from defender list`).toHaveLength(0);
    }
  });
});

// ---------------------------------------------------------------------------
// guardAttackerModifiers
// ---------------------------------------------------------------------------

describe("guardAttackerModifiers", () => {
  it("removes all defender-exclusive types from an attacker modifier list", () => {
    const rules: SpecialRule[] = [
      { type: "FEEL_NO_PAIN", value: 5 },
      { type: "DAMAGE_REDUCTION", value: 1 },
      { type: "INVULNERABLE_SAVE", value: 4 },
      { type: "SET_SAVE_CHARACTERISTIC", value: 2 },
    ];

    const result = guardAttackerModifiers(rules);

    expect(result).toHaveLength(0);
  });

  it("passes through attacker-beneficial types unchanged", () => {
    const rules: SpecialRule[] = [
      { type: "REROLL_HITS" },
      { type: "LETHAL_HITS" },
      { type: "DEVASTATING_WOUNDS" },
      { type: "SUSTAINED_HITS", value: 1 },
    ];

    const result = guardAttackerModifiers(rules);

    expect(result).toHaveLength(4);
  });

  it("passes through HIT_MODIFIER (valid from both sides)", () => {
    const rules: SpecialRule[] = [{ type: "HIT_MODIFIER", value: 1 }];
    expect(guardAttackerModifiers(rules)).toHaveLength(1);
  });

  it("filters mixed list correctly, stripping only defender-exclusive types", () => {
    const rules: SpecialRule[] = [
      { type: "REROLL_HITS" },             // keep
      { type: "FEEL_NO_PAIN", value: 5 },  // defender exclusive — strip
      { type: "DAMAGE_REDUCTION", value: 1 }, // strip
      { type: "HIT_MODIFIER", value: 1 },  // keep
    ];

    const result = guardAttackerModifiers(rules);

    expect(result.map((r) => r.type)).toEqual(["REROLL_HITS", "HIT_MODIFIER"]);
  });

  it("covers every DEFENDER_EXCLUSIVE_RULE_TYPES member", () => {
    for (const ruleType of DEFENDER_EXCLUSIVE_RULE_TYPES) {
      const rule = minimalRule(ruleType);
      const result = guardAttackerModifiers([rule]);
      expect(result, `${ruleType} should be stripped from attacker list`).toHaveLength(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Mutual exclusivity
// ---------------------------------------------------------------------------

describe("ATTACKER_EXCLUSIVE and DEFENDER_EXCLUSIVE sets", () => {
  it("have no overlap — no rule type is in both sets", () => {
    for (const ruleType of ATTACKER_EXCLUSIVE_RULE_TYPES) {
      expect(
        DEFENDER_EXCLUSIVE_RULE_TYPES.has(ruleType),
        `${ruleType} must not appear in both exclusive sets`
      ).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/** Build the minimal valid SpecialRule for a given type. */
function minimalRule(type: SpecialRule["type"]): SpecialRule {
  // Rules requiring a numeric `value` field
  const needsValue = new Set([
    "RAPID_FIRE",
    "MELTA",
    "SUSTAINED_HITS",
    "EXTRA_ATTACKS",
    "SET_SAVE_CHARACTERISTIC",
    "INVULNERABLE_SAVE",
    "FEEL_NO_PAIN",
    "DAMAGE_REDUCTION",
    "TARGETING_RANGE_LIMIT",
    "FIXED_HIT_ROLL",
    "HIT_MODIFIER",
    "ATTACKS_MODIFIER",
    "CRITICAL_WOUND_AP_MODIFIER",
    "CRITICAL_HITS_ON",
    "AP_MODIFIER",
    "STRENGTH_MODIFIER",
    "TOUGHNESS_MODIFIER",
    "DAMAGE_MODIFIER",
    "WOUND_MODIFIER",
  ]);

  if (needsValue.has(type)) {
    return { type, value: 1 } as SpecialRule;
  }

  if (type === "ANTI") {
    return { type: "ANTI", keyword: "MONSTER", value: 4 };
  }

  return { type } as SpecialRule;
}
