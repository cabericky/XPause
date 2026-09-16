import React from 'react';
import { FileText, Settings as SettingsIcon } from 'lucide-react';
import type { Settings } from '../../../types';
import { SensitivitySettings } from './SensitivitySettings';
import { ExerciseSettings } from './ExerciseSettings';
import { SoundSettingsPanel } from '../../sound';
import { AppearanceSettings } from './AppearanceSettings';

interface SettingsPanelProps {
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
  onOpenPrivacy: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSaveSettings,
  onOpenPrivacy
}) => {
  return (
    <section className="panel">
      <h2>
        <SettingsIcon size={16} />
        Settings
      </h2>

      <SensitivitySettings settings={settings} onSaveSettings={onSaveSettings} />
      <ExerciseSettings settings={settings} onSaveSettings={onSaveSettings} />
      <SoundSettingsPanel settings={settings} onSaveSettings={onSaveSettings} />
      <AppearanceSettings settings={settings} onSaveSettings={onSaveSettings} />

      <div className="settings-section">
        <h3>Privacy</h3>
        <button
          type="button"
          className="privacy-link-button"
          onClick={onOpenPrivacy}
        >
          <FileText size={15} />
          View privacy policy
        </button>
      </div>
    </section>
  );
};

