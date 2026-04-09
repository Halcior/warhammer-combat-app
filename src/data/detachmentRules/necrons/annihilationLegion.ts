import type { DetachmentRuleOverride } from "../types";

export const annihilationLegionRuleOverride: DetachmentRuleOverride = ({
  rule,
}) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("annihilation protocol")) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "shooting",
      modifiers: [
        {
          type: "AP_MODIFIER",
          value: 1,
          attackType: "ranged",
          requiredAttackerKeywords: ["DESTROYER CULT"],
          requiresTargetIsClosestEligible: true,
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
