import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  TrendingUp,
  CheckCircle2,
  GitPullRequest,
  Clock,
  DollarSign,
  PlusCircle,
  ArrowRight,
  Activity as ActivityIcon,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { dashboardService } from '../services/dashboardService';
import { projectService } from '../services/projectService';
import { useToast } from '../components/ui/Toast';
import type { DashboardStats, Project, ActivityLog } from '../types';
import {
  formatCurrency,
  formatDate,
  daysUntil,
  projectStatusColors,
  priorityColors,
} from '../utils/helpers';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: typeof FolderKanban;
  color: string;
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card className="p-5" hover>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.stats(),
      dashboardService.recentActivities(6),
      projectService.list(),
    ])
      .then(([s, a, p]) => {
        setStats(s);
        setActivities(a);
        setProjects(p);
      })
      .catch((err) =>
        toast(err instanceof Error ? err.message : 'Failed to load dashboard data', 'error')
      )
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading)
    return (
      <DashboardLayout>
        <Spinner className="h-16 w-16" />
      </DashboardLayout>
    );

  if (!stats)
    return (
      <DashboardLayout>
        <EmptyState title="Unable to load dashboard" description="Please check your connection." />
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">Overview of your freelance projects</p>
        </div>
        <Link to="/projects/new">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
            <PlusCircle className="h-4 w-4" />
            New Project
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Projects" value={stats.totalProjects} icon={FolderKanban} color="bg-indigo-50 text-indigo-600" />
        <StatCard label="Active Projects" value={stats.activeProjects} icon={TrendingUp} color="bg-amber-50 text-amber-600" />
        <StatCard label="Completed" value={stats.completedProjects} icon={CheckCircle2} color="bg-green-50 text-green-600" />
        <StatCard label="Pending Changes" value={stats.pendingChanges} icon={GitPullRequest} color="bg-orange-50 text-orange-600" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Approved Changes" value={stats.approvedChanges} icon={CheckCircle2} color="bg-green-50 text-green-600" />
        <StatCard label="Total Budget" value={formatCurrency(stats.totalBudget)} icon={DollarSign} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Approved Extra Cost" value={formatCurrency(stats.additionalCostApproved)} icon={TrendingUp} color="bg-red-50 text-red-600" />
        <StatCard label="Milestones Done" value={`${stats.completedMilestones}/${stats.totalMilestones}`} icon={Clock} color="bg-blue-50 text-blue-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Recent Projects</h3>
            <Link to="/projects" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Create your first project to start managing scope."
              icon={<FolderKanban className="h-7 w-7" />}
              action={
                <Link to="/projects/new">
                  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
                    <PlusCircle className="h-4 w-4" /> Create Project
                  </button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map((p) => (
                <Link
                  key={p._id}
                  to={`/projects/${p._id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate">{p.projectName}</p>
                    <p className="text-sm text-slate-500 truncate">{p.clientName}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${projectStatusColors[p.status]}`}>
                      {p.status}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityColors[p.priority]}`}>
                      {p.priority}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Project Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-600">Deliverables</span>
                <span className="font-medium text-slate-900">{stats.completedDeliverables}/{stats.totalDeliverables}</span>
              </div>
              <ProgressBar value={stats.progress} />
              <p className="text-xs text-slate-500 mt-1">{stats.progress}% complete</p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-600">Milestones</span>
                <span className="font-medium text-slate-900">{stats.completedMilestones}/{stats.totalMilestones}</span>
              </div>
              <ProgressBar
                value={stats.totalMilestones > 0 ? (stats.completedMilestones / stats.totalMilestones) * 100 : 0}
                color="bg-blue-600"
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Upcoming Deadlines</h3>
          {stats.upcomingMilestones.length === 0 ? (
            <EmptyState title="No upcoming milestones" icon={<Clock className="h-7 w-7" />} />
          ) : (
            <div className="space-y-3">
              {stats.upcomingMilestones.map((m) => {
                const days = daysUntil(m.dueDate);
                return (
                  <Link
                    key={m.id}
                    to={`/projects/${m.projectId}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{m.title}</p>
                      <p className="text-xs text-slate-500">{formatDate(m.dueDate)}</p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        days <= 2
                          ? 'bg-red-100 text-red-700'
                          : days <= 7
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {days <= 0 ? 'Overdue' : `${days}d left`}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Recent Activity</h3>
            <Link to="/activity" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {activities.length === 0 ? (
            <EmptyState title="No activity yet" icon={<ActivityIcon className="h-7 w-7" />} />
          ) : (
            <div className="space-y-3">
              {activities.map((a) => (
                <div key={a._id} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700">{a.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
