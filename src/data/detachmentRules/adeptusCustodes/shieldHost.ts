import type { RuleOption } from "../../../types/faction";
import type { DetachmentRuleOverride } from "../types";

export const shieldHostRuleOverride: DetachmentRuleOverride = ({ rule }) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("lethal hits")) {
    return {
      ...rule,
      supportLevel: "implemented",
      modifiers: [{ type: "LETHAL_HITS" }],
      engineTags: [],
    };
  }

  if (haystack.includes("sustained hits")) {
    return {
      ...rule,
      supportLevel: "implemented",
      modifiers: [{ type: "SUSTAINED_HITS", value: 1 }],
      engineTags: [],
    };
  }

  if (haystack.includes("ignores cover") || haystack.includes("ignore cover")) {
    return {
      ...rule,
      supportLevel: "implemented",
      modifiers: [{ type: "IGNORES_COVER" }],
      engineTags: [],
    };
  }

  return rule;
};
