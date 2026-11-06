import api from './api';
import type { ActivityLog, DashboardStats } from '../types';

export const activityService = {
  projectHistory: async (projectId: string): Promise<ActivityLog[]> => {
    const { data } = await api.get(`/projects/${projectId}/history`);
    return data;
  },
  recent: async (limit = 10): Promise<ActivityLog[]> => {
    const { data } = await api.get('/activity/recent', { params: { limit } });
    return data;
  },
};

export const dashboardService = {
  stats: async (): Promise<DashboardStats> => {
    const { data } = await api.get('/dashboard/stats');
    return data;
  },
  recentActivities: async (limit = 8): Promise<ActivityLog[]> => {
    const { data } = await api.get('/dashboard/recent-activities', { params: { limit } });
    return data;
  },
};
