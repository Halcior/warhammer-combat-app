import type { DetachmentRuleOverride } from "../types";

export const starfireCadreRuleOverride: DetachmentRuleOverride = ({
  rule,
}) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("markerlight precision")) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "shooting",
      modifiers: [
        {
          type: "HIT_MODIFIER",
          value: 1,
          attackType: "ranged",
          excludedAttackerKeywords: ["KROOT"],
          requiresTargetSpotted: true,
        },
        {
          type: "SUSTAINED_HITS",
          value: 1,
          attackType: "ranged",
          excludedAttackerKeywords: ["KROOT"],
          requiresTargetSpotted: true,
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
