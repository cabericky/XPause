import React from 'react';
import type { Sensitivity, Settings } from '../../../types';

interface SensitivitySettingsProps {
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
}

export const SensitivitySettings: React.FC<SensitivitySettingsProps> = ({
  settings,
  onSaveSettings,
}) => {
  const handleSessionLengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseInt(event.target.value, 10);
    if (Number.isNaN(raw)) return;
    const clamped = Math.max(5, Math.min(90, raw));
    onSaveSettings({
      ...settings,
      sessionLengthMinutes: clamped,
    });
  };

  const handleDailyGoalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseInt(event.target.value, 10);
    if (Number.isNaN(raw)) return;
    const clamped = Math.max(1, Math.min(20, raw));
    onSaveSettings({
      ...settings,
      dailyBreakGoal: clamped,
    });
  };

  return (
    <div className="settings-section">
      <h3>Sensitivity</h3>
      <label>
        First break (minutes)
        <input
          type="number"
          min={5}
          max={90}
          value={settings.sessionLengthMinutes}
          onChange={handleSessionLengthChange}
        />
      </label>
      <label>
        Daily break goal
        <input
          type="number"
          min={1}
          max={20}
          value={settings.dailyBreakGoal}
          onChange={handleDailyGoalChange}
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
