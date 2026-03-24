import normalizedUnitsRaw from "./normalized/units.json";
import { mapNormalizedUnitToCombatUnit } from "./mappers/mapNormalizedUnitToCombatUnit";
import type { NormalizedUnit } from "../types/wahapedia";

const normalizedUnits = normalizedUnitsRaw as NormalizedUnit[];

export const units = normalizedUnits.map(mapNormalizedUnitToCombatUnit);