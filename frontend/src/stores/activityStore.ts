import { create } from 'zustand';
import dayjs from 'dayjs';
import { createActivity, fetchActivities, fetchActivitySummary, ActivityPayload } from '../api/activity';
import { ActivityCategory } from '../constants/activity';
import { Activity } from '../types/entities';

interface ActivityStore {
  rows: Activity[];
  thirtyDaysRows: Activity[];
  total: number;
  byCategory: { category: ActivityCategory; value: number }[];
  loading: boolean;
  load: (filters?: { category?: ActivityCategory; start?: string; end?: string }) => Promise<void>;
  loadThirtyDays: () => Promise<void>;
  loadSummary: (range: { start: string; end: string }) => Promise<void>;
  add: (payload: ActivityPayload) => Promise<void>;
}

export const useActivityStore = create<ActivityStore>((set, get) => ({
  rows: [],
  thirtyDaysRows: [],
  total: 0,
  byCategory: [],
  loading: false,
  async load(filters) {
    set({ loading: true });
    const rows = await fetchActivities(filters);
    set({ rows, loading: false });
  },
  async loadThirtyDays() {
    const [start, end] = [dayjs().subtract(30, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')];
    const rows = await fetchActivities({ start, end });
    set({ thirtyDaysRows: rows });
  },
  async loadSummary(range) {
    const summary = await fetchActivitySummary(range);
    set({ total: summary.total, byCategory: summary.byCategory, rows: summary.rows });
  },
  async add(payload) {
    await createActivity(payload);
    await get().load();
  }
}));

