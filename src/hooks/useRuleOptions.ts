import { useMemo, useState } from "react";
import type { RuleOption, EnhancementConfig, StratagemConfig } from "../types/faction";
import type { SpecialRule } from "../types/combat";

export function useRuleOptions(ruleOptions: RuleOption[]) {
  const [activeRuleOptionIds, setActiveRuleOptionIds] = useState<string[]>([]);

  // Reset selections when the available rule pool changes (faction or detachment
  // switch). Without this, a rule ID active in Faction A could silently activate
  // a different rule with the same ID in Faction B.
  // Previous-value comparison during render avoids setState-in-effect lint violations.
  const [prevRuleOptions, setPrevRuleOptions] = useState(ruleOptions);
  if (prevRuleOptions !== ruleOptions) {
    setPrevRuleOptions(ruleOptions);
    setActiveRuleOptionIds([]);
  }

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

export function useEnhancementOptions(enhancements: EnhancementConfig[]) {
  const [activeEnhancementIds, setActiveEnhancementIds] = useState<string[]>([]);

  const [prevEnhancements, setPrevEnhancements] = useState(enhancements);
  if (prevEnhancements !== enhancements) {
    setPrevEnhancements(enhancements);
    setActiveEnhancementIds([]);
  }

  const toggleEnhancement = (id: string) => {
    setActiveEnhancementIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const activeEnhancementRuleEffects = useMemo(() => {
    return enhancements
      .filter((e) => activeEnhancementIds.includes(e.id))
      .flatMap((e) => e.effects);
  }, [enhancements, activeEnhancementIds]);

  const activeEnhancementEffects: SpecialRule[] = useMemo(() => {
    return activeEnhancementRuleEffects.flatMap((effect) => effect.modifiers);
  }, [activeEnhancementRuleEffects]);

  return {
    activeEnhancementIds,
    toggleEnhancement,
    activeEnhancementRuleEffects,
    activeEnhancementEffects,
  };
}

export function useStratagemOptions(stratagems: StratagemConfig[]) {
  const [activeStratagemIds, setActiveStratagemIds] = useState<string[]>([]);

  const [prevStratagems, setPrevStratagems] = useState(stratagems);
  if (prevStratagems !== stratagems) {
    setPrevStratagems(stratagems);
    setActiveStratagemIds([]);
  }

  const toggleStratagem = (id: string) => {
    setActiveStratagemIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const activeStratagemRuleEffects = useMemo(() => {
    return stratagems
      .filter((s) => activeStratagemIds.includes(s.id))
      .flatMap((s) => s.effects);
  }, [stratagems, activeStratagemIds]);

  const activeStratagemEffects: SpecialRule[] = useMemo(() => {
    return activeStratagemRuleEffects.flatMap((effect) => effect.modifiers);
  }, [activeStratagemRuleEffects]);

  return {
    activeStratagemIds,
    toggleStratagem,
    activeStratagemRuleEffects,
    activeStratagemEffects,
  };
}
