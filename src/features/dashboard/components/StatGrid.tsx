import React from 'react';
import { Eye, RotateCcw, Trophy } from 'lucide-react';
import type { ExtensionStats } from '../../../types';

interface StatGridProps {
  stats: ExtensionStats;
}

export const StatGrid: React.FC<StatGridProps> = ({ stats }) => {
  const level = Math.floor(stats.xp / 500) + 1;
  const xpProgress = stats.xp % 500;

  return (
    <>
      <section className="stat-grid" aria-label="Rewards">
        <div>
          <Trophy size={16} />
          <strong>{stats.xp}</strong>
          <span>XP</span>
        </div>
        <div>
          <RotateCcw size={16} />
          <strong>{stats.daily.completed + stats.daily.partial}</strong>
          <span>Today</span>
        </div>
        <div>
          <Eye size={16} />
          <strong>{level}</strong>
          <span>Level</span>
        </div>
      </section>

      <div
        className="meter small"
        aria-label={`${xpProgress} XP toward next level`}
      >
        <span style={{ width: `${(xpProgress / 500) * 100}%` }} />
      </div>
    </>
  );
};

