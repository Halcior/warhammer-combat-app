import type {
  DetachmentConfig,
  EnhancementConfig,
  RuleOption,
  StratagemConfig,
} from "../../types/faction";
import type { NormalizedDetachment } from "../../types/wahapedia";
import { getDetachmentRuleOverride } from "../detachmentRules/registry";

export function mapNormalizedDetachmentToDetachmentConfig(
  detachment: NormalizedDetachment
): DetachmentConfig {
  const override = getDetachmentRuleOverride(detachment.id);

  const baseRuleOptions = detachment.abilities.map(mapAbilityToRuleOption);
  const ruleOptions = override
    ? baseRuleOptions.map((rule) =>
        override({
          rule,
          context: { detachment },
        })
      )
    : baseRuleOptions;
if (detachment.id === "shield_host") {
  console.log(
    "SHIELD HOST ABILITIES",
    detachment.abilities.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
    }))
  );
}
  return {
    id: detachment.id,
    name: detachment.name,
    description: detachment.description ?? "",
    ruleOptions,
    stratagems: mapNormalizedDetachmentToStratagems(detachment),
    enhancements: mapNormalizedDetachmentToEnhancements(detachment),
  };
}

export function mapNormalizedDetachmentToEnhancements(
  detachment: NormalizedDetachment
): EnhancementConfig[] {
  return detachment.enhancements.map((enhancement) => {
    const enhancementName = enhancement.name.toLowerCase();
    const enhancementId = enhancement.id.toLowerCase();

    if (
      detachment.id === "shield_host" &&
      (enhancementId.includes("hall_of_armouries") ||
        enhancementName.includes("hall of armouries"))
    ) {
      return {
        id: enhancement.id,
        name: enhancement.name,
        description: enhancement.description,
        supportLevel: "implemented",
        effects: [
          {
            id: `${enhancement.id}-strength`,
            name: "Hall of Armouries: +1 Strength",
            description: "Add 1 to the Strength characteristic of melee weapons.",
            appliesTo: "attacker",
            phase: "fight",
            isToggle: true,
            supportLevel: "implemented",
            engineTags: ["melee-strength-plus-1"],
            modifiers: [
              { type: "STRENGTH_MODIFIER", value: 1, attackType: "melee" },
            ],
          },
          {
            id: `${enhancement.id}-damage`,
            name: "Hall of Armouries: +1 Damage",
            description: "Add 1 to the Damage characteristic of melee weapons.",
            appliesTo: "attacker",
            phase: "fight",
            isToggle: true,
            supportLevel: "implemented",
            engineTags: ["melee-damage-plus-1"],
            modifiers: [
              { type: "DAMAGE_MODIFIER", value: 1, attackType: "melee" },
            ],
          },
        ],
      };
    }

    if (
      detachment.id === "shield_host" &&
      (enhancementId.includes("panoptispex") ||
        enhancementName.includes("panoptispex"))
    ) {
      return {
        id: enhancement.id,
        name: enhancement.name,
        description: enhancement.description,
        supportLevel: "implemented",
        effects: [
          {
            id: `${enhancement.id}-effect`,
            name: "Panoptispex Effect",
            appliesTo: "attacker",
            phase: "shooting",
            isToggle: true,
            supportLevel: "implemented",
            engineTags: ["ignores-cover-ranged"],
            modifiers: [{ type: "IGNORES_COVER" }],
          },
        ],
      };
    }

    return {
      id: enhancement.id,
      name: enhancement.name,
      description: enhancement.description,
      supportLevel: "info-only",
      effects: [],
    };
  });
}

export function mapNormalizedDetachmentToStratagems(
  detachment: NormalizedDetachment
): StratagemConfig[] {
  return detachment.stratagems.map((stratagem) => ({
    id: stratagem.id,
    name: stratagem.name,
    description: stratagem.description,
    cpCost: stratagem.cpCost ?? 1,
    phase: normalizePhase(stratagem.phase),
    supportLevel: "info-only",
    effects: [],
  }));
}

function mapAbilityToRuleOption(
  ability: NormalizedDetachment["abilities"][number]
): RuleOption {
  return {
    id: ability.id,
    name: ability.name,
    description: ability.description,
    appliesTo: "detachment",
    phase: "any",
    supportLevel: "info-only",
    modifiers: [],
    engineTags: [],
    isToggle: true,
  };
}

function normalizePhase(phase?: string): StratagemConfig["phase"] {
  const normalized = String(phase ?? "").trim().toLowerCase();

  if (normalized.includes("command")) return "command";
  if (normalized.includes("movement")) return "movement";
  if (normalized.includes("shooting")) return "shooting";
  if (normalized.includes("charge")) return "charge";
  if (normalized.includes("fight")) return "fight";

  return "any";
}