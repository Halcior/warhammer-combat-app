import { useEffect, useMemo, useState } from "react";
import "./App.css";
import appLogo from "./assets/Nowe_Logo_header.png";
import { calculateExpectedDamage } from "./lib/combat";
import { runSimulationByMode } from "./lib/combat/simulation/runSimulationByMode";

import { useBattleSetup } from "./hooks/useBattleSetup";
import { useAttackModifiers } from "./hooks/useAttackModifiers";
import { useFactionRules } from "./hooks/useFactionRules";
import {
  useRuleOptions,
  useEnhancementOptions,
  useStratagemOptions,
} from "./hooks/useRuleOptions";
import { useSidedRuleOptions } from "./hooks/useSidedRuleOptions";

import type { SimulationSummary } from "./lib/combat/simulation/analyzeSimulation";
import type { CalculationMode } from "./lib/combat/simulation/runSimulationByMode";

import { guardAttackerModifiers, guardDefenderModifiers } from "./lib/combat/combatRoleGuards";
import { explainAttackBreakdown } from "./lib/combat/explainAttackBreakdown";
import type { AppView } from "./components/AppNav";
import { useArmyPresets } from "./hooks/useArmyPresets";
import { loadBattleSetup, loadUISession, saveUISession } from "./lib/storage/uiStorage";
import { loadArmies } from "./lib/storage/armyStorage";

import { CalculatorPage } from "./components/pages/CalculatorPage";
import { ArmiesPage } from "./components/pages/ArmiesPage";
import { WorkspacePage } from "./components/pages/WorkspacePage";
import { UpdatesPage } from "./components/pages/UpdatesPage";
import type { Unit } from "./types/combat";
import type { NormalizedDetachment } from "./types/wahapedia";

type LoadedAppProps = {
  units: Unit[];
  detachments: NormalizedDetachment[];
};

