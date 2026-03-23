import { useMemo, useState } from "react";
import { getFactionConfigByName } from "../data/factions";
import type { RuleOption } from "../types/faction";

export function useFactionRules(attackerFaction: string) {
  const factionConfig = useMemo(() => {
    return getFactionConfigByName(attackerFaction);
  }, [attackerFaction]);

  const availableDetachments = factionConfig?.detachments ?? [];
  const [selectedDetachmentId, setSelectedDetachmentId] = useState<string>("");

  const selectedDetachment =
    availableDetachments.find((d) => d.id === selectedDetachmentId) ??
    availableDetachments[0];

  const resolvedSelectedDetachmentId =
    selectedDetachmentId || selectedDetachment?.id || "";

  const armyRules = factionConfig?.armyRules ?? [];
  const detachmentRuleOptions = selectedDetachment?.ruleOptions ?? [];
  const stratagems = selectedDetachment?.stratagems ?? [];

  const allAvailableRuleOptions: RuleOption[] = [
    ...armyRules,
    ...detachmentRuleOptions,
  ];

  return {
    factionConfig,
    availableDetachments,
    selectedDetachment,
    selectedDetachmentId: resolvedSelectedDetachmentId,
    setSelectedDetachmentId,
    armyRules,
    detachmentRuleOptions,
    stratagems,
    allAvailableRuleOptions,
  };
}