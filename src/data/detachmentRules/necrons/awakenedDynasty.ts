import type { DetachmentRuleOverride } from "../types";

export const awakenedDynastyRuleOverride: DetachmentRuleOverride = ({ rule }) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("command protocols")) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "any",
      modifiers: [
        {
          type: "HIT_MODIFIER",
          value: 1,
          requiresAttachedUnit: true,
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
