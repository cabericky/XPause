import React from 'react';
import type { Sensitivity, Settings } from '../../../types';

interface SensitivitySettingsProps {
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
}

export const SensitivitySettings: React.FC<SensitivitySettingsProps> = ({
  settings,
  onSaveSettings
}) => {
  return (
    <div className="settings-section">
      <h3>Sensitivity</h3>
      <label>
        First break
        <input
          type="number"
          min={5}
          max={90}
          value={settings.sessionLengthMinutes}
          onChange={(event) =>
            onSaveSettings({
              ...settings,
              sessionLengthMinutes: Number(event.target.value)
            })
          }
        />
      </label>
      <div className="segments">
        {(['low', 'medium', 'high'] as Sensitivity[]).map((levelName) => (
          <button
            type="button"
            className={settings.sensitivity === levelName ? 'active' : ''}
            onClick={() => onSaveSettings({ ...settings, sensitivity: levelName })}
            key={levelName}
          >
            {levelName}
          </button>
        ))}
      </div>
    </div>
  );
};

