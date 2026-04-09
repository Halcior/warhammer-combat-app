import type { DetachmentRuleOverride } from "../types";

export const goretrackOnslaughtRuleOverride: DetachmentRuleOverride = ({
  rule,
}) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("rush to the fray")) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "fight",
      modifiers: [
        {
          type: "LANCE",
          attackType: "melee",
          requiresAttackerDisembarkedThisTurn: true,
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
