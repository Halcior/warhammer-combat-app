import type { Unit } from "../types/combat";

export const adeptusCustodesGeneratedUnits: Unit[] = [
  {
    "id": "custodian_guard",
    "name": "Custodian Guard",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "custodian_guard_guardian_spear_1",
        "name": "Guardian spear",
        "attacks": 2,
        "skill": 2,
        "strength": 4,
        "ap": -1,
        "damage": 2,
        "type": "ranged",
        "specialRules": [
          {
            "type": "ASSAULT"
          }
        ]
      },
      {
        "id": "custodian_guard_sentinel_blade_2",
        "name": "Sentinel blade",
        "attacks": 2,
        "skill": 2,
        "strength": 4,
        "ap": -1,
        "damage": 2,
        "type": "ranged",
        "specialRules": [
          {
            "type": "ASSAULT"
          },
          {
            "type": "PISTOL"
          }
        ]
      },
      {
        "id": "custodian_guard_guardian_spear_3",
        "name": "Guardian spear",
        "attacks": 5,
        "skill": 2,
        "strength": 7,
        "ap": -2,
        "damage": 2,
        "type": "melee",
        "specialRules": []
      },
      {
        "id": "custodian_guard_misericordia_4",
        "name": "Misericordia",
        "attacks": 5,
        "skill": 2,
        "strength": 5,
        "ap": -2,
        "damage": 1,
        "type": "melee",
        "specialRules": []
      },
      {
        "id": "custodian_guard_sentinel_blade_5",
        "name": "Sentinel blade",
        "attacks": 5,
        "skill": 2,
        "strength": 6,
        "ap": -2,
        "damage": 1,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Imperium",
      "Custodian Guard",
      "Battleline",
      "Infantry"
    ],
    "specialRules": []
  },
  {
    "id": "venerable_contemptor_dreadnought",
    "name": "Venerable Contemptor Dreadnought",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "venerable_contemptor_dreadnought_combi_bolter_1",
        "name": "Combi-bolter",
        "attacks": 2,
        "skill": 2,
        "strength": 4,
        "ap": 0,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "RAPID_FIRE",
            "value": 2
          }
        ]
      },
      {
        "id": "venerable_contemptor_dreadnought_kheres_pattern_assault_cannon_2",
        "name": "Kheres-pattern assault cannon",
        "attacks": 6,
        "skill": 2,
        "strength": 7,
        "ap": -1,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "DEVASTATING_WOUNDS"
          }
        ]
      },
      {
        "id": "venerable_contemptor_dreadnought_multi_melta_3",
        "name": "Multi-melta",
        "attacks": 2,
        "skill": 2,
        "strength": 9,
        "ap": -4,
        "damage": "D6",
        "type": "ranged",
        "specialRules": [
          {
            "type": "MELTA",
            "value": 2
          }
        ]
      },
      {
        "id": "venerable_contemptor_dreadnought_contemptor_combat_weapon_4",
        "name": "Contemptor combat weapon",
        "attacks": 5,
        "skill": 2,
        "strength": 12,
        "ap": -2,
        "damage": 3,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Walker",
      "Imperium",
      "Venerable Contemptor Dreadnought",
      "Vehicle"
    ],
    "specialRules": []
  },
  {
    "id": "venerable_land_raider",
    "name": "Venerable Land Raider",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "venerable_land_raider_godhammer_lascannon_1",
        "name": "Godhammer lascannon",
        "attacks": 2,
        "skill": 2,
        "strength": 12,
        "ap": -3,
        "damage": "D6+1",
        "type": "ranged",
        "specialRules": []
      },
      {
        "id": "venerable_land_raider_hunter_killer_missile_2",
        "name": "Hunter-killer missile",
        "attacks": 1,
        "skill": 2,
        "strength": 14,
        "ap": -3,
        "damage": "D6",
        "type": "ranged",
        "specialRules": []
      },
      {
        "id": "venerable_land_raider_storm_bolter_3",
        "name": "Storm bolter",
        "attacks": 2,
        "skill": 2,
        "strength": 4,
        "ap": 0,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "RAPID_FIRE",
            "value": 2
          }
        ]
      },
      {
        "id": "venerable_land_raider_twin_heavy_bolter_4",
        "name": "Twin heavy bolter",
        "attacks": 3,
        "skill": 2,
        "strength": 5,
        "ap": -1,
        "damage": 2,
        "type": "ranged",
        "specialRules": [
          {
            "type": "SUSTAINED_HITS",
            "value": 1
          },
          {
            "type": "TWIN_LINKED"
          }
        ]
      },
      {
        "id": "venerable_land_raider_armoured_tracks_5",
        "name": "Armoured tracks",
        "attacks": 6,
        "skill": 4,
        "strength": 8,
        "ap": 0,
        "damage": 1,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Smoke",
      "Transport",
      "Imperium",
      "Vehicle",
      "Venerable Land Raider"
    ],
    "specialRules": []
  },
  {
    "id": "trajann_valoris",
    "name": "Trajann Valoris",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "trajann_valoris_eagle_s_scream_1",
        "name": "Eagle's Scream",
        "attacks": 2,
        "skill": 2,
        "strength": 5,
        "ap": -2,
        "damage": 3,
        "type": "ranged",
        "specialRules": [
          {
            "type": "ASSAULT"
          }
        ]
      },
      {
        "id": "trajann_valoris_watcher_s_axe_2",
        "name": "Watcher’s Axe",
        "attacks": 6,
        "skill": 2,
        "strength": 10,
        "ap": -2,
        "damage": 3,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Infantry",
      "Character",
      "Imperium",
      "Epic Hero",
      "Trajann Valoris"
    ],
    "specialRules": []
  },
  {
    "id": "shield_captain",
    "name": "Shield-captain",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "shield_captain_castellan_axe_1",
        "name": "Castellan axe",
        "attacks": 2,
        "skill": 2,
        "strength": 4,
        "ap": -1,
        "damage": 2,
        "type": "ranged",
        "specialRules": [
          {
            "type": "ASSAULT"
          }
        ]
      },
      {
        "id": "shield_captain_guardian_spear_2",
        "name": "Guardian spear",
        "attacks": 2,
        "skill": 2,
        "strength": 4,
        "ap": -1,
        "damage": 2,
        "type": "ranged",
        "specialRules": [
          {
            "type": "ASSAULT"
          }
        ]
      },
      {
        "id": "shield_captain_pyrithite_spear_3",
        "name": "Pyrithite spear",
        "attacks": 1,
        "skill": 2,
        "strength": 9,
        "ap": -4,
        "damage": "D6",
        "type": "ranged",
        "specialRules": [
          {
            "type": "MELTA",
            "value": 2
          }
        ]
      },
      {
        "id": "shield_captain_sentinel_blade_4",
        "name": "Sentinel blade",
        "attacks": 2,
        "skill": 2,
        "strength": 4,
        "ap": -1,
        "damage": 2,
        "type": "ranged",
        "specialRules": [
          {
            "type": "ASSAULT"
          },
          {
            "type": "PISTOL"
          }
        ]
      },
      {
        "id": "shield_captain_castellan_axe_5",
        "name": "Castellan axe",
        "attacks": 6,
        "skill": 2,
        "strength": 9,
        "ap": -1,
        "damage": 3,
        "type": "melee",
        "specialRules": []
      },
      {
        "id": "shield_captain_guardian_spear_6",
        "name": "Guardian spear",
        "attacks": 7,
        "skill": 2,
        "strength": 7,
        "ap": -2,
        "damage": 2,
        "type": "melee",
        "specialRules": []
      },
      {
        "id": "shield_captain_pyrithite_spear_7",
        "name": "Pyrithite spear",
        "attacks": 7,
        "skill": 2,
        "strength": 7,
        "ap": -2,
        "damage": 2,
        "type": "melee",
        "specialRules": []
      },
      {
        "id": "shield_captain_sentinel_blade_8",
        "name": "Sentinel blade",
        "attacks": 7,
        "skill": 2,
        "strength": 6,
        "ap": -2,
        "damage": 1,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Infantry",
      "Character",
      "Imperium",
      "Shield-Captain"
    ],
    "specialRules": []
  },
  {
    "id": "shield_captain_in_allarus_terminator_armour",
    "name": "Shield-captain In Allarus Terminator Armour",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "shield_captain_in_allarus_terminator_armour_balistus_grenade_launcher_1",
        "name": "Balistus grenade launcher",
        "attacks": "D6",
        "skill": 2,
        "strength": 4,
        "ap": -1,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "BLAST"
          }
        ]
      },
      {
        "id": "shield_captain_in_allarus_terminator_armour_castellan_axe_2",
        "name": "Castellan axe",
        "attacks": 2,
        "skill": 2,
        "strength": 4,
        "ap": -1,
        "damage": 2,
        "type": "ranged",
        "specialRules": [
          {
            "type": "ASSAULT"
          }
        ]
      },
      {
        "id": "shield_captain_in_allarus_terminator_armour_guardian_spear_3",
        "name": "Guardian spear",
        "attacks": 2,
        "skill": 2,
        "strength": 4,
        "ap": -1,
        "damage": 2,
        "type": "ranged",
        "specialRules": [
          {
            "type": "ASSAULT"
          }
        ]
      },
      {
        "id": "shield_captain_in_allarus_terminator_armour_castellan_axe_4",
        "name": "Castellan axe",
        "attacks": 6,
        "skill": 2,
        "strength": 9,
        "ap": -1,
        "damage": 3,
        "type": "melee",
        "specialRules": []
      },
      {
        "id": "shield_captain_in_allarus_terminator_armour_guardian_spear_5",
        "name": "Guardian spear",
        "attacks": 7,
        "skill": 2,
        "strength": 7,
        "ap": -2,
        "damage": 2,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Infantry",
      "Imperium",
      "Shield-Captain",
      "Terminator",
      "Character"
    ],
    "specialRules": []
  },
  {
    "id": "shield_captain_on_dawneagle_jetbike",
    "name": "Shield-captain On Dawneagle Jetbike",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "shield_captain_on_dawneagle_jetbike_vertus_hurricane_bolter_1",
        "name": "Vertus hurricane bolter",
        "attacks": 3,
        "skill": 2,
        "strength": 4,
        "ap": -1,
        "damage": 2,
        "type": "ranged",
        "specialRules": [
          {
            "type": "RAPID_FIRE",
            "value": 3
          },
          {
            "type": "TWIN_LINKED"
          }
        ]
      },
      {
        "id": "shield_captain_on_dawneagle_jetbike_salvo_launcher_2",
        "name": "Salvo launcher",
        "attacks": 1,
        "skill": 2,
        "strength": 10,
        "ap": -3,
        "damage": "D6+1",
        "type": "ranged",
        "specialRules": [
          {
            "type": "TWIN_LINKED"
          }
        ]
      },
      {
        "id": "shield_captain_on_dawneagle_jetbike_interceptor_lance_3",
        "name": "Interceptor lance",
        "attacks": 6,
        "skill": 2,
        "strength": 7,
        "ap": -2,
        "damage": 2,
        "type": "melee",
        "specialRules": [
          {
            "type": "LANCE"
          }
        ]
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Character",
      "Fly",
      "Imperium",
      "Dawneagle Jetbike",
      "Shield-Captain",
      "Mounted"
    ],
    "specialRules": []
  },
  {
    "id": "custodian_wardens",
    "name": "Custodian Wardens",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "custodian_wardens_castellan_axe_1",
        "name": "Castellan axe",
        "attacks": 2,
        "skill": 2,
        "strength": 4,
        "ap": -1,
        "damage": 2,
        "type": "ranged",
        "specialRules": [
          {
            "type": "ASSAULT"
          }
        ]
      },
      {
        "id": "custodian_wardens_guardian_spear_2",
        "name": "Guardian spear",
        "attacks": 2,
        "skill": 2,
        "strength": 4,
        "ap": -1,
        "damage": 2,
        "type": "ranged",
        "specialRules": [
          {
            "type": "ASSAULT"
          }
        ]
      },
      {
        "id": "custodian_wardens_castellan_axe_3",
        "name": "Castellan axe",
        "attacks": 4,
        "skill": 2,
        "strength": 9,
        "ap": -1,
        "damage": 3,
        "type": "melee",
        "specialRules": []
      },
      {
        "id": "custodian_wardens_guardian_spear_4",
        "name": "Guardian spear",
        "attacks": 5,
        "skill": 2,
        "strength": 7,
        "ap": -2,
        "damage": 2,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Imperium",
      "Infantry",
      "Custodian Wardens"
    ],
    "specialRules": []
  },
  {
    "id": "allarus_custodians",
    "name": "Allarus Custodians",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "allarus_custodians_balistus_grenade_launcher_1",
        "name": "Balistus grenade launcher",
        "attacks": "D6",
        "skill": 2,
        "strength": 4,
        "ap": -1,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "BLAST"
          }
        ]
      },
      {
        "id": "allarus_custodians_castellan_axe_2",
        "name": "Castellan axe",
        "attacks": 2,
        "skill": 2,
        "strength": 4,
        "ap": -1,
        "damage": 2,
        "type": "ranged",
        "specialRules": [
          {
            "type": "ASSAULT"
          }
        ]
      },
      {
        "id": "allarus_custodians_guardian_spear_3",
        "name": "Guardian spear",
        "attacks": 2,
        "skill": 2,
        "strength": 4,
        "ap": -1,
        "damage": 2,
        "type": "ranged",
        "specialRules": [
          {
            "type": "ASSAULT"
          }
        ]
      },
      {
        "id": "allarus_custodians_castellan_axe_4",
        "name": "Castellan axe",
        "attacks": 4,
        "skill": 2,
        "strength": 9,
        "ap": -1,
        "damage": 3,
        "type": "melee",
        "specialRules": []
      },
      {
        "id": "allarus_custodians_guardian_spear_5",
        "name": "Guardian spear",
        "attacks": 5,
        "skill": 2,
        "strength": 7,
        "ap": -2,
        "damage": 2,
        "type": "melee",
        "specialRules": []
      },
      {
        "id": "allarus_custodians_misericordia_6",
        "name": "Misericordia",
        "attacks": 5,
        "skill": 2,
        "strength": 5,
        "ap": -2,
        "damage": 1,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Infantry",
      "Imperium",
      "Allarus Custodians",
      "Terminator"
    ],
    "specialRules": []
  },
  {
    "id": "vertus_praetors",
    "name": "Vertus Praetors",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "vertus_praetors_salvo_launcher_1",
        "name": "Salvo launcher",
        "attacks": 1,
        "skill": 2,
        "strength": 10,
        "ap": -3,
        "damage": "D6+1",
        "type": "ranged",
        "specialRules": [
          {
            "type": "TWIN_LINKED"
          }
        ]
      },
      {
        "id": "vertus_praetors_vertus_hurricane_bolter_2",
        "name": "Vertus hurricane bolter",
        "attacks": 3,
        "skill": 2,
        "strength": 4,
        "ap": -1,
        "damage": 2,
        "type": "ranged",
        "specialRules": [
          {
            "type": "RAPID_FIRE",
            "value": 3
          },
          {
            "type": "TWIN_LINKED"
          }
        ]
      },
      {
        "id": "vertus_praetors_interceptor_lance_3",
        "name": "Interceptor lance",
        "attacks": 5,
        "skill": 2,
        "strength": 7,
        "ap": -2,
        "damage": 2,
        "type": "melee",
        "specialRules": [
          {
            "type": "LANCE"
          }
        ]
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Mounted",
      "Fly",
      "Imperium",
      "Vertus Praetors"
    ],
    "specialRules": []
  },
  {
    "id": "contemptor_achillus_dreadnought",
    "name": "Contemptor-achillus Dreadnought",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "contemptor_achillus_dreadnought_achillus_dreadspear_1",
        "name": "Achillus dreadspear",
        "attacks": 1,
        "skill": 2,
        "strength": 9,
        "ap": -2,
        "damage": 3,
        "type": "ranged",
        "specialRules": []
      },
      {
        "id": "contemptor_achillus_dreadnought_infernus_incinerator_2",
        "name": "Infernus incinerator",
        "attacks": "D6",
        "skill": 0,
        "strength": 6,
        "ap": -1,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "IGNORES_COVER"
          },
          {
            "type": "TORRENT"
          }
        ]
      },
      {
        "id": "contemptor_achillus_dreadnought_lastrum_storm_bolter_3",
        "name": "Lastrum storm bolter",
        "attacks": 2,
        "skill": 2,
        "strength": 5,
        "ap": -1,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "RAPID_FIRE",
            "value": 2
          }
        ]
      },
      {
        "id": "contemptor_achillus_dreadnought_twin_adrathic_destructor_4",
        "name": "Twin adrathic destructor",
        "attacks": 1,
        "skill": 2,
        "strength": 6,
        "ap": -2,
        "damage": 3,
        "type": "ranged",
        "specialRules": [
          {
            "type": "TWIN_LINKED"
          }
        ]
      },
      {
        "id": "contemptor_achillus_dreadnought_achillus_dreadspear_5",
        "name": "Achillus dreadspear",
        "attacks": 5,
        "skill": 2,
        "strength": 12,
        "ap": -2,
        "damage": "D6+1",
        "type": "melee",
        "specialRules": [
          {
            "type": "LANCE"
          }
        ]
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Imperium",
      "Vehicle",
      "Walker",
      "Contemptor-Achillus Dreadnought"
    ],
    "specialRules": []
  },
  {
    "id": "caladius_grav_tank",
    "name": "Caladius Grav-tank",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "caladius_grav_tank_twin_arachnus_heavy_blaze_cannon_1",
        "name": "Twin arachnus heavy blaze cannon",
        "attacks": 4,
        "skill": 2,
        "strength": 12,
        "ap": -3,
        "damage": "D6+2",
        "type": "ranged",
        "specialRules": [
          {
            "type": "TWIN_LINKED"
          }
        ]
      },
      {
        "id": "caladius_grav_tank_twin_iliastus_accelerator_cannon_2",
        "name": "Twin iliastus accelerator cannon",
        "attacks": 4,
        "skill": 2,
        "strength": 10,
        "ap": -1,
        "damage": 3,
        "type": "ranged",
        "specialRules": [
          {
            "type": "RAPID_FIRE",
            "value": 4
          },
          {
            "type": "TWIN_LINKED"
          }
        ]
      },
      {
        "id": "caladius_grav_tank_twin_lastrum_bolt_cannon_3",
        "name": "Twin lastrum bolt cannon",
        "attacks": 3,
        "skill": 2,
        "strength": 6,
        "ap": -1,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "SUSTAINED_HITS",
            "value": 1
          }
        ]
      },
      {
        "id": "caladius_grav_tank_armoured_hull_4",
        "name": "Armoured hull",
        "attacks": 4,
        "skill": 4,
        "strength": 6,
        "ap": 0,
        "damage": 1,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Imperium",
      "Caladius Grav-tank",
      "Vehicle",
      "Fly"
    ],
    "specialRules": []
  },
  {
    "id": "coronus_grav_carrier",
    "name": "Coronus Grav-carrier",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "coronus_grav_carrier_twin_arachnus_blaze_cannon_1",
        "name": "Twin arachnus blaze cannon",
        "attacks": 8,
        "skill": 2,
        "strength": 5,
        "ap": -1,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "TWIN_LINKED"
          },
          {
            "type": "DEVASTATING_WOUNDS"
          }
        ]
      },
      {
        "id": "coronus_grav_carrier_twin_lastrum_bolt_cannon_2",
        "name": "Twin lastrum bolt cannon",
        "attacks": 3,
        "skill": 2,
        "strength": 6,
        "ap": -1,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "SUSTAINED_HITS",
            "value": 1
          }
        ]
      },
      {
        "id": "coronus_grav_carrier_armoured_hull_3",
        "name": "Armoured hull",
        "attacks": 6,
        "skill": 4,
        "strength": 8,
        "ap": 0,
        "damage": 1,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Transport",
      "Fly",
      "Coronus Grav-carrier",
      "Imperium",
      "Vehicle"
    ],
    "specialRules": []
  },
  {
    "id": "telemon_heavy_dreadnought",
    "name": "Telemon Heavy Dreadnought",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "telemon_heavy_dreadnought_arachnus_storm_cannon_1",
        "name": "Arachnus storm cannon",
        "attacks": 12,
        "skill": 2,
        "strength": 6,
        "ap": -1,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "DEVASTATING_WOUNDS"
          }
        ]
      },
      {
        "id": "telemon_heavy_dreadnought_iliastus_accelerator_culverin_2",
        "name": "Iliastus accelerator culverin",
        "attacks": 4,
        "skill": 2,
        "strength": 9,
        "ap": -1,
        "damage": 3,
        "type": "ranged",
        "specialRules": []
      },
      {
        "id": "telemon_heavy_dreadnought_spiculus_bolt_launcher_3",
        "name": "Spiculus bolt launcher",
        "attacks": "D6+3",
        "skill": 2,
        "strength": 5,
        "ap": 0,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "BLAST"
          }
        ]
      },
      {
        "id": "telemon_heavy_dreadnought_twin_plasma_projector_4",
        "name": "Twin plasma projector",
        "attacks": "D3",
        "skill": 0,
        "strength": 7,
        "ap": -2,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "TWIN_LINKED"
          },
          {
            "type": "TORRENT"
          }
        ]
      },
      {
        "id": "telemon_heavy_dreadnought_armoured_feet_5",
        "name": "Armoured feet",
        "attacks": 5,
        "skill": 2,
        "strength": 7,
        "ap": 0,
        "damage": 1,
        "type": "melee",
        "specialRules": []
      },
      {
        "id": "telemon_heavy_dreadnought_telemon_caestus_6",
        "name": "Telemon caestus",
        "attacks": 5,
        "skill": 2,
        "strength": 12,
        "ap": -2,
        "damage": 3,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Telemon Heavy Dreadnought",
      "Imperium",
      "Walker",
      "Vehicle"
    ],
    "specialRules": []
  },
  {
    "id": "contemptor_galatus_dreadnought",
    "name": "Contemptor-galatus Dreadnought",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "contemptor_galatus_dreadnought_galatus_warblade_1",
        "name": "Galatus warblade",
        "attacks": "D6",
        "skill": 0,
        "strength": 6,
        "ap": -1,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "IGNORES_COVER"
          },
          {
            "type": "TWIN_LINKED"
          },
          {
            "type": "TORRENT"
          }
        ]
      },
      {
        "id": "contemptor_galatus_dreadnought_galatus_warblade_2",
        "name": "Galatus warblade",
        "attacks": 8,
        "skill": 2,
        "strength": 8,
        "ap": -2,
        "damage": 3,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Imperium",
      "Contemptor-Galatus Dreadnought",
      "Walker",
      "Vehicle"
    ],
    "specialRules": []
  },
  {
    "id": "aquilon_custodians",
    "name": "Aquilon Custodians",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "aquilon_custodians_infernus_firepike_1",
        "name": "Infernus firepike",
        "attacks": "D6",
        "skill": 0,
        "strength": 6,
        "ap": -1,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "IGNORES_COVER"
          },
          {
            "type": "TORRENT"
          }
        ]
      },
      {
        "id": "aquilon_custodians_lastrum_storm_bolter_2",
        "name": "Lastrum storm bolter",
        "attacks": 2,
        "skill": 2,
        "strength": 5,
        "ap": -1,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "RAPID_FIRE",
            "value": 2
          }
        ]
      },
      {
        "id": "aquilon_custodians_twin_adrathic_destructor_3",
        "name": "Twin adrathic destructor",
        "attacks": 1,
        "skill": 2,
        "strength": 6,
        "ap": -2,
        "damage": 3,
        "type": "ranged",
        "specialRules": [
          {
            "type": "TWIN_LINKED"
          }
        ]
      },
      {
        "id": "aquilon_custodians_solerite_power_gauntlet_4",
        "name": "Solerite power gauntlet",
        "attacks": 5,
        "skill": 2,
        "strength": 8,
        "ap": -2,
        "damage": 2,
        "type": "melee",
        "specialRules": []
      },
      {
        "id": "aquilon_custodians_solerite_power_talon_5",
        "name": "Solerite power talon",
        "attacks": 7,
        "skill": 2,
        "strength": 7,
        "ap": -2,
        "damage": 1,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Infantry",
      "Terminator",
      "Imperium",
      "Aquilon Custodians"
    ],
    "specialRules": []
  },
  {
    "id": "custodian_guard_with_adrasite_and_pyrithite_spears",
    "name": "Custodian Guard With Adrasite And Pyrithite Spears",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "custodian_guard_with_adrasite_and_pyrithite_spears_adrasite_spear_1",
        "name": "Adrasite spear",
        "attacks": 1,
        "skill": 2,
        "strength": 5,
        "ap": -2,
        "damage": 3,
        "type": "ranged",
        "specialRules": []
      },
      {
        "id": "custodian_guard_with_adrasite_and_pyrithite_spears_pyrithite_spear_2",
        "name": "Pyrithite spear",
        "attacks": 1,
        "skill": 2,
        "strength": 9,
        "ap": -4,
        "damage": "D6",
        "type": "ranged",
        "specialRules": [
          {
            "type": "MELTA",
            "value": 2
          }
        ]
      },
      {
        "id": "custodian_guard_with_adrasite_and_pyrithite_spears_adrasite_spear_3",
        "name": "Adrasite spear",
        "attacks": 5,
        "skill": 2,
        "strength": 7,
        "ap": -2,
        "damage": 2,
        "type": "melee",
        "specialRules": []
      },
      {
        "id": "custodian_guard_with_adrasite_and_pyrithite_spears_pyrithite_spear_4",
        "name": "Pyrithite spear",
        "attacks": 5,
        "skill": 2,
        "strength": 7,
        "ap": -2,
        "damage": 2,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Custodian Guard with Adrasite and Pyrithite Spears",
      "Imperium",
      "Infantry"
    ],
    "specialRules": []
  },
  {
    "id": "agamatus_custodians",
    "name": "Agamatus Custodians",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "agamatus_custodians_adrathic_devastator_1",
        "name": "Adrathic devastator",
        "attacks": 1,
        "skill": 2,
        "strength": 7,
        "ap": -2,
        "damage": 3,
        "type": "ranged",
        "specialRules": []
      },
      {
        "id": "agamatus_custodians_lastrum_bolt_cannon_2",
        "name": "Lastrum bolt cannon",
        "attacks": 3,
        "skill": 2,
        "strength": 6,
        "ap": -1,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "SUSTAINED_HITS",
            "value": 1
          }
        ]
      },
      {
        "id": "agamatus_custodians_twin_las_pulsar_3",
        "name": "Twin las-pulsar",
        "attacks": 2,
        "skill": 2,
        "strength": 9,
        "ap": -1,
        "damage": 2,
        "type": "ranged",
        "specialRules": [
          {
            "type": "TWIN_LINKED"
          }
        ]
      },
      {
        "id": "agamatus_custodians_interceptor_lance_4",
        "name": "Interceptor lance",
        "attacks": 5,
        "skill": 2,
        "strength": 7,
        "ap": -2,
        "damage": 2,
        "type": "melee",
        "specialRules": [
          {
            "type": "LANCE"
          }
        ]
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Imperium",
      "Agamatus Custodians",
      "Fly",
      "Mounted"
    ],
    "specialRules": []
  },
  {
    "id": "venatari_custodians",
    "name": "Venatari Custodians",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "venatari_custodians_kinetic_destroyer_1",
        "name": "Kinetic destroyer",
        "attacks": 2,
        "skill": 2,
        "strength": 6,
        "ap": -1,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "SUSTAINED_HITS",
            "value": 1
          },
          {
            "type": "PISTOL"
          }
        ]
      },
      {
        "id": "venatari_custodians_venatari_lance_2",
        "name": "Venatari lance",
        "attacks": 2,
        "skill": 2,
        "strength": 4,
        "ap": -1,
        "damage": 2,
        "type": "ranged",
        "specialRules": [
          {
            "type": "ASSAULT"
          }
        ]
      },
      {
        "id": "venatari_custodians_tarsis_buckler_3",
        "name": "Tarsis buckler",
        "attacks": 5,
        "skill": 2,
        "strength": 5,
        "ap": -2,
        "damage": 1,
        "type": "melee",
        "specialRules": []
      },
      {
        "id": "venatari_custodians_venatari_lance_4",
        "name": "Venatari lance",
        "attacks": 5,
        "skill": 2,
        "strength": 7,
        "ap": -2,
        "damage": 2,
        "type": "melee",
        "specialRules": [
          {
            "type": "LANCE"
          }
        ]
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Venatari Custodians",
      "Imperium",
      "Jump Pack",
      "Fly",
      "Infantry"
    ],
    "specialRules": []
  },
  {
    "id": "pallas_grav_attack",
    "name": "Pallas Grav-attack",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "pallas_grav_attack_twin_arachnus_blaze_cannon_1",
        "name": "Twin arachnus blaze cannon",
        "attacks": 8,
        "skill": 2,
        "strength": 5,
        "ap": -1,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "TWIN_LINKED"
          },
          {
            "type": "DEVASTATING_WOUNDS"
          }
        ]
      },
      {
        "id": "pallas_grav_attack_armoured_hull_2",
        "name": "Armoured hull",
        "attacks": 3,
        "skill": 4,
        "strength": 6,
        "ap": 0,
        "damage": 1,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Imperium",
      "Pallas Grav-attack",
      "Vehicle",
      "Fly"
    ],
    "specialRules": []
  },
  {
    "id": "sagittarum_custodians",
    "name": "Sagittarum Custodians",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "sagittarum_custodians_adrastus_bolt_caliver_1",
        "name": "Adrastus bolt caliver",
        "attacks": 3,
        "skill": 2,
        "strength": 5,
        "ap": -1,
        "damage": 2,
        "type": "ranged",
        "specialRules": [
          {
            "type": "SUSTAINED_HITS",
            "value": 1
          }
        ]
      },
      {
        "id": "sagittarum_custodians_misericordia_2",
        "name": "Misericordia",
        "attacks": 4,
        "skill": 2,
        "strength": 5,
        "ap": -2,
        "damage": 1,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Infantry",
      "Imperium",
      "Sagittarum Custodians"
    ],
    "specialRules": []
  },
  {
    "id": "orion_assault_dropship",
    "name": "Orion Assault Dropship",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "orion_assault_dropship_arachnus_heavy_blaze_cannon_1",
        "name": "Arachnus heavy blaze cannon",
        "attacks": 4,
        "skill": 2,
        "strength": 12,
        "ap": -3,
        "damage": "D6+1",
        "type": "ranged",
        "specialRules": []
      },
      {
        "id": "orion_assault_dropship_spiculus_heavy_bolt_launcher_2",
        "name": "Spiculus heavy bolt launcher",
        "attacks": "D6+6",
        "skill": 2,
        "strength": 7,
        "ap": -1,
        "damage": 2,
        "type": "ranged",
        "specialRules": [
          {
            "type": "BLAST"
          }
        ]
      },
      {
        "id": "orion_assault_dropship_twin_lastrum_bolt_cannon_3",
        "name": "Twin lastrum bolt cannon",
        "attacks": 3,
        "skill": 2,
        "strength": 6,
        "ap": -1,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "SUSTAINED_HITS",
            "value": 1
          }
        ]
      },
      {
        "id": "orion_assault_dropship_armoured_hull_4",
        "name": "Armoured hull",
        "attacks": 9,
        "skill": 4,
        "strength": 9,
        "ap": 0,
        "damage": 1,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Fly",
      "Imperium",
      "Orion Assault Dropship",
      "Vehicle",
      "Transport",
      "Aircraft"
    ],
    "specialRules": []
  },
  {
    "id": "ares_gunship",
    "name": "Ares Gunship",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "ares_gunship_arachnus_heavy_blaze_cannon_1",
        "name": "Arachnus heavy blaze cannon",
        "attacks": 4,
        "skill": 2,
        "strength": 12,
        "ap": -3,
        "damage": "D6+1",
        "type": "ranged",
        "specialRules": []
      },
      {
        "id": "ares_gunship_arachnus_magna_blaze_cannon_2",
        "name": "Arachnus magna-blaze cannon",
        "attacks": 3,
        "skill": 2,
        "strength": 18,
        "ap": -4,
        "damage": "D6+6",
        "type": "ranged",
        "specialRules": []
      },
      {
        "id": "ares_gunship_armoured_hull_3",
        "name": "Armoured hull",
        "attacks": 9,
        "skill": 4,
        "strength": 9,
        "ap": 0,
        "damage": 1,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Fly",
      "Aircraft",
      "Vehicle",
      "Ares Gunship",
      "Imperium"
    ],
    "specialRules": []
  },
  {
    "id": "aleya",
    "name": "Aleya",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "aleya_somnus_1",
        "name": "Somnus",
        "attacks": 4,
        "skill": 2,
        "strength": 6,
        "ap": -3,
        "damage": 3,
        "type": "melee",
        "specialRules": [
          {
            "type": "ANTI",
            "keyword": "psyker",
            "value": 5
          },
          {
            "type": "DEVASTATING_WOUNDS"
          }
        ]
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Character",
      "Imperium",
      "Anathema Psykana",
      "Aleya",
      "Infantry",
      "Epic Hero"
    ],
    "specialRules": []
  },
  {
    "id": "blade_champion",
    "name": "Blade Champion",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "blade_champion_vaultswords_behemor_1",
        "name": "Vaultswords – Behemor",
        "attacks": 6,
        "skill": 2,
        "strength": 7,
        "ap": -2,
        "damage": 2,
        "type": "melee",
        "specialRules": [
          {
            "type": "PRECISION"
          }
        ]
      },
      {
        "id": "blade_champion_vaultswords_hurricanus_2",
        "name": "Vaultswords – Hurricanus",
        "attacks": 9,
        "skill": 2,
        "strength": 5,
        "ap": -1,
        "damage": 1,
        "type": "melee",
        "specialRules": [
          {
            "type": "SUSTAINED_HITS",
            "value": 1
          }
        ]
      },
      {
        "id": "blade_champion_vaultswords_victus_3",
        "name": "Vaultswords – Victus",
        "attacks": 5,
        "skill": 2,
        "strength": 6,
        "ap": -3,
        "damage": 3,
        "type": "melee",
        "specialRules": [
          {
            "type": "DEVASTATING_WOUNDS"
          }
        ]
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Infantry",
      "Blade Champion",
      "Imperium",
      "Character"
    ],
    "specialRules": []
  },
  {
    "id": "valerian",
    "name": "Valerian",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "valerian_gnosis_1",
        "name": "Gnosis",
        "attacks": 3,
        "skill": 2,
        "strength": 4,
        "ap": -1,
        "damage": 2,
        "type": "ranged",
        "specialRules": [
          {
            "type": "ASSAULT"
          }
        ]
      },
      {
        "id": "valerian_gnosis_2",
        "name": "Gnosis",
        "attacks": 7,
        "skill": 2,
        "strength": 8,
        "ap": -3,
        "damage": 2,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Valerian",
      "Epic Hero",
      "Infantry",
      "Character",
      "Imperium",
      "Shield-Captain"
    ],
    "specialRules": []
  },
  {
    "id": "knight_centura",
    "name": "Knight-centura",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "knight_centura_master_crafted_boltgun_1",
        "name": "Master-crafted boltgun",
        "attacks": 1,
        "skill": 2,
        "strength": 4,
        "ap": 0,
        "damage": 2,
        "type": "ranged",
        "specialRules": [
          {
            "type": "RAPID_FIRE",
            "value": 1
          }
        ]
      },
      {
        "id": "knight_centura_witchseeker_flamer_2",
        "name": "Witchseeker flamer",
        "attacks": "D6",
        "skill": 0,
        "strength": 4,
        "ap": 0,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "IGNORES_COVER"
          },
          {
            "type": "TORRENT"
          }
        ]
      },
      {
        "id": "knight_centura_close_combat_weapon_3",
        "name": "Close combat weapon",
        "attacks": 3,
        "skill": 2,
        "strength": 3,
        "ap": 0,
        "damage": 1,
        "type": "melee",
        "specialRules": []
      },
      {
        "id": "knight_centura_executioner_greatblade_4",
        "name": "Executioner greatblade",
        "attacks": 3,
        "skill": 2,
        "strength": 5,
        "ap": -2,
        "damage": 2,
        "type": "melee",
        "specialRules": [
          {
            "type": "ANTI",
            "keyword": "psyker",
            "value": 5
          },
          {
            "type": "DEVASTATING_WOUNDS"
          }
        ]
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Infantry",
      "Character",
      "Knight-Centura",
      "Anathema Psykana",
      "Imperium"
    ],
    "specialRules": []
  },
  {
    "id": "prosecutors",
    "name": "Prosecutors",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "prosecutors_boltgun_1",
        "name": "Boltgun",
        "attacks": 1,
        "skill": 3,
        "strength": 4,
        "ap": 0,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "RAPID_FIRE",
            "value": 1
          }
        ]
      },
      {
        "id": "prosecutors_close_combat_weapon_2",
        "name": "Close combat weapon",
        "attacks": 2,
        "skill": 3,
        "strength": 3,
        "ap": 0,
        "damage": 1,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Prosecutors",
      "Anathema Psykana",
      "Imperium",
      "Infantry"
    ],
    "specialRules": []
  },
  {
    "id": "vigilators",
    "name": "Vigilators",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "vigilators_executioner_greatblade_1",
        "name": "Executioner greatblade",
        "attacks": 2,
        "skill": 3,
        "strength": 5,
        "ap": -2,
        "damage": 2,
        "type": "melee",
        "specialRules": [
          {
            "type": "ANTI",
            "keyword": "psyker",
            "value": 5
          },
          {
            "type": "DEVASTATING_WOUNDS"
          }
        ]
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Anathema Psykana",
      "Infantry",
      "Imperium",
      "Vigilators"
    ],
    "specialRules": []
  },
  {
    "id": "witchseekers",
    "name": "Witchseekers",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "witchseekers_witchseeker_flamer_1",
        "name": "Witchseeker flamer",
        "attacks": "D6",
        "skill": 0,
        "strength": 4,
        "ap": 0,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "IGNORES_COVER"
          },
          {
            "type": "TORRENT"
          }
        ]
      },
      {
        "id": "witchseekers_close_combat_weapon_2",
        "name": "Close combat weapon",
        "attacks": 2,
        "skill": 3,
        "strength": 3,
        "ap": 0,
        "damage": 1,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Witchseekers",
      "Infantry",
      "Imperium",
      "Anathema Psykana"
    ],
    "specialRules": []
  },
  {
    "id": "anathema_psykana_rhino",
    "name": "Anathema Psykana Rhino",
    "faction": "Adeptus Custodes",
    "toughness": 0,
    "save": 0,
    "woundsPerModel": 1,
    "weapons": [
      {
        "id": "anathema_psykana_rhino_hunter_killer_missile_1",
        "name": "Hunter-killer missile",
        "attacks": 1,
        "skill": 2,
        "strength": 14,
        "ap": -3,
        "damage": "D6",
        "type": "ranged",
        "specialRules": []
      },
      {
        "id": "anathema_psykana_rhino_storm_bolter_2",
        "name": "Storm bolter",
        "attacks": 2,
        "skill": 3,
        "strength": 4,
        "ap": 0,
        "damage": 1,
        "type": "ranged",
        "specialRules": [
          {
            "type": "RAPID_FIRE",
            "value": 2
          }
        ]
      },
      {
        "id": "anathema_psykana_rhino_armoured_tracks_3",
        "name": "Armoured tracks",
        "attacks": 3,
        "skill": 4,
        "strength": 6,
        "ap": 0,
        "damage": 1,
        "type": "melee",
        "specialRules": []
      }
    ],
    "keywords": [
      "Adeptus Custodes",
      "Rhino",
      "Vehicle",
      "Transport",
      "Dedicated Transport",
      "Smoke",
      "Imperium",
      "Anathema Psykana"
    ],
    "specialRules": []
  }
];
