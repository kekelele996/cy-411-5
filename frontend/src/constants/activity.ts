export enum ActivityCategory {
  TRANSPORT = 'transport',
  ENERGY = 'energy',
  FOOD = 'food',
  SHOPPING = 'shopping'
}

export const ACTIVITY_CATEGORY_LABELS: Record<ActivityCategory, string> = {
  [ActivityCategory.TRANSPORT]: '交通',
  [ActivityCategory.ENERGY]: '能源',
  [ActivityCategory.FOOD]: '餐饮',
  [ActivityCategory.SHOPPING]: '购物'
};

export const ACTIVITY_CATEGORY_COLORS: Record<ActivityCategory, string> = {
  [ActivityCategory.TRANSPORT]: 'blue',
  [ActivityCategory.ENERGY]: 'gold',
  [ActivityCategory.FOOD]: 'green',
  [ActivityCategory.SHOPPING]: 'purple'
};

export const REDUCTION_SUGGESTIONS: Record<ActivityCategory, string> = {
  [ActivityCategory.TRANSPORT]: '尝试使用公共交通、骑行或步行替代私家车出行，可显著降低交通碳排放。',
  [ActivityCategory.ENERGY]: '减少空调使用时间、选用节能电器、随手关灯，有效降低能源碳排放。',
  [ActivityCategory.FOOD]: '减少红肉摄入、选择本地时令食材，可大幅降低餐饮碳足迹。',
  [ActivityCategory.SHOPPING]: '优先选择环保包装和本地产品、减少不必要的网购快递，降低购物碳排放。'
};

