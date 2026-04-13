# Layout & UX Refactoring Plan

## Current State Analysis

**Problems:**
- Shared hero block "Launch the analysis stack" appears on all views
- Docs/Sources/Pricing cards repeated on every section
- Views feel like tabs of one page, not distinct tools
- My Armies feels empty and lacks purpose
- Battle Workspace lacks clear flow

**Current structure:**
```
App.tsx (main)
├── Hero section (large landing page header)
├── Feature showcase section
├── AppNav (tab navigation)
└── app-shell (containers all views)
    ├── app-shell__intro ("Launch the analysis stack")
    ├── info-cards (Docs/Sources/Pricing)
    └── View-specific content (ArmiesView, calculator panels, WorkspaceView)
```

---

## Proposed New Structure

### 1. App.tsx (Restructured)

```
App.tsx (refactored to be layout router)
├── Header (top navigation bar - always visible)
│   ├── Logo
│   ├── Tab navigation (Calculator | My Armies | Battle Workspace)
│   └── External links (GitHub)
│
└── Main content area (one of):
    ├── CalculatorPage
    │   ├── PageHeader (with hero if needed, or simplified)
    │   ├── SetupPanel
    │   ├── workspace-grid
    │   │   ├── workspace-main
    │   │   │   ├── SimulationPanel
    │   │   │   ├── ExpectedResultPanel
    │   │   │   ├── AttackBreakdownSourcesPanel
    │   │   │   └── CompareWeaponsPanel
    │   │   └── workspace-sidebar (ModifiersPanel)
    │   └── Docs/Sources/Pricing (moved here ONLY)
    │
    ├── ArmiesPage
    │   ├── PageHeader ("My Armies" - simple, no hero)
    │   ├── ArmiesView (refactored)
    │   │   ├── EmptyState (if no armies)
    │   │   │   ├── CTA button
    │   │   │   └── Preview card
    │   │   └── ArmyGrid
    │   │       └── ArmyCard[] (each with name, faction, units, points)
    │   └── NO sidebar
    │
    └── WorkspacePage
        ├── PageHeader ("Battle Workspace" - simple)
        ├── WorkspaceView (refactored)
        │   ├── TwoColumnPanel
        │   │   ├── LeftPanel (Army A)
        │   │   │   ├── ArmySelector dropdown
        │   │   │   └── ArmyPreview
        │   │   └── RightPanel (Army B)
        │   │       ├── ArmySelector dropdown
        │   │       └── ArmyPreview
        │   └── Helper text
        │
        ├── workspace-grid (calculator analysis below)
        │   ├── workspace-main
        │   │   ├── SimulationPanel
        │   │   └── analysis-grid (Expected + Breakdown)
        │   └── workspace-sidebar (ModifiersPanel)
        │
        └── NO sidebar info cards
```

---

## 2. New Components to Create

### A. PageHeader component

```tsx
// src/components/PageHeader.tsx

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  helperText?: string;
}

export function PageHeader({ title, subtitle, helperText }: PageHeaderProps) {
  return (
    <div className="page-header">
      <h1 className="page-header__title">{title}</h1>
      {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      {helperText && <p className="page-header__helper">{helperText}</p>}
    </div>
  );
}
```

**CSS:**
```css
.page-header {
  padding: 24px 0 32px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 32px;
}

.page-header__title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 8px;
}

.page-header__subtitle {
  font-size: 1.1rem;
  color: var(--text-muted);
  margin: 0 0 8px;
}

.page-header__helper {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 8px 0 0;
}
```

### B. ArmyCard component

