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
import { kauyonRuleOverride } from "./tau/kauyon";
import { krootHuntingPackRuleOverride } from "./tau/krootHuntingPack";
import { montKaRuleOverride } from "./tau/montKa";
import { retaliationCadreRuleOverride } from "./tau/retaliationCadre";
import { starfireCadreRuleOverride } from "./tau/starfireCadre";

const detachmentRuleOverrideRegistry: Record<string, DetachmentRuleOverride> = {
  annihilation_legion: annihilationLegionRuleOverride,
  auric_champions: auricChampionsRuleOverride,
  awakened_dynasty: awakenedDynastyRuleOverride,
  black_ship_guardians: blackShipGuardiansRuleOverride,
  canoptek_court: canoptekCourtRuleOverride,
  canoptek_harvesters: canoptekHarvestersRuleOverride,
  cursed_legion: cursedLegionRuleOverride,
  kauyon: kauyonRuleOverride,
  kroot_hunting_pack: krootHuntingPackRuleOverride,
  lions_of_the_emperor: lionsOfTheEmperorRuleOverride,
  mont_ka: montKaRuleOverride,
  obeisance_phalanx: obeisancePhalanxRuleOverride,
  pantheon_of_woe: pantheonOfWoeRuleOverride,
  retaliation_cadre: retaliationCadreRuleOverride,
  shield_host: shieldHostRuleOverride,
  solar_spearhead: solarSpearheadRuleOverride,
  starfire_cadre: starfireCadreRuleOverride,
  starshatter_arsenal: starshatterArsenalRuleOverride,
  tomb_ship_complement: tombShipComplementRuleOverride,
};

export function getDetachmentRuleOverride(
  detachmentId: string
): DetachmentRuleOverride | null {
  return detachmentRuleOverrideRegistry[detachmentId] ?? null;
}
