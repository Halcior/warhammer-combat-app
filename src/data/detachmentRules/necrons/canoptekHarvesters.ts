import type { DetachmentRuleOverride } from "../types";

export const canoptekHarvestersRuleOverride: DetachmentRuleOverride = ({
  rule,
}) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("retribution protocols")) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "any",
      modifiers: [{ type: "REROLL_HITS" }],
      engineTags: [],
    };
  }

  return rule;
};
