// ── UI Session (view + workspace) ─────────────────────────────────────────────

const UI_KEY = "df_ui_session_v1";

type UISession = {
  view: "calculator" | "armies" | "workspace" | "updates";
  workspaceArmyA: string | null;
  workspaceArmyB: string | null;
  updatesHintDismissed?: boolean;
};

export function loadUISession(): Partial<UISession> {
  try {
    const raw = localStorage.getItem(UI_KEY);
    return raw ? (JSON.parse(raw) as Partial<UISession>) : {};
  } catch {
    return {};
  }
}

export function saveUISession(state: UISession): void {
  try {
    localStorage.setItem(UI_KEY, JSON.stringify(state));
  } catch {
    // storage quota exceeded — silent fail
  }
}

// ── Battle Setup ──────────────────────────────────────────────────────────────

const BATTLE_KEY = "df_battle_setup_v1";

export type SavedBattleSetup = {
  attackerFaction: string;
  attackerId: string;
  weaponId: string;
  defenderFaction: string;
  defenderId: string;
  attackingModels: number;
  defendingModels: number;
};

export function loadBattleSetup(): Partial<SavedBattleSetup> {
  try {
    const raw = localStorage.getItem(BATTLE_KEY);
    return raw ? (JSON.parse(raw) as Partial<SavedBattleSetup>) : {};
  } catch {
    return {};
  }
}

export function saveBattleSetup(state: SavedBattleSetup): void {
  try {
    localStorage.setItem(BATTLE_KEY, JSON.stringify(state));
  } catch {
    // storage quota exceeded — silent fail
  }
}
