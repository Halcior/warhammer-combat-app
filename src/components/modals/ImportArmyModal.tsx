import { useState, useRef } from "react";
import type { Unit } from "../../types/combat";
import {
  parseArmyJSON,
  importArmyPreset,
  type ArmyPresetExport,
} from "../../lib/presetExportImport";
import type { ArmyPresetV2 } from "../../types/armyPreset";

interface ImportArmyModalProps {
  unitDefinitions: Map<string, Unit>;
  onImport: (preset: ArmyPresetV2) => void;
  onClose: () => void;
}

type ImportStep = "input" | "preview" | "confirm";

export function ImportArmyModal({
  unitDefinitions,
  onImport,
  onClose,
}: ImportArmyModalProps) {
  const [step, setStep] = useState<ImportStep>("input");
  const [jsonInput, setJsonInput] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<ArmyPresetExport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handlePasteJSON = () => {
    const result = parseArmyJSON(jsonInput);

    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    setParsedData(result.data);
    setErrors([]);
    setStep("preview");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = parseArmyJSON(content);

      if (!result.valid) {
        setErrors(result.errors);
        return;
      }

      setParsedData(result.data);
      setErrors([]);
      setStep("preview");
    };

    reader.readAsText(file);

    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  const handleConfirmImport = async () => {
    if (!parsedData) return;

    setIsImporting(true);
    try {
      const preset = importArmyPreset(parsedData, unitDefinitions);
      onImport(preset);
    } finally {
      setIsImporting(false);
    }
  };

  const handleBack = () => {
    setStep("input");
    setParsedData(null);
    setJsonInput("");
    setErrors([]);
  };

  if (step === "preview" && parsedData) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal modal--import" onClick={(e) => e.stopPropagation()}>
          <div className="modal__header">
            <h2 className="modal__title">Import Preview</h2>
            <button
              className="modal__close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="modal__body">
            <div className="import-preview">
              <div className="import-preview__section">
                <h3 className="import-preview__label">Army Details</h3>
                <div className="import-preview__item">
                  <span>Name:</span>
                  <strong>{parsedData.armyName}</strong>
                </div>
                <div className="import-preview__item">
                  <span>Faction:</span>
                  <strong>{parsedData.faction}</strong>
                </div>
                {parsedData.detachmentName && (
                  <div className="import-preview__item">
                    <span>Detachment:</span>
                    <strong>{parsedData.detachmentName}</strong>
                  </div>
                )}
                <div className="import-preview__item">
                  <span>Points:</span>
                  <strong>
                    {parsedData.totalPoints} / {parsedData.pointsLimit}
                  </strong>
                </div>
              </div>

              <div className="import-preview__section">
                <h3 className="import-preview__label">Units ({parsedData.units.length})</h3>
                <div className="import-preview__units">
                  {parsedData.units.slice(0, 5).map((unit, idx) => (
                    <div key={idx} className="import-preview__unit-item">
                      <span>{unit.unitName}</span>
                      <span className="import-preview__unit-count">
                        {unit.modelCount}x {unit.resolvedPoints || 0} pts
                      </span>
                    </div>
                  ))}
                  {parsedData.units.length > 5 && (
                    <div className="import-preview__unit-item import-preview__unit-item--more">
                      +{parsedData.units.length - 5} more units
                    </div>
                  )}
                </div>
              </div>

              {parsedData.notes && (
                <div className="import-preview__section">
                  <h3 className="import-preview__label">Notes</h3>
                  <p className="import-preview__notes">{parsedData.notes}</p>
                </div>
              )}

              {parsedData.tags && parsedData.tags.length > 0 && (
                <div className="import-preview__section">
                  <h3 className="import-preview__label">Tags</h3>
                  <div className="import-preview__tags">
                    {parsedData.tags.map((tag, idx) => (
                      <span key={idx} className="import-preview__tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal__footer">
            <button
              className="button-link button-link--secondary"
              onClick={handleBack}
            >
              Back
            </button>
            <button
              className="button-link button-link--primary"
              onClick={handleConfirmImport}
              disabled={isImporting}
            >
              {isImporting ? "Importing..." : "Import Army"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--import" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Import Army</h2>
          <button
            className="modal__close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="modal__body">
          <div className="import-tabs">
            <button
              className="import-tabs__btn import-tabs__btn--active"
              disabled
            >
              Paste JSON
            </button>
            <button className="import-tabs__btn" disabled>
              Upload File
            </button>
          </div>

          <div className="import-section">
            <label className="import-label">Paste your army preset JSON here</label>
            <textarea
              className="import-textarea"
              placeholder='Paste JSON export or select file below...'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={10}
            />
          </div>

          <div className="import-divider">
            <span className="import-divider__text">OR</span>
          </div>

          <div className="import-section">
            <label className="import-label">Upload .json file</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="import-file-input"
              style={{
                position: "absolute",
                opacity: 0,
                width: 0,
                height: 0,
                pointerEvents: "none",
              }}
            />
            <button
              className="button-link button-link--secondary import-file-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </button>
          </div>

          {errors.length > 0 && (
            <div className="import-errors">
              <h4 className="import-errors__title">Errors</h4>
              <ul className="import-errors__list">
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="modal__footer">
          <button
            className="button-link button-link--secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="button-link button-link--primary"
            onClick={handlePasteJSON}
            disabled={!jsonInput.trim()}
          >
            Import from Clipboard
          </button>
        </div>
      </div>
    </div>
  );
}
