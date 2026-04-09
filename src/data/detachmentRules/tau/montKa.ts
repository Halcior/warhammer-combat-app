import type { DetachmentRuleOverride } from "../types";

export const montKaRuleOverride: DetachmentRuleOverride = ({ rule }) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("killing blow")) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "shooting",
      modifiers: [
        {
          type: "ASSAULT",
          attackType: "ranged",
          requiresBattleRoundAtMost: 3,
        },
        {
          type: "LETHAL_HITS",
          attackType: "ranged",
          requiresAttackerGuided: true,
          requiresBattleRoundAtMost: 3,
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
