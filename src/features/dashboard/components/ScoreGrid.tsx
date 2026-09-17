import React from 'react';
import { Activity, Brain } from 'lucide-react';
import type { BreakUrgency } from '../../../types';

interface ScoreGridProps {
  fatigueScore: number;
  urgency: BreakUrgency;
  primaryReason?: string;
  socialFatigueScore: number;
  disconnectSuggestion: string;
}

export const ScoreGrid: React.FC<ScoreGridProps> = ({
  fatigueScore,
  urgency,
  primaryReason,
  socialFatigueScore,
  disconnectSuggestion,
}) => {
  return (
    <div className="score-grid">
      <section className={`score-card ${urgency}`}>
        <div className="card-title">
          <p>Fatigue</p>
          <Activity size={16} />
        </div>
        <strong>{fatigueScore}</strong>
        <div className="meter" aria-hidden="true">
          <span style={{ width: `${fatigueScore}%` }} />
        </div>
        <small>{primaryReason ?? 'Activity is balanced.'}</small>
      </section>

      <section className={`score-card social ${socialFatigueScore >= 70 ? 'critical' : ''}`}>
        <div className="card-title">
          <p>Social</p>
          <Brain size={16} />
        </div>
        <strong>{socialFatigueScore}</strong>
        <div className="meter" aria-hidden="true">
          <span style={{ width: `${socialFatigueScore}%` }} />
        </div>
        <small>{disconnectSuggestion}</small>
      </section>
    </div>
  );
};
