import type { DetachmentRuleOverride } from "../types";

export const blackShipGuardiansRuleOverride: DetachmentRuleOverride = ({
  rule,
}) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("priority quarry")) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "any",
      modifiers: [
        {
          type: "REROLL_HITS_ONES",
          requiredAttackerKeywords: ["ANATHEMA PSYKANA"],
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
