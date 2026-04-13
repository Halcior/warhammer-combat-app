import { useEffect, useMemo, useState } from "react";
import "./App.css";
import appLogo from "./assets/Nowe_LogoPNG.png";
import heroBackground from "./assets/Tło.png";
import { calculateExpectedDamage } from "./lib/combat";
import { runSimulationByMode } from "./lib/combat/simulation/runSimulationByMode";

import { SetupPanel } from "./components/SetupPanel";
import { ModifiersPanel } from "./components/ModifiersPanel";
import { ExpectedResultPanel } from "./components/ExpectedResultPanel";
import { CompareWeaponsPanel } from "./components/CompareWeaponsPanel";
import { SimulationPanel } from "./components/SimulationPanel";

import { useBattleSetup } from "./hooks/useBattleSetup";
import { useAttackModifiers } from "./hooks/useAttackModifiers";
import { useFactionRules } from "./hooks/useFactionRules";
import {
  useRuleOptions,
  useEnhancementOptions,
  useStratagemOptions,
} from "./hooks/useRuleOptions";

import type { SimulationSummary } from "./lib/combat/simulation/analyzeSimulation";
import type { CalculationMode } from "./lib/combat/simulation/runSimulationByMode";
import type { RuleOption } from "./types/faction";

import { explainAttackBreakdown } from "./lib/combat/explainAttackBreakdown";
import { AttackBreakdownSourcesPanel } from "./components/AttackBreakdownSourcesPanel";

