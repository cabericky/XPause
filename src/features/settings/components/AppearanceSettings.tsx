import React from 'react';
import { Laptop, Moon, Sun, type LucideProps } from 'lucide-react';
import type { Settings, ThemeMode } from '../../../types';

interface AppearanceSettingsProps {
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
}

const themeModes: Array<{
  id: ThemeMode;
  label: string;
  icon: React.ComponentType<LucideProps>;
}> = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Laptop }
];

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  settings,
  onSaveSettings
}) => {
  return (
    <div className="settings-section">
      <h3>Appearance</h3>
      <div className="segments theme-segments">
        {themeModes.map((theme) => {
          const Icon = theme.icon;
          return (
            <button
              type="button"
              className={settings.themeMode === theme.id ? 'active' : ''}
              onClick={() => onSaveSettings({ ...settings, themeMode: theme.id })}
              key={theme.id}
            >
              <Icon size={14} />
              {theme.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

