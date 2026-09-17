import React from 'react';
import { Brain } from 'lucide-react';
import type { InsightSnapshot } from '../../../types';

interface InsightsPanelProps {
  insights: InsightSnapshot;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
  return (
    <section className="panel">
      <h2>
        <Brain size={16} />
        AI schedule
      </h2>
      <div className="usage-grid">
        <div>
          <strong>{insights.eyeStrainMinutes}m</strong>
          <span>Eye timer</span>
        </div>
        <div>
          <strong>{Math.round(insights.passiveRatio * 100)}%</strong>
          <span>Passive ratio</span>
        </div>
      </div>
      <ul className="insight-list">
        {insights.schedule.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
};
