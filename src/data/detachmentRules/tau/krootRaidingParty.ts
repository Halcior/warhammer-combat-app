import type { DetachmentRuleOverride } from "../types";

export const krootRaidingPartyRuleOverride: DetachmentRuleOverride = ({
  rule,
}) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("guerrilla ambushers")) {
    return {
      ...rule,
      appliesTo: "defender",
      supportLevel: "implemented",
      phase: "shooting",
      modifiers: [
        {
          type: "TARGETING_RANGE_LIMIT",
          value: 0,
          attackType: "ranged",
          requiredDefenderKeywords: ["KROOT"],
          requiresAttackerFiringOverwatch: true,
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
