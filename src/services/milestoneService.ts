import api from './api';
import type { Milestone } from '../types';

export interface MilestoneInput {
  title: string;
  description?: string;
  startDate?: string;
  dueDate: string;
  priority?: string;
  status?: string;
}

export const milestoneService = {
  list: async (projectId: string): Promise<Milestone[]> => {
    const { data } = await api.get(`/projects/${projectId}/milestones`);
    return data;
  },
  create: async (projectId: string, input: MilestoneInput): Promise<Milestone> => {
    const { data } = await api.post(`/projects/${projectId}/milestones`, input);
    return data;
  },
  update: async (id: string, input: Partial<MilestoneInput>): Promise<Milestone> => {
    const { data } = await api.put(`/milestones/${id}`, input);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/milestones/${id}`);
  },
};
