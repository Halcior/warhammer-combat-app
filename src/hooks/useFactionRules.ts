import { useMemo, useState } from "react";
import { getFactionRuntimeDetachments } from "../data/factions/runtimeDetachments";
import type { RuleOption } from "../types/faction";
import { getAdeptusCustodesFactionConfig } from "../data/factions/AdeptusCustodes/faction";
import type { NormalizedDetachment } from "../types/wahapedia";

export function useFactionRules(
  attackerFaction: string,
  normalizedDetachments: NormalizedDetachment[]
) {
  const runtimeData = useMemo(() => {
    if (attackerFaction === "Adeptus Custodes") {
      const adeptusCustodesFactionConfig = getAdeptusCustodesFactionConfig(normalizedDetachments);
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

    return getFactionRuntimeDetachments(attackerFaction, normalizedDetachments);
  }, [attackerFaction, normalizedDetachments]);

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
      const adeptusCustodesFactionConfig = getAdeptusCustodesFactionConfig(normalizedDetachments);
      return [
        ...adeptusCustodesFactionConfig.armyRules,
        ...(selectedDetachment?.ruleOptions ?? []),
      ];
    }

    return selectedDetachment?.ruleOptions ?? [];
  }, [attackerFaction, normalizedDetachments, selectedDetachment]);

  // Stable references — only change when selectedDetachment changes.
  // Without memoization these would be new array instances on every render,
  // which would cause useEffect reset hooks in useRuleOptions-family hooks
  // to fire on every render instead of only on faction/detachment change.
  const stratagems = useMemo(
    () => selectedDetachment?.stratagems ?? [],
    [selectedDetachment]
  );
  const enhancements = useMemo(
    () => selectedDetachment?.enhancements ?? [],
    [selectedDetachment]
  );

  return {
    availableDetachments,
    selectedDetachmentId: effectiveSelectedDetachmentId,
    setSelectedDetachmentId,
    selectedDetachment,
    allAvailableRuleOptions,
    stratagems,
    enhancements,
  };
}
