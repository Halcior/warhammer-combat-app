import type { DetachmentRuleOverride } from "../types";

export const canoptekCourtRuleOverride: DetachmentRuleOverride = ({ rule }) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("power matrix")) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "any",
      modifiers: [
        {
          type: "REROLL_HITS_ONES",
          requiredAttackerKeywords: ["CRYPTEK", "CANOPTEK"],
        },
        {
          type: "REROLL_HITS",
          requiredAttackerKeywords: ["CRYPTEK", "CANOPTEK"],
          requiresAttackerWithinPowerMatrix: true,
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
