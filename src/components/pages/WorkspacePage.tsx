import { PageHeader } from "../PageHeader";
import { WorkspaceView } from "../WorkspaceView";
import { SimulationPanel } from "../SimulationPanel";
import { ExpectedResultPanel } from "../ExpectedResultPanel";
import { AttackBreakdownSourcesPanel } from "../AttackBreakdownSourcesPanel";
import { ModifiersPanel } from "../ModifiersPanel";
import type { ArmyPreset } from "../../types/army";
import type { AttackConditions } from "../../types/combat";
import type { SimulationSummary } from "../../lib/combat/simulation/analyzeSimulation";
import type { CalculationMode } from "../../lib/combat/simulation/runSimulationByMode";
import type { DamageResult } from "../../types/combat";
import type { AttackBreakdownExplanation } from "../../lib/combat/explainAttackBreakdown";

interface WorkspacePageProps {
  armies: ArmyPreset[];
  workspaceArmyA: string | null;
  workspaceArmyB: string | null;
  setWorkspaceArmyA: (id: string | null) => void;
  setWorkspaceArmyB: (id: string | null) => void;
  attackerId: string;
  defenderId: string;
  conditions: AttackConditions;
  setConditions: (c: AttackConditions) => void;
  selectAttacker: (faction: string, unitId: string, weaponId: string) => void;
  selectDefender: (faction: string, unitId: string) => void;
  // Calculation props
  expectedResult: DamageResult;
  attackBreakdownExplanation: AttackBreakdownExplanation;
  mode: CalculationMode;
  setMode: (mode: CalculationMode) => void;
  runs: number;
  setRuns: (runs: number) => void;
  onRunSimulation: () => void;
  simulationSummary: SimulationSummary | null;
  simulationError: string | null;
  isSimulationRunning: boolean;
  // Modifiers panel props
  activeAttackModifiers: any;
  setActiveAttackModifiers: any;
  attackerActiveModifierRules: any;
  defenderActiveModifierRules: any;
  selectedWeapon: any;
  attacker: any;
  defender: any;
  availableDetachments: any;
  selectedDetachmentId: string | null;
  setSelectedDetachmentId: (id: string | null) => void;
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
  attackerId,
  defenderId,
  conditions,
  setConditions,
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
  attackerUnitAbilityOptions,
  activeAttackerUnitAbilityIds,
  toggleAttackerUnitAbility,
  defenderUnitAbilityOptions,
  activeDefenderUnitAbilityIds,
  toggleDefenderUnitAbility,
}: WorkspacePageProps) {
  const armyA = armies.find((a) => a.id === workspaceArmyA);
  const armyB = armies.find((a) => a.id === workspaceArmyB);
  const showAnalysis = armyA && armyB;

  return (
    <div className="workspace-page">
      <PageHeader
        title="Battle Workspace"
        subtitle="Compare two armies and run instant matchups."
        helperText="Load your army and your opponent's army to simulate attacks instantly."
      />

      <WorkspaceView
        armies={armies}
        workspaceArmyA={workspaceArmyA}
        workspaceArmyB={workspaceArmyB}
        setWorkspaceArmyA={setWorkspaceArmyA}
        setWorkspaceArmyB={setWorkspaceArmyB}
        attackerId={attackerId}
        defenderId={defenderId}
        conditions={conditions}
        setConditions={setConditions}
        selectAttacker={selectAttacker}
        selectDefender={selectDefender}
      />

      {showAnalysis && (
        <div className="workspace-page__analysis">
          <p className="workspace-page__helper-text">
            Select units from each army to analyze their matchup.
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
