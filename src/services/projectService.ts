import api from './api';
import type { Project, ProjectSummary, ProjectStatus } from '../types';

export interface ProjectInput {
  projectName: string;
  clientName: string;
  clientEmail: string;
  description?: string;
  budget?: number;
  startDate?: string;
  deadline: string;
  status?: ProjectStatus;
  priority?: string;
  revisionLimit?: number;
}

export const projectService = {
  list: async (status?: string): Promise<Project[]> => {
    const { data } = await api.get('/projects', { params: status ? { status } : {} });
    return data;
  },
  get: async (id: string): Promise<Project> => {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  },
  getSummary: async (id: string): Promise<ProjectSummary> => {
    const { data } = await api.get(`/projects/${id}/summary`);
    return data;
  },
  create: async (input: ProjectInput): Promise<Project> => {
    const { data } = await api.post('/projects', input);
    return data;
  },
  update: async (id: string, input: Partial<ProjectInput>): Promise<Project> => {
    const { data } = await api.put(`/projects/${id}`, input);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
  lockScope: async (id: string): Promise<Project> => {
    const { data } = await api.post(`/projects/${id}/lock-scope`);
    return data;
  },
};
