/**
 * Contract tests for faction rule data.
 *
 * These tests verify that the `RuleOption` definitions in hand-crafted faction
 * files and the mapper output satisfy structural invariants required by the
 * combat engine's side-awareness model:
 *
 * 1. Attacker-scoped rules must not carry defender-exclusive modifier types.
 * 2. Defender-scoped rules must not carry attacker-exclusive modifier types.
 * 3. Implemented rules must declare an explicit `combatRole`.
 *
 * A failure here means data will silently flow to the wrong side's modifier
 * list — the guards (combatRoleGuards.ts) would strip it before the engine
 * sees it, but the user would still not see the expected effect.
 */

import { describe, expect, it } from "vitest";
import type { RuleOption } from "../../../types/faction";
import {
  ATTACKER_EXCLUSIVE_RULE_TYPES,
  DEFENDER_EXCLUSIVE_RULE_TYPES,
} from "../../../lib/combat/combatRoleGuards";
import { aeldariArmyRules } from "../Aeldari/armyRules";
import { adeptaSororitasArmyRules } from "../AdeptaSororitas/armyRules";
import { adeptusMechanicusArmyRules } from "../AdeptusMechanicus/armyRules";
import { astraMilitarumArmyRules } from "../AstraMilitarum/armyRules";
import { adeptusCustodesArmyRules } from "../AdeptusCustodes/armyRules";
import { chaosKnightsArmyRules } from "../ChaosKnights/armyRules";
import { chaosSpaceMarinesArmyRules } from "../ChaosSpaceMarines/armyRules";
import { tyranidsArmyRules } from "../Tyranids/armyRules";
import { shieldHostDetachment } from "../AdeptusCustodes/detachments/shieldHost";
import { deathGuardArmyRules } from "../DeathGuard/armyRules";
import { greyKnightsArmyRules } from "../GreyKnights/armyRules";
import { leaguesOfVotannArmyRules } from "../LeaguesOfVotann/armyRules";
import { necronsArmyRules } from "../Necrons/armyRules";
import { orksArmyRules } from "../Orks/armyRules";
import { tauArmyRules } from "../Tau/armyRules";
import { thousandSonsArmyRules } from "../ThousandSons/armyRules";
import { spaceMarinesArmyRules } from "../SpaceMarines/armyRules";
import { worldEatersArmyRules } from "../WorldEaters/armyRules";
import { mapNormalizedDetachmentToDetachmentConfig } from "../../mappers/mapNormalizedDetachmentToFactionConfig";
import type { NormalizedDetachment } from "../../../types/wahapedia";

// ---------------------------------------------------------------------------
// Shared validator — reusable for any faction's rule list
// ---------------------------------------------------------------------------

function validateRuleOptions(rules: RuleOption[], label: string) {
  for (const rule of rules) {
    const ruleLabel = `${label} → "${rule.name}" (${rule.id})`;

    // Attacker-scoped rules must not have defender-exclusive modifier types.
    if (rule.combatRole === "attacker" || rule.appliesTo === "attacker") {
      for (const modifier of rule.modifiers) {
        expect(
          DEFENDER_EXCLUSIVE_RULE_TYPES.has(modifier.type),
          `Attacker rule has defender-exclusive modifier "${modifier.type}": ${ruleLabel}`
        ).toBe(false);
      }
    }

    // Defender-scoped rules must not have attacker-exclusive modifier types.
    if (rule.combatRole === "defender" || rule.appliesTo === "defender") {
      for (const modifier of rule.modifiers) {
        expect(
          ATTACKER_EXCLUSIVE_RULE_TYPES.has(modifier.type),
          `Defender rule has attacker-exclusive modifier "${modifier.type}": ${ruleLabel}`
        ).toBe(false);
      }
    }

    // Implemented rules must declare an explicit combatRole (no heuristic guessing).
    if (rule.supportLevel === "implemented" && rule.modifiers.length > 0) {
      expect(
        rule.combatRole,
        `Implemented rule is missing combatRole: ${ruleLabel}`
      ).toBeDefined();
    }
  }
}