function App() {
  const battleSetup = useBattleSetup();
  const attackModifiers = useAttackModifiers();
  const factionRules = useFactionRules(battleSetup.attackerFaction);
  const ruleOptions = useRuleOptions(factionRules.allAvailableRuleOptions);
  const enhancementOptions = useEnhancementOptions(factionRules.enhancements);
  const stratagemOptions = useStratagemOptions(factionRules.stratagems);

  const [compareWeaponId, setCompareWeaponId] = useState("");
  const [mode, setMode] = useState<CalculationMode>("fast");
  const [runs, setRuns] = useState(5000);
  const [simulationSummary, setSimulationSummary] =
    useState<SimulationSummary | null>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationRefreshKey, setSimulationRefreshKey] = useState(0);

  const fallbackCompareWeaponId = useMemo(() => {
    const fallbackWeapon =
      battleSetup.attacker.weapons.find(
        (weapon) => weapon.id !== battleSetup.selectedWeapon.id
      ) ?? battleSetup.selectedWeapon;

    return fallbackWeapon.id;
  }, [battleSetup.attacker.weapons, battleSetup.selectedWeapon]);

  const activeCompareWeaponId = useMemo(() => {
    const isCurrentCompareWeaponValid = battleSetup.attacker.weapons.some(
      (weapon) =>
        weapon.id === compareWeaponId && weapon.id !== battleSetup.selectedWeapon.id
    );

    return isCurrentCompareWeaponValid ? compareWeaponId : fallbackCompareWeaponId;
  }, [
    battleSetup.attacker.weapons,
    battleSetup.selectedWeapon.id,
    compareWeaponId,
    fallbackCompareWeaponId,
  ]);

  const attackerUnitAbilityRuleOptions = useMemo(() => {
    return (battleSetup.attacker.abilities ?? [])
      .filter((ability) => ability.modifiers.length > 0)
      .map((ability) => ({
        id: `attacker-ability-${ability.id}`,
        name: ability.name,
        description: ability.description,
        appliesTo: "attacker" as const,
        phase: "any" as const,
        modifiers: ability.modifiers,
        isToggle: true,
        supportLevel: ability.supportLevel,
        engineTags: [],
        selectionGroup: ability.selectionGroup,
      }));
  }, [battleSetup.attacker.abilities]);

  const defenderUnitAbilityRuleOptions = useMemo(() => {
    return (battleSetup.defender.abilities ?? [])
      .filter((ability) => ability.modifiers.length > 0)
      .map((ability) => ({
        id: `defender-ability-${ability.id}`,
        name: ability.name,
        description: ability.description,
        appliesTo: "defender" as const,
        phase: "any" as const,
        modifiers: ability.modifiers,
        isToggle: true,
        supportLevel: ability.supportLevel,
        engineTags: [],
        selectionGroup: ability.selectionGroup,
      }));
  }, [battleSetup.defender.abilities]);

  const attackerUnitAbilityOptions = useRuleOptions(attackerUnitAbilityRuleOptions);
  const defenderUnitAbilityOptions = useRuleOptions(defenderUnitAbilityRuleOptions);

  const activeRuleEffects = useMemo(() => {
    return [
      ...ruleOptions.activeRuleOptions,
      ...enhancementOptions.activeEnhancementRuleEffects,
      ...stratagemOptions.activeStratagemRuleEffects,
      ...attackerUnitAbilityOptions.activeRuleOptions,
      ...defenderUnitAbilityOptions.activeRuleOptions,
    ];
  }, [
    ruleOptions.activeRuleOptions,
    enhancementOptions.activeEnhancementRuleEffects,
    stratagemOptions.activeStratagemRuleEffects,
    attackerUnitAbilityOptions.activeRuleOptions,
    defenderUnitAbilityOptions.activeRuleOptions,
  ]);

  const attackerScopedModifierRules = useMemo(() => {
    return [
      ...attackModifiers.allActiveModifierRules,
      ...activeRuleEffects
        .filter((effect: RuleOption) => effect.appliesTo !== "defender")
        .flatMap((effect) => effect.modifiers),
    ];
  }, [attackModifiers.allActiveModifierRules, activeRuleEffects]);

  const defenderScopedModifierRules = useMemo(() => {
    return activeRuleEffects
      .filter((effect: RuleOption) => effect.appliesTo === "defender")
      .flatMap((effect) => effect.modifiers);
  }, [activeRuleEffects]);

  const expectedResult = useMemo(() => {
    return calculateExpectedDamage({
      attacker: battleSetup.attacker,
      weapon: battleSetup.selectedWeapon,
      defender: battleSetup.defender,
      attackingModels: battleSetup.attackingModels,
      defendingModels: battleSetup.defendingModels,
      conditions: battleSetup.conditions,
      activeModifierRules: attackerScopedModifierRules,
      activeDefenderModifierRules: defenderScopedModifierRules,
    });
  }, [
    battleSetup.attacker,
    battleSetup.selectedWeapon,
    battleSetup.defender,
    battleSetup.attackingModels,
    battleSetup.defendingModels,
    battleSetup.conditions,
    attackerScopedModifierRules,
    defenderScopedModifierRules,
  ]);

  const attackBreakdownExplanation = useMemo(() => {
    return explainAttackBreakdown({
      attacker: battleSetup.attacker,
      weapon: battleSetup.selectedWeapon,
      defender: battleSetup.defender,
      conditions: battleSetup.conditions,
      activeModifierRules: attackerScopedModifierRules,
      activeDefenderModifierRules: defenderScopedModifierRules,
    });
  }, [
    battleSetup.attacker,
    battleSetup.selectedWeapon,
    battleSetup.defender,
    battleSetup.conditions,
    attackerScopedModifierRules,
    defenderScopedModifierRules,
  ]);

  const compareWeapon =
    battleSetup.attacker.weapons.find((w) => w.id === activeCompareWeaponId) ??
    battleSetup.selectedWeapon;

  const featureCards = [
    {
      title: "Damage simulation",
      description:
        "Read average output, variance and wipe potential through fast analytics or full Monte Carlo resolution.",
    },
    {
      title: "Unit interaction analysis",
      description:
        "Layer detachments, keywords and battlefield conditions to see what actually changes the combat math.",
    },
    {
      title: "Scenario comparison",
      description:
        "Compare weapons, matchup states and active effects without leaving the same tactical workspace.",
    },
  ];

  const compareResult = useMemo(() => {
    return calculateExpectedDamage({
      attacker: battleSetup.attacker,
      weapon: compareWeapon,
      defender: battleSetup.defender,
      attackingModels: battleSetup.attackingModels,
      defendingModels: battleSetup.defendingModels,
      conditions: battleSetup.conditions,
      activeModifierRules: attackerScopedModifierRules,
      activeDefenderModifierRules: defenderScopedModifierRules,
    });
  }, [
    battleSetup.attacker,
    compareWeapon,
    battleSetup.defender,
    battleSetup.attackingModels,
    battleSetup.defendingModels,
    battleSetup.conditions,
    attackerScopedModifierRules,
    defenderScopedModifierRules,
  ]);

  const handleRunSimulation = () => {
    setSimulationRefreshKey((current) => current + 1);
  };

  useEffect(() => {
    let isCancelled = false;

    setIsSimulationRunning(true);
    setSimulationError(null);

    const timeoutId = window.setTimeout(() => {
      try {
        const summary = runSimulationByMode({
          mode,
          expectedResult,
          selectedWeapon: battleSetup.selectedWeapon,
          targetWounds: battleSetup.defender.woundsPerModel,
          defendingModels: battleSetup.defendingModels,
          runs,
          accurateParams: {
            attacker: battleSetup.attacker,
            weapon: battleSetup.selectedWeapon,
            defender: battleSetup.defender,
            attackingModels: battleSetup.attackingModels,
            defendingModels: battleSetup.defendingModels,
            conditions: battleSetup.conditions,
            activeModifierRules: attackerScopedModifierRules,
            activeDefenderModifierRules: defenderScopedModifierRules,
          },
        });

        validateSimulationSummary(summary);

        if (!isCancelled) {
          setSimulationSummary(summary);
          setSimulationError(null);
        }
      } catch (error) {
        if (!isCancelled) {
          setSimulationSummary(null);
          setSimulationError(getSimulationErrorMessage(error));
        }
      } finally {
        if (!isCancelled) {
          setIsSimulationRunning(false);
        }
      }
    }, 0);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [
    mode,
    runs,
    expectedResult,
    battleSetup.selectedWeapon,
    battleSetup.defender.woundsPerModel,
    battleSetup.defendingModels,
    battleSetup.attacker,
    battleSetup.defender,
    battleSetup.attackingModels,
    battleSetup.conditions,
    attackerScopedModifierRules,
    defenderScopedModifierRules,
    simulationRefreshKey,
  ]);

  return (
    <div className="app">
      <header
        className="hero-shell"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="hero-shell__overlay" />

        <div className="page-shell hero-shell__frame">
          <nav className="hero-nav" aria-label="Primary">
            <a className="hero-nav__brand" href="#top">
              <img
                className="hero-nav__logo"
                src={appLogo}
                alt="DamageForge logo"
              />
              <span className="hero-nav__brand-name">DamageForge</span>
            </a>

            <div className="hero-nav__links">
              <a href="#feature-highlights">Features</a>
              <a href="#docs">Docs</a>
              <a href="#pricing">Pricing</a>
              <a
                href="https://github.com/Halcior/warhammer-combat-app.git"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </div>

            <a className="button-link button-link--ghost" href="#app-shell">
              Open App
            </a>
          </nav>

          <div className="hero-shell__content" id="top">
            <div className="hero-copy">
              <span className="hero-badge">Industrial combat analytics</span>

              <div className="hero-brand">
                <img
                  className="hero-brand__logo"
                  src={appLogo}
                  alt="DamageForge logo"
                />
                <div className="hero-brand__copy">
                  <p className="hero-brand__eyebrow">DamageForge</p>
                  <h1>DamageForge</h1>
                </div>
              </div>

              <p className="hero-subtitle">
                Forged precision for combat analysis
              </p>

              <p className="hero-description">
                DamageForge is a tactical workspace for damage simulation, unit
                interaction analysis and scenario comparison, built to keep
                complex combat math readable without flattening the nuance out of
                a matchup.
              </p>

              <div className="hero-actions">
                <a className="button-link button-link--primary" href="#app-shell">
                  Launch App
                </a>
                <a className="button-link button-link--secondary" href="#feature-highlights">
                  View Features
                </a>
              </div>
            </div>

            <aside className="hero-summary" aria-label="Current matchup summary">
              <div className="hero-chip">
                <span className="hero-chip__label">Attacker</span>
                <span className="hero-chip__value">{battleSetup.attacker.name}</span>
              </div>

              <div className="hero-chip">
                <span className="hero-chip__label">Weapon</span>
                <span className="hero-chip__value">
                  {battleSetup.selectedWeapon.name}
                </span>
              </div>

              {factionRules.selectedDetachment && (
                <div className="hero-chip">
                  <span className="hero-chip__label">Detachment</span>
                  <span className="hero-chip__value">
                    {factionRules.selectedDetachment.name}
                  </span>
                </div>
              )}
            </aside>
          </div>
        </div>
      </header>

      <section className="page-shell feature-showcase" id="feature-highlights">
        {featureCards.map((feature) => (
          <article key={feature.title} className="feature-card">
            <p className="feature-card__eyebrow">Core capability</p>
            <h2>{feature.title}</h2>
            <p className="feature-card__text">{feature.description}</p>
          </article>
        ))}
      </section>

      <main className="page-shell app-shell" id="app-shell">
        <section className="app-shell__intro">
          <div className="app-shell__intro-copy">
            <p className="panel-eyebrow">Operational workspace</p>
            <h2>Launch the analysis stack</h2>
            <p className="muted-text">
              Set the matchup, apply battlefield conditions and work through the
              damage profile from quick analytical output down to simulation and
              active rules.
            </p>
          </div>

          <div className="app-shell__info">
            <article className="info-card" id="docs">
              <span className="info-card__label">Docs</span>
              <p>
                Breakdown traces and rule tooltips keep the combat logic readable
                inside the app.
              </p>
            </article>

            <article className="info-card">
              <span className="info-card__label">Sources</span>
              <p>
                Use Wahapedia as a quick external rules reference when you want to
                cross-check wording while building a matchup.
              </p>
              <div className="info-card__actions">
                <a
                  className="inline-link"
                  href="https://wahapedia.ru/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Wahapedia
                </a>
              </div>
            </article>

            <article className="info-card" id="pricing">
              <span className="info-card__label">Pricing</span>
              <p>
                The current focus is a strong core calculator, with room for
                future premium flows like saved scenarios and team presets.
              </p>
            </article>
          </div>
        </section>

        <SetupPanel
          factions={battleSetup.factions}
          attackerFaction={battleSetup.attackerFaction}
          defenderFaction={battleSetup.defenderFaction}
          attackerId={battleSetup.attackerId}
          defenderId={battleSetup.defenderId}
          weaponId={battleSetup.weaponId}
          attackingModels={battleSetup.attackingModels}
          defendingModels={battleSetup.defendingModels}
          conditions={battleSetup.conditions}
          attackerUnits={battleSetup.attackerUnits}
          defenderUnits={battleSetup.defenderUnits}
          attacker={battleSetup.attacker}
          setAttackingModels={battleSetup.setAttackingModels}
          setDefendingModels={battleSetup.setDefendingModels}
          setConditions={battleSetup.setConditions}
          handleAttackerFactionChange={battleSetup.handleAttackerFactionChange}
          handleAttackerChange={battleSetup.handleAttackerChange}
          handleWeaponChange={battleSetup.handleWeaponChange}
          handleDefenderFactionChange={battleSetup.handleDefenderFactionChange}
          handleDefenderChange={battleSetup.handleDefenderChange}
        />

        <div className="workspace-grid">
          <div className="workspace-main">
            <SimulationPanel
              mode={mode}
              setMode={setMode}
              runs={runs}
              setRuns={setRuns}
              onRun={handleRunSimulation}
              summary={simulationSummary}
              error={simulationError}
              isRunning={isSimulationRunning}
            />

            <div className="analysis-grid">
              <ExpectedResultPanel expectedResult={expectedResult} />
              <AttackBreakdownSourcesPanel explanation={attackBreakdownExplanation} />
            </div>

            {battleSetup.attacker.weapons.length > 1 && (
              <CompareWeaponsPanel
                weaponA={battleSetup.selectedWeapon}
                weaponB={compareWeapon}
                compareWeaponId={activeCompareWeaponId}
                setCompareWeaponId={setCompareWeaponId}
                availableWeapons={battleSetup.attacker.weapons}
                resultA={expectedResult}
                resultB={compareResult}
              />
            )}
          </div>

          <div className="workspace-sidebar">
        <ModifiersPanel
          activeAttackModifiers={attackModifiers.activeAttackModifiers}
          setActiveAttackModifiers={attackModifiers.setActiveAttackModifiers}
          attackerActiveModifierRules={attackerScopedModifierRules}
          defenderActiveModifierRules={defenderScopedModifierRules}
          selectedWeapon={battleSetup.selectedWeapon}
          attacker={battleSetup.attacker}
          defender={battleSetup.defender}
              availableDetachments={factionRules.availableDetachments}
              selectedDetachmentId={factionRules.selectedDetachmentId}
              setSelectedDetachmentId={factionRules.setSelectedDetachmentId}
              selectedDetachment={factionRules.selectedDetachment}
              availableRuleOptions={factionRules.allAvailableRuleOptions}
              activeRuleOptionIds={ruleOptions.activeRuleOptionIds}
              toggleRuleOption={ruleOptions.toggleRuleOption}
              stratagems={factionRules.stratagems}
              enhancements={factionRules.enhancements}
              activeEnhancementIds={enhancementOptions.activeEnhancementIds}
              toggleEnhancement={enhancementOptions.toggleEnhancement}
              activeStratagemIds={stratagemOptions.activeStratagemIds}
              toggleStratagem={stratagemOptions.toggleStratagem}
              attackerUnitAbilityOptions={attackerUnitAbilityRuleOptions}
              activeAttackerUnitAbilityIds={
                attackerUnitAbilityOptions.activeRuleOptionIds
              }
              toggleAttackerUnitAbility={
                attackerUnitAbilityOptions.toggleRuleOption
              }
              defenderUnitAbilityOptions={defenderUnitAbilityRuleOptions}
              activeDefenderUnitAbilityIds={
                defenderUnitAbilityOptions.activeRuleOptionIds
              }
              toggleDefenderUnitAbility={
                defenderUnitAbilityOptions.toggleRuleOption
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

function validateSimulationSummary(summary: SimulationSummary) {
  const values = Object.entries(summary);

  for (const [key, value] of values) {
    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new Error(`Simulation produced a non-finite value for "${key}".`);
    }
  }
}

function getSimulationErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Simulation failed for this setup.";
}