```tsx
// src/components/ArmyCard.tsx

import type { ArmyPreset } from "../types/army";

interface ArmyCardProps {
  army: ArmyPreset;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onLoadInWorkspace: () => void;
}

export function ArmyCard({
  army,
  onEdit,
  onDelete,
  onDuplicate,
  onLoadInWorkspace,
}: ArmyCardProps) {
  return (
    <div className="army-card">
      <div className="army-card__header">
        <h3 className="army-card__name">{army.name}</h3>
        <p className="army-card__faction">{army.faction}</p>
      </div>

      <div className="army-card__content">
        <div className="army-card__stat">
          <span className="army-card__stat-label">Units:</span>
          <span className="army-card__stat-value">{army.units.length}</span>
        </div>

        {/* Optional: Points if stored */}
        {/* 
        <div className="army-card__stat">
          <span className="army-card__stat-label">Points:</span>
          <span className="army-card__stat-value">{army.points}</span>
        </div>
        */}

        {/* Unit preview list */}
        {army.units.length > 0 && (
          <div className="army-card__units">
            <p className="army-card__units-label">Units:</p>
            <ul className="army-card__units-list">
              {army.units.slice(0, 3).map((su, idx) => {
                const unitData = units.find(u => u.id === su.unitId);
                return (
                  <li key={idx} className="army-card__unit-item">
                    {su.nickname ?? unitData?.name ?? su.unitId}
                  </li>
                );
              })}
              {army.units.length > 3 && (
                <li className="army-card__unit-item army-card__unit-item--more">
                  +{army.units.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="army-card__actions">
        <button className="army-card__action-btn" onClick={onEdit}>
          Edit
        </button>
        <button className="army-card__action-btn" onClick={onDuplicate}>
          Duplicate
        </button>
        <button
          className="army-card__action-btn army-card__action-btn--workspace"
          onClick={onLoadInWorkspace}
        >
          Use in Workspace
        </button>
        <button
          className="army-card__action-btn army-card__action-btn--danger"
          onClick={() => {
            if (confirm(`Delete "${army.name}"?`)) onDelete();
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
```

**CSS:**
```css
.army-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--surface);
  transition: background 0.12s ease, border-color 0.12s ease;
}

.army-card:hover {
  border-color: var(--accent);
  background: var(--surface-hover);
}

.army-card__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.army-card__name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text);
}

.army-card__faction {
  font-size: 0.85rem;
  color: var(--accent);
  margin: 0;
  font-weight: 500;
}

.army-card__content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-grow: 1;
}

.army-card__stat {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.army-card__stat-label {
  color: var(--text-muted);
}

.army-card__stat-value {
  color: var(--text);
  font-weight: 600;
}

.army-card__units {
  margin-top: 8px;
}

.army-card__units-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0 0 6px;
}

.army-card__units-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.army-card__unit-item {
  font-size: 0.85rem;
  color: var(--text);
  padding-left: 12px;
  position: relative;
}

.army-card__unit-item::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--accent);
}

.army-card__unit-item--more {
  color: var(--text-muted);
  font-style: italic;
}

.army-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-top: 1px solid var(--border);
  padding-top: 12px;
}

.army-card__action-btn {
  flex: 1;
  min-width: 100px;
  padding: 8px 12px;
  border-radius: var(--radius-xs);
  border: 1px solid var(--border);
  background: none;
  color: var(--text);
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}

.army-card__action-btn:hover {
  background: var(--accent-faint);
  color: var(--accent);
  border-color: var(--accent);
}

.army-card__action-btn--workspace {
  flex-basis: 100%;
  background: rgba(242, 106, 27, 0.1);
  border-color: rgba(242, 106, 27, 0.3);
  color: var(--accent);
}

.army-card__action-btn--workspace:hover {
  background: var(--accent);
  color: white;
}

.army-card__action-btn--danger {
  color: #ffb5a6;
}

.army-card__action-btn--danger:hover {
  background: rgba(200, 69, 45, 0.14);
  border-color: rgba(200, 69, 45, 0.3);
  color: #ffb5a6;
}
```

### C. EmptyState component

```tsx
// src/components/EmptyState.tsx

interface EmptyStateProps {
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryText?: string;
}

export function EmptyState({
  title,
  description,
  primaryAction,
  secondaryText,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        {/* Placeholder for icon */}
        <div className="empty-state__icon-placeholder" />
      </div>

      <h2 className="empty-state__title">{title}</h2>
      <p className="empty-state__description">{description}</p>

      {primaryAction && (
        <button
          className="button-link button-link--primary"
          onClick={primaryAction.onClick}
        >
          {primaryAction.label}
        </button>
      )}

      {secondaryText && (
        <p className="empty-state__secondary">{secondaryText}</p>
      )}
    </div>
  );
}
```

**CSS:**
```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 60px 40px;
  text-align: center;
}

.empty-state__icon {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state__icon-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--border), transparent);
  border-radius: 50%;
  opacity: 0.5;
}

.empty-state__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.empty-state__description {
  font-size: 1rem;
  color: var(--text-muted);
  max-width: 400px;
  margin: 0;
}

.empty-state__secondary {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-top: 12px;
}
```

### D. ArmySelector component

