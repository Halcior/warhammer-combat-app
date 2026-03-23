import { useMemo, useState } from "react";
import type { RuleOption, EnhancementConfig } from "../types/faction";
import type { SpecialRule } from "../types/combat";

type UseRuleOptionsParams = {
  ruleOptions: RuleOption[];
  enhancements?: EnhancementConfig[];
};

export function useRuleOptions({
  ruleOptions,
  enhancements = [],
}: UseRuleOptionsParams) {
  const [activeRuleOptionIds, setActiveRuleOptionIds] = useState<string[]>([]);
  const [activeEnhancementIds, setActiveEnhancementIds] = useState<string[]>([]);

  const toggleRuleOption = (ruleId: string) => {
    setActiveRuleOptionIds((prev) =>
      prev.includes(ruleId)
        ? prev.filter((id) => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  const toggleEnhancement = (enhancementId: string) => {
    setActiveEnhancementIds((prev) =>
      prev.includes(enhancementId)
        ? prev.filter((id) => id !== enhancementId)
        : [...prev, enhancementId]
    );
  };

  const activeRuleOptions = useMemo(() => {
    return ruleOptions.filter((rule) => activeRuleOptionIds.includes(rule.id));
  }, [ruleOptions, activeRuleOptionIds]);

  const activeEnhancements = useMemo(() => {
    return enhancements.filter((enhancement) =>
      activeEnhancementIds.includes(enhancement.id)
    );
  }, [enhancements, activeEnhancementIds]);

  const activeRuleModifiers: SpecialRule[] = useMemo(() => {
    return activeRuleOptions.flatMap((rule) => rule.modifiers);
  }, [activeRuleOptions]);

  const activeEnhancementModifiers: SpecialRule[] = useMemo(() => {
    return activeEnhancements.flatMap((enhancement) =>
      enhancement.effects.flatMap((effect) => effect.modifiers)
    );
  }, [activeEnhancements]);

  const activeEngineTags: string[] = useMemo(() => {
    return [
      ...activeRuleOptions.flatMap((rule) => rule.engineTags ?? []),
      ...activeEnhancements.flatMap((enhancement) =>
        enhancement.effects.flatMap((effect) => effect.engineTags ?? [])
      ),
    ];
  }, [activeRuleOptions, activeEnhancements]);

  return {
    activeRuleOptionIds,
    activeEnhancementIds,
    activeRuleOptions,
    activeEnhancements,
    activeRuleModifiers,
    activeEnhancementModifiers,
    activeEngineTags,
    toggleRuleOption,
    toggleEnhancement,
  };
}