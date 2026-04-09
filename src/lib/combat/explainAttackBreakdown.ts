import type { AttackConditions, SpecialRule, Weapon, Unit } from "../../types/combat";
import { getModifiedSave, applyCoverToSave } from "./save";
import {
  filterActiveRules,
  getHitRerollMode,
  getWoundRerollMode,
} from "./ruleApplicability";
import { getWoundTarget } from "./wound";

type BreakdownLine = {
  label: string;
  value: string | number;
};

export type AttackBreakdownExplanation = {
  hit: BreakdownLine[];
  wound: BreakdownLine[];
  save: BreakdownLine[];
  damage: BreakdownLine[];
};

export function explainAttackBreakdown(params: {
  attacker: Unit;
  weapon: Weapon;
  defender: Unit;
  conditions: AttackConditions;
  activeModifierRules?: SpecialRule[];
  activeDefenderModifierRules?: SpecialRule[];
}): AttackBreakdownExplanation {
  const {
    attacker,
    weapon,
    defender,
    conditions,
    activeModifierRules = [],
    activeDefenderModifierRules = [],
  } = params;

  const combinedRules = [
    ...(weapon.specialRules ?? []),
    ...activeModifierRules,
    ...(defender.specialRules ?? []),
    ...activeDefenderModifierRules,
  ];
  const activeRules = filterActiveRules(combinedRules, {
    attacker,
    defender,
    weapon,
    conditions,
  });

  const hitModifier = getRuleModifier(activeRules, "HIT_MODIFIER", weapon.type);
  const fixedHitRoll = getRuleModifier(activeRules, "FIXED_HIT_ROLL", weapon.type);
  const heavyBonus =
    hasRule(activeRules, "HEAVY") && conditions.remainedStationary ? 1 : 0;
  const attacksModifier = getRuleModifier(
    activeRules,
    "ATTACKS_MODIFIER",
    weapon.type
  );
  const hasAttackRerolls = hasRule(activeRules, "REROLL_ATTACKS");
  const hitRerollMode = getHitRerollMode(activeRules);
  const woundRerollMode = getWoundRerollMode(activeRules);

  const baseHit = weapon.skill;
  const finalHit =
    hasRule(combinedRules, "TORRENT")
      ? "Auto"
      : `${Math.max(
          2,
          fixedHitRoll || weapon.skill - heavyBonus - hitModifier
        )}+`;

  const strengthModifier = getRuleModifier(
    activeRules,
    "STRENGTH_MODIFIER",
    weapon.type
  );
  const effectiveStrength = weapon.strength + strengthModifier;

  const baseWoundTarget = getWoundTarget(effectiveStrength, defender.toughness);

  const lanceBonus =
    hasRule(activeRules, "LANCE") && conditions.isChargeTurn ? 1 : 0;

  const woundModifier = getConditionalWoundModifier(
    activeRules,
    weapon.type,
    defender.toughness
  );

  const finalWound = Math.max(2, baseWoundTarget - lanceBonus - woundModifier);

  const apModifier = getRuleModifier(activeRules, "AP_MODIFIER", weapon.type);
  const criticalWoundApModifier = getRuleModifier(
    activeRules,
    "CRITICAL_WOUND_AP_MODIFIER",
    weapon.type
  );
  const effectiveAp = weapon.ap - apModifier;

  const ignoresCover = hasRule(activeRules, "IGNORES_COVER");
  const baseSaveTarget = getModifiedSave(
    defender.save,
    effectiveAp,
    defender.invulnerableSave ?? null
  );

  const finalSave = applyCoverToSave(
    baseSaveTarget,
    weapon.type,
    conditions.isTargetInCover && !ignoresCover
  );

  const damageModifier = getRuleModifier(
    activeRules,
    "DAMAGE_MODIFIER",
    weapon.type
  );
  const meltaBonus =
    hasRule(activeRules, "MELTA") && conditions.isHalfRange
      ? getMeltaValue(activeRules)
      : 0;

  return {
    hit: [
      { label: "Base skill", value: `${baseHit}+` },
      { label: "Fixed hit roll", value: fixedHitRoll ? `${fixedHitRoll}+` : 0 },
      { label: "Heavy bonus", value: heavyBonus ? `-${heavyBonus}` : 0 },
      {
        label: "Hit modifier",
        value: hitModifier ? formatSignedModifier(hitModifier) : 0,
      },
      {
        label: "Hit rerolls",
        value: formatRerollMode(hitRerollMode),
      },
      { label: "Final hit", value: finalHit },
    ],
    wound: [
      { label: "Base strength", value: weapon.strength },
      {
        label: "Strength modifier",
        value: strengthModifier ? formatSignedModifier(strengthModifier) : 0,
      },
      { label: "Defender toughness", value: defender.toughness },
      { label: "Base wound target", value: `${baseWoundTarget}+` },
      { label: "Lance bonus", value: lanceBonus ? `-${lanceBonus}` : 0 },
      {
        label: "Wound modifier",
        value: woundModifier ? formatSignedModifier(woundModifier) : 0,
      },
      {
        label: "Wound rerolls",
        value: formatRerollMode(woundRerollMode),
      },
      { label: "Final wound", value: `${finalWound}+` },
    ],
    save: [
      { label: "Base save", value: `${defender.save}+` },
      { label: "Effective AP", value: effectiveAp },
      {
        label: "Critical wound AP",
        value: criticalWoundApModifier
          ? formatSignedModifier(criticalWoundApModifier)
          : 0,
      },
      { label: "In cover", value: conditions.isTargetInCover && !ignoresCover ? "Yes" : "No" },
      { label: "Final save", value: `${finalSave}+` },
    ],
    damage: [
      {
        label: "Attack count rerolls",
        value: hasAttackRerolls ? "Yes" : "No",
      },
      {
        label: "Attacks modifier",
        value: attacksModifier ? formatSignedModifier(attacksModifier) : 0,
      },
      { label: "Base damage", value: weapon.damage },
      {
        label: "Damage modifier",
        value: damageModifier ? formatSignedModifier(damageModifier) : 0,
      },
      { label: "Melta bonus", value: meltaBonus ? `+${meltaBonus}` : 0 },
    ],
  };
}

