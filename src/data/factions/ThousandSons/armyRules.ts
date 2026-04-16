import type { RuleOption } from "../../../types/faction";

/**
 * Thousand Sons army-wide rules.
 *
 * Cabal of Sorcerers revolves around ritual points and spell economy that vary
 * across the battle. This is useful context for players, but there is no fixed
 * direct damage-calculator effect we can safely model yet.
 */
export const thousandSonsArmyRules: RuleOption[] = [
  {
    id: "ts-cabal-of-sorcerers",
    name: "Cabal of Sorcerers",
    displayLabel: "Cabal of Sorcerers",
    description:
      "Thousand Sons generate Cabal points and spend them on rituals that modify psychic and tactical play. The effect depends on the current ritual economy, so it is listed as informational only for now.",
    modifiers: [],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "any",
    isToggle: false,
    supportLevel: "info-only",
    engineTags: [],
  },
];
