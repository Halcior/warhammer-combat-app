import { useState } from "react";
import type { ArmyPresetV2 } from "../types/armyPreset";
import * as storage from "../lib/storage/armyStorage";

type ArmyDraft = storage.ArmyDraft;

export function useArmyPresets() {
  const [armies, setArmies] = useState<ArmyPresetV2[]>(() => storage.loadArmies());

  function refresh() {
    setArmies(storage.loadArmies());
  }

  function addArmy(data: ArmyDraft) {
    storage.createArmy(data);
    refresh();
  }

  function editArmy(id: string, data: ArmyDraft) {
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
