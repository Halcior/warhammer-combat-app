import type { RuleOption } from "../../../types/faction";

/**
 * Necrons army-wide rule options for the combat calculator.
 *
 * Reanimation Protocols is modelled as a Feel No Pain save — an approximation
 * for the calculator context (the real mechanic restores whole models rather
 * than wounds, but FNP 4+ is the closest single-stat equivalent for per-wound
 * damage mitigation in unit testing).
 *
 * Living Metal (heal D3 per Command phase) has no combat-calculation equivalent
 * and is listed as info-only.
 */
export const necronsArmyRules: RuleOption[] = [
  {
    id: "necrons-reanimation-protocols",
    name: "Reanimation Protocols (FNP 4+)",
    displayLabel: "Reanimation Protocols",
    description:
      "Necrons roll Reanimation dice at the end of each phase in which they suffered casualties. Modelled as a FNP 4+ save for calculator purposes — toggle when the targeted Necron unit has active Reanimation Protocols.",
    modifiers: [{ type: "FEEL_NO_PAIN", value: 4 }],
    appliesTo: "defender",
    combatRole: "defender",
    phase: "any",
    isToggle: true,
    supportLevel: "implemented",
    engineTags: ["reanimation-protocols", "fnp-4plus"],
  },
  {
    id: "necrons-living-metal",
    name: "Living Metal",
    description:
      "At the start of each Command phase, each Necrons unit regains up to D3 lost wounds. This is a between-phases effect and has no impact on a single attack sequence.",
    modifiers: [],
    appliesTo: "defender",
    combatRole: "defender",
    phase: "command",
    isToggle: false,
    supportLevel: "info-only",
    engineTags: [],
  },
];
