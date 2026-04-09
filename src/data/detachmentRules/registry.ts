import type { DetachmentRuleOverride } from "./types";
import { auricChampionsRuleOverride } from "./adeptusCustodes/auricChampions";
import { blackShipGuardiansRuleOverride } from "./adeptusCustodes/blackShipGuardians";
import { lionsOfTheEmperorRuleOverride } from "./adeptusCustodes/lionsOfTheEmperor";
import { shieldHostRuleOverride } from "./adeptusCustodes/shieldHost";
import { solarSpearheadRuleOverride } from "./adeptusCustodes/solarSpearhead";
import { annihilationLegionRuleOverride } from "./necrons/annihilationLegion";
import { awakenedDynastyRuleOverride } from "./necrons/awakenedDynasty";
import { canoptekCourtRuleOverride } from "./necrons/canoptekCourt";
import { canoptekHarvestersRuleOverride } from "./necrons/canoptekHarvesters";
import { cursedLegionRuleOverride } from "./necrons/cursedLegion";
import { obeisancePhalanxRuleOverride } from "./necrons/obeisancePhalanx";
import { pantheonOfWoeRuleOverride } from "./necrons/pantheonOfWoe";
import { starshatterArsenalRuleOverride } from "./necrons/starshatterArsenal";
import { tombShipComplementRuleOverride } from "./necrons/tombShipComplement";

const detachmentRuleOverrideRegistry: Record<string, DetachmentRuleOverride> = {
  annihilation_legion: annihilationLegionRuleOverride,
  auric_champions: auricChampionsRuleOverride,
  awakened_dynasty: awakenedDynastyRuleOverride,
  black_ship_guardians: blackShipGuardiansRuleOverride,
  canoptek_court: canoptekCourtRuleOverride,
  canoptek_harvesters: canoptekHarvestersRuleOverride,
  cursed_legion: cursedLegionRuleOverride,
  lions_of_the_emperor: lionsOfTheEmperorRuleOverride,
  obeisance_phalanx: obeisancePhalanxRuleOverride,
  pantheon_of_woe: pantheonOfWoeRuleOverride,
  shield_host: shieldHostRuleOverride,
  solar_spearhead: solarSpearheadRuleOverride,
  starshatter_arsenal: starshatterArsenalRuleOverride,
  tomb_ship_complement: tombShipComplementRuleOverride,
};

export function getDetachmentRuleOverride(
  detachmentId: string
): DetachmentRuleOverride | null {
  return detachmentRuleOverrideRegistry[detachmentId] ?? null;
}
