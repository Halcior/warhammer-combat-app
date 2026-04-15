import { useEffect, useMemo, useState } from "react";
import type { RuleOption } from "../types/faction";
import type { SpecialRule } from "../types/combat";
import {
  guardAttackerModifiers,
  guardDefenderModifiers,
} from "../lib/combat/combatRoleGuards";

export type RuleOptionSide = "attacker" | "defender";

type SidedActiveIds = {
  attacker: string[];
  defender: string[];
};

/**
 * Side-aware variant of useRuleOptions.
 *
 * Tracks which side (attacker / defender) each rule was toggled from, so that
 * offensive modifiers (LETHAL_HITS, REROLL_HITS, …) coming from a rule that
 * appears in the Defender panel cannot reach the attacker modifier list, and
 * vice-versa.
 *
 * The caller (ModifiersPanel) is responsible for passing the correct side when
 * calling toggleRuleOptionForSide — it should use inferRuleOptionSide(rule) to
 * match the panel placement side.
 */
export function useSidedRuleOptions(ruleOptions: RuleOption[]) {
  const [activeRuleOptionIdsBySide, setActiveRuleOptionIdsBySide] =
    useState<SidedActiveIds>({ attacker: [], defender: [] });

  // Reset selections when the rule pool changes (faction or detachment switch).
  useEffect(() => {
    setActiveRuleOptionIdsBySide({ attacker: [], defender: [] });
  }, [ruleOptions]);

  const toggleRuleOptionForSide = (ruleId: string, side: RuleOptionSide) => {
    const option = ruleOptions.find((o) => o.id === ruleId);
    if (!option) return;

    setActiveRuleOptionIdsBySide((prev) => {
      const sideIds = prev[side];
      const isActive = sideIds.includes(ruleId);

      let newSideIds: string[];

      if (option.selectionGroup) {
        const sameGroupIds = ruleOptions
          .filter((o) => o.selectionGroup === option.selectionGroup)
          .map((o) => o.id);

        newSideIds = isActive
          ? sideIds.filter((id) => id !== ruleId)
          : [...sideIds.filter((id) => !sameGroupIds.includes(id)), ruleId];
      } else {
        newSideIds = isActive
          ? sideIds.filter((id) => id !== ruleId)
          : [...sideIds, ruleId];
      }

      return { ...prev, [side]: newSideIds };
    });
  };

  const attackerActiveRuleOptions = useMemo(
    () =>
      ruleOptions.filter((rule) =>
        activeRuleOptionIdsBySide.attacker.includes(rule.id)
      ),
    [ruleOptions, activeRuleOptionIdsBySide.attacker]
  );

  const defenderActiveRuleOptions = useMemo(
    () =>
      ruleOptions.filter((rule) =>
        activeRuleOptionIdsBySide.defender.includes(rule.id)
      ),
    [ruleOptions, activeRuleOptionIdsBySide.defender]
  );

  // Attacker-scoped modifiers: strip any defender-exclusive types (safety guard
  // in case data has a miscategorised rule in the attacker bucket).
  const attackerModifiers: SpecialRule[] = useMemo(
    () =>
      guardAttackerModifiers(
        attackerActiveRuleOptions.flatMap((r) => r.modifiers)
      ),
    [attackerActiveRuleOptions]
  );

  // Defender-scoped modifiers: strip any attacker-exclusive types so that,
  // e.g., LETHAL_HITS from a rule shown in the Defender panel never reaches
  // the attacker's hit-roll calculation.
  const defenderModifiers: SpecialRule[] = useMemo(
    () =>
      guardDefenderModifiers(
        defenderActiveRuleOptions.flatMap((r) => r.modifiers)
      ),
    [defenderActiveRuleOptions]
  );

  return {
    activeRuleOptionIdsBySide,
    toggleRuleOptionForSide,
    attackerActiveRuleOptions,
    defenderActiveRuleOptions,
    attackerModifiers,
    defenderModifiers,
  };
}
