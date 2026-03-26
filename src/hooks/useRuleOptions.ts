import { useMemo, useState } from "react";
import type { RuleOption } from "../types/faction";
import type { SpecialRule } from "../types/combat";

export function useRuleOptions(ruleOptions: RuleOption[]) {
  const [activeRuleOptionIds, setActiveRuleOptionIds] = useState<string[]>([]);

  const toggleRuleOption = (ruleId: string) => {
    const option = ruleOptions.find((o) => o.id === ruleId);
    if (!option) return;

    setActiveRuleOptionIds((prev) => {
      const isActive = prev.includes(ruleId);

      if (option.selectionGroup) {
        const sameGroupIds = ruleOptions
          .filter((o) => o.selectionGroup === option.selectionGroup)
          .map((o) => o.id);

        if (isActive) {
          return prev.filter((id) => id !== ruleId);
        }

        return [...prev.filter((id) => !sameGroupIds.includes(id)), ruleId];
      }

      if (isActive) {
        return prev.filter((id) => id !== ruleId);
      }

      return [...prev, ruleId];
    });
  };

  const activeRuleOptions = useMemo(() => {
    return ruleOptions.filter((rule) => activeRuleOptionIds.includes(rule.id));
  }, [ruleOptions, activeRuleOptionIds]);

  const activeRuleModifiers: SpecialRule[] = useMemo(() => {
    return activeRuleOptions.flatMap((rule) => rule.modifiers);
  }, [activeRuleOptions]);

  const activeEngineTags: string[] = useMemo(() => {
    return activeRuleOptions.flatMap((rule) => rule.engineTags ?? []);
  }, [activeRuleOptions]);

  return {
    activeRuleOptionIds,
    setActiveRuleOptionIds,
    activeRuleOptions,
    activeRuleModifiers,
    activeEngineTags,
    toggleRuleOption,
  };
}