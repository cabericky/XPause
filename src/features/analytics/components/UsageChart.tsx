import React, { useMemo } from 'react';
import type { UsageDay } from '../../../types';
import { formatChartDate, type UsageRange } from '../../../shared/utils/date';
import { formatDuration } from '../../../shared/utils/formatters';

interface UsageChartProps {
  usageDays: UsageDay[];
  range: UsageRange;
}

export const UsageChart: React.FC<UsageChartProps> = ({ usageDays, range }) => {
  const usageChart = useMemo(() => {
    const dayMap = new Map<string, number>();
    usageDays.forEach((day) => {
      if (day.date) {
        dayMap.set(day.date, (dayMap.get(day.date) ?? 0) + day.screenMs);
      }
    });

    const buckets: Array<{ key: string; label: string; screenMs: number }> = [];

    if (range === 'weekly') {
      const dates: string[] = [];
      for (let i = 6; i >= 0; i -= 1) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toLocaleDateString('en-CA'));
      }
      return dates.map((dateStr) => ({
        key: dateStr,
        label: formatChartDate(dateStr, range),
        screenMs: dayMap.get(dateStr) ?? 0,
      }));
    }

    if (range === 'monthly') {
      for (let bucketIndex = 5; bucketIndex >= 0; bucketIndex -= 1) {
        let bucketScreenMs = 0;
        let bucketFirstDate = '';
        for (let dayOffset = 4; dayOffset >= 0; dayOffset -= 1) {
          const totalDaysAgo = bucketIndex * 5 + dayOffset;
          const d = new Date();
          d.setDate(d.getDate() - totalDaysAgo);
          const dateStr = d.toLocaleDateString('en-CA');
          if (!bucketFirstDate) bucketFirstDate = dateStr;
          bucketScreenMs += dayMap.get(dateStr) ?? 0;
        }
        buckets.push({
          key: bucketFirstDate,
          label: formatChartDate(bucketFirstDate, range),
          screenMs: bucketScreenMs,
        });
      }
      return buckets;
    }

    const months = new Map<string, number>();
    usageDays.forEach((day) => {
      if (day.date) {
        const key = day.date.slice(0, 7);
        months.set(key, (months.get(key) ?? 0) + day.screenMs);
      }
    });
    const monthKeys: string[] = [];
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      monthKeys.push(d.toLocaleDateString('en-CA').slice(0, 7));
    }
    return monthKeys.map((key) => ({
      key,
      label: formatChartDate(`${key}-01`, range),
      screenMs: months.get(key) ?? 0,
    }));
  }, [usageDays, range]);

  const maxChartScreenMs = Math.max(1, ...usageChart.map((item) => item.screenMs));

  return (
    <div className="usage-chart column-chart" aria-label={`${range} screen usage column chart`}>
      {usageChart.map((item) => (
        <div className="usage-chart-item" key={item.key}>
          <div className="usage-chart-track">
            <span
              style={{
                height: `${Math.max(6, (item.screenMs / maxChartScreenMs) * 92)}px`,
              }}
              title={item.label ? `${item.label}: ${formatDuration(item.screenMs)}` : 'No data'}
            />
          </div>
          <small>{item.label || '-'}</small>
        </div>
      ))}
    </div>
  );
};
