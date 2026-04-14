import { useState } from "react";
import type { ArmyPresetV2 } from "../../types/armyPreset";
import type { Unit } from "../../types/combat";
import {
  exportArmyAsJSON,
  copyToClipboard,
  downloadFile,
} from "../../lib/presetExportImport";

interface ExportArmyModalProps {
  army: ArmyPresetV2;
  unitDefinitions: Map<string, Unit>;
  onClose: () => void;
}

export function ExportArmyModal({
  army,
  unitDefinitions,
  onClose,
}: ExportArmyModalProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const jsonString = exportArmyAsJSON(army, unitDefinitions);
  const filename = `${army.name.replace(/\s+/g, "-")}-army.json`;

  const handleCopyJSON = async () => {
    const success = await copyToClipboard(jsonString);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    setIsDownloading(true);
    downloadFile(jsonString, filename);
    setTimeout(() => setIsDownloading(false), 500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Export Army</h2>
          <button
            className="modal__close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="modal__body">
          <div className="export-info">
            <p className="export-info__text">
              Army: <strong>{army.name}</strong>
            </p>
            <p className="export-info__text">
              Faction: <strong>{army.faction}</strong>
            </p>
            <p className="export-info__text">
              Units: <strong>{army.units.length}</strong> | Points:{" "}
              <strong>{army.totalPoints}</strong>
            </p>
          </div>

          <div className="export-json-container">
            <label className="export-json-label">JSON Export</label>
            <textarea
              className="export-json-textarea"
              value={jsonString}
              readOnly
              rows={12}
            />
          </div>
        </div>

        <div className="modal__footer">
          <button
            className="button-link button-link--secondary"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className={`button-link button-link--primary ${
              copied ? "is-success" : ""
            }`}
            onClick={handleCopyJSON}
          >
            {copied ? "✓ Copied!" : "Copy JSON"}
          </button>
          <button
            className="button-link button-link--primary"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? "Downloading..." : "Download File"}
          </button>
        </div>
      </div>
    </div>
  );
}