function LoadedApp({ units, detachments }: LoadedAppProps) {
  const battleSetup = useBattleSetup(units);
  const attackModifiers = useAttackModifiers();
  const factionRules = useFactionRules(battleSetup.attackerFaction, detachments);
  const ruleOptions = useSidedRuleOptions(factionRules.allAvailableRuleOptions);
  const enhancementOptions = useEnhancementOptions(factionRules.enhancements);
  const stratagemOptions = useStratagemOptions(factionRules.stratagems);

  const defenderFactionRules = useFactionRules(battleSetup.defenderFaction, detachments);
  const defenderDetachmentRuleOptions = useRuleOptions(defenderFactionRules.allAvailableRuleOptions);
  const defenderDetachmentEnhancementOptions = useEnhancementOptions(defenderFactionRules.enhancements);
  const defenderDetachmentStratagemOptions = useStratagemOptions(defenderFactionRules.stratagems);

  const armyPresets = useArmyPresets();
  
  const session = loadUISession();
  const [view, setView] = useState<AppView>(session.view ?? "calculator");
  const [workspaceArmyA, setWorkspaceArmyA] = useState<string | null>(session.workspaceArmyA ?? null);
  const [workspaceArmyB, setWorkspaceArmyB] = useState<string | null>(session.workspaceArmyB ?? null);
  const [updatesHintDismissed, setUpdatesHintDismissed] = useState(
    session.updatesHintDismissed ?? false
  );

  useEffect(() => {
    saveUISession({ view, workspaceArmyA, workspaceArmyB, updatesHintDismissed });
  }, [view, workspaceArmyA, workspaceArmyB, updatesHintDismissed]);

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

  // Attacker modifier rules fed to the engine.
  //
  // useSidedRuleOptions routes each attacker detachment rule into the correct
  // side bucket (attacker vs defender) based on inferRuleOptionSide, and
  // pre-applies guardAttackerModifiers so offensive types from defender-panel
  // rules cannot bleed into this list. enhancements / stratagems are always
  // attacker-side; an extra guardAttackerModifiers pass catches any
  // miscategorised types in data.
  const attackerScopedModifierRules = useMemo(() => {
    return guardAttackerModifiers([
      ...attackModifiers.allActiveModifierRules,
      ...ruleOptions.attackerModifiers,
      ...enhancementOptions.activeEnhancementEffects,
      ...stratagemOptions.activeStratagemEffects,
      ...attackerUnitAbilityOptions.activeRuleModifiers,
    ]);
  }, [
    attackModifiers.allActiveModifierRules,
    ruleOptions.attackerModifiers,
    enhancementOptions.activeEnhancementEffects,
    stratagemOptions.activeStratagemEffects,
    attackerUnitAbilityOptions.activeRuleModifiers,
  ]);

  // Defender modifier rules fed to the engine.
  //
  // ruleOptions.defenderModifiers carries attacker detachment rules inferred
  // as defender-side (e.g. appliesTo:"defender" or modifier-score-based
  // inference). guardDefenderModifiers is applied inside useSidedRuleOptions
  // and again here as a belt-and-suspenders pass over all sources.
  const defenderScopedModifierRules = useMemo(() => {
    return guardDefenderModifiers([
      ...ruleOptions.defenderModifiers,
      ...defenderUnitAbilityOptions.activeRuleModifiers,
      ...defenderDetachmentRuleOptions.activeRuleModifiers,
      ...defenderDetachmentEnhancementOptions.activeEnhancementEffects,
      ...defenderDetachmentStratagemOptions.activeStratagemEffects,
    ]);
  }, [
    ruleOptions.defenderModifiers,
    defenderUnitAbilityOptions.activeRuleModifiers,
    defenderDetachmentRuleOptions.activeRuleModifiers,
    defenderDetachmentEnhancementOptions.activeEnhancementEffects,
    defenderDetachmentStratagemOptions.activeStratagemEffects,
  ]);

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

  const simulationInputSignature = useMemo(() => {
    return JSON.stringify({
      mode,
      runs,
      attackerId: battleSetup.attacker.id,
      defenderId: battleSetup.defender.id,
      weaponId: battleSetup.selectedWeapon.id,
      compareWeaponId: compareWeapon.id,
      attackingModels: battleSetup.attackingModels,
      defendingModels: battleSetup.defendingModels,
      defenderWoundsPerModel: battleSetup.defender.woundsPerModel,
      conditions: battleSetup.conditions,
      attackerRules: attackerScopedModifierRules,
      defenderRules: defenderScopedModifierRules,
      expectedDamage: {
        totalAttacks: expectedResult.totalAttacks,
        hitTarget: expectedResult.hitTarget,
        woundTarget: expectedResult.woundTarget,
        saveTarget: expectedResult.saveTarget,
        expectedHits: expectedResult.expectedHits,
        expectedWounds: expectedResult.expectedWounds,
        expectedUnsavedWounds: expectedResult.expectedUnsavedWounds,
        expectedDamage: expectedResult.expectedDamage,
        expectedSlainModels: expectedResult.expectedSlainModels,
        attacksPerModel: expectedResult.attacksPerModel,
        damagePerFailedSave: expectedResult.damagePerFailedSave,
        blastBonus: expectedResult.blastBonus,
        criticalHits: expectedResult.criticalHits,
        extraHitsFromSustained: expectedResult.extraHitsFromSustained,
        autoWoundsFromLethalHits: expectedResult.autoWoundsFromLethalHits,
        criticalWoundsFromRolls: expectedResult.criticalWoundsFromRolls,
        mortalWoundsFromDevastating: expectedResult.mortalWoundsFromDevastating,
        effectiveAp: expectedResult.effectiveAp,
      },
    });
  }, [
    mode,
    runs,
    battleSetup.attacker.id,
    battleSetup.defender.id,
    battleSetup.selectedWeapon.id,
    compareWeapon.id,
    battleSetup.attackingModels,
    battleSetup.defendingModels,
    battleSetup.defender.woundsPerModel,
    battleSetup.conditions,
    attackerScopedModifierRules,
    defenderScopedModifierRules,
    expectedResult,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: simulationInputSignature is a derived hash of all simulation inputs; listing them individually would re-run the effect on every reference change rather than on value changes.
  }, [simulationInputSignature, simulationRefreshKey]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="page-shell">
          <div className="app-header__content">
            <a className="app-header__brand" href="#top">
              <img
                className="app-header__logo"
                src={appLogo}
                alt="DamageForge logo"
              />
              <span className="app-header__brand-name">DamageForge</span>
            </a>

            <nav className="app-header__nav" aria-label="Views">
              <button
                className={`app-header__tab ${view === "calculator" ? "app-header__tab--active" : ""}`}
                onClick={() => setView("calculator")}
              >
                Calculator
              </button>
              <button
                className={`app-header__tab ${view === "armies" ? "app-header__tab--active" : ""}`}
                onClick={() => setView("armies")}
              >
                My Armies
              </button>
              <button
                className={`app-header__tab ${view === "workspace" ? "app-header__tab--active" : ""}`}
                onClick={() => setView("workspace")}
              >
                Battle Workspace
              </button>
              <button
                className={`app-header__tab ${view === "updates" ? "app-header__tab--active" : ""}`}
                onClick={() => setView("updates")}
              >
                Updates
              </button>
            </nav>

            <div className="app-header__actions">
              <a
                className="app-header__discord"
                href="https://discord.gg/f5hQXr2Hc7"
                target="_blank"
                rel="noreferrer"
                title="Join our Discord community"
              >
                Discord
              </a>
              <a
                className="app-header__support"
                href="https://buymeacoffee.com/damageforge"
                target="_blank"
                rel="noreferrer"
              >
                Support
              </a>
            </div>

          </div>
        </div>
      </header>

      <main className="page-shell app-main">
        {!updatesHintDismissed && (
          <section className="updates-hint card" aria-label="Tester updates hint">
            <div className="updates-hint__copy">
              <p className="panel-eyebrow">For testers</p>
              <h2 className="updates-hint__title">Check Updates before deeper testing.</h2>
              <p className="updates-hint__text">
                It covers the current alpha status, best-supported factions, known limitations
                and the parts of the app that are still actively moving.
              </p>
            </div>

            <div className="updates-hint__actions">
              <button
                className="button-link button-link--primary"
                onClick={() => setView("updates")}
              >
                Open Updates
              </button>
              <button
                className="button-link button-link--ghost"
                onClick={() => setUpdatesHintDismissed(true)}
              >
                Dismiss
              </button>
            </div>
          </section>
        )}

        {view === "calculator" && (
          <CalculatorPage
            battleSetup={battleSetup}
            attackModifiers={attackModifiers}
            factionRules={factionRules}
            ruleOptions={ruleOptions}
            enhancementOptions={enhancementOptions}
            stratagemOptions={stratagemOptions}
            defenderFactionRules={defenderFactionRules}
            defenderDetachmentRuleOptions={defenderDetachmentRuleOptions}
            defenderDetachmentEnhancementOptions={defenderDetachmentEnhancementOptions}
            defenderDetachmentStratagemOptions={defenderDetachmentStratagemOptions}
            expectedResult={expectedResult}
            attackBreakdownExplanation={attackBreakdownExplanation}
            compareWeapon={compareWeapon}
            compareResult={compareResult}
            attackerUnitAbilityRuleOptions={attackerUnitAbilityRuleOptions}
            attackerUnitAbilityOptions={attackerUnitAbilityOptions}
            defenderUnitAbilityRuleOptions={defenderUnitAbilityRuleOptions}
            defenderUnitAbilityOptions={defenderUnitAbilityOptions}
            attackerScopedModifierRules={attackerScopedModifierRules}
            defenderScopedModifierRules={defenderScopedModifierRules}
            mode={mode}
            setMode={setMode}
            runs={runs}
            setRuns={setRuns}
            onRunSimulation={handleRunSimulation}
            simulationSummary={simulationSummary}
            simulationError={simulationError}
            isSimulationRunning={isSimulationRunning}
            compareWeaponId={compareWeaponId}
            setCompareWeaponId={setCompareWeaponId}
            armies={armyPresets.armies}
            unitDefinitions={units}
          />
        )}

        {view === "armies" && (
          <ArmiesPage
            armies={armyPresets.armies}
            canCreate={armyPresets.canCreate}
            freeLimit={armyPresets.freeLimit}
            onAdd={armyPresets.addArmy}
            onEdit={armyPresets.editArmy}
            onDelete={armyPresets.removeArmy}
            onDuplicate={armyPresets.dupeArmy}
            setView={setView}
            availableUnits={units}
            availableDetachments={detachments}
            onOpenWorkspace={(armyId, sv) => {
              setWorkspaceArmyA(armyId);
              sv("workspace");
            }}
          />
        )}

        {view === "workspace" && (
            <WorkspacePage
              armies={armyPresets.armies}
              unitDefinitions={units}
              workspaceArmyA={workspaceArmyA}
              workspaceArmyB={workspaceArmyB}
              setWorkspaceArmyA={setWorkspaceArmyA}
              setWorkspaceArmyB={setWorkspaceArmyB}
              attackerFaction={battleSetup.attackerFaction}
              defenderFaction={battleSetup.defenderFaction}
              attackerId={battleSetup.attackerId}
              defenderId={battleSetup.defenderId}
              weaponId={battleSetup.weaponId}
              attackingModels={battleSetup.attackingModels}
              defendingModels={battleSetup.defendingModels}
              conditions={battleSetup.conditions}
              setConditions={battleSetup.setConditions}
              handleWeaponChange={battleSetup.handleWeaponChange}
              setAttackingModels={battleSetup.setAttackingModels}
              setDefendingModels={battleSetup.setDefendingModels}
              selectAttacker={battleSetup.selectAttacker}
              selectDefender={battleSetup.selectDefender}
            expectedResult={expectedResult}
            attackBreakdownExplanation={attackBreakdownExplanation}
            mode={mode}
            setMode={setMode}
            runs={runs}
            setRuns={setRuns}
            onRunSimulation={handleRunSimulation}
            simulationSummary={simulationSummary}
            simulationError={simulationError}
            isSimulationRunning={isSimulationRunning}
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
            activeRuleOptionIdsBySide={ruleOptions.activeRuleOptionIdsBySide}
            toggleRuleOptionForSide={ruleOptions.toggleRuleOptionForSide}
            stratagems={factionRules.stratagems}
            enhancements={factionRules.enhancements}
            activeEnhancementIds={enhancementOptions.activeEnhancementIds}
            toggleEnhancement={enhancementOptions.toggleEnhancement}
            activeStratagemIds={stratagemOptions.activeStratagemIds}
            toggleStratagem={stratagemOptions.toggleStratagem}
            defenderAvailableDetachments={defenderFactionRules.availableDetachments}
            defenderSelectedDetachmentId={defenderFactionRules.selectedDetachmentId}
            setDefenderSelectedDetachmentId={defenderFactionRules.setSelectedDetachmentId}
            defenderAvailableRuleOptions={defenderFactionRules.allAvailableRuleOptions}
            activeDefenderDetachmentRuleOptionIds={defenderDetachmentRuleOptions.activeRuleOptionIds}
            toggleDefenderDetachmentRuleOption={defenderDetachmentRuleOptions.toggleRuleOption}
            defenderDetachmentStratagems={defenderFactionRules.stratagems}
            defenderDetachmentEnhancements={defenderFactionRules.enhancements}
            activeDefenderDetachmentEnhancementIds={defenderDetachmentEnhancementOptions.activeEnhancementIds}
            toggleDefenderDetachmentEnhancement={defenderDetachmentEnhancementOptions.toggleEnhancement}
            activeDefenderDetachmentStratagemIds={defenderDetachmentStratagemOptions.activeStratagemIds}
            toggleDefenderDetachmentStratagem={defenderDetachmentStratagemOptions.toggleStratagem}
            attackerUnitAbilityOptions={attackerUnitAbilityRuleOptions}
            activeAttackerUnitAbilityIds={attackerUnitAbilityOptions.activeRuleOptionIds}
            toggleAttackerUnitAbility={attackerUnitAbilityOptions.toggleRuleOption}
            defenderUnitAbilityOptions={defenderUnitAbilityRuleOptions}
            activeDefenderUnitAbilityIds={defenderUnitAbilityOptions.activeRuleOptionIds}
            toggleDefenderUnitAbility={defenderUnitAbilityOptions.toggleRuleOption}
          />
        )}

        {view === "updates" && <UpdatesPage />}
      </main>
    </div>
  );
}

