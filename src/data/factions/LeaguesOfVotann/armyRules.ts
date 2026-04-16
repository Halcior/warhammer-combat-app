import type { RuleOption } from "../../../types/faction";

/**
 * Leagues of Votann army-wide rule options for the combat calculator.
 *
 * Hostile Acquisition / Fortify Takeover change dynamically with Yield Points
 * and combine attacker and defender effects in the same active mode. The
 * current side-aware rule pipeline handles pure attacker or defender rules
 * much better than mixed-role army states, so we register the faction with an
 * explicit info-only rule rather than ship a lossy approximation.
 */
export const leaguesOfVotannArmyRules: RuleOption[] = [
  {
    id: "votann-hostile-acquisition-fortify-takeover",
    name: "Hostile Acquisition / Fortify Takeover",
    displayLabel: "Hostile Acquisition",
    description:
      "Leagues of Votann units switch between Hostile Acquisition and Fortify Takeover depending on Yield Points. The active mode mixes objective-based offensive bonuses with defensive wound mitigation, so it is currently tracked as info-only.",
    modifiers: [],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "any",
    isToggle: false,
    supportLevel: "info-only",
    engineTags: [],
  },
];
