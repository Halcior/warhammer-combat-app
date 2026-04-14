import { useEffect, useMemo, useState } from "react";
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
};

export function stripRuleHtmlText(value?: string) {
  if (!value) {
    return "";
  }

  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;|â€™/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

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
    .map((entry) => `${entry.name}${entry.quantity && entry.quantity > 1 ? ` ×${entry.quantity}` : ""}`)
    .join(" • ");
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
        quantity: 1,
      },
    ];
  }

  return selectedWeapons.filter((entry) => entry.weaponId !== weapon.id);
}

function updateWeaponQuantity(
  selectedWeapons: SelectedWeaponEntry[],
  weaponId: string,
  quantity: number
) {
  return selectedWeapons.map((entry) =>
    entry.weaponId === weaponId
      ? { ...entry, quantity: Math.max(1, Math.min(20, quantity || 1)) }
      : entry
  );
}

function WeaponLoadoutEditor({
  title,
  unitDefinition,
  selectedWeapons,
  onChange,
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
          Select one or more weapons and adjust quantities where needed.
        </span>
      </div>

      {categories.map(({ key, label, weapons }) =>
        weapons.length > 0 ? (
          <div key={key} className="unit-card__loadout-group">
            <p className="unit-card__loadout-label">{label}</p>
            <div className="unit-card__equipment-list">
              {weapons.map((weapon) => {
                const selectedEntry = selectedWeapons.find((entry) => entry.weaponId === weapon.id);
                const isSelected = Boolean(selectedEntry);

                return (
                  <div key={weapon.id} className="unit-card__equipment-row">
                    <label className="unit-card__equipment-toggle">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(event) =>
                          onChange(upsertWeaponEntry(selectedWeapons, weapon, event.target.checked))
                        }
                      />
                      <span>{weapon.name}</span>
                    </label>

                    {isSelected && (
                      <input
                        className="unit-card__equipment-quantity"
                        type="number"
                        min="1"
                        max="20"
                        value={selectedEntry?.quantity ?? 1}
                        onChange={(event) =>
                          onChange(
                            updateWeaponQuantity(
                              selectedWeapons,
                              weapon.id,
                              parseInt(event.target.value, 10) || 1
                            )
                          )
                        }
                        aria-label={`${weapon.name} quantity`}
                      />
                    )}
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

  return {
    ...draft,
    ...resolvedPoints.normalizedUnitWeapons,
    attachedLeader,
    leaderAttachedId: attachedLeader?.unitId,
    enhancementHost,
    pointsPerModel: getEstimatedPointsPerModel(unitDefinition),
    unitTotalPoints: resolvedPoints.baseUnitPoints,
    leaderPointsCost: resolvedPoints.leaderPoints,
    enhancementPointsCost: resolvedPoints.enhancementPoints,
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

  useEffect(() => {
    setLocalUnit(unit);
    if (!isEditing) {
      setEditSnapshot(unit);
    }
  }, [unit, isEditing]);

  const selectedLeaderDefinition = useMemo(
    () => availableLeaders.find((leader) => leader.id === localUnit.leaderAttachedId),
    [availableLeaders, localUnit.leaderAttachedId]
  );
  const selectedLeaderPoints = selectedLeaderDefinition
    ? calculateUnitTotalPointsFromDefinition(selectedLeaderDefinition, 1)
    : 0;
  const selectedEnhancement = useMemo(
    () => availableEnhancements.find((enhancement) => enhancement.id === localUnit.enhancementId),
    [availableEnhancements, localUnit.enhancementId]
  );
  const enhancementHostDefinition =
    localUnit.enhancementHost === "leader" && selectedLeaderDefinition
      ? selectedLeaderDefinition
      : unitDefinition;
  const enhancementRestriction = getEnhancementRestrictionLabel(
    enhancementHostDefinition,
    selectedEnhancement
  );
  const totalUnitPoints = calculateUnitPoints(unit);

  function applyDraftUpdate(updater: (current: SavedUnitInPreset) => SavedUnitInPreset) {
    setLocalUnit((current) => {
      const nextDraft = updater(current);
      const resolved = resolveEditableUnitState(
        nextDraft,
        unitDefinition,
        availableLeaders,
        availableEnhancements
      );
      onUpdate(resolved);
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
            ×
          </button>
        </div>

        <div className="unit-card__editor">
          <div className="form-field">
            <label className="form-label">Model Count *</label>
            <input
              type="number"
              min="1"
              max="100"
              value={localUnit.modelCount}
              onChange={(event) =>
                applyDraftUpdate((current) => ({
                  ...current,
                  modelCount: Math.max(1, Math.min(100, parseInt(event.target.value, 10) || 1)),
                }))
              }
              className="form-input"
            />
            <span className="form-hint">
              Base points update immediately from the current model count.
            </span>
          </div>

          <WeaponLoadoutEditor
            title="Weapons / Equipment"
            unitDefinition={unitDefinition}
            selectedWeapons={getSelectedWeaponEntries(localUnit.selectedWeapons, unitDefinition)}
            onChange={(selectedWeapons) =>
              applyDraftUpdate((current) => ({ ...current, selectedWeapons }))
            }
          />

          <div className="form-field">
            <label className="form-label">Leader (Optional)</label>
            <select
              value={localUnit.leaderAttachedId ?? ""}
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
            <span className="form-hint">
              {selectedLeaderDefinition
                ? `${selectedLeaderDefinition.name}${selectedLeaderPoints ? ` (${selectedLeaderPoints} pts)` : ""}`
                : "No leader attached"}
            </span>
          </div>

          {selectedLeaderDefinition && localUnit.attachedLeader && (
            <div className="unit-card__nested-editor">
              <div className="unit-card__nested-header">
                <h5 className="unit-card__nested-title">Attached Leader</h5>
                <span className="form-hint">
                  Edit the attached leader as a mini sub-unit.
                </span>
              </div>

              <WeaponLoadoutEditor
                title={selectedLeaderDefinition.name}
                unitDefinition={selectedLeaderDefinition}
                selectedWeapons={getSelectedWeaponEntries(
                  localUnit.attachedLeader.selectedWeapons,
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
              />

              <div className="unit-card__nested-summary">
                <span className="unit-card__detail-label">Leader points</span>
                <span className="unit-card__detail-value">
                  {localUnit.leaderPointsCost ? `${localUnit.leaderPointsCost} pts` : "Unavailable"}
                </span>
              </div>
            </div>
          )}

          <div className="form-field">
            <label className="form-label">Enhancement (Optional)</label>
            <select
              value={localUnit.enhancementId ?? ""}
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
            {selectedLeaderDefinition && localUnit.enhancementId && (
              <select
                className="form-select"
                value={localUnit.enhancementHost ?? "unit"}
                onChange={(event) =>
                  applyDraftUpdate((current) => ({
                    ...current,
                    enhancementHost: event.target.value as "unit" | "leader",
                  }))
                }
              >
                <option value="unit">Apply to unit</option>
                <option value="leader">Apply to attached leader</option>
              </select>
            )}
            <span className="form-hint">
              {detachmentSelected
                ? selectedEnhancement
                  ? `${selectedEnhancement.name}${selectedEnhancement.cost ? ` (${selectedEnhancement.cost} pts)` : ""}`
                  : "Choose from the selected detachment's enhancements"
                : "Enhancements unlock after choosing a detachment"}
            </span>
            {enhancementRestriction && (
              <span className="form-hint form-hint--warning">{enhancementRestriction}</span>
            )}
          </div>

          <div className="unit-card__points-display">
            <div className="unit-card__points-row">
              <span>Base unit points</span>
              <span>{localUnit.unitTotalPoints > 0 ? `${localUnit.unitTotalPoints} pts` : "Unavailable"}</span>
            </div>
            <div className="unit-card__points-row">
              <span>Attached leader</span>
              <span>{localUnit.leaderPointsCost ? `${localUnit.leaderPointsCost} pts` : "0 pts"}</span>
            </div>
            <div className="unit-card__points-row">
              <span>Enhancement</span>
              <span>{localUnit.enhancementPointsCost ? `${localUnit.enhancementPointsCost} pts` : "0 pts"}</span>
            </div>
            <div className="unit-card__points-row unit-card__points-row--total">
              <span>Total</span>
              <span>{calculateUnitPoints(localUnit)} pts</span>
            </div>
          </div>

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
              onClick={() => setIsEditing(false)}
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
            ×
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
