import type { DetachmentRuleOverride } from "../types";

export const tombShipComplementRuleOverride: DetachmentRuleOverride = ({
  rule,
}) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("conquest protocols")) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "any",
      modifiers: [
        {
          type: "CRITICAL_WOUND_AP_MODIFIER",
          value: 1,
          requiresAttackWithinObjectiveRange: true,
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
