import type { RuleOption } from "../../../types/faction";

/**
 * Tyranids army-wide rule options for the combat calculator.
 *
 * Synaptic Imperative: At the start of each Command phase a SYNAPSE unit
 * activates one of six directives that apply to friendly TYRANIDS units
 * within Synapse range for that round. Only one directive is active at a time.
 *
 * Calculator-relevant directives are modelled as a mutex selectionGroup.
 * Movement/mission directives (Metabolic Overdrive, Lurk, etc.) are info-only.
 */
export const tyranidsArmyRules: RuleOption[] = [
  {
    id: "tyranids-directive-voracious-appetite",
    name: "Synaptic Directive: Voracious Appetite",
    displayLabel: "Directive: Voracious Appetite",
    description:
      "Active Synaptic Imperative directive. Friendly TYRANIDS units within Synapse range re-roll Wound rolls of 1.",
    modifiers: [{ type: "REROLL_WOUNDS_ONES" }],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "fight",
    isToggle: true,
    supportLevel: "implemented",
    selectionGroup: "tyranids-directive",
    engineTags: ["synaptic-imperative", "reroll-wounds-ones"],
  },
  {
    id: "tyranids-directive-onslaught",
    name: "Synaptic Directive: Onslaught",
    displayLabel: "Directive: Onslaught",
    description:
      "Active Synaptic Imperative directive. Friendly TYRANIDS units within Synapse range can Advance and still charge. No calculator effect.",
    modifiers: [],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "fight",
    isToggle: false,
    supportLevel: "info-only",
    selectionGroup: "tyranids-directive",
    engineTags: [],
  },
  {
    id: "tyranids-directive-metabolic-overdrive",
    name: "Synaptic Directive: Metabolic Overdrive",
    displayLabel: "Directive: Metabolic Overdrive",
    description:
      "Active Synaptic Imperative directive. Friendly TYRANIDS units within Synapse range can make an additional Normal Move. No calculator effect.",
    modifiers: [],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "movement",
    isToggle: false,
    supportLevel: "info-only",
    selectionGroup: "tyranids-directive",
    engineTags: [],
  },
];
