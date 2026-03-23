import { useMemo, useState } from "react";
import type { RuleOption } from "../types/faction";
import type { SpecialRule } from "../types/combat";

export function useRuleOptions(ruleOptions: RuleOption[]) {
  const [activeRuleOptionIds, setActiveRuleOptionIds] = useState<string[]>([]);

  const toggleRuleOption = (ruleId: string) => {
    setActiveRuleOptionIds((prev) =>
      prev.includes(ruleId)
        ? prev.filter((id) => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  const activeRuleOptions = useMemo(() => {
    return ruleOptions.filter((rule) => activeRuleOptionIds.includes(rule.id));
  }, [ruleOptions, activeRuleOptionIds]);

  const activeRuleModifiers: SpecialRule[] = useMemo(() => {
    return activeRuleOptions.flatMap((rule) => rule.modifiers);
  }, [activeRuleOptions]);

  return {
    activeRuleOptionIds,
    setActiveRuleOptionIds,
    activeRuleOptions,
    activeRuleModifiers,
    toggleRuleOption,
  };
}