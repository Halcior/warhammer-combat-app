export { calculateExpectedDamage } from "./expectedDamage";
export { resolveAttack } from "./damage";
export { getSuccessChance, parseDiceValue } from "./probability";
export { applyCoverToSave, getModifiedSave } from "./save";
export { getWoundTarget } from "./wound";

export type {
  CalculateExpectedDamageParams,
  ExpectedDamageResult,
  ResolveAttackParams,
  ResolvedAttackResult,
} from "./types";