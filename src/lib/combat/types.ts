import type {
  AttackConditions,
  SpecialRule,
  Unit,
  Weapon,
} from "../../types/combat";

export type CalculateExpectedDamageParams = {
  attacker: Unit;
  weapon: Weapon;
  defender: Unit;
  attackingModels: number;
  defendingModels: number;
  conditions: AttackConditions;
  activeModifierRules?: SpecialRule[];
  activeDefenderModifierRules?: SpecialRule[];
};

export type ExpectedDamageResult = {
  totalAttacks: number;
  hitTarget: number | null;
  woundTarget: number;
  saveTarget: number;
  expectedHits: number;
  expectedWounds: number;
  expectedUnsavedWounds: number;
  expectedDamage: number;
  expectedSlainModels: number;
  attacksPerModel: number;
  damagePerFailedSave: number;
  blastBonus: number;
  criticalHits: number;
  extraHitsFromSustained: number;
  autoWoundsFromLethalHits: number;
  criticalWoundsFromRolls: number;
  mortalWoundsFromDevastating: number;
  effectiveAp: number;
};

export type ResolveAttackParams = {
  weapon: Weapon;
  defender: Unit;
  defendingModels: number;
  rolledHits: number;
  rolledWounds: number;
  successfulSaves: number;
};

export type ResolvedAttackResult = {
  unsavedWounds: number;
  resolvedDamage: number;
  resolvedSlainModels: number;
  damagePerFailedSave: number;
};
