import type { DetachmentRuleOverride } from "../types";

export const obeisancePhalanxRuleOverride: DetachmentRuleOverride = ({
  rule,
}) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("worthy foes")) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "any",
      modifiers: [
        {
          type: "WOUND_MODIFIER",
          value: 1,
          requiredAttackerKeywords: ["NOBLE", "LYCHGUARD", "TRIARCH"],
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