```tsx
// src/components/ArmySelector.tsx

import type { ArmyPreset } from "../types/army";

interface ArmySelectorProps {
  armies: ArmyPreset[];
  selectedId: string | null;
  onChange: (armyId: string) => void;
  label: string;
  placeholder: string;
}

export function ArmySelector({
  armies,
  selectedId,
  onChange,
  label,
  placeholder,
}: ArmySelectorProps) {
  return (
    <div className="army-selector">
      <label className="army-selector__label">{label}</label>
      <select
        className="army-selector__select"
        value={selectedId ?? ""}
        onChange={(e) => e.target.value && onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {armies.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name} ({a.faction})
          </option>
        ))}
      </select>
    </div>
  );
}
```

**CSS:**
```css
.army-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.army-selector__label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}

.army-selector__select {
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  font-size: 0.95rem;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.12s ease;
}

.army-selector__select:hover {
  border-color: var(--accent);
}

.army-selector__select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(242, 106, 27, 0.1);
}
```

### E. ArmyPreview component

```tsx
// src/components/ArmyPreview.tsx

import type { ArmyPreset } from "../types/army";
import { units } from "../data/units";

interface ArmyPreviewProps {
  army: ArmyPreset | null;
}

export function ArmyPreview({ army }: ArmyPreviewProps) {
  if (!army) {
    return (
      <div className="army-preview army-preview--empty">
        <p className="army-preview__placeholder">No army selected</p>
      </div>
    );
  }

  return (
    <div className="army-preview">
      <div className="army-preview__header">
        <h3 className="army-preview__name">{army.name}</h3>
        <p className="army-preview__faction">{army.faction}</p>
      </div>

      <div className="army-preview__stats">
        <div className="army-preview__stat">
          <span className="army-preview__stat-label">Units</span>
          <span className="army-preview__stat-value">{army.units.length}</span>
        </div>
      </div>

      {army.units.length > 0 && (
        <div className="army-preview__units">
          <p className="army-preview__units-title">Unit List</p>
          <ul className="army-preview__units-list">
            {army.units.map((su, idx) => {
              const unitData = units.find(u => u.id === su.unitId);
              return (
                <li key={idx} className="army-preview__unit">
                  {su.nickname ?? unitData?.name ?? su.unitId}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
```

**CSS:**
```css
.army-preview {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 16px;
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.army-preview--empty {
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.army-preview__placeholder {
  color: var(--text-muted);
  margin: 0;
  font-size: 0.95rem;
}

.army-preview__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
}

.army-preview__name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.army-preview__faction {
  font-size: 0.8rem;
  color: var(--accent);
  margin: 0;
  font-weight: 500;
}

.army-preview__stats {
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.army-preview__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.army-preview__stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

.army-preview__stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--accent);
}

.army-preview__units {
  margin-top: 8px;
}

.army-preview__units-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 8px;
}

.army-preview__units-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.army-preview__unit {
  font-size: 0.85rem;
  color: var(--text);
  padding-left: 8px;
  position: relative;
}

.army-preview__unit::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--text-muted);
}
```

---

## 3. New Page Components

### CalculatorPage

```tsx
// src/components/pages/CalculatorPage.tsx

export function CalculatorPage({
  battleSetup,
  attackModifiers,
  factionRules,
  ruleOptions,
  enhancementOptions,
  stratagemOptions,
  // ... all other props from SetupPanel, ModifiersPanel, etc.
}: CalculatorPageProps) {
  return (
    <div className="calculator-page">
      <PageHeader
        title="Combat Calculator"
        subtitle="Set up a matchup and analyze damage output"
      />

      <SetupPanel {...battleSetupProps} />

      <div className="workspace-grid">
        <div className="workspace-main">
          <SimulationPanel {...simulationProps} />
          <div className="analysis-grid">
            <ExpectedResultPanel {...expectedProps} />
            <AttackBreakdownSourcesPanel {...breakdownProps} />
          </div>
          <CompareWeaponsPanel {...compareProps} />
        </div>

        <div className="workspace-sidebar">
          <ModifiersPanel {...modifiersProps} />
        </div>
      </div>

      {/* Move Docs/Sources/Pricing here ONLY */}
      <section className="calculator-page__info">
        <div className="info-card">
          <span className="info-card__label">Docs</span>
          <p>Breakdown traces and rule tooltips...</p>
        </div>
        <div className="info-card">
          <span className="info-card__label">Sources</span>
          <p>Use Wahapedia as a quick external...</p>
          <a href="https://wahapedia.ru/" target="_blank" rel="noreferrer">
            Open Wahapedia
          </a>
        </div>
        <div className="info-card">
          <span className="info-card__label">Pricing</span>
          <p>The current focus is a strong core...</p>
        </div>
      </section>
    </div>
  );
}
```

