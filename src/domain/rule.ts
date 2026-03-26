export type RuleSupportLevel = "implemented" | "planned" | "info-only";

export type RuleEffect =
  | { type: "LETHAL_HITS" }
  | { type: "SUSTAINED_HITS"; value: number }
  | { type: "IGNORES_COVER" }
  | { type: "DEVASTATING_WOUNDS" }
  | { type: "RAPID_FIRE"; value: number }
  | { type: "MELTA"; value: number }
  | { type: "HEAVY" }
  | { type: "BLAST" }
  | { type: "TORRENT" };

export type RuleDefinition = {
  id: string;
  name: string;
  description?: string;
  supportLevel: RuleSupportLevel;
  effects: RuleEffect[];
  engineTags?: string[];
};
