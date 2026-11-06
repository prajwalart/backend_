import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, PlusCircle, Search } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { Select } from '../components/ui/Input';
import { projectService } from '../services/projectService';
import type { Project } from '../types';
import { useToast } from '../components/ui/Toast';
import {
  projectStatusColors,
  priorityColors,
  formatDate,
  daysUntil,
  formatCurrency,
  projectStatuses,
} from '../utils/helpers';

export default function ProjectsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    projectService
      .list(statusFilter || undefined)
      .then(setProjects)
      .catch((err) => {
        setProjects([]);
        toast(err instanceof Error ? err.message : 'Failed to load projects', 'error');
      })
      .finally(() => setLoading(false));
  }, [statusFilter, toast]);

  const filtered = projects.filter(
    (p) =>
      p.projectName.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
          <p className="text-sm text-slate-500 mt-0.5">{projects.length} project(s) total</p>
        </div>
        <Link to="/projects/new">
          <Button>
            <PlusCircle className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by project or client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="sm:w-48">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {projectStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {loading ? (
        <Spinner className="h-16 w-16" />
      ) : filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            title="No projects found"
            description={search || statusFilter ? "Try changing your filters." : "Create your first project to get started."}
            icon={<FolderKanban className="h-7 w-7" />}
            action={
              !search && !statusFilter ? (
                <Link to="/projects/new">
                  <Button>
                    <PlusCircle className="h-4 w-4" /> Create Project
                  </Button>
                </Link>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => {
            const days = daysUntil(p.deadline);
            return (
              <Link key={p._id} to={`/projects/${p._id}`}>
                <Card className="p-5 h-full" hover>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-slate-900 truncate">{p.projectName}</h3>
                    <Badge className={projectStatusColors[p.status]}>{p.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">{p.description || 'No description'}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Client</span>
                      <span className="text-slate-700 font-medium">{p.clientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Budget</span>
                      <span className="text-slate-700 font-medium">{formatCurrency(p.budget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Deadline</span>
                      <span className="text-slate-700 font-medium">{formatDate(p.deadline)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Priority</span>
                      <Badge className={priorityColors[p.priority]}>{p.priority}</Badge>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className={days <= 0 ? 'text-red-600 font-medium' : days <= 7 ? 'text-amber-600 font-medium' : 'text-slate-500'}>
                      {days <= 0 ? `${Math.abs(days)}d overdue` : `${days}d remaining`}
                    </span>
                    {p.scopeLockedAt && (
                      <span className="text-green-600 font-medium">Scope Locked</span>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
