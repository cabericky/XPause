import React from 'react';
import type { ExerciseId, Settings } from '../../../types';
import { exercises } from '../../breaks/exercises';

interface ExerciseSettingsProps {
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
}

export const ExerciseSettings: React.FC<ExerciseSettingsProps> = ({
  settings,
  onSaveSettings
}) => {
  const toggleExercise = (id: ExerciseId) => {
    const enabled = settings.enabledExercises.includes(id)
      ? settings.enabledExercises.filter((item) => item !== id)
      : [...settings.enabledExercises, id];
    onSaveSettings({ ...settings, enabledExercises: enabled.length ? enabled : [id] });
  };

  return (
    <div className="settings-section">
      <h3>Exercises</h3>
      <div className="checks">
        {exercises.map((exercise) => (
          <label key={exercise.id}>
            <input
              type="checkbox"
              checked={settings.enabledExercises.includes(exercise.id)}
              onChange={() => toggleExercise(exercise.id)}
            />
            {exercise.shortLabel}
          </label>
        ))}
      </div>
    </div>
  );
};

