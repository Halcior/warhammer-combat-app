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

  return {
    id: detachment.id,
    name: detachment.name,
    description: summarizeDetachmentDescription(detachment),
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
      detachment.id === "berzerker_warband" &&
      enhancementName.includes("berzerker glaive")
    ) {
      return createImplementedEnhancement(enhancement, "fight", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Berzerker Glaive Effect",
          description:
            "The bearer's melee weapons gain +1 Attacks and +1 Damage.",
          phase: "fight",
          modifiers: [
            { type: "ATTACKS_MODIFIER", value: 1, attackType: "melee" },
            { type: "DAMAGE_MODIFIER", value: 1, attackType: "melee" },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "berzerker_warband" &&
      enhancementName.includes("helm of brazen ire")
    ) {
      return createImplementedEnhancement(enhancement, "any", [
        createImplementedDefenderRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Helm of Brazen Ire Effect",
          description:
            "Attacks allocated to the bearer have their Damage reduced by 1.",
          phase: "any",
          modifiers: [{ type: "DAMAGE_REDUCTION", value: 1 }],
        }),
      ]);
    }

    if (
      detachment.id === "goretrack_onslaught" &&
      enhancementName.includes("unleash hell")
    ) {
      return createImplementedEnhancement(enhancement, "any", [
        createImplementedDefenderRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Unleash Hell Effect",
          description:
            "A suppressed enemy unit suffers -1 to hit when it attacks the bearer or its allies.",
          phase: "any",
          modifiers: [{ type: "HIT_MODIFIER", value: -1 }],
        }),
      ]);
    }

    if (
      detachment.id === "khorne_daemonkin" &&
      enhancementName.includes("blood-forged armour")
    ) {
      return createImplementedEnhancement(enhancement, "any", [
        createImplementedDefenderRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Blood-forged Armour Effect",
          description: "The bearer has a Save characteristic of 2+.",
          phase: "any",
          modifiers: [{ type: "SET_SAVE_CHARACTERISTIC", value: 2 }],
        }),
      ]);
    }

    if (
      detachment.id === "khorne_daemonkin" &&
      enhancementName.includes("blade of endless bloodshed")
    ) {
      return createImplementedEnhancement(enhancement, "fight", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Blade of Endless Bloodshed Effect",
          description:
            "The bearer's melee weapons gain +1 Attacks, +1 Strength and +1 Damage.",
          phase: "fight",
          modifiers: [
            { type: "ATTACKS_MODIFIER", value: 1, attackType: "melee" },
            { type: "STRENGTH_MODIFIER", value: 1, attackType: "melee" },
            { type: "DAMAGE_MODIFIER", value: 1, attackType: "melee" },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "cult_of_blood" &&
      enhancementName.includes("brazen form")
    ) {
      return createImplementedEnhancement(enhancement, "any", [
        createImplementedDefenderRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Brazen Form Effect",
          description:
            "The enhanced model gains Feel No Pain 5+ while it is the defended unit.",
          phase: "any",
          modifiers: [{ type: "FEEL_NO_PAIN", value: 5 }],
        }),
      ]);
    }

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

    if (
      detachment.id === "annihilation_legion" &&
      enhancementName.includes("ingrained superiority")
    ) {
      return createImplementedEnhancement(enhancement, "any", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Ingrained Superiority Effect",
          description:
            "Critical wounds improve AP by 1 for the bearer's unit.",
          phase: "any",
          modifiers: [{ type: "CRITICAL_WOUND_AP_MODIFIER", value: 1 }],
        }),
      ]);
    }

    if (
      detachment.id === "auric_champions" &&
      enhancementName.includes("veiled blade")
    ) {
      return createImplementedEnhancement(enhancement, "fight", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Veiled Blade Effect",
          description: "Add 2 to the Attacks characteristic of melee weapons.",
          phase: "fight",
          modifiers: [{ type: "ATTACKS_MODIFIER", value: 2, attackType: "melee" }],
        }),
      ]);
    }

    if (
      detachment.id === "awakened_dynasty" &&
      enhancementName.includes("phasal subjugator")
    ) {
      return createImplementedEnhancement(enhancement, "any", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Phasal Subjugator Effect",
          description:
            "Friendly non-Character Necrons units gain +1 to hit while in range.",
          phase: "any",
          modifiers: [
            {
              type: "HIT_MODIFIER",
              value: 1,
              excludedAttackerKeywords: ["CHARACTER"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "hypercrypt_legion" &&
      enhancementName.includes("arisen tyrant")
    ) {
      return createImplementedEnhancement(enhancement, "any", [
        createImplementedRuleOption({
          id: `${enhancement.id}-reroll-ones-effect`,
          name: "Arisen Tyrant: Re-roll Hit Rolls of 1",
          description: "The bearer's unit re-rolls hit rolls of 1.",
          phase: "any",
          modifiers: [{ type: "REROLL_HITS_ONES" }],
        }),
        createImplementedRuleOption({
          id: `${enhancement.id}-full-reroll-effect`,
          name: "Arisen Tyrant: Full Hit Re-rolls",
          description:
            "If the bearer's unit was set up on the battlefield this turn, it re-rolls hit rolls.",
          phase: "any",
          modifiers: [
            {
              type: "REROLL_HITS",
              requiresAttackerSetUpThisTurn: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "lions_of_the_emperor" &&
      enhancementName.includes("admonimortis")
    ) {
      return createImplementedEnhancement(enhancement, "fight", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Admonimortis Effect",
          description:
            "Improve the Strength characteristic of melee weapons by 3, and improve their AP and Damage by 1.",
          phase: "fight",
          modifiers: [
            { type: "STRENGTH_MODIFIER", value: 3, attackType: "melee" },
            { type: "AP_MODIFIER", value: 1, attackType: "melee" },
            { type: "DAMAGE_MODIFIER", value: 1, attackType: "melee" },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "null_maiden_vigil" &&
      enhancementName.includes("oblivion knight")
    ) {
      return createImplementedEnhancement(enhancement, "any", [
        createImplementedRuleOption({
          id: `${enhancement.id}-hit-effect`,
          name: "Oblivion Knight: Hit Bonus",
          description: "Add 1 to hit rolls for the bearer's unit.",
          phase: "any",
          modifiers: [{ type: "HIT_MODIFIER", value: 1 }],
        }),
        createImplementedRuleOption({
          id: `${enhancement.id}-wound-effect`,
          name: "Oblivion Knight: Wound Bonus vs Psyker",
          description: "Add 1 to wound rolls against Psyker units.",
          phase: "any",
          modifiers: [
            {
              type: "WOUND_MODIFIER",
              value: 1,
              requiredDefenderKeywords: ["PSYKER"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "null_maiden_vigil" &&
      enhancementName.includes("raptor blade")
    ) {
      return createImplementedEnhancement(enhancement, "fight", [
        createImplementedRuleOption({
          id: `${enhancement.id}-base-effect`,
          name: "Raptor Blade Effect",
          description:
            "Add 1 to the Attacks, Strength and Damage characteristics of melee weapons.",
          phase: "fight",
          modifiers: [
            { type: "ATTACKS_MODIFIER", value: 1, attackType: "melee" },
            { type: "STRENGTH_MODIFIER", value: 1, attackType: "melee" },
            { type: "DAMAGE_MODIFIER", value: 1, attackType: "melee" },
          ],
        }),
        createImplementedRuleOption({
          id: `${enhancement.id}-battle-shocked-psyker-effect`,
          name: "Raptor Blade vs Battle-shocked Psyker",
          description:
            "Gain an additional +1 Attacks, Strength and Damage against Battle-shocked Psyker units.",
          phase: "fight",
          modifiers: [
            {
              type: "ATTACKS_MODIFIER",
              value: 1,
              attackType: "melee",
              requiredDefenderKeywords: ["PSYKER"],
              requiresTargetBattleShocked: true,
            },
            {
              type: "STRENGTH_MODIFIER",
              value: 1,
              attackType: "melee",
              requiredDefenderKeywords: ["PSYKER"],
              requiresTargetBattleShocked: true,
            },
            {
              type: "DAMAGE_MODIFIER",
              value: 1,
              attackType: "melee",
              requiredDefenderKeywords: ["PSYKER"],
              requiresTargetBattleShocked: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "obeisance_phalanx" &&
      enhancementName.includes("unflinching will")
    ) {
      return createImplementedEnhancement(enhancement, "fight", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Unflinching Will Effect",
          description:
            "The bearer's melee weapons gain Precision and Anti-Infantry 5+.",
          phase: "fight",
          modifiers: [
            { type: "PRECISION" },
            { type: "ANTI", keyword: "INFANTRY", value: 5 },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "obeisance_phalanx" &&
      enhancementName.includes("eternal conqueror")
    ) {
      return createImplementedEnhancement(enhancement, "any", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Eternal Conqueror Effect",
          description:
            "The bearer's unit re-rolls hits against enemies within objective range.",
          phase: "any",
          modifiers: [
            {
              type: "REROLL_HITS",
              requiresTargetWithinObjectiveRange: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "possessed_slaughterband" &&
      enhancementName.includes("frenzied focus")
    ) {
      return createImplementedEnhancement(enhancement, "any", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Frenzied Focus Effect",
          description: "Daemon attacks score critical hits on 5+.",
          phase: "any",
          modifiers: [
            {
              type: "CRITICAL_HITS_ON",
              value: 5,
              requiredAttackerKeywords: ["DAEMON"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "solar_spearhead" &&
      enhancementName.includes("adamantine talisman")
    ) {
      return createImplementedEnhancement(enhancement, "fight", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Adamantine Talisman Effect",
          description:
            "Improve the Attacks, Strength and Damage characteristics of melee weapons by 1.",
          phase: "fight",
          modifiers: [
            { type: "ATTACKS_MODIFIER", value: 1, attackType: "melee" },
            { type: "STRENGTH_MODIFIER", value: 1, attackType: "melee" },
            { type: "DAMAGE_MODIFIER", value: 1, attackType: "melee" },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "vessels_of_wrath" &&
      enhancementName.includes("archslaughterer")
    ) {
      return createImplementedEnhancement(enhancement, "fight", [
        createImplementedRuleOption({
          id: `${enhancement.id}-ap-effect`,
          name: "Archslaughterer: AP Bonus",
          description: "The bearer's melee weapons improve AP by 1.",
          phase: "fight",
          modifiers: [{ type: "AP_MODIFIER", value: 1, attackType: "melee" }],
        }),
        createImplementedRuleOption({
          id: `${enhancement.id}-damage-effect`,
          name: "Archslaughterer: Vessel Damage Bonus",
          description:
            "While the bearer is a Vessel of Wrath, its melee weapons gain +1 Damage.",
          phase: "fight",
          modifiers: [
            {
              type: "DAMAGE_MODIFIER",
              value: 1,
              attackType: "melee",
              requiresAttackerIsVesselOfWrath: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "talons_of_the_emperor" &&
      enhancementName.includes("gift of terran artifice")
    ) {
      return createImplementedEnhancement(enhancement, "fight", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Gift of Terran Artifice Effect",
          description: "Add 1 to wound rolls for melee attacks.",
          phase: "fight",
          modifiers: [{ type: "WOUND_MODIFIER", value: 1, attackType: "melee" }],
        }),
      ]);
    }

    if (
      detachment.id === "cursed_legion" &&
      enhancementName.includes("mark of the nekrosor")
    ) {
      return createImplementedEnhancement(enhancement, "any", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Mark of the Nekrosor Effect",
          description: "Destroyer Cult attacks gain +1 to hit.",
          phase: "any",
          modifiers: [
            {
              type: "HIT_MODIFIER",
              value: 1,
              requiredAttackerKeywords: ["DESTROYER CULT"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "starshatter_arsenal" &&
      enhancementName.includes("dread majesty")
    ) {
      return createImplementedEnhancement(enhancement, "any", [
        createImplementedRuleOption({
          id: `${enhancement.id}-hit-effect`,
          name: "Dread Majesty: Re-roll Hit Rolls of 1",
          description:
            "Affected non-Monster, non-Titanic units re-roll hit rolls of 1.",
          phase: "any",
          modifiers: [
            {
              type: "REROLL_HITS_ONES",
              excludedAttackerKeywords: ["MONSTER", "TITANIC"],
            },
          ],
        }),
        createImplementedRuleOption({
          id: `${enhancement.id}-wound-effect`,
          name: "Dread Majesty: Re-roll Wound Rolls of 1",
          description:
            "Affected non-Monster, non-Titanic units re-roll wound rolls of 1.",
          phase: "any",
          modifiers: [
            {
              type: "REROLL_WOUNDS_ONES",
              excludedAttackerKeywords: ["MONSTER", "TITANIC"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "starshatter_arsenal" &&
      enhancementName.includes("miniaturised nebuloscope")
    ) {
      return createImplementedEnhancement(enhancement, "shooting", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Miniaturised Nebuloscope Effect",
          description: "Ranged weapons gain Ignores Cover.",
          phase: "shooting",
          modifiers: [{ type: "IGNORES_COVER" }],
        }),
      ]);
    }

    if (
      detachment.id === "canoptek_court" &&
      enhancementName.includes("hyperphasic fulcrum")
    ) {
      return createImplementedEnhancement(enhancement, "any", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Hyperphasic Fulcrum Effect",
          description:
            "Attached units in the Power Matrix re-roll wound rolls of 1.",
          phase: "any",
          modifiers: [
            {
              type: "REROLL_WOUNDS_ONES",
              requiresAttachedUnit: true,
              requiresAttackerWithinPowerMatrix: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "experimental_prototype_cadre" &&
      enhancementName.includes("supernova launcher")
    ) {
      return createImplementedEnhancement(enhancement, "shooting", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Supernova Launcher Effect",
          description:
            "Improve a ranged weapon's Strength by 3, and its AP and Damage by 1.",
          phase: "shooting",
          modifiers: [
            { type: "STRENGTH_MODIFIER", value: 3, attackType: "ranged" },
            { type: "AP_MODIFIER", value: 1, attackType: "ranged" },
            { type: "DAMAGE_MODIFIER", value: 1, attackType: "ranged" },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "experimental_prototype_cadre" &&
      enhancementName.includes("thermoneutronic projector")
    ) {
      return createImplementedEnhancement(enhancement, "shooting", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Thermoneutronic Projector Effect",
          description:
            "Improve a ranged weapon's Strength by 2, and its AP and Damage by 1.",
          phase: "shooting",
          modifiers: [
            { type: "STRENGTH_MODIFIER", value: 2, attackType: "ranged" },
            { type: "AP_MODIFIER", value: 1, attackType: "ranged" },
            { type: "DAMAGE_MODIFIER", value: 1, attackType: "ranged" },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "experimental_prototype_cadre" &&
      enhancementName.includes("plasma accelerator rifle")
    ) {
      return createImplementedEnhancement(enhancement, "shooting", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Plasma Accelerator Rifle Effect",
          description:
            "Improve a ranged weapon's Attacks by 1, Strength by 2, and AP and Damage by 1.",
          phase: "shooting",
          modifiers: [
            { type: "ATTACKS_MODIFIER", value: 1, attackType: "ranged" },
            { type: "STRENGTH_MODIFIER", value: 2, attackType: "ranged" },
            { type: "AP_MODIFIER", value: 1, attackType: "ranged" },
            { type: "DAMAGE_MODIFIER", value: 1, attackType: "ranged" },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "experimental_prototype_cadre" &&
      enhancementName.includes("fusion blades")
    ) {
      return createImplementedEnhancement(enhancement, "shooting", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Fusion Blades Effect",
          description:
            "Improve a ranged weapon's Attacks by 1, Strength by 3, and add Melta 4.",
          phase: "shooting",
          modifiers: [
            { type: "ATTACKS_MODIFIER", value: 1, attackType: "ranged" },
            { type: "STRENGTH_MODIFIER", value: 3, attackType: "ranged" },
            { type: "MELTA", value: 4, attackType: "ranged" },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "kauyon" &&
      enhancementName.includes("exemplar of the kauyon")
    ) {
      return createImplementedEnhancement(enhancement, "shooting", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Exemplar of the Kauyon Effect",
          description:
            "A led unit gains Sustained Hits 1 with ranged weapons from battle round 2 onwards.",
          phase: "shooting",
          modifiers: [
            {
              type: "SUSTAINED_HITS",
              value: 1,
              attackType: "ranged",
              requiresAttachedUnit: true,
              requiresBattleRoundAtLeast: 2,
              requiresBattleRoundAtMost: 5,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "kauyon" &&
      enhancementName.includes("precision of the patient hunter")
    ) {
      return createImplementedEnhancement(enhancement, "shooting", [
        createImplementedRuleOption({
          id: `${enhancement.id}-hit-effect`,
          name: "Precision of the Patient Hunter: Hit Bonus",
          description: "The bearer's ranged attacks gain +1 to hit.",
          phase: "shooting",
          modifiers: [{ type: "HIT_MODIFIER", value: 1, attackType: "ranged" }],
        }),
        createImplementedRuleOption({
          id: `${enhancement.id}-wound-effect`,
          name: "Precision of the Patient Hunter: Wound Bonus",
          description:
            "From battle round 3 onwards, the bearer's ranged attacks gain +1 to wound.",
          phase: "shooting",
          modifiers: [
            {
              type: "WOUND_MODIFIER",
              value: 1,
              attackType: "ranged",
              requiresBattleRoundAtLeast: 3,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "kauyon" &&
      enhancementName.includes("through unity, devastation")
    ) {
      return createImplementedEnhancement(enhancement, "shooting", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Through Unity, Devastation Effect",
          description:
            "Guided ranged attacks against a spotted target gain Lethal Hits.",
          phase: "shooting",
          modifiers: [
            {
              type: "LETHAL_HITS",
              attackType: "ranged",
              requiresAttackerGuided: true,
              requiresTargetSpotted: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "kroot_hunting_pack" &&
      enhancementName.includes("borthrod gland")
    ) {
      return createImplementedEnhancement(enhancement, "fight", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Borthrod Gland Effect",
          description:
            "A led Kroot unit scores critical hits on 5+ in melee.",
          phase: "fight",
          modifiers: [
            {
              type: "CRITICAL_HITS_ON",
              value: 5,
              attackType: "melee",
              requiredAttackerKeywords: ["KROOT"],
              requiresAttachedUnit: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "kroot_hunting_pack" &&
      enhancementName.includes("kroothawk flock")
    ) {
      return createImplementedEnhancement(enhancement, "shooting", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Kroothawk Flock Effect",
          description: "Kroot ranged weapons gain Ignores Cover.",
          phase: "shooting",
          modifiers: [
            {
              type: "IGNORES_COVER",
              attackType: "ranged",
              requiredAttackerKeywords: ["KROOT"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "kroot_hunting_pack" &&
      enhancementName.includes("nomadic hunter")
    ) {
      return createImplementedEnhancement(enhancement, "shooting", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Nomadic Hunter Effect",
          description: "A led Kroot unit gains Assault on ranged weapons.",
          phase: "shooting",
          modifiers: [
            {
              type: "ASSAULT",
              attackType: "ranged",
              requiredAttackerKeywords: ["KROOT"],
              requiresAttachedUnit: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "kroot_hunting_pack" &&
      enhancementName.includes("root-carved weapons")
    ) {
      return createImplementedEnhancement(enhancement, "any", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Root-carved Weapons Effect",
          description:
            "The bearer's weapons gain Precision and Devastating Wounds.",
          phase: "any",
          modifiers: [{ type: "PRECISION" }, { type: "DEVASTATING_WOUNDS" }],
        }),
      ]);
    }

    if (
      detachment.id === "kroot_raiding_party" &&
      enhancementName.includes("experienced leader")
    ) {
      return createImplementedEnhancement(enhancement, "any", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Experienced Leader Effect",
          description:
            "Kroot attacks re-roll wounds against the marked enemy unit.",
          phase: "any",
          modifiers: [
            {
              type: "REROLL_WOUNDS",
              requiredAttackerKeywords: ["KROOT"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "mont_ka" &&
      enhancementName.includes("coordinated exploitation")
    ) {
      return createImplementedEnhancement(enhancement, "shooting", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Coordinated Exploitation Effect",
          description:
            "Guided ranged attacks against a spotted target gain Sustained Hits 1.",
          phase: "shooting",
          modifiers: [
            {
              type: "SUSTAINED_HITS",
              value: 1,
              attackType: "ranged",
              requiresAttackerGuided: true,
              requiresTargetSpotted: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "mont_ka" &&
      enhancementName.includes("exemplar of the mont")
    ) {
      return createImplementedEnhancement(enhancement, "shooting", [
        createImplementedRuleOption({
          id: `${enhancement.id}-assault-effect`,
          name: "Exemplar of the Mont'ka: Assault",
          description:
            "A led unit gains Assault on ranged weapons in battle round 4.",
          phase: "shooting",
          modifiers: [
            {
              type: "ASSAULT",
              attackType: "ranged",
              requiresAttachedUnit: true,
              requiresBattleRoundAtLeast: 4,
              requiresBattleRoundAtMost: 4,
            },
          ],
        }),
        createImplementedRuleOption({
          id: `${enhancement.id}-lethal-effect`,
          name: "Exemplar of the Mont'ka: Lethal Hits",
          description:
            "A led Guided unit gains Lethal Hits on ranged attacks in battle round 4.",
          phase: "shooting",
          modifiers: [
            {
              type: "LETHAL_HITS",
              attackType: "ranged",
              requiresAttachedUnit: true,
              requiresAttackerGuided: true,
              requiresBattleRoundAtLeast: 4,
              requiresBattleRoundAtMost: 4,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "retaliation_cadre" &&
      enhancementName.includes("prototype weapon system")
    ) {
      return createImplementedEnhancement(enhancement, "shooting", [
        createImplementedRuleOption({
          id: `${enhancement.id}-sustained-effect`,
          name: "Prototype Weapon System: Sustained Hits 1",
          description: "Battlesuit ranged attacks gain Sustained Hits 1.",
          phase: "shooting",
          modifiers: [
            {
              type: "SUSTAINED_HITS",
              value: 1,
              attackType: "ranged",
              requiredAttackerKeywords: ["BATTLESUIT"],
            },
          ],
        }),
        createImplementedRuleOption({
          id: `${enhancement.id}-lethal-effect`,
          name: "Prototype Weapon System: Lethal Hits",
          description: "Battlesuit ranged attacks gain Lethal Hits.",
          phase: "shooting",
          modifiers: [
            {
              type: "LETHAL_HITS",
              attackType: "ranged",
              requiredAttackerKeywords: ["BATTLESUIT"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "starfire_cadre" &&
      enhancementName.includes("target optimisation microdrones")
    ) {
      return createImplementedEnhancement(enhancement, "shooting", [
        createImplementedRuleOption({
          id: `${enhancement.id}-effect`,
          name: "Target Optimisation Microdrones Effect",
          description:
            "Fire Warriors, Pathfinder Teams and Cadre Fireblades improve AP by 1 in shooting.",
          phase: "shooting",
          modifiers: [
            {
              type: "AP_MODIFIER",
              value: 1,
              attackType: "ranged",
              requiredAttackerKeywords: [
                "FIRE WARRIOR",
                "PATHFINDER TEAM",
                "CADRE FIREBLADE",
              ],
            },
          ],
        }),
      ]);
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
  return detachment.stratagems.map((stratagem) => {
    const stratagemName = stratagem.name.toLowerCase();
    const phase = normalizePhase(stratagem.phase);

    if (
      detachment.id === "auric_champions" &&
      stratagemName.includes("slayer of champions")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Slayer of Champions Effect",
          description: "Add 1 to wound rolls against the selected enemy unit.",
          phase,
          modifiers: [
            {
              type: "WOUND_MODIFIER",
              value: 1,
              requiredAttackerKeywords: ["CHARACTER"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "auric_champions" &&
      stratagemName.includes("earning of a name")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-hit-reroll-effect`,
          name: "Earning of a Name: Re-roll Hits",
          description: "Character models re-roll hit rolls against Monsters and Vehicles.",
          phase,
          modifiers: [
            {
              type: "REROLL_HITS",
              attackType: "melee",
              requiredAttackerKeywords: ["CHARACTER"],
              requiredDefenderKeywords: ["MONSTER", "VEHICLE"],
            },
          ],
        }),
        createImplementedRuleOption({
          id: `${stratagem.id}-wound-reroll-effect`,
          name: "Earning of a Name: Re-roll Wounds",
          description:
            "Character models re-roll wound rolls against Monsters and Vehicles.",
          phase,
          modifiers: [
            {
              type: "REROLL_WOUNDS",
              attackType: "melee",
              requiredAttackerKeywords: ["CHARACTER"],
              requiredDefenderKeywords: ["MONSTER", "VEHICLE"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "black_ship_guardians" &&
      stratagemName.includes("punishment of the prosecutors")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Punishment of the Prosecutors Effect",
          description: "Improve the AP characteristic of ranged weapons by 1.",
          phase,
          modifiers: [
            {
              type: "AP_MODIFIER",
              value: 1,
              attackType: "ranged",
              requiredAttackerKeywords: ["ANATHEMA PSYKANA"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "null_maiden_vigil" &&
      stratagemName.includes("anathema blademastery")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-hit-reroll-effect`,
          name: "Anathema Blademastery: Re-roll Hits",
          description: "Re-roll hit rolls for melee attacks.",
          phase,
          modifiers: [{ type: "REROLL_HITS", attackType: "melee" }],
        }),
        createImplementedRuleOption({
          id: `${stratagem.id}-wound-reroll-psyker-effect`,
          name: "Anathema Blademastery: Re-roll Wounds vs Psyker",
          description: "Re-roll wound rolls against Psyker units.",
          phase,
          modifiers: [
            {
              type: "REROLL_WOUNDS",
              attackType: "melee",
              requiredDefenderKeywords: ["PSYKER"],
            },
          ],
        }),
        createImplementedRuleOption({
          id: `${stratagem.id}-wound-reroll-battle-shocked-effect`,
          name: "Anathema Blademastery: Re-roll Wounds vs Battle-shocked",
          description: "Re-roll wound rolls against Battle-shocked units.",
          phase,
          modifiers: [
            {
              type: "REROLL_WOUNDS",
              attackType: "melee",
              requiresTargetBattleShocked: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "null_maiden_vigil" &&
      stratagemName.includes("psy-chaff volley")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Psy-chaff Volley Effect",
          description: "Improve the AP characteristic against the prosecuted target by 1.",
          phase,
          modifiers: [
            {
              type: "AP_MODIFIER",
              value: 1,
              requiredAttackerKeywords: ["ANATHEMA PSYKANA"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "annihilation_legion" &&
      stratagemName.includes("spoor of frailty")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-hit-effect`,
          name: "The Spoor of Frailty: Hit Bonus",
          description: "Add 1 to hit rolls against targets below starting strength.",
          phase,
          modifiers: [
            {
              type: "HIT_MODIFIER",
              value: 1,
              requiresTargetBelowStartingStrength: true,
            },
          ],
        }),
        createImplementedRuleOption({
          id: `${stratagem.id}-wound-effect`,
          name: "The Spoor of Frailty: Wound Bonus",
          description: "Add 1 to wound rolls against targets below half strength.",
          phase,
          modifiers: [
            {
              type: "WOUND_MODIFIER",
              value: 1,
              requiresTargetBelowHalfStrength: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "awakened_dynasty" &&
      stratagemName.includes("conquering tyrant")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-reroll-ones-effect`,
          name: "Protocol of the Conquering Tyrant: Re-roll Hit Rolls of 1",
          description: "Re-roll hit rolls of 1 within half range.",
          phase,
          modifiers: [
            {
              type: "REROLL_HITS_ONES",
              attackType: "ranged",
              requiresHalfRange: true,
            },
          ],
        }),
        createImplementedRuleOption({
          id: `${stratagem.id}-full-reroll-effect`,
          name: "Protocol of the Conquering Tyrant: Full Hit Re-rolls",
          description: "Attached units re-roll hit rolls within half range.",
          phase,
          modifiers: [
            {
              type: "REROLL_HITS",
              attackType: "ranged",
              requiresHalfRange: true,
              requiresAttachedUnit: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "awakened_dynasty" &&
      stratagemName.includes("hungry void")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-strength-effect`,
          name: "Protocol of the Hungry Void: Strength Bonus",
          description: "Add 1 Strength to melee weapons.",
          phase,
          modifiers: [{ type: "STRENGTH_MODIFIER", value: 1, attackType: "melee" }],
        }),
        createImplementedRuleOption({
          id: `${stratagem.id}-ap-effect`,
          name: "Protocol of the Hungry Void: AP Bonus",
          description: "Attached units improve melee AP by 1.",
          phase,
          modifiers: [
            {
              type: "AP_MODIFIER",
              value: 1,
              attackType: "melee",
              requiresAttachedUnit: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "awakened_dynasty" &&
      stratagemName.includes("sudden storm")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Protocol of the Sudden Storm Effect",
          description: "Ranged weapons gain Assault until the end of the turn.",
          phase,
          modifiers: [{ type: "ASSAULT", attackType: "ranged" }],
        }),
      ]);
    }

    if (
      detachment.id === "canoptek_court" &&
      stratagemName.includes("cynosure of eradication")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Cynosure of Eradication Effect",
          description:
            "Cryptek and Canoptek attacks in the Power Matrix gain Devastating Wounds.",
          phase,
          modifiers: [
            {
              type: "DEVASTATING_WOUNDS",
              requiredAttackerKeywords: ["CRYPTEK", "CANOPTEK"],
              requiresAttackerWithinPowerMatrix: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "canoptek_court" &&
      stratagemName.includes("curse of the cryptek")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Curse of the Cryptek Effect",
          description: "Canoptek attacks gain +1 to hit and +1 to wound.",
          phase,
          modifiers: [
            {
              type: "HIT_MODIFIER",
              value: 1,
              requiredAttackerKeywords: ["CANOPTEK"],
            },
            {
              type: "WOUND_MODIFIER",
              value: 1,
              requiredAttackerKeywords: ["CANOPTEK"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "canoptek_court" &&
      stratagemName.includes("solar pulse")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Solar Pulse Effect",
          description:
            "Attacks targeting units within the selected objective range ignore cover.",
          phase,
          modifiers: [
            {
              type: "IGNORES_COVER",
              requiresTargetWithinObjectiveRange: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "canoptek_harvesters" &&
      stratagemName.includes("targeting algorithms")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Targeting Algorithms Effect",
          description: "Cryptek attacks re-roll hits and wounds.",
          phase,
          modifiers: [
            {
              type: "REROLL_HITS",
              requiredAttackerKeywords: ["CRYPTEK"],
            },
            {
              type: "REROLL_WOUNDS",
              requiredAttackerKeywords: ["CRYPTEK"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "auxiliary_cadre" &&
      stratagemName.includes("guided fire")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Guided Fire Effect",
          description:
            "Non-Kroot, non-Vespid ranged attacks gain +1 Strength.",
          phase,
          modifiers: [
            {
              type: "STRENGTH_MODIFIER",
              value: 1,
              attackType: "ranged",
              excludedAttackerKeywords: ["KROOT", "VESPID STINGWINGS"],
            },
          ],
        }),
        createImplementedRuleOption({
          id: `${stratagem.id}-support-effect`,
          name: "Guided Fire Support Bonus",
          description:
            "If the unit is near friendly Kroot or Vespid support, it gains an additional +1 Strength.",
          phase,
          modifiers: [
            {
              type: "STRENGTH_MODIFIER",
              value: 1,
              attackType: "ranged",
              excludedAttackerKeywords: ["KROOT", "VESPID STINGWINGS"],
              requiresAttackerWithinAuxiliarySupportRange: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "auxiliary_cadre" &&
      stratagemName.includes("multisensory scanning")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-reroll-ones-effect`,
          name: "Multisensory Scanning: Re-roll Wound Rolls of 1",
          description: "The unit re-rolls wound rolls of 1.",
          phase,
          modifiers: [{ type: "REROLL_WOUNDS_ONES" }],
        }),
        createImplementedRuleOption({
          id: `${stratagem.id}-full-reroll-effect`,
          name: "Multisensory Scanning: Full Wound Re-rolls",
          description: "Kroot and Vespid Stingwings units re-roll wound rolls.",
          phase,
          modifiers: [
            {
              type: "REROLL_WOUNDS",
              requiredAttackerKeywords: ["KROOT", "VESPID STINGWINGS"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "auxiliary_cadre" &&
      stratagemName.includes("experimental modifications")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Experimental Modifications Effect",
          description: "Kroot and Vespid Stingwings weapons improve AP by 1.",
          phase,
          modifiers: [
            {
              type: "AP_MODIFIER",
              value: 1,
              requiredAttackerKeywords: ["KROOT", "VESPID STINGWINGS"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "berzerker_warband" &&
      stratagemName.includes("hack and slash")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Hack and Slash Effect",
          description:
            "Charging melee attacks improve AP by 1 until the end of the phase.",
          phase,
          modifiers: [
            {
              type: "AP_MODIFIER",
              value: 1,
              attackType: "melee",
              requiresChargeTurn: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "berzerker_warband" &&
      stratagemName.includes("frenzied resilience")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedDefenderRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Frenzied Resilience Effect",
          description:
            "Attacks targeting the unit have their Damage reduced by 1.",
          phase,
          modifiers: [{ type: "DAMAGE_REDUCTION", value: 1 }],
        }),
      ]);
    }

    if (
      detachment.id === "boarding_butchers" &&
      stratagemName.includes("savage resilience")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedDefenderRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Savage Resilience Effect",
          description:
            "Attacks targeting the unit have their Damage reduced by 1.",
          phase,
          modifiers: [{ type: "DAMAGE_REDUCTION", value: 1 }],
        }),
      ]);
    }

    if (
      detachment.id === "boarding_butchers" &&
      stratagemName.includes("unstoppable rage")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedDefenderRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Unstoppable Rage Effect",
          description:
            "Stunned enemy units suffer -1 to hit while they attack this turn.",
          phase,
          modifiers: [{ type: "HIT_MODIFIER", value: -1 }],
        }),
      ]);
    }

    if (
      detachment.id === "cult_of_blood" &&
      stratagemName.includes("bloody vengeance")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Bloody Vengeance Effect",
          description:
            "Jakhals and Goremongers re-roll hits against the enemy that destroyed your Monster or Titanic unit.",
          phase,
          modifiers: [
            {
              type: "REROLL_HITS",
              requiredAttackerKeywords: ["JAKHALS", "GOREMONGERS"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "cult_of_blood" &&
      stratagemName.includes("fail not the blood god")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-reroll-ones-effect`,
          name: "Fail Not the Blood God: Re-roll Hit Rolls of 1",
          description:
            "Jakhals and Goremongers re-roll hit rolls of 1 in melee.",
          phase,
          modifiers: [
            {
              type: "REROLL_HITS_ONES",
              attackType: "melee",
              requiredAttackerKeywords: ["JAKHALS", "GOREMONGERS"],
            },
          ],
        }),
        createImplementedRuleOption({
          id: `${stratagem.id}-full-reroll-effect`,
          name: "Fail Not the Blood God: Full Hit Re-rolls",
          description:
            "Jakhals and Goremongers within Monster or Titanic support range re-roll hits in melee.",
          phase,
          modifiers: [
            {
              type: "REROLL_HITS",
              attackType: "melee",
              requiredAttackerKeywords: ["JAKHALS", "GOREMONGERS"],
              requiresAttackerWithinFriendlyMonsterAura: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "cult_of_blood" &&
      stratagemName.includes("shadow of brass idols")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedDefenderRuleOption({
          id: `${stratagem.id}-base-effect`,
          name: "In the Shadow of Brass Idols: Feel No Pain 6+",
          description:
            "Jakhals and Goremongers gain Feel No Pain 6+ while targeted.",
          phase,
          modifiers: [
            {
              type: "FEEL_NO_PAIN",
              value: 6,
              requiredDefenderKeywords: ["JAKHALS", "GOREMONGERS"],
            },
          ],
        }),
        createImplementedDefenderRuleOption({
          id: `${stratagem.id}-aura-effect`,
          name: "In the Shadow of Brass Idols: Feel No Pain 5+",
          description:
            "Jakhals and Goremongers within Monster or Titanic support gain Feel No Pain 5+ instead.",
          phase,
          modifiers: [
            {
              type: "FEEL_NO_PAIN",
              value: 5,
              requiredDefenderKeywords: ["JAKHALS", "GOREMONGERS"],
              requiresAttackerWithinFriendlyMonsterAura: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "cryptek_conclave" &&
      stratagemName.includes("animus curse")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Animus Curse Effect",
          description: "Re-roll hit rolls against the cursed unit.",
          phase,
          modifiers: [{ type: "REROLL_HITS" }],
        }),
      ]);
    }

    if (
      detachment.id === "cursed_legion" &&
      stratagemName.includes("methodical murder")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Methodical Murder Effect",
          description: "Non-Monster, non-Vehicle units gain Sustained Hits 1.",
          phase,
          modifiers: [
            {
              type: "SUSTAINED_HITS",
              value: 1,
              excludedAttackerKeywords: ["MONSTER", "VEHICLE", "TITANIC"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "experimental_prototype_cadre" &&
      stratagemName.includes("experimental weaponry")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Experimental Weaponry Effect",
          description:
            "Ranged weapons can re-roll the result when determining the number of attacks.",
          phase,
          modifiers: [{ type: "REROLL_ATTACKS", attackType: "ranged" }],
        }),
      ]);
    }

    if (
      detachment.id === "khorne_daemonkin" &&
      stratagemName.includes("daemonic fury")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Daemonic Fury Effect",
          description:
            "The targeted World Eaters unit gains Lance on melee weapons.",
          phase,
          modifiers: [{ type: "LANCE", attackType: "melee" }],
        }),
      ]);
    }

    if (
      detachment.id === "khorne_daemonkin" &&
      stratagemName.includes("burning blood")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedDefenderRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Blessing of Burning Blood: Invulnerable Save 5+",
          description:
            "The targeted World Eaters unit gains a 5+ invulnerable save. The stronger 4+ mode still needs explicit support for mode selection.",
          phase,
          modifiers: [{ type: "INVULNERABLE_SAVE", value: 5 }],
        }),
      ]);
    }

    if (
      detachment.id === "experimental_prototype_cadre" &&
      stratagemName.includes("threat assessment analyser")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-sustained-effect`,
          name: "Threat Assessment Analyser: Sustained Hits 1",
          description: "Ranged weapons gain Sustained Hits 1.",
          phase,
          modifiers: [
            { type: "SUSTAINED_HITS", value: 1, attackType: "ranged" },
          ],
        }),
        createImplementedRuleOption({
          id: `${stratagem.id}-lethal-effect`,
          name: "Threat Assessment Analyser: Lethal Hits",
          description: "Ranged weapons gain Lethal Hits.",
          phase,
          modifiers: [{ type: "LETHAL_HITS", attackType: "ranged" }],
        }),
        createImplementedRuleOption({
          id: `${stratagem.id}-hazardous-effect`,
          name: "Threat Assessment Analyser: Full Risk Mode",
          description:
            "Ranged weapons gain Sustained Hits 1, Lethal Hits and Hazardous.",
          phase,
          modifiers: [
            { type: "SUSTAINED_HITS", value: 1, attackType: "ranged" },
            { type: "LETHAL_HITS", attackType: "ranged" },
            { type: "HAZARDOUS", attackType: "ranged" },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "experimental_prototype_cadre" &&
      stratagemName.includes("experimental ammunition")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-strength-effect`,
          name: "Experimental Ammunition: +1 Strength",
          description: "Ranged weapons gain +1 Strength.",
          phase,
          modifiers: [
            { type: "STRENGTH_MODIFIER", value: 1, attackType: "ranged" },
          ],
        }),
        createImplementedRuleOption({
          id: `${stratagem.id}-overcharge-effect`,
          name: "Experimental Ammunition: Overcharge",
          description:
            "Ranged weapons gain +1 Strength, +1 AP and Hazardous.",
          phase,
          modifiers: [
            { type: "STRENGTH_MODIFIER", value: 1, attackType: "ranged" },
            { type: "AP_MODIFIER", value: 1, attackType: "ranged" },
            { type: "HAZARDOUS", attackType: "ranged" },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "experimental_prototype_cadre" &&
      stratagemName.includes("reactive impact dampeners")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedDefenderRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Reactive Impact Dampeners Effect",
          description:
            "Attacks with Strength greater than the Battlesuit unit's Toughness suffer -1 to wound.",
          phase,
          modifiers: [
            {
              type: "WOUND_MODIFIER",
              value: -1,
              requiresAttackStrengthGreaterThanTargetToughness: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "experimental_prototype_cadre" &&
      stratagemName.includes("neuroweb system jammer")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedDefenderRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Neuroweb System Jammer Effect",
          description:
            "The targeted Crisis unit can only be selected as the target of ranged attacks from within 18\".",
          phase,
          modifiers: [
            {
              type: "TARGETING_RANGE_LIMIT",
              value: 18,
              attackType: "ranged",
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "kroot_hunting_pack" &&
      stratagemName.includes("trap well laid")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "A Trap Well Laid Effect",
          description:
            "Kroot attacks against the trapped enemy unit improve AP by 1.",
          phase,
          modifiers: [
            {
              type: "AP_MODIFIER",
              value: 1,
              requiredAttackerKeywords: ["KROOT"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "kroot_hunting_pack" &&
      stratagemName.includes("hidden hunters")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedDefenderRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Hidden Hunters Effect",
          description:
            "The targeted Kroot unit can only be selected as the target of ranged attacks from within 18\".",
          phase,
          modifiers: [
            {
              type: "TARGETING_RANGE_LIMIT",
              value: 18,
              attackType: "ranged",
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "kroot_hunting_pack" &&
      stratagemName.includes("emp grenades")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedDefenderRuleOption({
          id: `${stratagem.id}-effect`,
          name: "EMP Grenades Effect",
          description:
            "Enemy Vehicle attacks suffer -1 to hit while the interference lasts.",
          phase,
          modifiers: [
            {
              type: "HIT_MODIFIER",
              value: -1,
              requiredAttackerKeywords: ["VEHICLE"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "kroot_raiding_party" &&
      stratagemName.includes("boarding blades")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-ap-effect`,
          name: "Boarding Blades: AP Bonus",
          description: "Kroot melee weapons improve AP by 1.",
          phase,
          modifiers: [
            {
              type: "AP_MODIFIER",
              value: 1,
              attackType: "melee",
              requiredAttackerKeywords: ["KROOT"],
            },
          ],
        }),
        createImplementedRuleOption({
          id: `${stratagem.id}-critical-ap-effect`,
          name: "Boarding Blades: Critical Wound AP",
          description:
            "Critical wounds from Kroot melee attacks improve AP by an additional 1.",
          phase,
          modifiers: [
            {
              type: "CRITICAL_WOUND_AP_MODIFIER",
              value: 1,
              attackType: "melee",
              requiredAttackerKeywords: ["KROOT"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "kauyon" &&
      stratagemName.includes("coordinate to engage")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-hit-effect`,
          name: "Coordinate to Engage: Hit Bonus",
          description:
            "Attacks against the unit's spotted target gain +1 to hit.",
          phase,
          modifiers: [
            {
              type: "HIT_MODIFIER",
              value: 1,
              attackType: "ranged",
              requiresTargetSpotted: true,
            },
          ],
        }),
        createImplementedRuleOption({
          id: `${stratagem.id}-cover-effect`,
          name: "Coordinate to Engage: Ignores Cover",
          description:
            "Markerlight attacks against the unit's spotted target ignore cover.",
          phase,
          modifiers: [
            {
              type: "IGNORES_COVER",
              attackType: "ranged",
              requiredAttackerKeywords: ["MARKERLIGHT"],
              requiresTargetSpotted: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "kauyon" &&
      stratagemName.includes("point-blank ambush")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Point-blank Ambush Effect",
          description:
            "From battle round 3 onwards, ranged attacks within 9\" improve AP by 1.",
          phase,
          modifiers: [
            {
              type: "AP_MODIFIER",
              value: 1,
              attackType: "ranged",
              requiresBattleRoundAtLeast: 3,
              requiresTargetWithinRange: 9,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "kauyon" &&
      stratagemName.includes("tempting trap")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "A Tempting Trap Effect",
          description:
            "From battle round 3 onwards, ranged attacks against enemies in trap objective range gain +1 to wound.",
          phase,
          modifiers: [
            {
              type: "WOUND_MODIFIER",
              value: 1,
              attackType: "ranged",
              requiresBattleRoundAtLeast: 3,
              requiresTargetWithinObjectiveRange: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "mont_ka" &&
      stratagemName.includes("focused fire")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Focused Fire Effect",
          description:
            "Until battle round 3, ranged attacks improve AP by 1.",
          phase,
          modifiers: [
            {
              type: "AP_MODIFIER",
              value: 1,
              attackType: "ranged",
              requiresBattleRoundAtMost: 3,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "mont_ka" &&
      stratagemName.includes("pinpoint counter-offensive")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Pinpoint Counter-offensive Effect",
          description:
            "Non-Kroot attacks re-roll hits against the marked enemy unit.",
          phase,
          modifiers: [
            {
              type: "REROLL_HITS",
              excludedAttackerKeywords: ["KROOT"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "mont_ka" &&
      stratagemName.includes("combat debarkation")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Combat Debarkation Effect",
          description:
            "Infantry ranged attacks re-roll wounds against the closest eligible target.",
          phase,
          modifiers: [
            {
              type: "REROLL_WOUNDS",
              attackType: "ranged",
              requiredAttackerKeywords: ["INFANTRY"],
              requiresAttackerDisembarkedThisTurn: true,
              requiresTargetIsClosestEligible: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "mont_ka" &&
      stratagemName.includes("counterfire defence systems")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedDefenderRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Counterfire Defence Systems Effect",
          description:
            "Attacks allocated to the unit have their Damage reduced by 1.",
          phase,
          modifiers: [{ type: "DAMAGE_REDUCTION", value: 1 }],
        }),
      ]);
    }

    if (
      detachment.id === "obeisance_phalanx" &&
      stratagemName.includes("enslaved artifice")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Enslaved Artifice Effect",
          description:
            "Non-Titanic units score critical hits on 5+ until the end of the phase.",
          phase,
          modifiers: [
            {
              type: "CRITICAL_HITS_ON",
              value: 5,
              excludedAttackerKeywords: ["TITANIC"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "pantheon_of_woe" &&
      stratagemName.includes("entrophasic aura targeting")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-hit-effect`,
          name: "Entrophasic Aura Targeting: Re-roll Hit Rolls of 1",
          description: "Non-Monster units re-roll hit rolls of 1.",
          phase,
          modifiers: [
            {
              type: "REROLL_HITS_ONES",
              excludedAttackerKeywords: ["MONSTER"],
            },
          ],
        }),
        createImplementedRuleOption({
          id: `${stratagem.id}-wound-effect`,
          name: "Entrophasic Aura Targeting: Re-roll Wound Rolls of 1",
          description:
            "Non-Monster units re-roll wound rolls of 1 against unravelling targets.",
          phase,
          modifiers: [
            {
              type: "REROLL_WOUNDS_ONES",
              excludedAttackerKeywords: ["MONSTER"],
              requiresTargetUnravelling: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "possessed_slaughterband" &&
      stratagemName.includes("daemonic resistance")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedDefenderRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Daemonic Resistance Effect",
          description:
            "Attacks targeting the Possessed unit suffer -1 to wound.",
          phase,
          modifiers: [{ type: "WOUND_MODIFIER", value: -1 }],
        }),
      ]);
    }

    if (
      detachment.id === "possessed_slaughterband" &&
      stratagemName.includes("daemonic strength")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-eightbound-effect`,
          name: "Daemonic Strength: Eightbound Bonus",
          description:
            "Eightbound melee attacks gain +1 Damage against non-Monster, non-Vehicle targets.",
          phase,
          modifiers: [
            {
              type: "DAMAGE_MODIFIER",
              value: 1,
              attackType: "melee",
              requiredAttackerKeywords: ["EIGHTBOUND"],
              excludedDefenderKeywords: ["MONSTER", "VEHICLE"],
            },
          ],
        }),
        createImplementedRuleOption({
          id: `${stratagem.id}-exalted-effect`,
          name: "Daemonic Strength: Exalted Eightbound Bonus",
          description:
            "Exalted Eightbound melee attacks gain +1 Damage against Monster and Vehicle targets.",
          phase,
          modifiers: [
            {
              type: "DAMAGE_MODIFIER",
              value: 1,
              attackType: "melee",
              requiredAttackerKeywords: ["EXALTED EIGHTBOUND"],
              requiredDefenderKeywords: ["MONSTER", "VEHICLE"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "retaliation_cadre" &&
      stratagemName.includes("stimm injectors")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedDefenderRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Stimm Injectors Effect",
          description: "Battlesuit models gain Feel No Pain 6+ while targeted.",
          phase,
          modifiers: [{ type: "FEEL_NO_PAIN", value: 6 }],
        }),
      ]);
    }

    if (
      detachment.id === "retaliation_cadre" &&
      stratagemName.includes("arro")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-sustained-1-effect`,
          name: "The Arro'kon Protocol: Sustained Hits 1",
          description:
            "Battlesuit ranged attacks gain Sustained Hits 1 against units with 6+ models.",
          phase,
          modifiers: [
            {
              type: "SUSTAINED_HITS",
              value: 1,
              attackType: "ranged",
              requiredAttackerKeywords: ["BATTLESUIT"],
              requiresTargetModelCountAtLeast: 6,
            },
          ],
        }),
        createImplementedRuleOption({
          id: `${stratagem.id}-sustained-2-effect`,
          name: "The Arro'kon Protocol: Sustained Hits 2",
          description:
            "Battlesuit ranged attacks gain Sustained Hits 2 against units with 11+ models.",
          phase,
          modifiers: [
            {
              type: "SUSTAINED_HITS",
              value: 2,
              attackType: "ranged",
              requiredAttackerKeywords: ["BATTLESUIT"],
              requiresTargetModelCountAtLeast: 11,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "starfire_cadre" &&
      stratagemName.includes("responsive volley")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Responsive Volley Effect",
          description:
            "Fire Warrior and Pathfinder ranged attacks score critical hits on 5+ against enemies on the opposite side of a hatchway.",
          phase,
          modifiers: [
            {
              type: "CRITICAL_HITS_ON",
              value: 5,
              attackType: "ranged",
              requiredAttackerKeywords: ["FIRE WARRIOR", "PATHFINDER TEAM"],
              requiresTargetOppositeHatchway: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "starfire_cadre" &&
      stratagemName.includes("pulse barrage")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Pulse Barrage Effect",
          description:
            "Fire Warrior and Pathfinder Overwatch attacks hit on unmodified 5+.",
          phase,
          modifiers: [
            {
              type: "FIXED_HIT_ROLL",
              value: 5,
              attackType: "ranged",
              requiredAttackerKeywords: ["FIRE WARRIOR", "PATHFINDER TEAM"],
              requiresAttackerFiringOverwatch: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "starfire_cadre" &&
      stratagemName.includes("firing line")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Firing Line Effect",
          description:
            "Fire Warrior and Pathfinder snapshot attacks within 9\" hit on unmodified 5+.",
          phase,
          modifiers: [
            {
              type: "FIXED_HIT_ROLL",
              value: 5,
              attackType: "ranged",
              requiredAttackerKeywords: ["FIRE WARRIOR", "PATHFINDER TEAM"],
              requiresTargetWithinRange: 9,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "solar_spearhead" &&
      stratagemName.includes("punishment inescapable")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Punishment Inescapable Effect",
          description: "Ranged weapons gain Ignores Cover.",
          phase,
          modifiers: [{ type: "IGNORES_COVER" }],
        }),
      ]);
    }

    if (
      detachment.id === "starshatter_arsenal" &&
      stratagemName.includes("merciless reclamation")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Merciless Reclamation Effect",
          description:
            "Non-Monster, non-Titanic units gain +1 to wound against targets within objective range.",
          phase,
          modifiers: [
            {
              type: "WOUND_MODIFIER",
              value: 1,
              requiresTargetWithinObjectiveRange: true,
              excludedAttackerKeywords: ["MONSTER", "TITANIC"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "vessels_of_wrath" &&
      stratagemName.includes("brazen contempt")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedDefenderRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Brazen Contempt Effect",
          description:
            "Attacks with Strength greater than the unit's Toughness suffer -1 to wound.",
          phase,
          modifiers: [
            {
              type: "WOUND_MODIFIER",
              value: -1,
              requiresAttackStrengthGreaterThanTargetToughness: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "vessels_of_wrath" &&
      stratagemName.includes("aspire to infamy")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Aspire to Infamy Effect",
          description:
            "Khorne Berzerkers and Jakhals within Character support range gain +1 Strength and +1 AP in melee.",
          phase,
          modifiers: [
            {
              type: "STRENGTH_MODIFIER",
              value: 1,
              attackType: "melee",
              requiredAttackerKeywords: ["KHORNE BERZERKERS", "JAKHALS"],
              requiresAttackerWithinFriendlyCharacterRange: true,
            },
            {
              type: "AP_MODIFIER",
              value: 1,
              attackType: "melee",
              requiredAttackerKeywords: ["KHORNE BERZERKERS", "JAKHALS"],
              requiresAttackerWithinFriendlyCharacterRange: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "vessels_of_wrath" &&
      stratagemName.includes("overshadowed by none")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Overshadowed by None Effect",
          description:
            "Melee attacks re-roll wounds against Monster and Vehicle targets.",
          phase,
          modifiers: [
            {
              type: "REROLL_WOUNDS",
              attackType: "melee",
              requiredDefenderKeywords: ["MONSTER", "VEHICLE"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "tomb_ship_complement" &&
      stratagemName.includes("concentrated atomisation")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Concentrated Atomisation Effect",
          description:
            "Necron Warriors and Immortals re-roll hit rolls in shooting.",
          phase,
          modifiers: [
            {
              type: "REROLL_HITS",
              attackType: "ranged",
              requiredAttackerKeywords: ["NECRON WARRIORS", "IMMORTALS"],
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "tomb_ship_complement" &&
      stratagemName.includes("unwavering defence")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Unwavering Defence Effect",
          description:
            "Units set to defend gain Sustained Hits 2 on melee weapons.",
          phase,
          modifiers: [
            {
              type: "SUSTAINED_HITS",
              value: 2,
              attackType: "melee",
              requiresAttackerSetToDefend: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "tomb_ship_complement" &&
      stratagemName.includes("disruption fields")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Disruption Fields Effect",
          description: "Melee weapons gain +1 Strength.",
          phase,
          modifiers: [{ type: "STRENGTH_MODIFIER", value: 1, attackType: "melee" }],
        }),
      ]);
    }

    if (
      detachment.id === "talons_of_the_emperor" &&
      stratagemName.includes("executioners")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Emperor's Executioners Effect",
          description: "Add 1 to wound rolls against targets below starting strength.",
          phase,
          modifiers: [
            {
              type: "WOUND_MODIFIER",
              value: 1,
              attackType: "melee",
              requiresTargetBelowStartingStrength: true,
            },
          ],
        }),
      ]);
    }

    if (
      detachment.id === "talons_of_the_emperor" &&
      stratagemName.includes("talons interlocked")
    ) {
      return createImplementedStratagem(detachment, stratagem, phase, [
        createImplementedRuleOption({
          id: `${stratagem.id}-effect`,
          name: "Talons Interlocked Effect",
          description:
            "Improve the Strength and AP characteristics of ranged attacks by 1.",
          phase,
          modifiers: [
            { type: "STRENGTH_MODIFIER", value: 1, attackType: "ranged" },
            { type: "AP_MODIFIER", value: 1, attackType: "ranged" },
          ],
        }),
      ]);
    }

    return {
      id: stratagem.id,
      name: stratagem.name,
      description: stratagem.description,
      cpCost: stratagem.cpCost ?? 1,
      phase,
      supportLevel: "info-only",
      effects: [],
    };
  });
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

function summarizeDetachmentDescription(
  detachment: NormalizedDetachment
): string {
  const explicitDescription = cleanShortText(detachment.description);

  if (explicitDescription) {
    return explicitDescription;
  }

  const firstAbility = detachment.abilities[0];
  if (!firstAbility) {
    return "";
  }

  const cleanedAbilityDescription = cleanShortText(firstAbility.description);
  if (!cleanedAbilityDescription) {
    return firstAbility.name;
  }

  const firstSentence = getFirstSentence(cleanedAbilityDescription);
  return firstSentence
    ? `${firstAbility.name}: ${firstSentence}`
    : `${firstAbility.name}: ${cleanedAbilityDescription}`;
}

function cleanShortText(value?: string): string {
  if (!value) {
    return "";
  }

  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/li>/gi, " ")
    .replace(/<li>/gi, " ")
    .replace(/<\/(ul|ol|p|div|table|tr|td|tbody)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function getFirstSentence(value: string): string {
  const normalized = value.trim();
  if (!normalized) {
    return "";
  }

  const match = normalized.match(/(.+?[.!?])(?:\s|$)/);
  const sentence = match ? match[1] : normalized;

  if (sentence.length <= 180) {
    return sentence;
  }

  return `${sentence.slice(0, 177).trimEnd()}...`;
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

function createImplementedEnhancement(
  enhancement: NormalizedDetachment["enhancements"][number],
  phase: RuleOption["phase"],
  effects: RuleOption[]
): EnhancementConfig {
  return {
    id: enhancement.id,
    name: enhancement.name,
    description: enhancement.description,
    supportLevel: "implemented",
    effects: effects.map((effect) => ({
      ...effect,
      phase,
    })),
  };
}

function createImplementedStratagem(
  detachment: NormalizedDetachment,
  stratagem: NormalizedDetachment["stratagems"][number],
  phase: StratagemConfig["phase"],
  effects: RuleOption[]
): StratagemConfig {
  void detachment;

  return {
    id: stratagem.id,
    name: stratagem.name,
    description: stratagem.description,
    cpCost: stratagem.cpCost ?? 1,
    phase,
    supportLevel: "implemented",
    effects: effects.map((effect) => ({
      ...effect,
      phase,
    })),
  };
}

function createImplementedRuleOption(params: {
  id: string;
  name: string;
  description: string;
  phase: RuleOption["phase"];
  modifiers: RuleOption["modifiers"];
}): RuleOption {
  return {
    id: params.id,
    name: params.name,
    description: params.description,
    appliesTo: "attacker",
    phase: params.phase,
    isToggle: true,
    supportLevel: "implemented",
    modifiers: params.modifiers,
    engineTags: [],
  };
}

function createImplementedDefenderRuleOption(params: {
  id: string;
  name: string;
  description: string;
  phase: RuleOption["phase"];
  modifiers: RuleOption["modifiers"];
}): RuleOption {
  return {
    id: params.id,
    name: params.name,
    description: params.description,
    appliesTo: "defender",
    phase: params.phase,
    isToggle: true,
    supportLevel: "implemented",
    modifiers: params.modifiers,
    engineTags: [],
  };
}
