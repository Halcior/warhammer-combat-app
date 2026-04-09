import type { FactionConfig } from "../../../types/faction";
import { adeptusCustodesArmyRules } from "./armyRules";
import { auricChampionsDetachment } from "./detachments/auricChampions";
import { blackShipGuardiansDetachment } from "./detachments/blackShipGuardians";
import { lionsOfTheEmperorDetachment } from "./detachments/lionsOfTheEmperor";
import { nullMaidenVigilDetachment } from "./detachments/nullMaidenVigil";
import { shieldHostDetachment } from "./detachments/shieldHost";
import { solarSpearheadDetachment } from "./detachments/solarSpearhead";
import { talonsOfTheEmperorDetachment } from "./detachments/talonsOfTheEmperor";
import { voyagersInDarknessDetachment } from "./detachments/voyagersInDarkness";

export const adeptusCustodesFactionConfig: FactionConfig = {
  id: "adeptus-custodes",
  faction: "Adeptus Custodes",
  armyRules: adeptusCustodesArmyRules,
  detachments: [
    shieldHostDetachment,
    talonsOfTheEmperorDetachment,
    nullMaidenVigilDetachment,
    auricChampionsDetachment,
    voyagersInDarknessDetachment,
    blackShipGuardiansDetachment,
    solarSpearheadDetachment,
    lionsOfTheEmperorDetachment,
  ],
};
