import { useMemo, useState } from "react";
import { getFactionRuntimeDetachments } from "../data/factions/runtimeDetachments";
import type { RuleOption } from "../types/faction";
import { adeptusCustodesFactionConfig } from "../data/factions/AdeptusCustodes/faction";

export function useFactionRules(attackerFaction: string) {
  const runtimeData = useMemo(() => {
    if (attackerFaction === "Adeptus Custodes") {
      return {
        detachments: adeptusCustodesFactionConfig.detachments,
        enhancements: adeptusCustodesFactionConfig.detachments.flatMap(
          (detachment) => detachment.enhancements ?? []
        ),
        stratagems: adeptusCustodesFactionConfig.detachments.flatMap(
          (detachment) => detachment.stratagems
        ),
      };
    }

    return getFactionRuntimeDetachments(attackerFaction);
  }, [attackerFaction]);

  const availableDetachments = runtimeData.detachments;

  const [selectedDetachmentId, setSelectedDetachmentId] = useState("");

  const effectiveSelectedDetachmentId = useMemo(() => {
    const hasSelectedDetachment = availableDetachments.some(
      (detachment) => detachment.id === selectedDetachmentId
    );

    return hasSelectedDetachment
      ? selectedDetachmentId
      : (availableDetachments[0]?.id ?? "");
  }, [availableDetachments, selectedDetachmentId]);

  const selectedDetachment =
    availableDetachments.find(
      (detachment) => detachment.id === effectiveSelectedDetachmentId
    ) ?? availableDetachments[0];

  const allAvailableRuleOptions: RuleOption[] = useMemo(() => {
    if (attackerFaction === "Adeptus Custodes") {
      return [
        ...adeptusCustodesFactionConfig.armyRules,
        ...(selectedDetachment?.ruleOptions ?? []),
      ];
    }

    return selectedDetachment?.ruleOptions ?? [];
  }, [attackerFaction, selectedDetachment]);

  return {
    availableDetachments,
    selectedDetachmentId: effectiveSelectedDetachmentId,
    setSelectedDetachmentId,
    selectedDetachment,
    allAvailableRuleOptions,
    stratagems: selectedDetachment?.stratagems ?? [],
    enhancements: selectedDetachment?.enhancements ?? [],
  };
}