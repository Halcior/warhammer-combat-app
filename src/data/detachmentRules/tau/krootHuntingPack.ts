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

  return rule;
};
