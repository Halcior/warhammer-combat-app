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
};
