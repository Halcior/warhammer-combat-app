import type {
  DetachmentConfig,
  EnhancementConfig,
  RuleOption,
  StratagemConfig,
} from "../../types/faction";
import type { NormalizedDetachment } from "../../types/wahapedia";

export function mapNormalizedDetachmentToDetachmentConfig(
  detachment: NormalizedDetachment
): DetachmentConfig {
  return {
    id: detachment.id,
    name: detachment.name,
    description: detachment.description ?? "",
    ruleOptions: detachment.abilities.map(mapAbilityToRuleOption),
    stratagems: mapNormalizedDetachmentToStratagems(detachment),
    enhancements: mapNormalizedDetachmentToEnhancements(detachment),
  };
}

export function mapNormalizedDetachmentToEnhancements(
  detachment: NormalizedDetachment
): EnhancementConfig[] {
  return detachment.enhancements.map((enhancement) => ({
    id: enhancement.id,
    name: enhancement.name,
    description: enhancement.description,
    supportLevel: "info-only",
    effects: [],
  }));
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