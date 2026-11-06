import api from './api';
import type { Deliverable } from '../types';

export interface DeliverableInput {
  title: string;
  description?: string;
  category?: string;
  estimatedEffort?: string;
  dueDate?: string;
  revisionAllowance?: number;
  status?: string;
}

export const deliverableService = {
  list: async (projectId: string): Promise<Deliverable[]> => {
    const { data } = await api.get(`/projects/${projectId}/deliverables`);
    return data;
  },
  create: async (projectId: string, input: DeliverableInput): Promise<Deliverable> => {
    const { data } = await api.post(`/projects/${projectId}/deliverables`, input);
    return data;
  },
  update: async (id: string, input: Partial<DeliverableInput>): Promise<Deliverable> => {
    const { data } = await api.put(`/deliverables/${id}`, input);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/deliverables/${id}`);
  },
};
