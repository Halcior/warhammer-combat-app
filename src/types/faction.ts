import type { SpecialRule } from "./combat";

export type RuleApplicationTarget =
  | "army"
  | "detachment"
  | "unit"
  | "weapon"
  | "attacker"
  | "defender";

export type CombatPhase =
  | "command"
  | "movement"
  | "shooting"
  | "charge"
  | "fight"
  | "any";

export type RuleSupportLevel = "implemented" | "planned" | "info-only";

export type RuleOption = {
  id: string;
  name: string;
  /** Short sidebar label. Overrides name when present — use for long ability names. */
  displayLabel?: string;
  description?: string;
  appliesTo: RuleApplicationTarget;
  phase?: CombatPhase;
  modifiers: SpecialRule[];
  isToggle?: boolean;
  supportLevel?: RuleSupportLevel;
  engineTags?: string[];
  /** Explicit combat role. Overrides the inferred side when present. */
  combatRole?: "attacker" | "defender" | "shared";

  selectionGroup?: string;
  maxSelectionsInGroup?: number;
};

export type StratagemConfig = {
  id: string;
  name: string;
  description?: string;
  phase: CombatPhase;
  cpCost: number;
  effects: RuleOption[];
  supportLevel?: RuleSupportLevel;
};

export type EnhancementConfig = {
  id: string;
  name: string;
  description?: string;
  effects: RuleOption[];
  supportLevel?: RuleSupportLevel;
};

export type DetachmentConfig = {
  id: string;
  name: string;
  description?: string;
  ruleOptions: RuleOption[];
  stratagems: StratagemConfig[];
  enhancements?: EnhancementConfig[];
};

export type FactionConfig = {
  id: string;
  faction: string;
  armyRules: RuleOption[];
  detachments: DetachmentConfig[];
};