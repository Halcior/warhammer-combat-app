import type { DetachmentRuleOverride } from "./types";
import { shieldHostRuleOverride } from "./adeptusCustodes/shieldHost";

const detachmentRuleOverrideRegistry: Record<string, DetachmentRuleOverride> = {
  shield_host: shieldHostRuleOverride,
};

export function getDetachmentRuleOverride(
  detachmentId: string
): DetachmentRuleOverride | null {
  return detachmentRuleOverrideRegistry[detachmentId] ?? null;
}
