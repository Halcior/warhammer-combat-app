import type { DetachmentRuleOverride } from "../types";

export const kauyonRuleOverride: DetachmentRuleOverride = ({ rule }) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("patient hunter")) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "shooting",
      modifiers: [
        {
          type: "SUSTAINED_HITS",
          value: 1,
          attackType: "ranged",
          requiresBattleRoundAtLeast: 3,
          requiresBattleRoundAtMost: 5,
        },
        {
          type: "IGNORE_HIT_MODIFIERS",
          attackType: "ranged",
          requiresAttackerGuided: true,
          requiresTargetSpotted: true,
          requiresBattleRoundAtLeast: 3,
          requiresBattleRoundAtMost: 5,
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
