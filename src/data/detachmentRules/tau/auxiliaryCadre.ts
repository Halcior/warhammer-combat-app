import type { DetachmentRuleOverride } from "../types";

export const auxiliaryCadreRuleOverride: DetachmentRuleOverride = ({
  rule,
}) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("integrated command structure")) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "shooting",
      modifiers: [
        {
          type: "AP_MODIFIER",
          value: 1,
          attackType: "ranged",
          excludedAttackerKeywords: ["KROOT", "VESPID STINGWINGS", "TITANIC"],
          requiresTargetWithinAuxiliarySupportRange: true,
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
