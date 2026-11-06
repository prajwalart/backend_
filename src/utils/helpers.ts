import type {
  ProjectStatus,
  Priority,
  DeliverableStatus,
  ChangeRequestStatus,
  MilestoneStatus,
} from '../types';

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function daysUntil(date: string | Date | null | undefined): number {
  if (!date) return 0;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export const projectStatusColors: Record<ProjectStatus, string> = {
  Planning: 'bg-blue-100 text-blue-700 border-blue-200',
  'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
  'On Hold': 'bg-gray-100 text-gray-700 border-gray-200',
  Completed: 'bg-green-100 text-green-700 border-green-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export const priorityColors: Record<Priority, string> = {
  Low: 'bg-gray-100 text-gray-600 border-gray-200',
  Medium: 'bg-blue-100 text-blue-600 border-blue-200',
  High: 'bg-orange-100 text-orange-700 border-orange-200',
  Critical: 'bg-red-100 text-red-700 border-red-200',
};

export const deliverableStatusColors: Record<DeliverableStatus, string> = {
  planned: 'bg-gray-100 text-gray-600 border-gray-200',
  'in-progress': 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
};

export const deliverableStatusLabel: Record<DeliverableStatus, string> = {
  planned: 'Planned',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

export const changeStatusColors: Record<ChangeRequestStatus, string> = {
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Approved: 'bg-green-100 text-green-700 border-green-200',
  Rejected: 'bg-red-100 text-red-700 border-red-200',
};

export const milestoneStatusColors: Record<MilestoneStatus, string> = {
  'Not Started': 'bg-gray-100 text-gray-600 border-gray-200',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  Completed: 'bg-green-100 text-green-700 border-green-200',
  Overdue: 'bg-red-100 text-red-700 border-red-200',
};

export const projectStatuses: ProjectStatus[] = [
  'Planning',
  'In Progress',
  'On Hold',
  'Completed',
  'Cancelled',
];

export const priorities: Priority[] = ['Low', 'Medium', 'High', 'Critical'];

export const deliverableStatuses: DeliverableStatus[] = ['planned', 'in-progress', 'completed'];

export const milestoneStatuses: MilestoneStatus[] = [
  'Not Started',
  'In Progress',
  'Completed',
  'Overdue',
];

export const changeRequestStatuses: ChangeRequestStatus[] = ['Pending', 'Approved', 'Rejected'];