function hasRule(rules: SpecialRule[], type: SpecialRule["type"]): boolean {
  return rules.some((rule) => rule.type === type);
}

function getMeltaValue(rules: SpecialRule[]): number {
  const meltaRule = rules.find((rule) => rule.type === "MELTA");
  return meltaRule?.type === "MELTA" ? meltaRule.value : 0;
}

function getRuleModifier(
  rules: SpecialRule[],
  type:
    | "FIXED_HIT_ROLL"
    | "HIT_MODIFIER"
    | "ATTACKS_MODIFIER"
    | "CRITICAL_WOUND_AP_MODIFIER"
    | "STRENGTH_MODIFIER"
    | "DAMAGE_MODIFIER"
    | "AP_MODIFIER",
  weaponType: "melee" | "ranged"
): number {
  return rules.reduce((sum, rule) => {
    if (rule.type !== type) return sum;
    if ("attackType" in rule && rule.attackType && rule.attackType !== weaponType) {
      return sum;
    }
    if (type === "FIXED_HIT_ROLL") {
      return sum === 0 ? rule.value : Math.min(sum, rule.value);
    }
    return sum + rule.value;
  }, 0);
}

function formatSignedModifier(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

function formatRerollMode(mode: "none" | "ones" | "full"): string {
  switch (mode) {
    case "full":
      return "Full";
    case "ones":
      return "Ones";
    default:
      return "No";
  }
}

function getConditionalWoundModifier(
  rules: SpecialRule[],
  weaponType: "melee" | "ranged",
  defenderToughness: number
): number {
  return rules.reduce((sum, rule) => {
    if (rule.type !== "WOUND_MODIFIER") return sum;
    if (rule.attackType && rule.attackType !== weaponType) return sum;
    if (
      rule.targetToughnessAtLeast !== undefined &&
      defenderToughness < rule.targetToughnessAtLeast
    ) {
      return sum;
    }
    return sum + rule.value;
  }, 0);
}
