import React, { useMemo, useState } from 'react';
import { Clock3 } from 'lucide-react';
import type { ExtensionStats, UsageCategory } from '../../../types';
import type { UsageRange } from '../../../shared/utils/date';
import { formatDuration } from '../../../shared/utils/formatters';
import { UsageChart } from './UsageChart';

interface UsageAnalyticsPanelProps {
  stats: ExtensionStats;
}

const categories: UsageCategory[] = ['work', 'entertainment', 'social'];
const ranges: UsageRange[] = ['weekly', 'monthly', 'yearly'];

export const UsageAnalyticsPanel: React.FC<UsageAnalyticsPanelProps> = ({ stats }) => {
  const [usageRange, setUsageRange] = useState<UsageRange>('weekly');

  const usageDays = useMemo(
    () =>
      [...Object.values(stats.usage.week), stats.usage.today]
        .filter((day) => day.date)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [stats.usage.today, stats.usage.week]
  );

  const weeklyScreenMs = useMemo(
    () => usageDays.slice(-7).reduce((total, day) => total + day.screenMs, 0),
    [usageDays]
  );

  const totalTodayMs = Math.max(1, stats.usage.today.screenMs);

  return (
    <section className="panel analytics-panel">
      <div className="panel-title-row">
        <h2>
          <Clock3 size={16} />
          Screen usage
        </h2>
        <div className="segments range-segments">
          {ranges.map((range) => (
            <button
              type="button"
              className={usageRange === range ? 'active' : ''}
              onClick={() => setUsageRange(range)}
              key={range}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <UsageChart usageDays={usageDays} range={usageRange} />

      <div className="usage-grid">
        <div>
          <strong>{formatDuration(stats.usage.today.screenMs)}</strong>
          <span>Today screen</span>
        </div>
        <div>
          <strong>{formatDuration(weeklyScreenMs)}</strong>
          <span>Week screen</span>
        </div>
        <div>
          <strong>{formatDuration(stats.usage.today.activeMs)}</strong>
          <span>Active</span>
        </div>
        <div>
          <strong>{formatDuration(stats.usage.today.passiveMs)}</strong>
          <span>Passive</span>
        </div>
      </div>

      <div className="category-bars" aria-label="Usage by category">
        {categories.map((category) => (
          <div key={category}>
            <span>{category}</span>
            <div className="meter small">
              <span
                style={{
                  width: `${(stats.usage.today.categories[category] / totalTodayMs) * 100}%`
                }}
              />
            </div>
            <small>{formatDuration(stats.usage.today.categories[category])}</small>
          </div>
        ))}
      </div>
    </section>
  );
};

