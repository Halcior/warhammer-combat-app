import type { RuleOption } from "../../../types/faction";
import type { DetachmentRuleOverride } from "../types";

export const shieldHostRuleOverride: DetachmentRuleOverride = ({ rule }) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("martial mastery")) {
    return {
      ...rule,
      supportLevel: "implemented",
      modifiers: [
        { type: "CRITICAL_HITS_ON", value: 5 },
        { type: "AP_MODIFIER", value: 1, attackType: "melee" },
      ],
      engineTags: [],
    };
  }

  return rule;
};