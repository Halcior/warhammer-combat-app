import type { WeaponType } from "../types/combat";
import type { AttackConditions } from "../types/combat";
import { normalizeFactionName } from "./normalizeFactionName";

export type BattleStateToggleKey =
  | "isTargetInCover"
  | "remainedStationary"
  | "isChargeTurn"
  | "targetHasMatchingAntiKeyword"
  | "isAttachedUnit"
  | "attackerWithinObjectiveRange"
  | "attackerDisembarkedThisTurn"
  | "attackerIsFiringOverwatch"
  | "attackerIsAfflicted"
  | "attackerIsGuided"
  | "attackerIsVesselOfWrath"
  | "attackerWithinFriendlyCharacterRange"
  | "attackerWithinFriendlyMonsterAura"
  | "attackWithinObjectiveRange"
  | "attackerWithinPowerMatrix"
  | "attackerSetUpThisTurn"
  | "attackerSetToDefend"
  | "isHalfRange"
  | "targetIsClosestEligible"
  | "targetWithinPlagueLegionsEngagementRange"
  | "targetIsSpotted"
  | "targetIsAfflicted"
  | "targetWithinContagionRange"
  | "targetInOpponentDeploymentZone"
  | "attackerWithinAuxiliarySupportRange"
  | "defenderWithinFriendlyVehicleSupportRange"
  | "defenderWithinAuxiliaryStealthRange"
  | "targetWithinAuxiliarySupportRange"
  | "targetOppositeHatchway"
  | "targetIsUnravelling"
  | "targetWithinObjectiveRange"
  | "targetIsBattleShocked"
  | "targetBelowStartingStrength"
  | "targetBelowHalfStrength"
  | "attackerBelowStartingStrength"
  | "attackerBelowHalfStrength"
  | "attackerIsIsolated";

export type BattleStateToggle = {
  key: BattleStateToggleKey;
  label: string;
  title: string;
  group: "core" | "advanced";
  factions?: string[];
  attackTypes?: WeaponType[];
};

