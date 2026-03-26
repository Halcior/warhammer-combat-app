import type { DetachmentDefinition } from "../../../domain/detachment";

export const shieldHostDetachment: DetachmentDefinition = {
  id: "shield_host",
  name: "Shield Host",
  faction: "Adeptus Custodes",
  ruleIds: ["lethal_hits", "sustained_hits_1", "ignores_cover"],
  stratagemIds: [],
  enhancementIds: [],
};
