export type DiceValue = number | string;

export type WeaponType = "melee" | "ranged";

export type SpecialRule =
  | { type: "ASSAULT" }
  | { type: "PISTOL" }
  | { type: "RAPID_FIRE"; value: number }
  | { type: "IGNORES_COVER" }
  | { type: "TWIN_LINKED" }
  | { type: "TORRENT" }
  | { type: "LETHAL_HITS" }
  | { type: "LANCE" }
  | { type: "INDIRECT_FIRE" }
  | { type: "PRECISION" }
  | { type: "BLAST" }
  | { type: "MELTA"; value: number }
  | { type: "HEAVY" }
  | { type: "HAZARDOUS" }
  | { type: "SUSTAINED_HITS"; value: number }
  | { type: "EXTRA_ATTACKS" }
  | { type: "DEVASTATING_WOUNDS" }
  | { type: "ANTI"; keyword: string; value: number }
  | { type: "FEEL_NO_PAIN"; value: number }
  | { type: "DAMAGE_REDUCTION"; value: number };

export type Weapon = {
  id: string;
  name: string;
  attacks: DiceValue;
  skill: number;
  strength: number;
  ap: number;
  damage: DiceValue;
  type: WeaponType;
  specialRules?: SpecialRule[];
};

export type Unit = {
  id: string;
  name: string;
  faction: string;
  toughness: number;
  save: number;
  invulnerableSave?: number;
  woundsPerModel: number;
  weapons: Weapon[];
  specialRules?: SpecialRule[];
  keywords?: string[];
};

export type AttackConditions = {
  isTargetInCover: boolean;
  isHalfRange: boolean;
  remainedStationary: boolean;
  advancedThisTurn: boolean;
  targetVisible: boolean;
  targetInEngagementRange: boolean;
  targetModelCount: number;
  targetHasMatchingAntiKeyword: boolean;
  isChargeTurn: boolean;
  isAttachedUnit: boolean;
};
