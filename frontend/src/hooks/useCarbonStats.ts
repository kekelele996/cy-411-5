import { useMemo } from 'react';
import dayjs from 'dayjs';
import { Activity } from '../types/entities';
import { ActivityCategory } from '../constants/activity';

export interface TopCategoryInfo {
  category: ActivityCategory;
  total: number;
  percent: number;
}

export function useCarbonStats(rows: Activity[]) {
  return useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    const weekStart = dayjs().startOf('week');
    const monthStart = dayjs().startOf('month');
    const todayTotal = rows.filter((row) => row.recordDate === today).reduce((sum, row) => sum + Number(row.carbonValue), 0);
    const weekTotal = rows.filter((row) => dayjs(row.recordDate).isAfter(weekStart.subtract(1, 'day'))).reduce((sum, row) => sum + Number(row.carbonValue), 0);
    const monthTotal = rows.filter((row) => dayjs(row.recordDate).isAfter(monthStart.subtract(1, 'day'))).reduce((sum, row) => sum + Number(row.carbonValue), 0);
    const trend = rows
      .slice()
      .sort((a, b) => a.recordDate.localeCompare(b.recordDate))
      .map((row) => ({ date: row.recordDate, value: Number(row.carbonValue), category: row.category }));

    const thirtyDaysAgo = dayjs().subtract(30, 'day');
    const recentRows = rows.filter((row) => dayjs(row.recordDate).isAfter(thirtyDaysAgo.subtract(1, 'day')));
    const categoryTotals: Partial<Record<ActivityCategory, number>> = {};
    let recentGrandTotal = 0;
    for (const row of recentRows) {
      const val = Number(row.carbonValue);
      categoryTotals[row.category] = (categoryTotals[row.category] || 0) + val;
      recentGrandTotal += val;
    }
    let topCategory: TopCategoryInfo | null = null;
    if (recentGrandTotal > 0) {
      let maxCat: ActivityCategory | null = null;
      let maxVal = 0;
      for (const [cat, val] of Object.entries(categoryTotals)) {
        if (val > maxVal) {
          maxVal = val;
          maxCat = cat as ActivityCategory;
        }
      }
      if (maxCat) {
        topCategory = {
          category: maxCat,
          total: Number(maxVal.toFixed(2)),
          percent: Number(((maxVal / recentGrandTotal) * 100).toFixed(1)),
        };
      }
    }

    return {
      todayTotal: Number(todayTotal.toFixed(2)),
      weekTotal: Number(weekTotal.toFixed(2)),
      monthTotal: Number(monthTotal.toFixed(2)),
      trend,
      topCategory,
    };
  }, [rows]);
}

