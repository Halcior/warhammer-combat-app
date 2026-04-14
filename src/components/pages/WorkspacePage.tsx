import { PageHeader } from "../PageHeader";
import { WorkspaceView } from "../WorkspaceView";
import { SimulationPanel } from "../SimulationPanel";
import { ExpectedResultPanel } from "../ExpectedResultPanel";
import { AttackBreakdownSourcesPanel } from "../AttackBreakdownSourcesPanel";
import { ModifiersPanel } from "../ModifiersPanel";
import type { ArmyPresetV2 } from "../../types/armyPreset";
import type { AttackConditions } from "../../types/combat";
import type { SimulationSummary } from "../../lib/combat/simulation/analyzeSimulation";
import type { CalculationMode } from "../../lib/combat/simulation/runSimulationByMode";
import type { AttackBreakdownExplanation } from "../../lib/combat/explainAttackBreakdown";
import type { ExpectedDamageResult } from "../../lib/combat/types";

interface WorkspacePageProps {
  armies: ArmyPresetV2[];
  workspaceArmyA: string | null;
  workspaceArmyB: string | null;
  setWorkspaceArmyA: (id: string | null) => void;
  setWorkspaceArmyB: (id: string | null) => void;
  attackerFaction: string;
  defenderFaction: string;
  attackerId: string;
  defenderId: string;
  weaponId: string;
  attackingModels: number;
  defendingModels: number;
  conditions: AttackConditions;
  setConditions: (c: AttackConditions) => void;
  handleWeaponChange: (weaponId: string) => void;
  setAttackingModels: (value: number) => void;
  setDefendingModels: (value: number) => void;
  selectAttacker: (faction: string, unitId: string, weaponId: string) => void;
  selectDefender: (faction: string, unitId: string) => void;
  expectedResult: ExpectedDamageResult;
  attackBreakdownExplanation: AttackBreakdownExplanation;
  mode: CalculationMode;
  setMode: (mode: CalculationMode) => void;
  runs: number;
  setRuns: (runs: number) => void;
  onRunSimulation: () => void;
  simulationSummary: SimulationSummary | null;
  simulationError: string | null;
  isSimulationRunning: boolean;
  activeAttackModifiers: any;
  setActiveAttackModifiers: any;
  attackerActiveModifierRules: any;
  defenderActiveModifierRules: any;
  selectedWeapon: any;
  attacker: any;
  defender: any;
  availableDetachments: any;
  selectedDetachmentId: string;
  setSelectedDetachmentId: React.Dispatch<React.SetStateAction<string>>;
  selectedDetachment: any;
  availableRuleOptions: any;
  activeRuleOptionIds: string[];
  toggleRuleOption: (id: string) => void;
  stratagems: any;
  enhancements: any;
  activeEnhancementIds: string[];
  toggleEnhancement: (id: string) => void;
  activeStratagemIds: string[];
  toggleStratagem: (id: string) => void;
  defenderAvailableDetachments: any;
  defenderSelectedDetachmentId: string;
  setDefenderSelectedDetachmentId: React.Dispatch<React.SetStateAction<string>>;
  defenderAvailableRuleOptions: any;
  activeDefenderDetachmentRuleOptionIds: string[];
  toggleDefenderDetachmentRuleOption: (id: string) => void;
  defenderDetachmentStratagems: any;
  defenderDetachmentEnhancements: any;
  activeDefenderDetachmentEnhancementIds: string[];
  toggleDefenderDetachmentEnhancement: (id: string) => void;
  activeDefenderDetachmentStratagemIds: string[];
  toggleDefenderDetachmentStratagem: (id: string) => void;
  attackerUnitAbilityOptions: any;
  activeAttackerUnitAbilityIds: string[];
  toggleAttackerUnitAbility: (id: string) => void;
  defenderUnitAbilityOptions: any;
  activeDefenderUnitAbilityIds: string[];
  toggleDefenderUnitAbility: (id: string) => void;
}

