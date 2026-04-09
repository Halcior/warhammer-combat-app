import type { DetachmentRuleOverride } from "../types";

export const lionsOfTheEmperorRuleOverride: DetachmentRuleOverride = ({ rule }) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("against all odds")) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "any",
      modifiers: [
        {
          type: "HIT_MODIFIER",
          value: 1,
          requiresAttackerIsolated: true,
          excludedAttackerKeywords: ["VEHICLE"],
        },
        {
          type: "WOUND_MODIFIER",
          value: 1,
          requiresAttackerIsolated: true,
          excludedAttackerKeywords: ["VEHICLE"],
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
