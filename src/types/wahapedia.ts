export type NormalizedFaction = {
  id: string;
  name: string;
};

export type NormalizedModelProfile = {
  id: string;
  name: string;
  toughness: number;
  save: number;
  invulnerableSave?: number;
  wounds: number;
};

export type NormalizedWeaponProfile = {
  id: string;
  name: string;
  range: string;
  type: "melee" | "ranged";
  attacks: number | string;
  skill: number;
  strength: number;
  ap: number;
  damage: number | string;
  keywords: string[];
  description?: string;
};

export type NormalizedAbility = {
  id: string;
  name: string;
  description: string;
  type?: string;
};

export type NormalizedUnit = {
  id: string;
  name: string;
  factionId: string;
  factionName: string;
  models: NormalizedModelProfile[];
  weapons: NormalizedWeaponProfile[];
  keywords: string[];
  abilities: NormalizedAbility[];
  points?: number;
  pointsDescription?: string;
  pointsOptions?: Array<{
    description: string;
    cost: number;
    modelCount?: number;
  }>;
};

export type NormalizedDetachmentAbility = {
  id: string;
  name: string;
  description: string;
  type?: string;
};

export type NormalizedEnhancement = {
  id: string;
  name: string;
  description: string;
  points?: number;
};

export type NormalizedStratagem = {
  id: string;
  name: string;
  description: string;
  cpCost?: number;
  type?: string;
  turn?: string;
  phase?: string;
};

export type NormalizedDetachment = {
  id: string;
  name: string;
  factionId: string;
  factionName: string;
  description?: string;
  abilities: NormalizedDetachmentAbility[];
  enhancements: NormalizedEnhancement[];
  stratagems: NormalizedStratagem[];
};
