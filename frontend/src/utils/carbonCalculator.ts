import { ActivityCategory } from '../constants/activity';
import { CarbonFactor, Activity } from '../types/entities';

export interface TopCategoryInfo {
  category: ActivityCategory;
  total: number;
  percent: number;
}

export function calculateCarbonValue(category: ActivityCategory, amount: number, factor?: CarbonFactor | null) {
  if (!factor || factor.category !== category) return 0;
  return Number((amount * Number(factor.factorValue)).toFixed(2));
}

export function calculateTopCategory(rows: Activity[]): TopCategoryInfo | null {
  if (!rows.length) return null;
  const categoryTotals: Partial<Record<ActivityCategory, number>> = {};
  let grandTotal = 0;
  for (const row of rows) {
    const val = Number(row.carbonValue);
    categoryTotals[row.category] = (categoryTotals[row.category] || 0) + val;
    grandTotal += val;
  }
  if (grandTotal <= 0) return null;
  let maxCat: ActivityCategory | null = null;
  let maxVal = 0;
  for (const [cat, val] of Object.entries(categoryTotals)) {
    if (val > maxVal) {
      maxVal = val;
      maxCat = cat as ActivityCategory;
    }
  }
  if (!maxCat) return null;
  return {
    category: maxCat,
    total: Number(maxVal.toFixed(2)),
    percent: Number(((maxVal / grandTotal) * 100).toFixed(1)),
  };
}

