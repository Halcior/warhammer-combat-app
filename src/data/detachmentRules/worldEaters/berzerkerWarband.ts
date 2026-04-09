import type { DetachmentRuleOverride } from "../types";

export const berzerkerWarbandRuleOverride: DetachmentRuleOverride = ({
  rule,
}) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("relentless rage")) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "fight",
      modifiers: [
        {
          type: "ATTACKS_MODIFIER",
          value: 1,
          attackType: "melee",
          requiresChargeTurn: true,
        },
        {
          type: "STRENGTH_MODIFIER",
          value: 2,
          attackType: "melee",
          requiresChargeTurn: true,
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