export const battleStateToggles: BattleStateToggle[] = [
  { key: "isTargetInCover", label: "Target in cover", title: "The defender benefits from cover.", group: "core" },
  { key: "remainedStationary", label: "Remained stationary", title: "The attacking unit remained stationary this turn.", group: "core", attackTypes: ["ranged"] },
  { key: "isChargeTurn", label: "Charge turn", title: "The current attack happens during a charge turn.", group: "core", attackTypes: ["melee"] },
  { key: "targetHasMatchingAntiKeyword", label: "Anti keyword match", title: "The target matches the attack's Anti keyword.", group: "core" },
  { key: "isAttachedUnit", label: "Led / attached unit", title: "The attacking unit is led by a Character or attached.", group: "core" },
  { key: "attackerWithinObjectiveRange", label: "Attacker on objective", title: "The attacking unit is within range of an objective marker you control.", group: "advanced" },
  { key: "attackerDisembarkedThisTurn", label: "Disembarked this turn", title: "The attacking unit disembarked from a transport this turn.", group: "core" },
  { key: "attackerIsFiringOverwatch", label: "Firing Overwatch", title: "The attacking unit is making Overwatch attacks.", group: "core", attackTypes: ["ranged"] },
  { key: "attackerIsAfflicted", label: "Attacker is Afflicted", title: "The attacking unit currently counts as Afflicted for Death Guard interactions.", group: "advanced", factions: ["Death Guard"] },
  { key: "attackerIsGuided", label: "Attacker is Guided", title: "The attacking unit is Guided.", group: "core", factions: ["T'au Empire"] },
  { key: "isHalfRange", label: "Half range", title: "The target is inside half range for the active weapon.", group: "core", attackTypes: ["ranged"] },
  { key: "targetIsClosestEligible", label: "Closest eligible target", title: "The defender is the closest eligible target.", group: "core" },
  { key: "targetWithinPlagueLegionsEngagementRange", label: "Near Plague Legions", title: "The defender is within Engagement Range of one or more friendly Plague Legions units.", group: "advanced", factions: ["Death Guard"] },
  { key: "targetIsSpotted", label: "Spotted / markerlit", title: "The defender is the spotted or markerlit target.", group: "core", factions: ["T'au Empire"] },
  { key: "targetWithinObjectiveRange", label: "Target on objective", title: "The defender is within range of an objective marker.", group: "core" },
  { key: "targetIsBattleShocked", label: "Target is Battle-shocked", title: "The defender is Battle-shocked.", group: "core" },
  { key: "targetBelowStartingStrength", label: "Target damaged", title: "The defender has already lost at least one wound or model.", group: "core" },
  { key: "targetBelowHalfStrength", label: "Target below half", title: "The defender is below half of its starting strength.", group: "core" },
  { key: "attackerBelowStartingStrength", label: "Attacker damaged", title: "The attacker has already lost at least one wound or model.", group: "core" },
  { key: "attackerBelowHalfStrength", label: "Attacker below half", title: "The attacker is below half of its starting strength.", group: "core" },
  { key: "attackerIsVesselOfWrath", label: "Vessel of Wrath", title: "The attacking unit is currently a Vessel of Wrath.", group: "advanced", factions: ["World Eaters"] },
  { key: "attackerWithinFriendlyCharacterRange", label: "Near friendly Character", title: "The attacking unit is within friendly Character support range.", group: "advanced", factions: ["World Eaters"] },
  { key: "attackerWithinFriendlyMonsterAura", label: "Near Monster/Titanic aura", title: "The attacking unit is within a friendly Monster or Titanic aura.", group: "advanced", factions: ["World Eaters"] },
  { key: "attackWithinObjectiveRange", label: "Attack on objective", title: "The attack targets a unit within objective range.", group: "advanced" },
  { key: "attackerWithinPowerMatrix", label: "Attacker in Power Matrix", title: "The attacker is inside the Power Matrix.", group: "advanced", factions: ["Necrons"] },
  { key: "attackerSetUpThisTurn", label: "Set up this turn", title: "The attacking unit was set up on the battlefield this turn.", group: "advanced" },
  { key: "attackerSetToDefend", label: "Attacker set to defend", title: "The attacker is in a defensive set-to-defend state.", group: "advanced" },
  { key: "targetIsAfflicted", label: "Target is Afflicted", title: "The defender currently counts as Afflicted for Death Guard rules.", group: "advanced", factions: ["Death Guard"] },
  { key: "targetWithinContagionRange", label: "Target in Contagion Range", title: "The defender is currently within Contagion Range of one or more Death Guard units.", group: "advanced", factions: ["Death Guard"] },
  { key: "targetInOpponentDeploymentZone", label: "Target in enemy deployment", title: "The defender is within its controller's deployment zone.", group: "advanced", factions: ["Death Guard"] },
  { key: "defenderWithinFriendlyVehicleSupportRange", label: "Defender near friendly Vehicle", title: "The defended model is within support range of a friendly vehicle unit.", group: "advanced", factions: ["Death Guard"] },
  { key: "attackerWithinAuxiliarySupportRange", label: "Attacker near Kroot/Vespid support", title: "The attacker is within support range of friendly Kroot or Vespid auxiliaries.", group: "advanced", factions: ["T'au Empire"] },
  { key: "defenderWithinAuxiliaryStealthRange", label: "Auxiliary stealth screen", title: "A nearby Tau unit is screening the Kroot or Vespid defender.", group: "advanced", factions: ["T'au Empire"] },
  { key: "targetWithinAuxiliarySupportRange", label: "Near Kroot/Vespid support", title: "The target is within range of friendly Kroot or Vespid support.", group: "advanced", factions: ["T'au Empire"] },
  { key: "targetOppositeHatchway", label: "Target opposite hatchway", title: "The defender is on the opposite side of a hatchway.", group: "advanced" },
  { key: "targetIsUnravelling", label: "Target is unravelling", title: "The target currently counts as unravelling.", group: "advanced", factions: ["Necrons"] },
  { key: "attackerIsIsolated", label: "Attacker is isolated", title: "The attacking unit counts as isolated.", group: "advanced", factions: ["World Eaters"] },
];

type BattleStateToggleRelevanceParams = {
  toggle: BattleStateToggle;
  conditions: AttackConditions;
  relevantFactions: Set<string>;
  attackType: WeaponType;
};

export function isBattleStateToggleRelevant({
  toggle,
  conditions,
  relevantFactions,
  attackType,
}: BattleStateToggleRelevanceParams): boolean {
  if (conditions[toggle.key]) {
    return true;
  }

  const matchesFaction =
    !toggle.factions ||
    toggle.factions.some((faction) =>
      Array.from(relevantFactions).some(
        (relevantFaction) =>
          normalizeFactionName(relevantFaction) === normalizeFactionName(faction)
      )
    );
  const matchesAttackType =
    !toggle.attackTypes || toggle.attackTypes.includes(attackType);

  return matchesFaction && matchesAttackType;
}
