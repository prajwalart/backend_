import api from './api';
import type { ChangeRequest, ChangeRequestStatus } from '../types';

export interface ChangeRequestInput {
  title: string;
  description?: string;
  reason?: string;
  additionalCost?: number;
  additionalEffort?: string;
  additionalTime?: number;
}

export const changeRequestService = {
  listAll: async (status?: string): Promise<ChangeRequest[]> => {
    const { data } = await api.get('/changes', {
      params: status ? { status } : {},
    });
    return data;
  },
  list: async (projectId: string, status?: string): Promise<ChangeRequest[]> => {
    const { data } = await api.get(`/projects/${projectId}/changes`, {
      params: status ? { status } : {},
    });
    return data;
  },
  create: async (projectId: string, input: ChangeRequestInput): Promise<ChangeRequest> => {
    const { data } = await api.post(`/projects/${projectId}/changes`, input);
    return data;
  },
  get: async (id: string): Promise<ChangeRequest> => {
    const { data } = await api.get(`/changes/${id}`);
    return data;
  },
  updateStatus: async (
    id: string,
    status: ChangeRequestStatus,
    decisionNote?: string
  ): Promise<ChangeRequest> => {
    const { data } = await api.put(`/changes/${id}/status`, { status, decisionNote });
    return data;
  },
};
