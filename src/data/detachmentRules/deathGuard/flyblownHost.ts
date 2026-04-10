import type { DetachmentRuleOverride } from "../types";

export const flyblownHostRuleOverride: DetachmentRuleOverride = ({ rule }) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("verminous haze")) {
    return {
      ...rule,
      appliesTo: "defender",
      supportLevel: "implemented",
      phase: "any",
      modifiers: [
        {
          type: "HIT_MODIFIER",
          value: -1,
          attackType: "ranged",
          requiredDefenderKeywords: ["INFANTRY"],
          excludedDefenderKeywords: ["POXWALKERS"],
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
