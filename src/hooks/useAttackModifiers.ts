import { useMemo, useState } from "react";

export function useAttackModifiers() {
  const [activeAttackModifiers, setActiveAttackModifiers] = useState({
    devastatingWounds: false,
    lethalHits: false,
    ignoresCover: false,
  });

  const [activeFactionModifiers, setActiveFactionModifiers] = useState({
    martialKatahLethalHits: false,
    martialKatahSustainedHits: false,
  });

  const activeModifierRules = useMemo(() => {
    const rules = [];

    if (activeAttackModifiers.devastatingWounds) {
      rules.push({ type: "DEVASTATING_WOUNDS" as const });
    }

    if (activeAttackModifiers.lethalHits) {
      rules.push({ type: "LETHAL_HITS" as const });
    }

    if (activeAttackModifiers.ignoresCover) {
      rules.push({ type: "IGNORES_COVER" as const });
    }

    return rules;
  }, [activeAttackModifiers]);

  const activeFactionModifierRules = useMemo(() => {
    const rules = [];

    if (activeFactionModifiers.martialKatahLethalHits) {
      rules.push({ type: "LETHAL_HITS" as const });
    }

    if (activeFactionModifiers.martialKatahSustainedHits) {
      rules.push({ type: "SUSTAINED_HITS" as const, value: 1 });
    }

    return rules;
  }, [activeFactionModifiers]);

  const allActiveModifierRules = useMemo(() => {
    return [...activeModifierRules, ...activeFactionModifierRules];
  }, [activeModifierRules, activeFactionModifierRules]);

  return {
    activeAttackModifiers,
    setActiveAttackModifiers,
    activeFactionModifiers,
    setActiveFactionModifiers,
    activeModifierRules,
    activeFactionModifierRules,
    allActiveModifierRules,
  };
}