import React, { useState } from 'react';
import { Music2, SlidersHorizontal, Volume2 } from 'lucide-react';
import type { Settings } from '../../../types';
import { playAudioDataUrl, playSound } from '../soundPlayer';
import { soundThemes } from '../soundThemes';

interface SoundSettingsPanelProps {
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
}

export const SoundSettingsPanel: React.FC<SoundSettingsPanelProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [soundPanelOpen, setSoundPanelOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const toggleSound = () => {
    const nextSettings = { ...settings, soundEnabled: !settings.soundEnabled };
    if (nextSettings.soundEnabled) {
      void playSound(nextSettings.soundTheme, 'sound', nextSettings.customSoundDataUrl);
    }
    onSaveSettings(nextSettings);
  };

  const uploadCustomSound = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('audio/')) {
      setUploadError('Please select a valid audio file.');
      return;
    }
    if (file.size > 1024 * 1024) {
      setUploadError('Audio file size must be under 1MB.');
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) return;
      const nextSettings: Settings = {
        ...settings,
        soundEnabled: true,
        soundTheme: 'custom',
        customSoundDataUrl: dataUrl,
        customSoundName: file.name,
      };
      void playAudioDataUrl(dataUrl);
      onSaveSettings(nextSettings);
    });
    reader.addEventListener('error', () => {
      setUploadError('Failed to read audio file.');
    });
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="settings-section">
        <h3>Sounds</h3>
        <div className="segments">
          <button
            type="button"
            className={settings.soundEnabled ? 'active' : ''}
            onClick={toggleSound}
          >
            <Volume2 size={14} />
            Sound
          </button>
          <button type="button" onClick={() => setSoundPanelOpen((open) => !open)}>
            <SlidersHorizontal size={14} />
            Customize
          </button>
        </div>
      </div>
      {soundPanelOpen ? (
        <div className="sound-panel">
          <div className="sound-panel-title">
            <span>
              <Music2 size={15} />
              Exercise popup sound
            </span>
            <button
              type="button"
              onClick={() =>
                void playSound(settings.soundTheme, 'sound', settings.customSoundDataUrl)
              }
            >
              Test
            </button>
          </div>
          <div className="sound-options">
            {soundThemes.map((theme) => (
              <button
                type="button"
                className={settings.soundTheme === theme.id ? 'active' : ''}
                onClick={() => {
                  void playSound(theme.id, 'sound');
                  onSaveSettings({ ...settings, soundTheme: theme.id, soundEnabled: true });
                }}
                key={theme.id}
              >
                <strong>{theme.label}</strong>
                <span>{theme.description}</span>
              </button>
            ))}
          </div>
          <label className="upload-sound">
            <span>{settings.customSoundName ?? 'Upload custom audio'}</span>
            <input
              type="file"
              accept="audio/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadCustomSound(file);
              }}
            />
          </label>
          {uploadError ? (
            <p
              className="upload-error"
              style={{
                color: '#E11D48',
                fontSize: '12px',
                margin: '4px 0 0',
                lineHeight: 1.4,
              }}
            >
              {uploadError}
            </p>
          ) : null}
          {settings.customSoundDataUrl ? (
            <button
              type="button"
              className={settings.soundTheme === 'custom' ? 'custom-sound active' : 'custom-sound'}
              onClick={() => {
                void playAudioDataUrl(settings.customSoundDataUrl!);
                onSaveSettings({ ...settings, soundTheme: 'custom', soundEnabled: true });
              }}
            >
              Use uploaded sound
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
};
