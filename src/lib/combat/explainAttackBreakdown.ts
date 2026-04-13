import type { AttackConditions, SpecialRule, Weapon, Unit } from "../../types/combat";
import { getModifiedSave, applyCoverToSave } from "./save";
import {
  filterActiveRules,
  getHitRerollMode,
  getWoundRerollMode,
} from "./ruleApplicability";
import { getWoundTarget } from "./wound";

export type BreakdownLine = {
  label: string;
  value: string | number;
  type: "input" | "modifier" | "final" | "inactive";
};

export type StageBreakdown = {
  resolved: string;
  rows: BreakdownLine[];
};

export type AttackBreakdownExplanation = {
  hit: StageBreakdown;
  wound: StageBreakdown;
  save: StageBreakdown;
  damage: StageBreakdown;
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
    ...(attacker.specialRules ?? []),
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

  // ── Hit ─────────────────────────────────────────────────────────────────────
  const hitModifier = getRuleModifier(activeRules, "HIT_MODIFIER", weapon.type);
  const fixedHitRoll = getRuleModifier(activeRules, "FIXED_HIT_ROLL", weapon.type);
  const heavyBonus =
    hasRule(activeRules, "HEAVY") && conditions.remainedStationary ? 1 : 0;
  const hitRerollMode = getHitRerollMode(activeRules);
  const isTorrent = hasRule(combinedRules, "TORRENT");

  const baseHit = weapon.skill;
  const finalHit = isTorrent
    ? "Auto"
    : `${Math.max(2, fixedHitRoll || weapon.skill - heavyBonus - hitModifier)}+`;

  // ── Wound ────────────────────────────────────────────────────────────────────
  const strengthModifier = getRuleModifier(
    activeRules,
    "STRENGTH_MODIFIER",
    weapon.type
  );
  const effectiveStrength = weapon.strength + strengthModifier;
  const toughnessModifier = getToughnessModifier(activeRules);
  const effectiveToughness = Math.max(1, defender.toughness + toughnessModifier);
  const baseWoundTarget = getWoundTarget(effectiveStrength, effectiveToughness);

  const lanceBonus =
    hasRule(activeRules, "LANCE") && conditions.isChargeTurn ? 1 : 0;
  const woundModifier = getConditionalWoundModifier(
    activeRules,
    weapon.type,
    effectiveToughness
  );
  const woundRerollMode = getWoundRerollMode(activeRules);
  const finalWound = Math.max(2, baseWoundTarget - lanceBonus - woundModifier);

  // ── Save ─────────────────────────────────────────────────────────────────────
  const apModifier = getRuleModifier(activeRules, "AP_MODIFIER", weapon.type);
  const criticalWoundApModifier = getRuleModifier(
    activeRules,
    "CRITICAL_WOUND_AP_MODIFIER",
    weapon.type
  );
  const effectiveAp = weapon.ap - apModifier;
  const ignoresCover = hasRule(activeRules, "IGNORES_COVER");
  const inCover = conditions.isTargetInCover && !ignoresCover;
  const baseSaveTarget = getModifiedSave(
    defender.save,
    effectiveAp,
    defender.invulnerableSave ?? null
  );
  const finalSave = applyCoverToSave(baseSaveTarget, weapon.type, inCover);

  // ── Damage ───────────────────────────────────────────────────────────────────
  const attacksModifier = getRuleModifier(
    activeRules,
    "ATTACKS_MODIFIER",
    weapon.type
  );
  const hasAttackRerolls = hasRule(activeRules, "REROLL_ATTACKS");
  const damageModifier = getRuleModifier(
    activeRules,
    "DAMAGE_MODIFIER",
    weapon.type
  );
  const meltaBonus =
    hasRule(activeRules, "MELTA") && conditions.isHalfRange
      ? getMeltaValue(activeRules)
      : 0;

  const totalDamageBonus = damageModifier + meltaBonus;
  let damageResolved: string;
  if (totalDamageBonus === 0) {
    damageResolved = String(weapon.damage);
  } else if (typeof weapon.damage === "number") {
    damageResolved = String(weapon.damage + totalDamageBonus);
  } else {
    damageResolved =
      totalDamageBonus > 0
        ? `${weapon.damage}+${totalDamageBonus}`
        : `${weapon.damage}${totalDamageBonus}`;
  }

  return {
    hit: {
      resolved: finalHit,
      rows: isTorrent
        ? [{ label: "Hit roll", value: "Auto (Torrent)", type: "final" }]
        : [
            { label: "Base skill", value: `${baseHit}+`, type: "input" },
            {
              label: "Fixed hit roll",
              value: fixedHitRoll ? `${fixedHitRoll}+` : "—",
              type: fixedHitRoll ? "modifier" : "inactive",
            },
            {
              label: "Heavy bonus",
              value: heavyBonus ? `-${heavyBonus}` : "—",
              type: heavyBonus ? "modifier" : "inactive",
            },
            {
              label: "Hit modifier",
              value: hitModifier ? formatSignedModifier(hitModifier) : "—",
              type: hitModifier ? "modifier" : "inactive",
            },
            {
              label: "Hit rerolls",
              value: formatRerollMode(hitRerollMode),
              type: hitRerollMode !== "none" ? "modifier" : "inactive",
            },
            { label: "Final hit", value: finalHit, type: "final" },
          ],
    },

    wound: {
      resolved: `${finalWound}+`,
      rows: [
        { label: "Base strength", value: weapon.strength, type: "input" },
        {
          label: "Strength modifier",
          value: strengthModifier ? formatSignedModifier(strengthModifier) : "—",
          type: strengthModifier ? "modifier" : "inactive",
        },
        { label: "Defender toughness", value: defender.toughness, type: "input" },
        {
          label: "Toughness modifier",
          value: toughnessModifier ? formatSignedModifier(toughnessModifier) : "—",
          type: toughnessModifier ? "modifier" : "inactive",
        },
        ...(toughnessModifier
          ? [
              {
                label: "Effective toughness",
                value: effectiveToughness,
                type: "input" as const,
              },
            ]
          : []),
        { label: "Base wound target", value: `${baseWoundTarget}+`, type: "input" },
        {
          label: "Lance bonus",
          value: lanceBonus ? `-${lanceBonus}` : "—",
          type: lanceBonus ? "modifier" : "inactive",
        },
        {
          label: "Wound modifier",
          value: woundModifier ? formatSignedModifier(woundModifier) : "—",
          type: woundModifier ? "modifier" : "inactive",
        },
        {
          label: "Wound rerolls",
          value: formatRerollMode(woundRerollMode),
          type: woundRerollMode !== "none" ? "modifier" : "inactive",
        },
        { label: "Final wound", value: `${finalWound}+`, type: "final" },
      ],
    },

    save: {
      resolved: `${finalSave}+`,
      rows: [
        { label: "Base save", value: `${defender.save}+`, type: "input" },
        { label: "Effective AP", value: effectiveAp, type: "input" },
        {
          label: "Critical wound AP",
          value: criticalWoundApModifier
            ? formatSignedModifier(criticalWoundApModifier)
            : "—",
          type: criticalWoundApModifier ? "modifier" : "inactive",
        },
        {
          label: "In cover",
          value: inCover ? "Yes" : "No",
          type: inCover ? "modifier" : "inactive",
        },
        { label: "Final save", value: `${finalSave}+`, type: "final" },
      ],
    },

    damage: {
      resolved: damageResolved,
      rows: [
        {
          label: "Attack count rerolls",
          value: hasAttackRerolls ? "Yes" : "No",
          type: hasAttackRerolls ? "modifier" : "inactive",
        },
        {
          label: "Attacks modifier",
          value: attacksModifier ? formatSignedModifier(attacksModifier) : "—",
          type: attacksModifier ? "modifier" : "inactive",
        },
        { label: "Base damage", value: weapon.damage, type: "input" },
        {
          label: "Damage modifier",
          value: damageModifier ? formatSignedModifier(damageModifier) : "—",
          type: damageModifier ? "modifier" : "inactive",
        },
        {
          label: "Melta bonus",
          value: meltaBonus ? `+${meltaBonus}` : "—",
          type: meltaBonus ? "modifier" : "inactive",
        },
        {
          label: "Final damage",
          value: damageResolved,
          type: totalDamageBonus !== 0 ? "final" : "inactive",
        },
      ],
    },
  };
}

function hasRule(rules: SpecialRule[], type: SpecialRule["type"]): boolean {
  return rules.some((rule) => rule.type === type);
}

function getMeltaValue(rules: SpecialRule[]): number {
  const meltaRule = rules.find((rule) => rule.type === "MELTA");
  return meltaRule?.type === "MELTA" ? meltaRule.value : 0;
}

function getToughnessModifier(rules: SpecialRule[]): number {
  return rules.reduce((sum, rule) => {
    if (rule.type !== "TOUGHNESS_MODIFIER") return sum;
    return sum + rule.value;
  }, 0);
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
