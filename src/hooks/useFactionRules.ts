import { useEffect, useMemo, useState } from "react";
import { getFactionRuntimeDetachments } from "../data/factions/runtimeDetachments";
import type { RuleOption } from "../types/faction";

export function useFactionRules(attackerFaction: string) {
  const runtimeData = useMemo(() => {
    return getFactionRuntimeDetachments(attackerFaction);
  }, [attackerFaction]);

  const availableDetachments = runtimeData.detachments;

  const [selectedDetachmentId, setSelectedDetachmentId] = useState(
    availableDetachments[0]?.id ?? ""
  );

  useEffect(() => {
    setSelectedDetachmentId(availableDetachments[0]?.id ?? "");
  }, [attackerFaction]);

  const selectedDetachment =
    availableDetachments.find((detachment) => detachment.id === selectedDetachmentId) ??
    availableDetachments[0];

  const allAvailableRuleOptions: RuleOption[] = useMemo(() => {
    return selectedDetachment?.ruleOptions ?? [];
  }, [selectedDetachment]);

  return {
    availableDetachments,
    selectedDetachmentId,
    setSelectedDetachmentId,
    selectedDetachment,
    allAvailableRuleOptions,
    stratagems: runtimeData.stratagems,
    enhancements: runtimeData.enhancements,
  };
}