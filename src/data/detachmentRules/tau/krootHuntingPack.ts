import type { DetachmentRuleOverride } from "../types";

export const krootHuntingPackRuleOverride: DetachmentRuleOverride = ({
  rule,
}) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (
    haystack.includes("hunter's instincts") ||
    haystack.includes("hunter’s instincts")
  ) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "any",
      modifiers: [
        {
          type: "HIT_MODIFIER",
          value: 1,
          requiredAttackerKeywords: ["KROOT"],
          requiresTargetBelowStartingStrength: true,
        },
        {
          type: "WOUND_MODIFIER",
          value: 1,
          requiredAttackerKeywords: ["KROOT"],
          requiresTargetBelowHalfStrength: true,
        },
      ],
      engineTags: [],
    };
  }

  if (haystack.includes("skirmish fighters")) {
    return {
      ...rule,
      appliesTo: "defender",
      supportLevel: "implemented",
      phase: "any",
      modifiers: [
        {
          type: "INVULNERABLE_SAVE",
          value: 6,
          attackType: "melee",
          requiredDefenderKeywords: ["KROOT"],
        },
        {
          type: "INVULNERABLE_SAVE",
          value: 5,
          attackType: "ranged",
          requiredDefenderKeywords: ["KROOT"],
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
