import type { DetachmentRuleOverride } from "../types";

export const starshatterArsenalRuleOverride: DetachmentRuleOverride = ({
  rule,
}) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("relentless onslaught")) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "any",
      modifiers: [
        {
          type: "HIT_MODIFIER",
          value: 1,
          requiresTargetWithinObjectiveRange: true,
          excludedAttackerKeywords: ["MONSTER"],
        },
        {
          type: "ASSAULT",
          attackType: "ranged",
          requiredAttackerKeywords: ["VEHICLE", "MOUNTED"],
          excludedAttackerKeywords: ["TITANIC"],
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
