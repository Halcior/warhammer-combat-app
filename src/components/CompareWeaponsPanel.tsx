import type { Weapon } from "../types/combat";
import type { ExpectedDamageResult } from "../lib/combat";

type CompareWeaponsPanelProps = {
  weaponA: Weapon;
  weaponB: Weapon;
  compareWeaponId: string;
  setCompareWeaponId: React.Dispatch<React.SetStateAction<string>>;
  availableWeapons: Weapon[];
  resultA: ExpectedDamageResult;
  resultB: ExpectedDamageResult;
};

export function CompareWeaponsPanel({
  weaponA,
  weaponB,
  compareWeaponId,
  setCompareWeaponId,
  availableWeapons,
  resultA,
  resultB,
}: CompareWeaponsPanelProps) {
  const damageDelta = resultA.expectedDamage - resultB.expectedDamage;
  const slainDelta = resultA.expectedSlainModels - resultB.expectedSlainModels;

  return (
    <div className="card">
      <h2>Compare Weapons</h2>

      <label>
        Compare against
        <select
          value={compareWeaponId}
          onChange={(e) => setCompareWeaponId(e.target.value)}
        >
          {availableWeapons.map((weapon) => (
            <option key={weapon.id} value={weapon.id}>
              {weapon.name}
            </option>
          ))}
        </select>
      </label>

      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-label">{weaponA.name}</span>
          <span className="stat-value">{resultA.expectedDamage.toFixed(2)} dmg</span>
        </div>

        <div className="stat-box">
          <span className="stat-label">{weaponB.name}</span>
          <span className="stat-value">{resultB.expectedDamage.toFixed(2)} dmg</span>
        </div>

        <div className="stat-box stat-box--highlight">
          <span className="stat-label">Damage delta</span>
          <span className="stat-value">
            {damageDelta >= 0 ? "+" : ""}
            {damageDelta.toFixed(2)}
          </span>
        </div>

        <div className="stat-box">
          <span className="stat-label">{weaponA.name} slain</span>
          <span className="stat-value">
            {resultA.expectedSlainModels.toFixed(2)}
          </span>
        </div>

        <div className="stat-box">
          <span className="stat-label">{weaponB.name} slain</span>
          <span className="stat-value">
            {resultB.expectedSlainModels.toFixed(2)}
          </span>
        </div>

        <div className="stat-box stat-box--highlight">
          <span className="stat-label">Slain delta</span>
          <span className="stat-value">
            {slainDelta >= 0 ? "+" : ""}
            {slainDelta.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}