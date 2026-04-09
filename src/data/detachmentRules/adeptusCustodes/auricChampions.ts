import type { DetachmentRuleOverride } from "../types";

export const auricChampionsRuleOverride: DetachmentRuleOverride = ({ rule }) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("assemblage of might")) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "any",
      modifiers: [
        {
          type: "WOUND_MODIFIER",
          value: 1,
          requiredAttackerKeywords: ["CHARACTER"],
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