### ArmiesPage

```tsx
// src/components/pages/ArmiesPage.tsx

export function ArmiesPage({
  armies,
  canCreate,
  freeLimit,
  onAdd,
  onEdit,
  onDelete,
  onDuplicate,
  onOpenWorkspace,
  setView,
}: ArmiesPageProps) {
  const [editorState, setEditorState] = useState(/* ... */);

  // If editing, show ArmyBuilder
  if (isEditing) {
    return <ArmyBuilder {...editorProps} />;
  }

  return (
    <div className="armies-page">
      <PageHeader
        title="My Armies"
        subtitle="Save and reuse your army presets to speed up analysis."
      />

      {armies.length === 0 ? (
        <EmptyState
          title="No armies yet"
          description="Create your first army preset to get started"
          primaryAction={{
            label: "Create your first army",
            onClick: () => setEditorState({ mode: "creating" }),
          }}
        />
      ) : (
        <div className="armies-page__header">
          <span className="armies-page__count">
            {armies.length}/{freeLimit} presets
          </span>
          {canCreate && (
            <button
              className="button-link button-link--primary"
              onClick={() => setEditorState({ mode: "creating" })}
            >
              + New Army
            </button>
          )}
        </div>
      )}

      {armies.length > 0 && (
        <div className="armies-page__grid">
          {armies.map((army) => (
            <ArmyCard
              key={army.id}
              army={army}
              onEdit={() => handleEdit(army)}
              onDelete={() => onDelete(army.id)}
              onDuplicate={() => onDuplicate(army.id)}
              onLoadInWorkspace={() => {
                onOpenWorkspace(army.id, setView);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**CSS:**
```css
.armies-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.armies-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.armies-page__count {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.armies-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

@media (max-width: 768px) {
  .armies-page__grid {
    grid-template-columns: 1fr;
  }
}
```

### WorkspacePage

```tsx
// src/components/pages/WorkspacePage.tsx

export function WorkspacePage({
  armies,
  workspaceArmyA,
  workspaceArmyB,
  setWorkspaceArmyA,
  setWorkspaceArmyB,
  // ... simulation and calculation props
}: WorkspacePageProps) {
  const armyA = armies.find(a => a.id === workspaceArmyA);
  const armyB = armies.find(a => a.id === workspaceArmyB);

  return (
    <div className="workspace-page">
      <PageHeader
        title="Battle Workspace"
        subtitle="Compare two armies and run instant matchups."
        helperText="Load your army and your opponent's army to simulate attacks instantly."
      />

      {/* Army selection panels */}
      <div className="workspace-page__selectors">
        <div className="workspace-page__selector-panel">
          <h3 className="workspace-page__panel-title">Attacker — Army A</h3>
          <ArmySelector
            armies={armies}
            selectedId={workspaceArmyA}
            onChange={setWorkspaceArmyA}
            label="Select Army"
            placeholder="Choose attacker army..."
          />
          <ArmyPreview army={armyA} />
        </div>

        <div className="workspace-page__selector-panel">
          <h3 className="workspace-page__panel-title">Defender — Army B</h3>
          <ArmySelector
            armies={armies}
            selectedId={workspaceArmyB}
            onChange={setWorkspaceArmyB}
            label="Select Army"
            placeholder="Choose defender army..."
          />
          <ArmyPreview army={armyB} />
        </div>
      </div>

      {/* If both armies selected, show analysis */}
      {armyA && armyB && (
        <div className="workspace-page__analysis">
          <p className="workspace-page__helper-text">
            Select units from each army to simulate attacks
          </p>

          <div className="workspace-grid">
            <div className="workspace-main">
              <SimulationPanel {...simulationProps} />
              <div className="analysis-grid">
                <ExpectedResultPanel {...expectedProps} />
                <AttackBreakdownSourcesPanel {...breakdownProps} />
              </div>
            </div>

            <div className="workspace-sidebar">
              <ModifiersPanel {...modifiersProps} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**CSS:**
```css
.workspace-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.workspace-page__selectors {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px;
  background: var(--surface);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.workspace-page__selector-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.workspace-page__panel-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.workspace-page__analysis {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.workspace-page__helper-text {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0;
}

@media (max-width: 768px) {
  .workspace-page__selectors {
    grid-template-columns: 1fr;
  }
}
```

---

## 4. Updated App.tsx Structure

```tsx
// src/App.tsx (simplified layout)

function App() {
  // ... existing state and logic ...

  return (
    <div className="app">
      {/* REMOVE: large hero section */}
      {/* REMOVE: feature showcase section */}

      {/* SIMPLIFIED: Header with navigation only */}
      <header className="app-header">
        <div className="page-shell">
          <div className="app-header__content">
            <a className="app-header__brand" href="#top">
              <img src={appLogo} alt="DamageForge" />
              <span>DamageForge</span>
            </a>

            {/* Tab navigation - key change */}
            <nav className="app-header__nav">
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
            </nav>

            <a
              className="app-header__link"
              href="https://github.com/..."
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* REMOVE: app-shell__intro ("Launch the analysis stack") */}
      {/* REMOVE: info-cards (Docs/Sources/Pricing from non-calculator views) */}

      <main className="page-shell app-main">
        {view === "calculator" && (
          <CalculatorPage {...calculatorProps} />
        )}

        {view === "armies" && (
          <ArmiesPage {...armiesProps} />
        )}

        {view === "workspace" && (
          <WorkspacePage {...workspaceProps} />
        )}
      </main>
    </div>
  );
}
```

**CSS for header:**
```css
.app-header {
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-header__content {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 16px 0;
}

.app-header__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--text);
  font-weight: 700;
  font-size: 1.1rem;
}

.app-header__brand img {
  width: 32px;
  height: 32px;
}

.app-header__nav {
  display: flex;
  gap: 24px;
  flex: 1;
}

.app-header__tab {
  background: none;
  border: none;
  padding: 12px 8px;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.12s ease;
}

.app-header__tab:hover {
  color: var(--text);
}

.app-header__tab--active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.app-header__link {
  color: var(--accent);
  text-decoration: none;
  font-size: 0.9rem;
}
```

---

## 5. Summary of Changes

### Removed

- **Large hero section** — "DamageForge" branding on every view (keep only on landing/initial load)
- **Feature showcase section** — moved to separate landing page
- **"Launch the analysis stack" hero block** — no longer shown on Calculator/Armies/Workspace
- **Docs/Sources/Pricing cards** — removed from Armies and Workspace views (Calculator only)
- **Redundant styling** — simplified layout hierarchy

### Added

- **New Page Components:** `CalculatorPage`, `ArmiesPage`, `WorkspacePage`
- **Shared Components:** `PageHeader`, `ArmyCard`, `EmptyState`, `ArmySelector`, `ArmyPreview`
- **Clear Section Identity:** Each tab has distinct purpose and header
- **Improved Navigation:** Tab-based header with active state
- **Better Empty States:** Armies view shows CTA + preview when empty
- **Workspace Flow:** Left/right panels with clear labels
- **Reduced Visual Noise:** No repeated info cards

### Layout Benefits

- ✅ Each section feels like a distinct tool
- ✅ Clear mental model: Calculator → Armies → Workspace
- ✅ Less cognitive load (one section visible at a time)
- ✅ More space for actual content
- ✅ Consistent header/nav experience
- ✅ Clearer flow for new users

---

## 6. Implementation Checklist

- [ ] Create `PageHeader` component
- [ ] Create `ArmyCard` component
- [ ] Create `EmptyState` component
- [ ] Create `ArmySelector` component
- [ ] Create `ArmyPreview` component
- [ ] Create `CalculatorPage` component
- [ ] Create `ArmiesPage` component
- [ ] Create `WorkspacePage` component
- [ ] Update `App.tsx` main layout
- [ ] Remove old hero section JSX
- [ ] Remove old app-shell__intro JSX
- [ ] Remove Docs/Sources/Pricing from non-calculator views
- [ ] Update CSS for new components
- [ ] Update App.css for simplified layout
- [ ] Test navigation between sections
- [ ] Verify all functionality persists

---

## 7. Notes

**Backward Compatibility:**
- All existing logic (combat calculation, modifications, storage) remains unchanged
- Only presentation layer is refactored
- Component props can remain the same; only JSX structure changes

**Mobile Responsiveness:**
- Grid collapses to single column on small screens
- Sticky header remains accessible
- All CSS includes mobile breakpoints

**Performance:**
- Page components only render their respective content
- No performance impact from layout refactor
- Component lifecycle remains the same

