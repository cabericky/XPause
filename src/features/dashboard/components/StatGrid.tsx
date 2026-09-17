import React from 'react';
import { Eye, RotateCcw, Trophy } from 'lucide-react';
import type { ExtensionStats } from '../../../types';

interface StatGridProps {
  stats: ExtensionStats;
  dailyGoal?: number;
}

export const StatGrid: React.FC<StatGridProps> = ({ stats, dailyGoal = 4 }) => {
  const level = Math.floor(stats.xp / 500) + 1;
  const xpProgress = stats.xp % 500;
  const todayCount = stats.daily.completed + stats.daily.partial;

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
          <strong>
            {todayCount}
            {dailyGoal > 0 ? (
              <small style={{ fontSize: '0.72rem', opacity: 0.75, fontWeight: 500 }}>
                {' '}
                / {dailyGoal}
              </small>
            ) : null}
          </strong>
          <span>Today</span>
        </div>
        <div>
          <Eye size={16} />
          <strong>{level}</strong>
          <span>Level</span>
        </div>
      </section>

      <div className="meter small" aria-label={`${xpProgress} XP toward next level`}>
        <span style={{ width: `${(xpProgress / 500) * 100}%` }} />
      </div>
    </>
  );
};
