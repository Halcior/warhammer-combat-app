import type { DetachmentRuleOverride } from "../types";

export const solarSpearheadRuleOverride: DetachmentRuleOverride = ({ rule }) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("auric armour")) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "any",
      modifiers: [
        {
          type: "REROLL_HITS_ONES",
          requiredAttackerKeywords: ["VEHICLE"],
          requiresAttackerBelowStartingStrength: true,
        },
        {
          type: "REROLL_WOUNDS_ONES",
          requiredAttackerKeywords: ["VEHICLE"],
          requiresAttackerBelowHalfStrength: true,
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
