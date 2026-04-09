import type { DetachmentRuleOverride } from "../types";

export const pantheonOfWoeRuleOverride: DetachmentRuleOverride = ({ rule }) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("cosmic distortion")) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "any",
      modifiers: [
        {
          type: "AP_MODIFIER",
          value: 1,
          requiresTargetUnravelling: true,
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
