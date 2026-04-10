import type { DetachmentRuleOverride } from "../types";

export const auxiliaryCadreRuleOverride: DetachmentRuleOverride = ({
  rule,
}) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("integrated command structure")) {
    return {
      ...rule,
      supportLevel: "implemented",
      appliesTo: "defender",
      phase: "any",
      modifiers: [
        {
          type: "AP_MODIFIER",
          value: 1,
          attackType: "ranged",
          excludedAttackerKeywords: ["KROOT", "VESPID STINGWINGS", "TITANIC"],
          requiresTargetWithinAuxiliarySupportRange: true,
        },
        {
          type: "TARGETING_RANGE_LIMIT",
          value: 18,
          attackType: "ranged",
          requiredDefenderKeywords: ["KROOT", "VESPID STINGWINGS"],
          requiresDefenderWithinAuxiliaryStealthRange: true,
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