export function WorkspacePage({
  armies,
  workspaceArmyA,
  workspaceArmyB,
  setWorkspaceArmyA,
  setWorkspaceArmyB,
  attackerFaction,
  defenderFaction,
  attackerId,
  defenderId,
  weaponId,
  attackingModels,
  defendingModels,
  conditions,
  setConditions,
  handleWeaponChange,
  setAttackingModels,
  setDefendingModels,
  selectAttacker,
  selectDefender,
  expectedResult,
  attackBreakdownExplanation,
  mode,
  setMode,
  runs,
  setRuns,
  onRunSimulation,
  simulationSummary,
  simulationError,
  isSimulationRunning,
  activeAttackModifiers,
  setActiveAttackModifiers,
  attackerActiveModifierRules,
  defenderActiveModifierRules,
  selectedWeapon,
  attacker,
  defender,
  availableDetachments,
  selectedDetachmentId,
  setSelectedDetachmentId,
  selectedDetachment,
  availableRuleOptions,
  activeRuleOptionIds,
  toggleRuleOption,
  stratagems,
  enhancements,
  activeEnhancementIds,
  toggleEnhancement,
  activeStratagemIds,
  toggleStratagem,
  defenderAvailableDetachments,
  defenderSelectedDetachmentId,
  setDefenderSelectedDetachmentId,
  defenderAvailableRuleOptions,
  activeDefenderDetachmentRuleOptionIds,
  toggleDefenderDetachmentRuleOption,
  defenderDetachmentStratagems,
  defenderDetachmentEnhancements,
  activeDefenderDetachmentEnhancementIds,
  toggleDefenderDetachmentEnhancement,
  activeDefenderDetachmentStratagemIds,
  toggleDefenderDetachmentStratagem,
  attackerUnitAbilityOptions,
  activeAttackerUnitAbilityIds,
  toggleAttackerUnitAbility,
  defenderUnitAbilityOptions,
  activeDefenderUnitAbilityIds,
  toggleDefenderUnitAbility,
}: WorkspacePageProps) {
  const armyA = armies.find((army) => army.id === workspaceArmyA);
  const armyB = armies.find((army) => army.id === workspaceArmyB);
  const showAnalysis = armyA && armyB;

  return (
    <div className="workspace-page">
      <PageHeader
        title="Battle Workspace"
        subtitle="Load two saved armies, pick units instantly and pressure-test matchups."
        helperText="This view is meant for rapid tabletop comparisons, not full army list editing."
      />

      <WorkspaceView
        armies={armies}
        workspaceArmyA={workspaceArmyA}
        workspaceArmyB={workspaceArmyB}
        setWorkspaceArmyA={setWorkspaceArmyA}
        setWorkspaceArmyB={setWorkspaceArmyB}
        attackerFaction={attackerFaction}
        defenderFaction={defenderFaction}
        attackerId={attackerId}
        defenderId={defenderId}
        weaponId={weaponId}
        attackingModels={attackingModels}
        defendingModels={defendingModels}
        conditions={conditions}
        setConditions={setConditions}
        handleWeaponChange={handleWeaponChange}
        setAttackingModels={setAttackingModels}
        setDefendingModels={setDefendingModels}
        selectAttacker={selectAttacker}
        selectDefender={selectDefender}
      />

      {showAnalysis && (
        <div className="workspace-page__analysis">
          <p className="workspace-page__helper-text">
            Both armies are loaded. Select any unit pair above to inspect the
            matchup and adjust the battlefield state.
          </p>

          <div className="workspace-grid">
            <div className="workspace-main">
              <SimulationPanel
                mode={mode}
                setMode={setMode}
                runs={runs}
                setRuns={setRuns}
                onRun={onRunSimulation}
                summary={simulationSummary}
                error={simulationError}
                isRunning={isSimulationRunning}
              />

              <div className="analysis-grid">
                <ExpectedResultPanel expectedResult={expectedResult} />
                <AttackBreakdownSourcesPanel explanation={attackBreakdownExplanation} />
              </div>
            </div>

            <div className="workspace-sidebar">
              <ModifiersPanel
                activeAttackModifiers={activeAttackModifiers}
                setActiveAttackModifiers={setActiveAttackModifiers}
                attackerActiveModifierRules={attackerActiveModifierRules}
                defenderActiveModifierRules={defenderActiveModifierRules}
                selectedWeapon={selectedWeapon}
                attacker={attacker}
                defender={defender}
                availableDetachments={availableDetachments}
                selectedDetachmentId={selectedDetachmentId}
                setSelectedDetachmentId={setSelectedDetachmentId}
                selectedDetachment={selectedDetachment}
                availableRuleOptions={availableRuleOptions}
                activeRuleOptionIds={activeRuleOptionIds}
                toggleRuleOption={toggleRuleOption}
                stratagems={stratagems}
                enhancements={enhancements}
                activeEnhancementIds={activeEnhancementIds}
                toggleEnhancement={toggleEnhancement}
                activeStratagemIds={activeStratagemIds}
                toggleStratagem={toggleStratagem}
                defenderAvailableDetachments={defenderAvailableDetachments}
                defenderSelectedDetachmentId={defenderSelectedDetachmentId}
                setDefenderSelectedDetachmentId={setDefenderSelectedDetachmentId}
                defenderAvailableRuleOptions={defenderAvailableRuleOptions}
                activeDefenderDetachmentRuleOptionIds={activeDefenderDetachmentRuleOptionIds}
                toggleDefenderDetachmentRuleOption={toggleDefenderDetachmentRuleOption}
                defenderDetachmentStratagems={defenderDetachmentStratagems}
                defenderDetachmentEnhancements={defenderDetachmentEnhancements}
                activeDefenderDetachmentEnhancementIds={activeDefenderDetachmentEnhancementIds}
                toggleDefenderDetachmentEnhancement={toggleDefenderDetachmentEnhancement}
                activeDefenderDetachmentStratagemIds={activeDefenderDetachmentStratagemIds}
                toggleDefenderDetachmentStratagem={toggleDefenderDetachmentStratagem}
                attackerUnitAbilityOptions={attackerUnitAbilityOptions}
                activeAttackerUnitAbilityIds={activeAttackerUnitAbilityIds}
                toggleAttackerUnitAbility={toggleAttackerUnitAbility}
                defenderUnitAbilityOptions={defenderUnitAbilityOptions}
                activeDefenderUnitAbilityIds={activeDefenderUnitAbilityIds}
                toggleDefenderUnitAbility={toggleDefenderUnitAbility}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
