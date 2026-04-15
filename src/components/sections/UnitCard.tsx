import { useMemo, useState } from "react";
import type {
  AttachedLeaderInPreset,
  SavedUnitInPreset,
  SelectedWeaponEntry,
} from "../../types/armyPreset";
import type { Unit, Weapon } from "../../types/combat";
import {
  buildDefaultSelectedWeapons,
  calculateUnitPoints,
  calculateUnitTotalPointsFromDefinition,
  createAttachedLeaderFromUnit,
  deriveLegacyWeaponSelection,
  getEstimatedPointsPerModel,
  resolveEditedUnitPoints,
} from "../../lib/presetUtils";

interface EnhancementOption {
  id: string;
  name: string;
  description?: string;
  cost?: number;
}

interface UnitCardProps {
  unit: SavedUnitInPreset;
  unitDefinition: Unit;
  onUpdate: (updates: Partial<SavedUnitInPreset>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  availableLeaders: Unit[];
  availableEnhancements: EnhancementOption[];
  detachmentSelected: boolean;
}

type EquipmentEditorProps = {
  title: string;
  unitDefinition: Unit;
  selectedWeapons: SelectedWeaponEntry[];
  onChange: (selectedWeapons: SelectedWeaponEntry[]) => void;
  validation: WeaponSelectionValidation;
};

export type WeaponSelectionValidation = {
  isValid: boolean;
  messages: string[];
  selectedByCategory: Record<string, number>;
};

// eslint-disable-next-line react-refresh/only-export-components
export function stripRuleHtmlText(value?: string) {
  if (!value) {
    return "";
  }

  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;|&#8217;|&rsquo;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

// eslint-disable-next-line react-refresh/only-export-components
export function getEnhancementRestrictionLabel(
  unitDefinition: Unit,
  enhancement: EnhancementOption | undefined
) {
  const description = stripRuleHtmlText(enhancement?.description);
  const restrictionMatch = description.match(/^(.+?) model only\./i);

  if (!restrictionMatch) {
    return undefined;
  }

  const restrictionText = restrictionMatch[1]?.trim();
  if (!restrictionText) {
    return undefined;
  }

  const normalizedName = unitDefinition.name.toUpperCase();
  const normalizedFaction = unitDefinition.faction.toUpperCase();
  const keywordSet = new Set((unitDefinition.keywords ?? []).map((keyword) => keyword.toUpperCase()));
  const candidateTokens = restrictionText
    .split(/\s+OR\s+/i)
    .map((token) => token.replace(/[()]/g, "").trim())
    .filter(Boolean);

  const hasMatch = candidateTokens.some((token) => {
    const normalizedToken = token.toUpperCase();
    const tokenWords = normalizedToken.split(/\s+/).filter(Boolean);

    if (normalizedName.includes(normalizedToken) || keywordSet.has(normalizedToken)) {
      return true;
    }

    if (tokenWords.length > 1) {
      const everyWordInKeywords = tokenWords.every((word) => keywordSet.has(word));
      const everyWordInFaction = tokenWords.every((word) => normalizedFaction.includes(word));
      if (everyWordInKeywords || everyWordInFaction) {
        return true;
      }
    }

    return false;
  });

  if (hasMatch) {
    return undefined;
  }

  return `Restricted to: ${restrictionText}`;
}

// eslint-disable-next-line react-refresh/only-export-components
export function validateWeaponSelections(
  selectedWeapons: SelectedWeaponEntry[] | undefined
): WeaponSelectionValidation {
  const selectedByCategory = (selectedWeapons ?? []).reduce<Record<string, number>>((acc, entry) => {
    const category = entry.category || "other";
    acc[category] = (acc[category] ?? 0) + 1;
    return acc;
  }, {});

  const messages: string[] = [];

  if (!selectedWeapons || selectedWeapons.length === 0) {
    messages.push("Select at least one weapon or equipment entry before saving.");
  }

  return {
    isValid: messages.length === 0,
    messages,
    selectedByCategory,
  };
}

function groupWeaponsByCategory(weapons: Weapon[]) {
  return {
    ranged: weapons.filter((weapon) => weapon.type === "ranged"),
    melee: weapons.filter((weapon) => weapon.type === "melee"),
  };
}

function getSelectedWeaponEntries(
  selectedWeapons: SelectedWeaponEntry[] | undefined,
  unitDefinition: Unit
) {
  return selectedWeapons && selectedWeapons.length > 0
    ? selectedWeapons
    : buildDefaultSelectedWeapons(unitDefinition);
}

function formatSelectedWeapons(
  selectedWeapons: SelectedWeaponEntry[] | undefined,
  unitDefinition: Unit
) {
  const resolvedSelections = getSelectedWeaponEntries(selectedWeapons, unitDefinition);

  return resolvedSelections
    .map((entry) => entry.name)
    .join(" | ");
}

function upsertWeaponEntry(
  selectedWeapons: SelectedWeaponEntry[],
  weapon: Weapon,
  enabled: boolean
) {
  if (enabled) {
    if (selectedWeapons.some((entry) => entry.weaponId === weapon.id)) {
      return selectedWeapons;
    }

    return [
      ...selectedWeapons,
      {
        weaponId: weapon.id,
        name: weapon.name,
        category: weapon.type,
      },
    ];
  }

  return selectedWeapons.filter((entry) => entry.weaponId !== weapon.id);
}

function WeaponLoadoutEditor({
  title,
  unitDefinition,
  selectedWeapons,
  onChange,
  validation,
}: EquipmentEditorProps) {
  const groupedWeapons = useMemo(() => groupWeaponsByCategory(unitDefinition.weapons), [unitDefinition.weapons]);
  const categories: Array<{ key: "ranged" | "melee"; label: string; weapons: Weapon[] }> = [
    { key: "ranged", label: "Ranged", weapons: groupedWeapons.ranged },
    { key: "melee", label: "Melee", weapons: groupedWeapons.melee },
  ];

  return (
    <div className="unit-card__loadout">
      <div className="unit-card__loadout-header">
        <h5 className="unit-card__nested-title">{title}</h5>
        <span className="form-hint">
          Save which weapon profiles are present in this loadout. Match-specific attacker counts are chosen in Battle Workspace.
        </span>
      </div>

      {categories.map(({ key, label, weapons }) =>
        weapons.length > 0 ? (
          <div key={key} className="unit-card__loadout-group">
            <div className="unit-card__loadout-group-header">
              <p className="unit-card__loadout-label">{label}</p>
              <span className="unit-card__loadout-meta">
                {validation.selectedByCategory[key] ?? 0} selected
              </span>
            </div>

            <div className="unit-card__equipment-list">
              {weapons.map((weapon) => {
                const selectedEntry = selectedWeapons.find((entry) => entry.weaponId === weapon.id);
                const isSelected = Boolean(selectedEntry);

                return (
                  <div key={weapon.id} className="unit-card__equipment-row">
                    <div className="unit-card__equipment-name">
                      <span>{weapon.name}</span>
                    </div>

                    <div className="unit-card__equipment-controls">
                      <label className="unit-card__equipment-check">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(event) =>
                            onChange(upsertWeaponEntry(selectedWeapons, weapon, event.target.checked))
                          }
                        />
                        <span>{isSelected ? "Included" : "Add to loadout"}</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}

function resolveEditableUnitState(
  draft: SavedUnitInPreset,
  unitDefinition: Unit,
  availableLeaders: Unit[],
  availableEnhancements: EnhancementOption[]
): SavedUnitInPreset {
  const unitSelectedWeapons = getSelectedWeaponEntries(draft.selectedWeapons, unitDefinition);
  const normalizedUnitWeapons = deriveLegacyWeaponSelection(unitSelectedWeapons, unitDefinition);

  const leaderDefinition = availableLeaders.find((leader) => leader.id === draft.leaderAttachedId);
  let attachedLeader: AttachedLeaderInPreset | undefined;

  if (leaderDefinition) {
    const baseLeader =
      draft.attachedLeader?.unitId === leaderDefinition.id
        ? draft.attachedLeader
        : createAttachedLeaderFromUnit(leaderDefinition);
    const leaderSelectedWeapons = getSelectedWeaponEntries(baseLeader?.selectedWeapons, leaderDefinition);
    const normalizedLeaderWeapons = deriveLegacyWeaponSelection(leaderSelectedWeapons, leaderDefinition);

    attachedLeader = {
      ...(baseLeader as AttachedLeaderInPreset),
      unitId: leaderDefinition.id,
      unitName: leaderDefinition.name,
      modelCount: 1,
      pointsTotal: calculateUnitTotalPointsFromDefinition(leaderDefinition, 1),
      ...normalizedLeaderWeapons,
    };
  }

  const selectedEnhancement = availableEnhancements.find(
    (enhancement) => enhancement.id === draft.enhancementId
  );
  const enhancementHost = attachedLeader ? draft.enhancementHost ?? "unit" : "unit";
  const resolvedPoints = resolveEditedUnitPoints(
    unitDefinition,
    draft.modelCount,
    normalizedUnitWeapons.selectedWeapons,
    attachedLeader,
    attachedLeader?.selectedWeapons,
    selectedEnhancement?.cost
  );
  const normalizedLeaderWeapons = attachedLeader
    ? deriveLegacyWeaponSelection(resolvedPoints.normalizedLeaderLoadout, leaderDefinition)
    : undefined;

  return {
    ...draft,
    ...resolvedPoints.normalizedUnitWeapons,
    attachedLeader: attachedLeader
      ? {
          ...attachedLeader,
          ...(normalizedLeaderWeapons as ReturnType<typeof deriveLegacyWeaponSelection>),
          pointsTotal: resolvedPoints.leaderPoints,
        }
      : undefined,
    leaderAttachedId: attachedLeader?.unitId,
    enhancementHost,
    pointsPerModel: getEstimatedPointsPerModel(unitDefinition),
    unitTotalPoints: resolvedPoints.baseUnitPoints,
    leaderPointsCost: resolvedPoints.leaderPoints,
    enhancementPointsCost: resolvedPoints.enhancementPoints,
  };
}

function getEditorValidationMessages(unitDraft: SavedUnitInPreset) {
  const unitValidation = validateWeaponSelections(unitDraft.selectedWeapons);
  const leaderValidation = unitDraft.attachedLeader
    ? validateWeaponSelections(unitDraft.attachedLeader.selectedWeapons)
    : undefined;

  const messages = [
    ...unitValidation.messages,
    ...(leaderValidation?.messages.map((message) => `Leader: ${message}`) ?? []),
  ];

  return {
    isValid: messages.length === 0,
    messages,
    unitValidation,
    leaderValidation,
  };
}

export function UnitCard({
  unit,
  unitDefinition,
  onUpdate,
  onDelete,
  onDuplicate,
  availableLeaders,
  availableEnhancements,
  detachmentSelected,
}: UnitCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editSnapshot, setEditSnapshot] = useState<SavedUnitInPreset>(unit);
  const [localUnit, setLocalUnit] = useState<SavedUnitInPreset>(unit);

  // Sync local state when the parent prop changes (e.g. after a save from another
  // card in the same list). Previous-value comparison avoids setState-in-effect.
  const [prevUnit, setPrevUnit] = useState(unit);
  if (prevUnit !== unit) {
    setPrevUnit(unit);
    setLocalUnit(unit);
    if (!isEditing) {
      setEditSnapshot(unit);
    }
  }

  const resolvedLocalUnit = useMemo(
    () =>
      resolveEditableUnitState(localUnit, unitDefinition, availableLeaders, availableEnhancements),
    [localUnit, unitDefinition, availableLeaders, availableEnhancements]
  );

  const selectedLeaderDefinition = useMemo(
    () => availableLeaders.find((leader) => leader.id === resolvedLocalUnit.leaderAttachedId),
    [availableLeaders, resolvedLocalUnit.leaderAttachedId]
  );

  const selectedEnhancement = useMemo(
    () => availableEnhancements.find((enhancement) => enhancement.id === resolvedLocalUnit.enhancementId),
    [availableEnhancements, resolvedLocalUnit.enhancementId]
  );

  const enhancementHostDefinition =
    resolvedLocalUnit.enhancementHost === "leader" && selectedLeaderDefinition
      ? selectedLeaderDefinition
      : unitDefinition;
  const enhancementRestriction = getEnhancementRestrictionLabel(
    enhancementHostDefinition,
    selectedEnhancement
  );
  const totalUnitPoints = calculateUnitPoints(unit);
  const editorValidation = useMemo(
    () => getEditorValidationMessages(resolvedLocalUnit),
    [resolvedLocalUnit]
  );

  function applyDraftUpdate(updater: (current: SavedUnitInPreset) => SavedUnitInPreset) {
    setLocalUnit((current) => {
      const nextDraft = updater(current);
      const resolved = resolveEditableUnitState(
        nextDraft,
        unitDefinition,
        availableLeaders,
        availableEnhancements
      );

      if (getEditorValidationMessages(resolved).isValid) {
        onUpdate(resolved);
      }

      return resolved;
    });
  }

  function openEditor() {
    setEditSnapshot(unit);
    setLocalUnit(unit);
    setIsEditing(true);
  }

  function cancelEditing() {
    onUpdate(editSnapshot);
    setLocalUnit(editSnapshot);
    setIsEditing(false);
  }

  function saveEditing() {
    if (!editorValidation.isValid) {
      return;
    }

    onUpdate(resolvedLocalUnit);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="unit-card unit-card--editing">
        <div className="unit-card__header">
          <h4 className="unit-card__title">Edit Unit</h4>
          <button
            className="unit-card__close-btn"
            onClick={cancelEditing}
            aria-label="Close editor"
          >
            x
          </button>
        </div>

        <div className="unit-card__editor">
          <section className="unit-card__editor-section">
            <div className="unit-card__section-header">
              <h5 className="unit-card__section-title">Model Count</h5>
              <span className="form-hint">Base points update immediately from the selected size.</span>
            </div>

            <div className="form-field">
              <label className="form-label">Models</label>
              <input
                type="number"
                min="1"
                max="100"
                value={resolvedLocalUnit.modelCount}
                onChange={(event) =>
                  applyDraftUpdate((current) => ({
                    ...current,
                    modelCount: Math.max(1, Math.min(100, parseInt(event.target.value, 10) || 1)),
                  }))
                }
                className="form-input"
              />
            </div>
          </section>

          <section className="unit-card__editor-section">
            <div className="unit-card__section-header">
              <h5 className="unit-card__section-title">Weapons / Equipment</h5>
              <span className="form-hint">
                Choose active profiles and keep per-category assignments within the unit size.
              </span>
            </div>

            <WeaponLoadoutEditor
              title="Unit loadout"
              unitDefinition={unitDefinition}
              selectedWeapons={getSelectedWeaponEntries(resolvedLocalUnit.selectedWeapons, unitDefinition)}
              onChange={(selectedWeapons) =>
                applyDraftUpdate((current) => ({ ...current, selectedWeapons }))
              }
              validation={editorValidation.unitValidation}
            />
          </section>

          <section className="unit-card__editor-section">
            <div className="unit-card__section-header">
              <h5 className="unit-card__section-title">Attached Leader</h5>
              <span className="form-hint">
                Optional. Attached leaders add their own points and selectable combat profile.
              </span>
            </div>

            <div className="form-field">
              <label className="form-label">Leader</label>
              <select
                value={resolvedLocalUnit.leaderAttachedId ?? ""}
                onChange={(event) =>
                  applyDraftUpdate((current) => {
                    const selectedId = event.target.value || undefined;
                    const leaderDefinition = availableLeaders.find((leader) => leader.id === selectedId);

                    return {
                      ...current,
                      leaderAttachedId: selectedId,
                      attachedLeader: selectedId ? createAttachedLeaderFromUnit(leaderDefinition) : undefined,
                      leaderPointsCost: leaderDefinition
                        ? calculateUnitTotalPointsFromDefinition(leaderDefinition, 1)
                        : 0,
                      enhancementHost: selectedId ? current.enhancementHost ?? "unit" : "unit",
                    };
                  })
                }
                className="form-select"
              >
                <option value="">-- None --</option>
                {availableLeaders.map((leader) => (
                  <option key={leader.id} value={leader.id}>
                    {leader.name}
                    {calculateUnitTotalPointsFromDefinition(leader, 1)
                      ? ` (+${calculateUnitTotalPointsFromDefinition(leader, 1)} pts)`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedLeaderDefinition && resolvedLocalUnit.attachedLeader && (
              <div className="unit-card__nested-editor">
                <div className="unit-card__nested-header">
                  <h5 className="unit-card__nested-title">{selectedLeaderDefinition.name}</h5>
                  <span className="form-hint">
                    The leader is saved as an editable sub-unit and appears in Battle Workspace.
                  </span>
                </div>

                <WeaponLoadoutEditor
                  title="Leader loadout"
                  unitDefinition={selectedLeaderDefinition}
                  selectedWeapons={getSelectedWeaponEntries(
                    resolvedLocalUnit.attachedLeader.selectedWeapons,
                    selectedLeaderDefinition
                  )}
                  onChange={(selectedWeapons) =>
                    applyDraftUpdate((current) => ({
                      ...current,
                      attachedLeader: current.attachedLeader
                        ? { ...current.attachedLeader, selectedWeapons }
                        : current.attachedLeader,
                    }))
                  }
                  validation={
                    editorValidation.leaderValidation ??
                    validateWeaponSelections(resolvedLocalUnit.attachedLeader.selectedWeapons)
                  }
                />

                <div className="unit-card__nested-summary">
                  <span className="unit-card__detail-label">Leader points</span>
                  <span className="unit-card__detail-value">
                    {resolvedLocalUnit.leaderPointsCost
                      ? `${resolvedLocalUnit.leaderPointsCost} pts`
                      : "Unavailable"}
                  </span>
                </div>
              </div>
            )}
          </section>

          <section className="unit-card__editor-section">
            <div className="unit-card__section-header">
              <h5 className="unit-card__section-title">Enhancement</h5>
              <span className="form-hint">
                Enhancements stay attached to a specific eligible unit or leader.
              </span>
            </div>

            <div className="form-field">
              <label className="form-label">Enhancement</label>
              <select
                value={resolvedLocalUnit.enhancementId ?? ""}
                onChange={(event) =>
                  applyDraftUpdate((current) => ({
                    ...current,
                    enhancementId: event.target.value || undefined,
                  }))
                }
                className="form-select"
                disabled={!detachmentSelected}
              >
                <option value="">
                  {detachmentSelected ? "-- None --" : "-- Select detachment first --"}
                </option>
                {availableEnhancements.map((enhancement) => (
                  <option key={enhancement.id} value={enhancement.id}>
                    {enhancement.name}
                    {enhancement.cost ? ` (+${enhancement.cost} pts)` : ""}
                  </option>
                ))}
              </select>

              {selectedLeaderDefinition && resolvedLocalUnit.enhancementId && (
                <select
                  className="form-select"
                  value={resolvedLocalUnit.enhancementHost ?? "unit"}
                  onChange={(event) =>
                    applyDraftUpdate((current) => ({
                      ...current,
                      enhancementHost: event.target.value as "unit" | "leader",
                    }))
                  }
                >
                  <option value="unit">Host: unit</option>
                  <option value="leader">Host: attached leader</option>
                </select>
              )}

              <span className="form-hint">
                {detachmentSelected
                  ? selectedEnhancement
                    ? `${selectedEnhancement.name}${selectedEnhancement.cost ? ` (${selectedEnhancement.cost} pts)` : ""}`
                    : "Choose from the selected detachment's enhancements."
                  : "Enhancements unlock after choosing a detachment."}
              </span>

              {enhancementRestriction && (
                <span className="form-hint form-hint--warning">{enhancementRestriction}</span>
              )}
            </div>
          </section>

          <section className="unit-card__editor-section unit-card__editor-section--summary">
            <div className="unit-card__section-header">
              <h5 className="unit-card__section-title">Points Summary</h5>
              <span className="form-hint">
                Total combines unit size, attached leader, and enhancement cost.
              </span>
            </div>

            <div className="unit-card__points-display">
              <div className="unit-card__points-row">
                <span>Base unit points</span>
                <span>
                  {resolvedLocalUnit.unitTotalPoints > 0
                    ? `${resolvedLocalUnit.unitTotalPoints} pts`
                    : "Unavailable"}
                </span>
              </div>
              <div className="unit-card__points-row">
                <span>Attached leader</span>
                <span>
                  {resolvedLocalUnit.leaderPointsCost
                    ? `${resolvedLocalUnit.leaderPointsCost} pts`
                    : "0 pts"}
                </span>
              </div>
              <div className="unit-card__points-row">
                <span>Enhancement</span>
                <span>
                  {resolvedLocalUnit.enhancementPointsCost
                    ? `${resolvedLocalUnit.enhancementPointsCost} pts`
                    : "0 pts"}
                </span>
              </div>
              <div className="unit-card__points-row unit-card__points-row--total">
                <span>Total</span>
                <span>{calculateUnitPoints(resolvedLocalUnit)} pts</span>
              </div>
            </div>

            {!editorValidation.isValid && (
              <div className="unit-card__validation unit-card__validation--error" role="alert">
                <strong>Fix the loadout before saving:</strong>
                <ul className="unit-card__validation-list">
                  {editorValidation.messages.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <div className="unit-card__actions">
            <button className="button-link button-link--secondary" onClick={cancelEditing}>
              Cancel
            </button>
            <button
              className="button-link button-link--danger"
              onClick={() => {
                onDelete();
                setIsEditing(false);
              }}
            >
              Delete Unit
            </button>
            <button
              className="button-link button-link--primary"
              onClick={saveEditing}
              disabled={!editorValidation.isValid}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="unit-card">
      <div className="unit-card__header">
        <div className="unit-card__info">
          <h4 className="unit-card__title">{unit.nickname || unitDefinition.name}</h4>
          <p className="unit-card__subtitle">
            {unit.modelCount} Models | {totalUnitPoints > 0 ? `${totalUnitPoints} pts` : "Points unavailable"}
          </p>
        </div>
        <div className="unit-card__actions-compact">
          <button
            className="unit-card__btn unit-card__btn--compact"
            onClick={openEditor}
            title="Edit unit"
          >
            Edit
          </button>
          <button
            className="unit-card__btn unit-card__btn--compact"
            onClick={onDuplicate}
            title="Duplicate unit"
          >
            Dup
          </button>
          <button
            className="unit-card__btn unit-card__btn--compact unit-card__btn--danger"
            onClick={onDelete}
            title="Delete unit"
          >
            x
          </button>
        </div>
      </div>

      <div className="unit-card__details">
        <p className="unit-card__detail">
          <span className="unit-card__detail-label">Loadout:</span>
          <span className="unit-card__detail-value">
            {formatSelectedWeapons(unit.selectedWeapons, unitDefinition)}
          </span>
        </p>

        {unit.attachedLeader && (
          <p className="unit-card__detail">
            <span className="unit-card__detail-label">Leader:</span>
            <span className="unit-card__detail-value">
              {unit.attachedLeader.unitName}
              {unit.leaderPointsCost ? ` (${unit.leaderPointsCost} pts)` : ""}
            </span>
          </p>
        )}

        {unit.enhancementId && (
          <p className="unit-card__detail">
            <span className="unit-card__detail-label">Enhancement:</span>
            <span className="unit-card__detail-value">
              {selectedEnhancement?.name ?? unit.enhancementId}
              {unit.enhancementHost === "leader" ? " on Leader" : ""}
              {unit.enhancementPointsCost ? ` (${unit.enhancementPointsCost} pts)` : ""}
            </span>
          </p>
        )}

        {unitDefinition.points && (
          <p className="unit-card__detail">
            <span className="unit-card__detail-label">Datasheet cost:</span>
            <span className="unit-card__detail-value">
              {unitDefinition.points} pts
              {unitDefinition.pointsDescription ? ` (${unitDefinition.pointsDescription})` : ""}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
