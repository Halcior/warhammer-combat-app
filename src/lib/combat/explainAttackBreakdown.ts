import type { AttackConditions, SpecialRule, Weapon, Unit } from "../../types/combat";
import { getModifiedSave, applyCoverToSave } from "./save";
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
  weapon: Weapon;
  defender: Unit;
  conditions: AttackConditions;
  activeModifierRules?: SpecialRule[];
}): AttackBreakdownExplanation {
  const { weapon, defender, conditions, activeModifierRules = [] } = params;

  const combinedRules = [
    ...(weapon.specialRules ?? []),
    ...activeModifierRules,
  ];

  const hitModifier = getRuleModifier(combinedRules, "HIT_MODIFIER", weapon.type);
  const heavyBonus =
    hasRule(combinedRules, "HEAVY") && conditions.remainedStationary ? 1 : 0;

  const baseHit = weapon.skill;
  const finalHit =
    hasRule(combinedRules, "TORRENT")
      ? "Auto"
      : `${Math.max(2, weapon.skill - heavyBonus - hitModifier)}+`;

  const strengthModifier = getRuleModifier(
    combinedRules,
    "STRENGTH_MODIFIER",
    weapon.type
  );
  const effectiveStrength = weapon.strength + strengthModifier;

  const baseWoundTarget = getWoundTarget(effectiveStrength, defender.toughness);

  const lanceBonus =
    hasRule(combinedRules, "LANCE") && conditions.isChargeTurn ? 1 : 0;

  const woundModifier = getConditionalWoundModifier(
    combinedRules,
    weapon.type,
    defender.toughness
  );

  const finalWound = Math.max(2, baseWoundTarget - lanceBonus - woundModifier);

  const apModifier = getRuleModifier(combinedRules, "AP_MODIFIER", weapon.type);
  const effectiveAp = weapon.ap - apModifier;

  const ignoresCover = hasRule(combinedRules, "IGNORES_COVER");
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
    combinedRules,
    "DAMAGE_MODIFIER",
    weapon.type
  );
  const meltaBonus =
    hasRule(combinedRules, "MELTA") && conditions.isHalfRange
      ? getMeltaValue(combinedRules)
      : 0;

  return {
    hit: [
      { label: "Base skill", value: `${baseHit}+` },
      { label: "Heavy bonus", value: heavyBonus ? `-${heavyBonus}` : 0 },
      { label: "Hit modifier", value: hitModifier ? `-${hitModifier}` : 0 },
      { label: "Final hit", value: finalHit },
    ],
    wound: [
      { label: "Base strength", value: weapon.strength },
      { label: "Strength modifier", value: strengthModifier ? `+${strengthModifier}` : 0 },
      { label: "Defender toughness", value: defender.toughness },
      { label: "Base wound target", value: `${baseWoundTarget}+` },
      { label: "Lance bonus", value: lanceBonus ? `-${lanceBonus}` : 0 },
      { label: "Wound modifier", value: woundModifier ? `-${woundModifier}` : 0 },
      { label: "Final wound", value: `${finalWound}+` },
    ],
    save: [
      { label: "Base save", value: `${defender.save}+` },
      { label: "Effective AP", value: effectiveAp },
      { label: "In cover", value: conditions.isTargetInCover && !ignoresCover ? "Yes" : "No" },
      { label: "Final save", value: `${finalSave}+` },
    ],
    damage: [
      { label: "Base damage", value: weapon.damage },
      { label: "Damage modifier", value: damageModifier ? `+${damageModifier}` : 0 },
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
  type: "HIT_MODIFIER" | "STRENGTH_MODIFIER" | "DAMAGE_MODIFIER" | "AP_MODIFIER",
  weaponType: "melee" | "ranged"
): number {
  return rules.reduce((sum, rule) => {
    if (rule.type !== type) return sum;
    if ("attackType" in rule && rule.attackType && rule.attackType !== weaponType) {
      return sum;
    }
    return sum + rule.value;
  }, 0);
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
