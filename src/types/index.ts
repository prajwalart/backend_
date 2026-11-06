export type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type DeliverableStatus = 'planned' | 'in-progress' | 'completed';
export type ChangeRequestStatus = 'Pending' | 'Approved' | 'Rejected';
export type MilestoneStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Project {
  _id: string;
  owner: string;
  projectName: string;
  clientName: string;
  clientEmail: string;
  description: string;
  budget: number;
  startDate: string;
  deadline: string;
  status: ProjectStatus;
  priority: Priority;
  revisionLimit: number;
  originalScopeSnapshot: ScopeSnapshotItem[];
  scopeLockedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScopeSnapshotItem {
  title: string;
  description: string;
  category: string;
  estimatedEffort: string;
  dueDate: string;
  revisionAllowance: number;
  status: DeliverableStatus;
}

export interface Deliverable {
  _id: string;
  projectId: string;
  owner: string;
  title: string;
  description: string;
  category: string;
  estimatedEffort: string;
  dueDate: string | null;
  revisionAllowance: number;
  status: DeliverableStatus;
  isOriginal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChangeRequest {
  _id: string;
  projectId: string;
  owner: string;
  requestedBy: { _id: string; name: string; email: string } | string;
  title: string;
  description: string;
  reason: string;
  additionalCost: number;
  additionalEffort: string;
  additionalTime: number;
  status: ChangeRequestStatus;
  decisionBy: { _id: string; name: string; email: string } | string | null;
  decisionAt: string | null;
  decisionNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  _id: string;
  projectId: string;
  owner: string;
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  completedAt: string | null;
  status: MilestoneStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  _id: string;
  projectId: { _id: string; projectName: string } | string | null;
  userId: { _id: string; name: string; email: string } | string;
  action: string;
  description: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingChanges: number;
  approvedChanges: number;
  rejectedChanges: number;
  totalDeliverables: number;
  completedDeliverables: number;
  totalMilestones: number;
  completedMilestones: number;
  upcomingMilestones: {
    id: string;
    title: string;
    dueDate: string;
    priority: Priority;
    projectId: string;
  }[];
  progress: number;
  totalBudget: number;
  additionalCostApproved: number;
}

export interface ProjectSummary {
  project: Project;
  deliverables: Deliverable[];
  changeRequests: ChangeRequest[];
  milestones: Milestone[];
}
