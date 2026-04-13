export type SavedUnit = {
  unitId: string;
  selectedWeaponId: string;
  nickname?: string;
};

export type ArmyPreset = {
  id: string;
  name: string;
  faction: string;
  units: SavedUnit[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
};
