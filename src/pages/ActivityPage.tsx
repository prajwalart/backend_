import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Search,
  Lock,
  GitPullRequest,
  FolderKanban,
  FileCheck,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { Select } from '../components/ui/Input';
import { activityService } from '../services/dashboardService';
import { useToast } from '../components/ui/Toast';
import type { ActivityLog } from '../types';
import { formatDateTime } from '../utils/helpers';

export default function ActivityPage() {
  const { toast } = useToast();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    activityService
      .recent(100)
      .then(setActivities)
      .catch((err) =>
        toast(err instanceof Error ? err.message : 'Failed to load activity logs', 'error')
      )
      .finally(() => setLoading(false));
  }, [toast]);

  const getActionMeta = (action: string) => {
    if (action.includes('scope_locked')) {
      return {
        badge: 'Scope Locked',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Lock,
        iconColor: 'text-purple-600 bg-purple-50',
      };
    }
    if (action.includes('change_request')) {
      return {
        badge: 'Change Request',
        color: action.includes('approved')
          ? 'bg-green-100 text-green-800 border-green-200'
          : action.includes('rejected')
          ? 'bg-red-100 text-red-800 border-red-200'
          : 'bg-amber-100 text-amber-800 border-amber-200',
        icon: GitPullRequest,
        iconColor: 'text-amber-600 bg-amber-50',
      };
    }
    if (action.includes('deliverable')) {
      return {
        badge: 'Deliverable',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: FileCheck,
        iconColor: 'text-blue-600 bg-blue-50',
      };
    }
    if (action.includes('milestone')) {
      return {
        badge: 'Milestone',
        color: 'bg-teal-100 text-teal-800 border-teal-200',
        icon: Calendar,
        iconColor: 'text-teal-600 bg-teal-50',
      };
    }
    return {
      badge: 'Project',
      color: 'bg-slate-100 text-slate-800 border-slate-200',
      icon: FolderKanban,
      iconColor: 'text-slate-600 bg-slate-50',
    };
  };

  const filtered = activities.filter((a) => {
    const term = search.toLowerCase();
    const projName =
      typeof a.projectId === 'object' && a.projectId !== null
        ? (a.projectId as { projectName?: string }).projectName || ''
        : '';
    const matchesSearch =
      a.description.toLowerCase().includes(term) ||
      projName.toLowerCase().includes(term) ||
      a.action.toLowerCase().includes(term);

    if (!matchesSearch) return false;
    if (filterType === 'all') return true;
    if (filterType === 'scope') return a.action.includes('scope_locked');
    if (filterType === 'change') return a.action.includes('change_request');
    if (filterType === 'deliverable') return a.action.includes('deliverable');
    if (filterType === 'milestone') return a.action.includes('milestone');
    if (filterType === 'project') return a.action.includes('project');
    return true;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Activity History</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit trail of scope baselines, change request reviews, and project milestones.
          </p>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          {activities.length} total event{activities.length === 1 ? '' : 's'} recorded
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search activity description or project name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="sm:w-56">
          <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Events</option>
            <option value="scope">Scope Lock Events</option>
            <option value="change">Change Requests</option>
            <option value="deliverable">Deliverables</option>
            <option value="milestone">Milestones</option>
            <option value="project">Project Updates</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <Spinner className="h-16 w-16" />
      ) : filtered.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            title="No activity recorded"
            description={
              search || filterType !== 'all'
                ? 'Try broadening your search query or filter selection.'
                : 'Project actions, approvals, and scope lock events will appear here in chronological order.'
            }
            icon={<Activity className="h-8 w-8 text-slate-400" />}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((log) => {
            const meta = getActionMeta(log.action);
            const IconComponent = meta.icon;
            const project =
              typeof log.projectId === 'object' && log.projectId !== null
                ? (log.projectId as { _id?: string; projectName?: string })
                : null;
            const projectId = project?._id;

            return (
              <Card key={log._id} className="p-4" hover>
                <div className="flex items-start gap-3.5">
                  <div className={`p-2 rounded-lg ${meta.iconColor} flex-shrink-0 mt-0.5`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-slate-900 text-sm">{log.description}</span>
                      <Badge className={meta.color}>{meta.badge}</Badge>
                      {project?.projectName && projectId && (
                        <Link
                          to={`/projects/${projectId}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded"
                        >
                          {project.projectName}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                      <span>{formatDateTime(log.createdAt)}</span>
                      <span>•</span>
                      <span>
                        {typeof log.userId === 'object' && log.userId !== null
                          ? (log.userId as { name?: string }).name || 'User'
                          : 'You'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
