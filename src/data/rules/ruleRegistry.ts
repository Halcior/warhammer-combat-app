import type { RuleDefinition } from "../../domain/rule";

export const ruleRegistry: Record<string, RuleDefinition> = {
  lethal_hits: {
    id: "lethal_hits",
    name: "Lethal Hits",
    supportLevel: "implemented",
    effects: [{ type: "LETHAL_HITS" }],
    engineTags: [],
  },
  sustained_hits_1: {
    id: "sustained_hits_1",
    name: "Sustained Hits 1",
    supportLevel: "implemented",
    effects: [{ type: "SUSTAINED_HITS", value: 1 }],
    engineTags: [],
  },
  ignores_cover: {
    id: "ignores_cover",
    name: "Ignores Cover",
    supportLevel: "implemented",
    effects: [{ type: "IGNORES_COVER" }],
    engineTags: [],
  },
  devastating_wounds: {
    id: "devastating_wounds",
    name: "Devastating Wounds",
    supportLevel: "implemented",
    effects: [{ type: "DEVASTATING_WOUNDS" }],
    engineTags: [],
  },
  rapid_fire_1: {
    id: "rapid_fire_1",
    name: "Rapid Fire 1",
    supportLevel: "implemented",
    effects: [{ type: "RAPID_FIRE", value: 1 }],
    engineTags: [],
  },
  melta_2: {
    id: "melta_2",
    name: "Melta 2",
    supportLevel: "implemented",
    effects: [{ type: "MELTA", value: 2 }],
    engineTags: [],
  },
  heavy: {
    id: "heavy",
    name: "Heavy",
    supportLevel: "implemented",
    effects: [{ type: "HEAVY" }],
    engineTags: [],
  },
  blast: {
    id: "blast",
    name: "Blast",
    supportLevel: "implemented",
    effects: [{ type: "BLAST" }],
    engineTags: [],
  },
  torrent: {
    id: "torrent",
    name: "Torrent",
    supportLevel: "implemented",
    effects: [{ type: "TORRENT" }],
    engineTags: [],
  },
};
