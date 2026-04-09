import type { DetachmentRuleOverride } from "../types";

export const retaliationCadreRuleOverride: DetachmentRuleOverride = ({
  rule,
}) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("bonded heroes")) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "shooting",
      modifiers: [
        {
          type: "STRENGTH_MODIFIER",
          value: 1,
          attackType: "ranged",
          requiredAttackerKeywords: ["BATTLESUIT"],
          requiresTargetWithinRange: 12,
        },
        {
          type: "AP_MODIFIER",
          value: 1,
          attackType: "ranged",
          requiredAttackerKeywords: ["BATTLESUIT"],
          requiresTargetWithinRange: 9,
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
