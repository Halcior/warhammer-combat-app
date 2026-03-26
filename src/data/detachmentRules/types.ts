import type { RuleOption } from "../../types/faction";
import type { NormalizedDetachment } from "../../types/wahapedia";

export type DetachmentRuleOverrideContext = {
  detachment: NormalizedDetachment;
};

export type DetachmentRuleOverride = (params: {
  rule: RuleOption;
  context: DetachmentRuleOverrideContext;
}) => RuleOption;
