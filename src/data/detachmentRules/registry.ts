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
import { auxiliaryCadreRuleOverride } from "./tau/auxiliaryCadre";
import { kauyonRuleOverride } from "./tau/kauyon";
import { krootHuntingPackRuleOverride } from "./tau/krootHuntingPack";
import { krootRaidingPartyRuleOverride } from "./tau/krootRaidingParty";
import { montKaRuleOverride } from "./tau/montKa";
import { retaliationCadreRuleOverride } from "./tau/retaliationCadre";
import { starfireCadreRuleOverride } from "./tau/starfireCadre";
import { flyblownHostRuleOverride } from "./deathGuard/flyblownHost";
import { berzerkerWarbandRuleOverride } from "./worldEaters/berzerkerWarband";
import { cultOfBloodRuleOverride } from "./worldEaters/cultOfBlood";
import { goretrackOnslaughtRuleOverride } from "./worldEaters/goretrackOnslaught";

const detachmentRuleOverrideRegistry: Record<string, DetachmentRuleOverride> = {
  annihilation_legion: annihilationLegionRuleOverride,
  auric_champions: auricChampionsRuleOverride,
  awakened_dynasty: awakenedDynastyRuleOverride,
  auxiliary_cadre: auxiliaryCadreRuleOverride,
  berzerker_warband: berzerkerWarbandRuleOverride,
  black_ship_guardians: blackShipGuardiansRuleOverride,
  canoptek_court: canoptekCourtRuleOverride,
  canoptek_harvesters: canoptekHarvestersRuleOverride,
  cult_of_blood: cultOfBloodRuleOverride,
  cursed_legion: cursedLegionRuleOverride,
  flyblown_host: flyblownHostRuleOverride,
  goretrack_onslaught: goretrackOnslaughtRuleOverride,
  kauyon: kauyonRuleOverride,
  kroot_hunting_pack: krootHuntingPackRuleOverride,
  kroot_raiding_party: krootRaidingPartyRuleOverride,
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
