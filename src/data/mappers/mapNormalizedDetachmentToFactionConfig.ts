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
