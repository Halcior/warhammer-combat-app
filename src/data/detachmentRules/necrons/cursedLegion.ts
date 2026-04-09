import type { DetachmentRuleOverride } from "../types";

export const cursedLegionRuleOverride: DetachmentRuleOverride = ({ rule }) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("cold fervour")) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "any",
      modifiers: [
        {
          type: "STRENGTH_MODIFIER",
          value: 2,
          requiredAttackerKeywords: ["DESTROYER CULT"],
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