function validateDetachmentRules(
  detachment: { id: string; name: string; ruleOptions: RuleOption[]; stratagems?: { id: string; effects: RuleOption[] }[]; enhancements?: { id: string; effects: RuleOption[] }[] },
  label: string
) {
  validateRuleOptions(detachment.ruleOptions, `${label}:ruleOptions`);

  for (const stratagem of detachment.stratagems ?? []) {
    validateRuleOptions(stratagem.effects, `${label}:stratagem[${stratagem.id}]`);
  }

  for (const enhancement of detachment.enhancements ?? []) {
    validateRuleOptions(enhancement.effects, `${label}:enhancement[${enhancement.id}]`);
  }
}

// ---------------------------------------------------------------------------
// Adeptus Custodes — hand-crafted data
// ---------------------------------------------------------------------------

describe("Adeptus Custodes rule contracts", () => {
  it("army rules have correct side assignment", () => {
    validateRuleOptions(adeptusCustodesArmyRules, "Custodes army rules");
  });

  it("Shield Host detachment rules have correct side assignment", () => {
    validateDetachmentRules(shieldHostDetachment, "Shield Host");
  });

  it("mapped Shield Host Martial Mastery becomes two mutex options", () => {
    const shieldHostNormalized: NormalizedDetachment = {
      id: "shield_host",
      name: "Shield Host",
      factionId: "adeptus_custodes",
      factionName: "Adeptus Custodes",
      abilities: [
        {
          id: "shield_host_ability_1",
          name: "Martial Mastery",
          description:
            "At the start of the battle round, you can select one of the bullet points below. If you do, until the start of the next battle round, that bullet point's effects apply.",
        },
      ],
      enhancements: [],
      stratagems: [],
    };

    const config = mapNormalizedDetachmentToDetachmentConfig(shieldHostNormalized);
    const martialMasteryRules = config.ruleOptions.filter(
      (rule) => rule.selectionGroup === "custodes-martial-mastery"
    );

    expect(martialMasteryRules).toHaveLength(2);
    expect(
      martialMasteryRules.some((rule) =>
        rule.modifiers.some((modifier) => modifier.type === "CRITICAL_HITS_ON")
      )
    ).toBe(true);
    expect(
      martialMasteryRules.some((rule) =>
        rule.modifiers.some((modifier) => modifier.type === "AP_MODIFIER")
      )
    ).toBe(true);
    expect(
      martialMasteryRules.every((rule) => rule.modifiers.length === 1)
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Death Guard — hand-crafted army rules
// ---------------------------------------------------------------------------

describe("Death Guard rule contracts", () => {
  it("army rules have correct side assignment", () => {
    validateRuleOptions(deathGuardArmyRules, "Death Guard army rules");
  });

  it("Plague Weapons is an attacker rule with WOUND_MODIFIER", () => {
    const plagueWeapons = deathGuardArmyRules.find((r) => r.id === "dg-plague-weapons-wound-bonus");
    expect(plagueWeapons).toBeDefined();
    expect(plagueWeapons?.combatRole).toBe("attacker");
    expect(plagueWeapons?.modifiers.some((m) => m.type === "WOUND_MODIFIER")).toBe(true);
  });

  it("Disgustingly Resilient is a defender rule with FEEL_NO_PAIN", () => {
    const dr = deathGuardArmyRules.find((r) => r.id === "dg-disgustingly-resilient");
    expect(dr).toBeDefined();
    expect(dr?.combatRole).toBe("defender");
    expect(dr?.modifiers.some((m) => m.type === "FEEL_NO_PAIN")).toBe(true);
  });

  it("Flyblown Host verminous haze is a defender rule with combatRole", () => {
    const flyblownHostNormalized: NormalizedDetachment = {
      id: "flyblown_host",
      name: "Flyblown Host",
      factionId: "death_guard",
      factionName: "Death Guard",
      abilities: [
        {
          id: "verminous_haze",
          name: "Verminous Haze",
          description:
            "While this unit is on the battlefield, ranged attacks that target friendly DEATH GUARD INFANTRY units that are not POXWALKERS units have a -1 to their Hit rolls.",
        },
      ],
      enhancements: [],
      stratagems: [],
    };

    const config = mapNormalizedDetachmentToDetachmentConfig(flyblownHostNormalized);
    const verminousRule = config.ruleOptions.find((r) =>
      r.name.toLowerCase().includes("verminous")
    );
    expect(verminousRule).toBeDefined();
    expect(verminousRule?.combatRole).toBe("defender");
    expect(verminousRule?.appliesTo).toBe("defender");
  });
});

// ---------------------------------------------------------------------------
// Necrons — hand-crafted army rules
// ---------------------------------------------------------------------------

describe("Necrons rule contracts", () => {
  it("army rules have correct side assignment", () => {
    validateRuleOptions(necronsArmyRules, "Necrons army rules");
  });

  it("Reanimation Protocols is a defender rule with FEEL_NO_PAIN 4+", () => {
    const rp = necronsArmyRules.find((r) => r.id === "necrons-reanimation-protocols");
    expect(rp).toBeDefined();
    expect(rp?.combatRole).toBe("defender");
    const fnp = rp?.modifiers.find((m) => m.type === "FEEL_NO_PAIN");
    expect(fnp).toBeDefined();
    expect((fnp as { type: "FEEL_NO_PAIN"; value: number })?.value).toBe(4);
  });

  it("Living Metal is info-only and has no modifiers", () => {
    const lm = necronsArmyRules.find((r) => r.id === "necrons-living-metal");
    expect(lm).toBeDefined();
    expect(lm?.supportLevel).toBe("info-only");
    expect(lm?.modifiers).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// T'au Empire — hand-crafted army rules
// ---------------------------------------------------------------------------

describe("T'au Empire rule contracts", () => {
  it("army rules have correct side assignment", () => {
    validateRuleOptions(tauArmyRules, "T'au Empire army rules");
  });

  it("Markerlight is an attacker rule with HIT_MODIFIER", () => {
    const markerlight = tauArmyRules.find((r) => r.id === "tau-markerlight-hit-bonus");
    expect(markerlight).toBeDefined();
    expect(markerlight?.combatRole).toBe("attacker");
    const mod = markerlight?.modifiers.find((m) => m.type === "HIT_MODIFIER");
    expect(mod).toBeDefined();
  });

  it("Saviour Protocols is a defender rule with FEEL_NO_PAIN 5+", () => {
    const sp = tauArmyRules.find((r) => r.id === "tau-saviour-protocols");
    expect(sp).toBeDefined();
    expect(sp?.combatRole).toBe("defender");
    const fnp = sp?.modifiers.find((m) => m.type === "FEEL_NO_PAIN");
    expect((fnp as { type: "FEEL_NO_PAIN"; value: number })?.value).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// Space Marines — hand-crafted army rules
// ---------------------------------------------------------------------------

describe("Space Marines rule contracts", () => {
  it("army rules have correct side assignment", () => {
    validateRuleOptions(spaceMarinesArmyRules, "Space Marines army rules");
  });

  it("Oath of Moment is an attacker rule with REROLL_HITS and REROLL_WOUNDS", () => {
    const oath = spaceMarinesArmyRules.find((r) => r.id === "sm-oath-of-moment");
    expect(oath).toBeDefined();
    expect(oath?.combatRole).toBe("attacker");
    expect(oath?.modifiers.some((m) => m.type === "REROLL_HITS")).toBe(true);
    expect(oath?.modifiers.some((m) => m.type === "REROLL_WOUNDS")).toBe(true);
    expect(oath?.supportLevel).toBe("implemented");
  });
});

// ---------------------------------------------------------------------------
// World Eaters — hand-crafted army rules
// ---------------------------------------------------------------------------

describe("World Eaters rule contracts", () => {
  it("army rules have correct side assignment", () => {
    validateRuleOptions(worldEatersArmyRules, "World Eaters army rules");
  });

  it("Blessing rules are attacker-scoped with selectionGroup", () => {
    const blessings = worldEatersArmyRules.filter((r) => r.selectionGroup === "we-blessing");
    expect(blessings.length).toBeGreaterThan(0);
    for (const blessing of blessings) {
      expect(blessing.combatRole).toBe("attacker");
      expect(blessing.supportLevel).toBe("implemented");
    }
  });

  it("Berzerker Charge is info-only with no modifiers", () => {
    const bc = worldEatersArmyRules.find((r) => r.id === "we-berzerker-charge");
    expect(bc).toBeDefined();
    expect(bc?.supportLevel).toBe("info-only");
    expect(bc?.modifiers).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Chaos Space Marines — hand-crafted army rules
// ---------------------------------------------------------------------------

describe("Chaos Space Marines rule contracts", () => {
  it("army rules have correct side assignment", () => {
    validateRuleOptions(chaosSpaceMarinesArmyRules, "Chaos Space Marines army rules");
  });

  it("Veterans of the Long War is an attacker rule with REROLL_WOUNDS (melee)", () => {
    const votlw = chaosSpaceMarinesArmyRules.find((r) => r.id === "csm-veterans-of-the-long-war");
    expect(votlw).toBeDefined();
    expect(votlw?.combatRole).toBe("attacker");
    const mod = votlw?.modifiers.find((m) => m.type === "REROLL_WOUNDS");
    expect(mod).toBeDefined();
    expect((mod as { type: "REROLL_WOUNDS"; attackType?: string })?.attackType).toBe("melee");
    expect(votlw?.supportLevel).toBe("implemented");
  });
});

// ---------------------------------------------------------------------------
// Tyranids — hand-crafted army rules
// ---------------------------------------------------------------------------

describe("Tyranids rule contracts", () => {
  it("army rules have correct side assignment", () => {
    validateRuleOptions(tyranidsArmyRules, "Tyranids army rules");
  });

  it("Synaptic Directive rules are in the tyranids-directive selectionGroup", () => {
    const grouped = tyranidsArmyRules.filter((r) => r.selectionGroup === "tyranids-directive");
    expect(grouped.length).toBeGreaterThanOrEqual(2);
  });

  it("Voracious Appetite is an implemented attacker rule with REROLL_WOUNDS_ONES", () => {
    const va = tyranidsArmyRules.find((r) => r.id === "tyranids-directive-voracious-appetite");
    expect(va).toBeDefined();
    expect(va?.combatRole).toBe("attacker");
    expect(va?.supportLevel).toBe("implemented");
    expect(va?.modifiers.some((m) => m.type === "REROLL_WOUNDS_ONES")).toBe(true);
  });

  it("info-only directives have no modifiers", () => {
    const infoOnly = tyranidsArmyRules.filter((r) => r.supportLevel === "info-only");
    for (const rule of infoOnly) {
      expect(rule.modifiers).toHaveLength(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Aeldari — hand-crafted army rules
// ---------------------------------------------------------------------------

describe("Aeldari rule contracts", () => {
  it("army rules have correct side assignment", () => {
    validateRuleOptions(aeldariArmyRules, "Aeldari army rules");
  });

  it("all Aeldari army rules are info-only with no modifiers", () => {
    for (const rule of aeldariArmyRules) {
      expect(rule.supportLevel).toBe("info-only");
      expect(rule.modifiers).toHaveLength(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Adeptus Mechanicus — hand-crafted army rules
// ---------------------------------------------------------------------------

describe("Adeptus Mechanicus rule contracts", () => {
  it("army rules have correct side assignment", () => {
    validateRuleOptions(
      adeptusMechanicusArmyRules,
      "Adeptus Mechanicus army rules"
    );
  });

  it("all Adeptus Mechanicus army rules are info-only with no modifiers", () => {
    for (const rule of adeptusMechanicusArmyRules) {
      expect(rule.supportLevel).toBe("info-only");
      expect(rule.modifiers).toHaveLength(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Astra Militarum — hand-crafted army rules
// ---------------------------------------------------------------------------

describe("Astra Militarum rule contracts", () => {
  it("army rules have correct side assignment", () => {
    validateRuleOptions(astraMilitarumArmyRules, "Astra Militarum army rules");
  });

  it("Born Soldiers is an attacker rule with ranged LETHAL_HITS", () => {
    const bornSoldiers = astraMilitarumArmyRules.find(
      (r) => r.id === "am-born-soldiers"
    );
    expect(bornSoldiers).toBeDefined();
    expect(bornSoldiers?.combatRole).toBe("attacker");
    const mod = bornSoldiers?.modifiers.find((m) => m.type === "LETHAL_HITS");
    expect(mod).toBeDefined();
    expect((mod as { type: "LETHAL_HITS"; attackType?: string })?.attackType).toBe(
      "ranged"
    );
    expect(
      (mod as { type: "LETHAL_HITS"; excludedDefenderKeywords?: string[] })
        ?.excludedDefenderKeywords
    ).toEqual(["MONSTER", "VEHICLE"]);
  });
});

// ---------------------------------------------------------------------------
// Orks — hand-crafted army rules
// ---------------------------------------------------------------------------

describe("Orks rule contracts", () => {
  it("army rules have correct side assignment", () => {
    validateRuleOptions(orksArmyRules, "Orks army rules");
  });

  it("Waaagh! is an attacker rule with ATTACKS_MODIFIER (melee)", () => {
    const waaagh = orksArmyRules.find((r) => r.id === "orks-waaagh");
    expect(waaagh).toBeDefined();
    expect(waaagh?.combatRole).toBe("attacker");
    const mod = waaagh?.modifiers.find((m) => m.type === "ATTACKS_MODIFIER");
    expect(mod).toBeDefined();
    expect((mod as { type: "ATTACKS_MODIFIER"; value: number; attackType?: string })?.value).toBe(1);
    expect((mod as { type: "ATTACKS_MODIFIER"; value: number; attackType?: string })?.attackType).toBe("melee");
  });
});

// ---------------------------------------------------------------------------
// Grey Knights — hand-crafted army rules
// ---------------------------------------------------------------------------

describe("Grey Knights rule contracts", () => {
  it("army rules have correct side assignment", () => {
    validateRuleOptions(greyKnightsArmyRules, "Grey Knights army rules");
  });

  it("all Grey Knights army rules are info-only with no modifiers", () => {
    for (const rule of greyKnightsArmyRules) {
      expect(rule.supportLevel).toBe("info-only");
      expect(rule.modifiers).toHaveLength(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Leagues of Votann — hand-crafted army rules
// ---------------------------------------------------------------------------

describe("Leagues of Votann rule contracts", () => {
  it("army rules have correct side assignment", () => {
    validateRuleOptions(
      leaguesOfVotannArmyRules,
      "Leagues of Votann army rules"
    );
  });

  it("all Leagues of Votann army rules are info-only with no modifiers", () => {
    for (const rule of leaguesOfVotannArmyRules) {
      expect(rule.supportLevel).toBe("info-only");
      expect(rule.modifiers).toHaveLength(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Adepta Sororitas — hand-crafted army rules
// ---------------------------------------------------------------------------

describe("Adepta Sororitas rule contracts", () => {
  it("army rules have correct side assignment", () => {
    validateRuleOptions(adeptaSororitasArmyRules, "Adepta Sororitas army rules");
  });

  it("all Adepta Sororitas army rules are info-only with no modifiers", () => {
    for (const rule of adeptaSororitasArmyRules) {
      expect(rule.supportLevel).toBe("info-only");
      expect(rule.modifiers).toHaveLength(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Thousand Sons — hand-crafted army rules
// ---------------------------------------------------------------------------

describe("Thousand Sons rule contracts", () => {
  it("army rules have correct side assignment", () => {
    validateRuleOptions(thousandSonsArmyRules, "Thousand Sons army rules");
  });

  it("all Thousand Sons army rules are info-only with no modifiers", () => {
    for (const rule of thousandSonsArmyRules) {
      expect(rule.supportLevel).toBe("info-only");
      expect(rule.modifiers).toHaveLength(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Chaos Knights — hand-crafted army rules
// ---------------------------------------------------------------------------

describe("Chaos Knights rule contracts", () => {
  it("army rules have correct side assignment", () => {
    validateRuleOptions(chaosKnightsArmyRules, "Chaos Knights army rules");
  });

  it("all Chaos Knights army rules are info-only with no modifiers", () => {
    for (const rule of chaosKnightsArmyRules) {
      expect(rule.supportLevel).toBe("info-only");
      expect(rule.modifiers).toHaveLength(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Mapper — structural contract for auto-generated detachment configs
// ---------------------------------------------------------------------------

describe("mapNormalizedDetachmentToDetachmentConfig rule contracts", () => {
  /**
   * Minimal NormalizedDetachment fixture with no overrides. The mapper
   * produces rules only from abilities/enhancements/stratagems — here we
   * pass empty arrays so the mapper returns a trivially valid config that
   * we can still assert structural shape on.
   */
  const emptyDetachment: NormalizedDetachment = {
    id: "test-detachment",
    name: "Test Detachment",
    factionId: "test-faction",
    factionName: "Test Faction",
    abilities: [],
    enhancements: [],
    stratagems: [],
  };

  it("produces a DetachmentConfig with correct shape from empty normalized detachment", () => {
    const config = mapNormalizedDetachmentToDetachmentConfig(emptyDetachment);
    expect(config.id).toBe("test-detachment");
    expect(config.name).toBe("Test Detachment");
    expect(config.ruleOptions).toBeInstanceOf(Array);
    expect(config.stratagems).toBeInstanceOf(Array);
  });

  /**
   * World Eaters Berzerker Warband is a well-covered detachment in the mapper
   * with both attacker (ATTACKS_MODIFIER, DAMAGE_MODIFIER, REROLL_HITS_ONES)
   * and defender (DAMAGE_REDUCTION) rules. Good contract target.
   */
  const berzerkerWarbandDetachment: NormalizedDetachment = {
    id: "berzerker_warband",
    name: "Berzerker Warband",
    factionId: "world_eaters",
    factionName: "World Eaters",
    abilities: [],
    enhancements: [
      { id: "berzerker_glaive", name: "Berzerker Glaive", description: "The bearer's melee weapons gain +1 Attacks and +1 Damage." },
      { id: "helm_of_brazen_ire", name: "Helm of Brazen Ire", description: "Attacks allocated to the bearer have their Damage reduced by 1." },
    ],
    stratagems: [],
  };

  it("Berzerker Warband enhancement rules respect side contracts", () => {
    const config = mapNormalizedDetachmentToDetachmentConfig(berzerkerWarbandDetachment);
    validateDetachmentRules(config, "Berzerker Warband (mapper)");
  });

  it("Berzerker Glaive is mapped as attacker rule with correct combatRole", () => {
    const config = mapNormalizedDetachmentToDetachmentConfig(berzerkerWarbandDetachment);
    const glaiveEnhancement = config.enhancements?.find((e) => e.id.includes("berzerker_glaive"));
    expect(glaiveEnhancement).toBeDefined();
    for (const effect of glaiveEnhancement?.effects ?? []) {
      expect(effect.combatRole).toBe("attacker");
    }
  });

  it("Helm of Brazen Ire is mapped as defender rule with correct combatRole", () => {
    const config = mapNormalizedDetachmentToDetachmentConfig(berzerkerWarbandDetachment);
    const helmEnhancement = config.enhancements?.find((e) => e.id.includes("helm_of_brazen_ire"));
    expect(helmEnhancement).toBeDefined();
    for (const effect of helmEnhancement?.effects ?? []) {
      expect(effect.combatRole).toBe("defender");
    }
  });
});