function App() {
  const [loadedData, setLoadedData] = useState<LoadedAppProps | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([import("./data/loadAllUnits"), import("./data/loadDetachments")])
      .then(async ([unitsModule, detachmentsModule]) => {
        const savedBattleSetup = loadBattleSetup();
        const savedUISession = loadUISession();
        const savedArmies = loadArmies();
        const priorityFactions = unitsModule.resolvePriorityUnitFactions({
          battleSetup: savedBattleSetup,
          uiSession: savedUISession,
          armies: savedArmies,
        });

        const [units, detachments] = await Promise.all([
          unitsModule.loadUnitsForFactions(priorityFactions),
          detachmentsModule.loadDetachmentsForFactions(priorityFactions),
        ]);

        if (cancelled) {
          return;
        }

        setLoadedData({
          units,
          detachments,
        });

        void unitsModule
          .loadRemainingUnits(priorityFactions)
          .then((remainingUnits) => {
            if (cancelled || remainingUnits.length === 0) {
              return;
            }

            setLoadedData((current) => {
              if (!current) {
                return current;
              }

              return {
                ...current,
                units: mergeUnitsById(current.units, remainingUnits),
              };
            });
          })
          .catch(() => {
            // Background hydration is best-effort only.
          });

        void detachmentsModule
          .loadRemainingDetachments(priorityFactions)
          .then((remainingDetachments) => {
            if (cancelled || remainingDetachments.length === 0) {
              return;
            }

            setLoadedData((current) => {
              if (!current) {
                return current;
              }

              return {
                ...current,
                detachments: mergeDetachmentsById(
                  current.detachments,
                  remainingDetachments
                ),
              };
            });
          })
          .catch(() => {
            // Background hydration is best-effort only.
          });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setLoadingError(error instanceof Error ? error.message : "Failed to load app data.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loadingError) {
    return (
      <div className="app">
        <main className="page-shell app-main">
          <section className="card app-loading-state">
            <p className="panel-eyebrow">Startup Error</p>
            <h1 className="app-loading-state__title">DamageForge couldn't load its data.</h1>
            <p className="muted-text">{loadingError}</p>
          </section>
        </main>
      </div>
    );
  }

  if (!loadedData) {
    return (
      <div className="app">
        <main className="page-shell app-main">
          <section className="card app-loading-state">
            <p className="panel-eyebrow">Loading</p>
            <h1 className="app-loading-state__title">Preparing units and detachments…</h1>
            <p className="muted-text">
              Heavy game data is loading separately so the app shell can start faster.
            </p>
          </section>
        </main>
      </div>
    );
  }

  return <LoadedApp units={loadedData.units} detachments={loadedData.detachments} />;
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

function mergeUnitsById(existingUnits: Unit[], incomingUnits: Unit[]): Unit[] {
  const mergedUnits = new Map(existingUnits.map((unit) => [unit.id, unit]));

  incomingUnits.forEach((unit) => {
    if (!mergedUnits.has(unit.id)) {
      mergedUnits.set(unit.id, unit);
    }
  });

  return Array.from(mergedUnits.values());
}

function mergeDetachmentsById(
  existingDetachments: NormalizedDetachment[],
  incomingDetachments: NormalizedDetachment[]
): NormalizedDetachment[] {
  const mergedDetachments = new Map(
    existingDetachments.map((detachment) => [detachment.id, detachment])
  );

  incomingDetachments.forEach((detachment) => {
    if (!mergedDetachments.has(detachment.id)) {
      mergedDetachments.set(detachment.id, detachment);
    }
  });

  return Array.from(mergedDetachments.values());
}
