import { useState } from "react";
import type { ArmyPreset } from "../types/army";
import * as storage from "../lib/storage/armyStorage";

type ArmyData = Pick<ArmyPreset, "name" | "faction" | "units" | "notes">;

export function useArmyPresets() {
  const [armies, setArmies] = useState<ArmyPreset[]>(() => storage.loadArmies());

  function refresh() {
    setArmies(storage.loadArmies());
  }

  function addArmy(data: ArmyData) {
    storage.createArmy(data);
    refresh();
  }

  function editArmy(id: string, data: ArmyData) {
    storage.updateArmy(id, data);
    refresh();
  }

  function removeArmy(id: string) {
    storage.deleteArmy(id);
    refresh();
  }

  function dupeArmy(id: string) {
    storage.duplicateArmy(id);
    refresh();
  }

  return {
    armies,
    freeLimit: storage.FREE_LIMIT,
    canCreate: armies.length < storage.FREE_LIMIT,
    addArmy,
    editArmy,
    removeArmy,
    dupeArmy,
  };
}
