import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  PlusCircle,
  Lock,
  CheckCircle2,
  GitPullRequest,
  Clock,
  ListChecks,
  History,
  DollarSign,
  Calendar,
  User as UserIcon,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ProgressBar from '../components/ui/ProgressBar';
import { Input, Textarea, Select } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { projectService } from '../services/projectService';
import { deliverableService, type DeliverableInput } from '../services/deliverableService';
import { changeRequestService, type ChangeRequestInput } from '../services/changeRequestService';
import { milestoneService, type MilestoneInput } from '../services/milestoneService';
import { activityService } from '../services/dashboardService';
import type { ProjectSummary, Deliverable, Milestone, ActivityLog } from '../types';
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  daysUntil,
  projectStatusColors,
  priorityColors,
  deliverableStatusColors,
  deliverableStatusLabel,
  changeStatusColors,
  milestoneStatusColors,
  projectStatuses,
  priorities,
  deliverableStatuses,
  milestoneStatuses,
} from '../utils/helpers';

type Tab = 'overview' | 'scope' | 'changes' | 'milestones' | 'history';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [summary, setSummary] = useState<ProjectSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const [history, setHistory] = useState<ActivityLog[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ProjectSummary['project']>>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [lockingScope, setLockingScope] = useState(false);

  const [delivModal, setDelivModal] = useState(false);
  const [delivForm, setDelivForm] = useState<DeliverableInput>({ title: '', description: '', category: '', estimatedEffort: '', dueDate: '', revisionAllowance: 2, status: 'planned' });
  const [delivEditId, setDelivEditId] = useState<string | null>(null);

  const [crModal, setCrModal] = useState(false);
  const [crForm, setCrForm] = useState<ChangeRequestInput>({ title: '', description: '', reason: '', additionalCost: 0, additionalEffort: '', additionalTime: 0 });
  const [crDecision, setCrDecision] = useState<{ open: boolean; id: string; status: 'Approved' | 'Rejected'; note: string }>({ open: false, id: '', status: 'Approved', note: '' });

  const [msModal, setMsModal] = useState(false);
  const [msForm, setMsForm] = useState<MilestoneInput>({ title: '', description: '', startDate: new Date().toISOString().split('T')[0], dueDate: '', priority: 'Medium', status: 'Not Started' });
  const [msEditId, setMsEditId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    projectService
      .getSummary(id)
      .then(setSummary)
      .catch((err) => {
        setSummary(null);
        toast(err instanceof Error ? err.message : 'Failed to load project', 'error');
      })
      .finally(() => setLoading(false));
  }, [id, toast]);

  const loadHistory = useCallback(() => {
    if (!id) return;
    activityService
      .projectHistory(id)
      .then(setHistory)
      .catch((err) =>
        toast(err instanceof Error ? err.message : 'Failed to load project history', 'error')
      );
  }, [id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (tab === 'history') loadHistory();
  }, [tab, loadHistory]);

  const refresh = () => {
    load();
    if (tab === 'history') loadHistory();
  };

  if (loading)
    return (
      <DashboardLayout>
        <Spinner className="h-16 w-16" />
      </DashboardLayout>
    );

  if (!summary)
    return (
      <DashboardLayout>
        <EmptyState title="Project not found" />
      </DashboardLayout>
    );

  const { project, deliverables, changeRequests, milestones } = summary;
  const completedDeliv = deliverables.filter((d) => d.status === 'completed').length;
  const progress = deliverables.length > 0 ? Math.round((completedDeliv / deliverables.length) * 100) : 0;
  const approvedExtraCost = changeRequests.filter((c) => c.status === 'Approved').reduce((s, c) => s + (c.additionalCost || 0), 0);
  const approvedExtraTime = changeRequests.filter((c) => c.status === 'Approved').reduce((s, c) => s + (c.additionalTime || 0), 0);

  const handleDelete = async () => {
    setSavingEdit(true);
    try {
      await projectService.remove(project._id);
      toast('Project deleted', 'success');
      navigate('/projects');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed', 'error');
    } finally {
      setSavingEdit(false);
      setDeleteOpen(false);
    }
  };

  const handleEditSave = async () => {
    setSavingEdit(true);
    try {
      await projectService.update(project._id, {
        ...editForm,
        budget: Number(editForm.budget) || 0,
        revisionLimit: Number(editForm.revisionLimit) || 0,
        deadline: editForm.deadline ? new Date(editForm.deadline).toISOString() : undefined,
        startDate: editForm.startDate ? new Date(editForm.startDate).toISOString() : undefined,
      });
      toast('Project updated', 'success');
      setEditOpen(false);
      refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const openEdit = () => {
    setEditForm({
      projectName: project.projectName,
      clientName: project.clientName,
      clientEmail: project.clientEmail,
      description: project.description,
      budget: project.budget,
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      deadline: new Date(project.deadline).toISOString().split('T')[0],
      status: project.status,
      priority: project.priority,
      revisionLimit: project.revisionLimit,
    });
    setEditOpen(true);
  };

  const handleLockScope = async () => {
    setLockingScope(true);
    try {
      await projectService.lockScope(project._id);
      toast('Original scope locked', 'success');
      refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to lock scope', 'error');
    } finally {
      setLockingScope(false);
    }
  };

  const saveDeliverable = async () => {
    if (!delivForm.title.trim()) {
      toast('Title is required', 'error');
      return;
    }
    try {
      const payload = {
        ...delivForm,
        dueDate: delivForm.dueDate ? new Date(delivForm.dueDate).toISOString() : undefined,
        revisionAllowance: Number(delivForm.revisionAllowance) || 0,
      };
      if (delivEditId) {
        await deliverableService.update(delivEditId, payload);
        toast('Deliverable updated', 'success');
      } else {
        await deliverableService.create(project._id, payload);
        toast('Deliverable added', 'success');
      }
      setDelivModal(false);
      setDelivForm({ title: '', description: '', category: '', estimatedEffort: '', dueDate: '', revisionAllowance: 2, status: 'planned' });
      setDelivEditId(null);
      refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save', 'error');
    }
  };

  const deleteDeliverable = async (delivId: string) => {
    try {
      await deliverableService.remove(delivId);
      toast('Deliverable deleted', 'success');
      refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  };

  const toggleDeliverableStatus = async (d: Deliverable) => {
    const newStatus = d.status === 'completed' ? 'planned' : 'completed';
    try {
      await deliverableService.update(d._id, { status: newStatus });
      toast(newStatus === 'completed' ? 'Marked as completed' : 'Marked as planned', 'success');
      refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed', 'error');
    }
  };

  const saveChangeRequest = async () => {
    if (!crForm.title.trim()) {
      toast('Title is required', 'error');
      return;
    }
    try {
      await changeRequestService.create(project._id, {
        ...crForm,
        additionalCost: Number(crForm.additionalCost) || 0,
        additionalTime: Number(crForm.additionalTime) || 0,
      });
      toast('Change request submitted', 'success');
      setCrModal(false);
      setCrForm({ title: '', description: '', reason: '', additionalCost: 0, additionalEffort: '', additionalTime: 0 });
      refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to submit', 'error');
    }
  };

  const handleDecision = async () => {
    try {
      await changeRequestService.updateStatus(crDecision.id, crDecision.status, crDecision.note);
      toast(`Change request ${crDecision.status.toLowerCase()}`, 'success');
      setCrDecision({ open: false, id: '', status: 'Approved', note: '' });
      refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to update', 'error');
    }
  };

  const saveMilestone = async () => {
    if (!msForm.title.trim() || !msForm.dueDate) {
      toast('Title and due date are required', 'error');
      return;
    }
    try {
      const payload = {
        ...msForm,
        startDate: msForm.startDate ? new Date(msForm.startDate).toISOString() : undefined,
        dueDate: new Date(msForm.dueDate).toISOString(),
      };
      if (msEditId) {
        await milestoneService.update(msEditId, payload);
        toast('Milestone updated', 'success');
      } else {
        await milestoneService.create(project._id, payload);
        toast('Milestone created', 'success');
      }
      setMsModal(false);
      setMsForm({ title: '', description: '', startDate: new Date().toISOString().split('T')[0], dueDate: '', priority: 'Medium', status: 'Not Started' });
      setMsEditId(null);
      refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save', 'error');
    }
  };

  const deleteMilestone = async (msId: string) => {
    try {
      await milestoneService.remove(msId);
      toast('Milestone deleted', 'success');
      refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  };

  const completeMilestone = async (m: Milestone) => {
    const newStatus = m.status === 'Completed' ? 'Not Started' : 'Completed';
    try {
      await milestoneService.update(m._id, { status: newStatus });
      toast(newStatus === 'Completed' ? 'Milestone completed' : 'Reverted', 'success');
      refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed', 'error');
    }
  };

  const tabs: { key: Tab; label: string; icon: typeof ListChecks; count?: number }[] = [
    { key: 'overview', label: 'Overview', icon: ListChecks },
    { key: 'scope', label: 'Original Scope', icon: CheckCircle2, count: deliverables.length },
    { key: 'changes', label: 'Change Requests', icon: GitPullRequest, count: changeRequests.length },
    { key: 'milestones', label: 'Milestones', icon: Clock, count: milestones.length },
    { key: 'history', label: 'Activity History', icon: History },
  ];

  const days = daysUntil(project.deadline);

  return (
    <DashboardLayout>
      <button
        onClick={() => navigate('/projects')}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">{project.projectName}</h2>
            <Badge className={projectStatusColors[project.status]}>{project.status}</Badge>
            <Badge className={priorityColors[project.priority]}>{project.priority}</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">{project.clientName} · {project.clientEmail}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openEdit}>
            <Edit3 className="h-4 w-4" /> Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
            {t.count !== undefined && (
              <span className="px-1.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2">
            <h3 className="font-semibold text-slate-900 mb-4">Project Details</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <UserIcon className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-500">Client</p>
                  <p className="text-slate-900 font-medium">{project.clientName}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-500">Budget</p>
                  <p className="text-slate-900 font-medium">{formatCurrency(project.budget)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-500">Deadline</p>
                  <p className="text-slate-900 font-medium">{formatDate(project.deadline)} ({days > 0 ? `${days}d left` : `${Math.abs(days)}d overdue`})</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ListChecks className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-500">Revision Limit</p>
                  <p className="text-slate-900 font-medium">{project.revisionLimit}</p>
                </div>
              </div>
            </div>
            {project.description && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-slate-500 text-sm mb-1">Description</p>
                <p className="text-slate-700 text-sm leading-relaxed">{project.description}</p>
              </div>
            )}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-600">Overall Progress</span>
                <span className="font-medium text-slate-900">{completedDeliv}/{deliverables.length} deliverables</span>
              </div>
              <ProgressBar value={progress} />
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Scope Lock</h3>
              {project.scopeLockedAt ? (
                <div>
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <Lock className="h-4 w-4" />
                    <span className="font-medium text-sm">Locked on {formatDate(project.scopeLockedAt)}</span>
                  </div>
                  <p className="text-xs text-slate-500">{project.originalScopeSnapshot.length} deliverables preserved in the original agreement.</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-slate-500 mb-3">Lock the original scope to preserve a snapshot of agreed deliverables. Future change requests won't alter this snapshot.</p>
                  <Button size="sm" className="w-full" loading={lockingScope} onClick={handleLockScope}>
                    <Lock className="h-4 w-4" /> Lock Original Scope
                  </Button>
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Change Impact</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Approved extra cost</span>
                  <span className="font-medium text-red-600">{formatCurrency(approvedExtraCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Approved extra time</span>
                  <span className="font-medium text-amber-600">{approvedExtraTime} days</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Total project value</span>
                  <span className="font-bold text-slate-900">{formatCurrency(project.budget + approvedExtraCost)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'scope' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Original Scope Deliverables</h3>
              <p className="text-sm text-slate-500">
                {project.scopeLockedAt
                  ? 'The original agreement is locked. Submit a change request for any new or modified scope.'
                  : 'The agreed deliverables. Change requests are tracked separately.'}
              </p>
            </div>
            {!project.scopeLockedAt && (
              <Button size="sm" onClick={() => { setDelivForm({ title: '', description: '', category: '', estimatedEffort: '', dueDate: '', revisionAllowance: 2, status: 'planned' }); setDelivEditId(null); setDelivModal(true); }}>
                <PlusCircle className="h-4 w-4" /> Add Deliverable
              </Button>
            )}
          </div>

          {deliverables.length === 0 ? (
            <Card className="p-6">
              <EmptyState
                title="No deliverables yet"
                description="Add the original agreed deliverables for this project."
                icon={<CheckCircle2 className="h-7 w-7" />}
                action={!project.scopeLockedAt ? <Button size="sm" onClick={() => setDelivModal(true)}><PlusCircle className="h-4 w-4" /> Add Deliverable</Button> : undefined}
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {deliverables.map((d) => (
                <Card key={d._id} className="p-4" hover>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleDeliverableStatus(d)}
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          d.status === 'completed' ? 'bg-green-600 border-green-600' : 'border-slate-300 hover:border-green-500'
                        }`}
                      >
                        {d.status === 'completed' && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-medium text-slate-900 ${d.status === 'completed' ? 'line-through text-slate-400' : ''}`}>{d.title}</p>
                          <Badge className={deliverableStatusColors[d.status]}>{deliverableStatusLabel[d.status]}</Badge>
                        </div>
                        {d.description && <p className="text-sm text-slate-500 mt-1">{d.description}</p>}
                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                          <span>Category: {d.category || '—'}</span>
                          <span>Effort: {d.estimatedEffort || '—'}</span>
                          <span>Due: {formatDate(d.dueDate)}</span>
                          <span>Revisions: {d.revisionAllowance}</span>
                        </div>
                      </div>
                    </div>
                    {!project.scopeLockedAt && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setDelivForm({
                              title: d.title, description: d.description, category: d.category,
                              estimatedEffort: d.estimatedEffort,
                              dueDate: d.dueDate ? new Date(d.dueDate).toISOString().split('T')[0] : '',
                              revisionAllowance: d.revisionAllowance, status: d.status,
                            });
                            setDelivEditId(d._id);
                            setDelivModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteDeliverable(d._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {project.scopeLockedAt && project.originalScopeSnapshot.length > 0 && (
            <Card className="p-5 mt-6 bg-slate-50">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-4 w-4 text-slate-500" />
                <h4 className="font-semibold text-slate-700 text-sm">Original Scope Snapshot (Locked {formatDate(project.scopeLockedAt)})</h4>
              </div>
              <div className="text-xs text-slate-500 grid sm:grid-cols-2 gap-2">
                {project.originalScopeSnapshot.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'completed' ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <span>{s.title}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'changes' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Change Requests</h3>
              <p className="text-sm text-slate-500">Track scope changes separately from the original agreement.</p>
            </div>
            <Button size="sm" onClick={() => { setCrForm({ title: '', description: '', reason: '', additionalCost: 0, additionalEffort: '', additionalTime: 0 }); setCrModal(true); }}>
              <PlusCircle className="h-4 w-4" /> New Change Request
            </Button>
          </div>

          {changeRequests.length === 0 ? (
            <Card className="p-6">
              <EmptyState
                title="No change requests"
                description="When the client asks for something beyond the original scope, record it here."
                icon={<GitPullRequest className="h-7 w-7" />}
                action={<Button size="sm" onClick={() => setCrModal(true)}><PlusCircle className="h-4 w-4" /> New Change Request</Button>}
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {changeRequests.map((cr) => (
                <Card key={cr._id} className="p-4" hover>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-slate-900">{cr.title}</p>
                        <Badge className={changeStatusColors[cr.status]}>{cr.status}</Badge>
                      </div>
                      {cr.description && <p className="text-sm text-slate-600 mt-1">{cr.description}</p>}
                      {cr.reason && <p className="text-xs text-slate-500 mt-1">Reason: {cr.reason}</p>}
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                        <span>Extra cost: {formatCurrency(cr.additionalCost)}</span>
                        <span>Extra effort: {cr.additionalEffort || '—'}</span>
                        <span>Extra time: {cr.additionalTime} days</span>
                        <span>Submitted: {formatDate(cr.createdAt)}</span>
                        {cr.decisionAt && <span>Decided: {formatDateTime(cr.decisionAt)}</span>}
                      </div>
                      {cr.decisionNote && (
                        <p className="text-xs text-slate-600 mt-1 italic">Decision note: {cr.decisionNote}</p>
                      )}
                    </div>
                    {cr.status === 'Pending' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-700 border-green-200 hover:bg-green-50"
                          onClick={() => setCrDecision({ open: true, id: cr._id, status: 'Approved', note: '' })}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-700 border-red-200 hover:bg-red-50"
                          onClick={() => setCrDecision({ open: true, id: cr._id, status: 'Rejected', note: '' })}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'milestones' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Milestones</h3>
              <p className="text-sm text-slate-500">Track key deadlines and progress.</p>
            </div>
            <Button size="sm" onClick={() => { setMsForm({ title: '', description: '', startDate: new Date().toISOString().split('T')[0], dueDate: '', priority: 'Medium', status: 'Not Started' }); setMsEditId(null); setMsModal(true); }}>
              <PlusCircle className="h-4 w-4" /> Add Milestone
            </Button>
          </div>

          {milestones.length === 0 ? (
            <Card className="p-6">
              <EmptyState
                title="No milestones"
                description="Create milestones to track key project deadlines."
                icon={<Clock className="h-7 w-7" />}
                action={<Button size="sm" onClick={() => setMsModal(true)}><PlusCircle className="h-4 w-4" /> Add Milestone</Button>}
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {milestones.map((m) => {
                const mDays = daysUntil(m.dueDate);
                return (
                  <Card key={m._id} className="p-4" hover>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => completeMilestone(m)}
                          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            m.status === 'Completed' ? 'bg-green-600 border-green-600' : 'border-slate-300 hover:border-green-500'
                          }`}
                        >
                          {m.status === 'Completed' && <CheckCircle2 className="h-3 w-3 text-white" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`font-medium text-slate-900 ${m.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>{m.title}</p>
                            <Badge className={milestoneStatusColors[m.status]}>{m.status}</Badge>
                            <Badge className={priorityColors[m.priority]}>{m.priority}</Badge>
                          </div>
                          {m.description && <p className="text-sm text-slate-500 mt-1">{m.description}</p>}
                          <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                            <span>Due: {formatDate(m.dueDate)}</span>
                            {m.status !== 'Completed' && (
                              <span className={mDays <= 0 ? 'text-red-600 font-medium' : mDays <= 7 ? 'text-amber-600 font-medium' : ''}>
                                {mDays <= 0 ? `${Math.abs(mDays)}d overdue` : `${mDays}d left`}
                              </span>
                            )}
                            {m.completedAt && <span>Completed: {formatDate(m.completedAt)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setMsForm({
                              title: m.title, description: m.description,
                              startDate: m.startDate ? new Date(m.startDate).toISOString().split('T')[0] : '',
                              dueDate: new Date(m.dueDate).toISOString().split('T')[0],
                              priority: m.priority, status: m.status,
                            });
                            setMsEditId(m._id);
                            setMsModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteMilestone(m._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Activity History</h3>
          {history.length === 0 ? (
            <Card className="p-6">
              <EmptyState title="No activity recorded" icon={<History className="h-7 w-7" />} />
            </Card>
          ) : (
            <div className="space-y-3">
              {history.map((h) => (
                <Card key={h._id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{h.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span>{typeof h.userId === 'object' ? h.userId.name : 'You'}</span>
                        <span>·</span>
                        <span>{formatDateTime(h.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Project?"
        message="This will permanently delete the project and all its deliverables, change requests, and milestones. This cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        loading={savingEdit}
      />

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Project" size="lg">
        <div className="space-y-4">
          <Input label="Project Name" value={editForm.projectName || ''} onChange={(e) => setEditForm({ ...editForm, projectName: e.target.value })} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Client Name" value={editForm.clientName || ''} onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })} />
            <Input label="Client Email" value={editForm.clientEmail || ''} onChange={(e) => setEditForm({ ...editForm, clientEmail: e.target.value })} />
          </div>
          <Textarea label="Description" rows={3} value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Budget" type="number" value={editForm.budget ?? 0} onChange={(e) => setEditForm({ ...editForm, budget: Number(e.target.value) })} />
            <Input label="Revision Limit" type="number" value={editForm.revisionLimit ?? 0} onChange={(e) => setEditForm({ ...editForm, revisionLimit: Number(e.target.value) })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={editForm.startDate || ''} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} />
            <Input label="Deadline" type="date" value={editForm.deadline || ''} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Status" value={editForm.status || ''} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as ProjectSummary['project']['status'] })}>
              {projectStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select label="Priority" value={editForm.priority || ''} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as ProjectSummary['project']['priority'] })}>
              {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} loading={savingEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      <Modal open={delivModal} onClose={() => setDelivModal(false)} title={delivEditId ? 'Edit Deliverable' : 'Add Deliverable'} size="lg">
        <div className="space-y-4">
          <Input label="Title" placeholder="e.g. Home Page" value={delivForm.title} onChange={(e) => setDelivForm({ ...delivForm, title: e.target.value })} />
          <Textarea label="Description" rows={2} value={delivForm.description} onChange={(e) => setDelivForm({ ...delivForm, description: e.target.value })} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Category" placeholder="e.g. Page" value={delivForm.category} onChange={(e) => setDelivForm({ ...delivForm, category: e.target.value })} />
            <Input label="Estimated Effort" placeholder="e.g. 2 days" value={delivForm.estimatedEffort} onChange={(e) => setDelivForm({ ...delivForm, estimatedEffort: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Due Date" type="date" value={delivForm.dueDate} onChange={(e) => setDelivForm({ ...delivForm, dueDate: e.target.value })} />
            <Input label="Revision Allowance" type="number" min="0" value={delivForm.revisionAllowance} onChange={(e) => setDelivForm({ ...delivForm, revisionAllowance: Number(e.target.value) })} />
          </div>
          <Select label="Status" value={delivForm.status} onChange={(e) => setDelivForm({ ...delivForm, status: e.target.value })}>
            {deliverableStatuses.map((s) => <option key={s} value={s}>{deliverableStatusLabel[s]}</option>)}
          </Select>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDelivModal(false)}>Cancel</Button>
            <Button onClick={saveDeliverable}>{delivEditId ? 'Save' : 'Add Deliverable'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={crModal} onClose={() => setCrModal(false)} title="New Change Request" size="lg">
        <div className="space-y-4">
          <Input label="Request Title" placeholder="e.g. Add Payment Gateway" value={crForm.title} onChange={(e) => setCrForm({ ...crForm, title: e.target.value })} />
          <Textarea label="Description" rows={2} placeholder="What is being requested?" value={crForm.description} onChange={(e) => setCrForm({ ...crForm, description: e.target.value })} />
          <Textarea label="Reason for Change" rows={2} placeholder="Why is this needed?" value={crForm.reason} onChange={(e) => setCrForm({ ...crForm, reason: e.target.value })} />
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Additional Cost (USD)" type="number" min="0" value={crForm.additionalCost} onChange={(e) => setCrForm({ ...crForm, additionalCost: Number(e.target.value) })} />
            <Input label="Additional Effort" placeholder="e.g. 3 days" value={crForm.additionalEffort} onChange={(e) => setCrForm({ ...crForm, additionalEffort: e.target.value })} />
            <Input label="Additional Time (days)" type="number" min="0" value={crForm.additionalTime} onChange={(e) => setCrForm({ ...crForm, additionalTime: Number(e.target.value) })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setCrModal(false)}>Cancel</Button>
            <Button onClick={saveChangeRequest}>Submit Request</Button>
          </div>
        </div>
      </Modal>

      <Modal open={crDecision.open} onClose={() => setCrDecision({ ...crDecision, open: false })} title={`${crDecision.status} Change Request`} size="sm">
        <div className="space-y-4">
          <Textarea label="Decision Note (optional)" rows={3} placeholder="Reason for decision..." value={crDecision.note} onChange={(e) => setCrDecision({ ...crDecision, note: e.target.value })} />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCrDecision({ ...crDecision, open: false })}>Cancel</Button>
            <Button
              variant={crDecision.status === 'Approved' ? 'primary' : 'danger'}
              onClick={handleDecision}
            >
              {crDecision.status}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={msModal} onClose={() => setMsModal(false)} title={msEditId ? 'Edit Milestone' : 'Add Milestone'} size="lg">
        <div className="space-y-4">
          <Input label="Title" placeholder="e.g. Design Approval" value={msForm.title} onChange={(e) => setMsForm({ ...msForm, title: e.target.value })} />
          <Textarea label="Description" rows={2} value={msForm.description} onChange={(e) => setMsForm({ ...msForm, description: e.target.value })} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={msForm.startDate} onChange={(e) => setMsForm({ ...msForm, startDate: e.target.value })} />
            <Input label="Due Date" type="date" value={msForm.dueDate} onChange={(e) => setMsForm({ ...msForm, dueDate: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Priority" value={msForm.priority} onChange={(e) => setMsForm({ ...msForm, priority: e.target.value })}>
              {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
            <Select label="Status" value={msForm.status} onChange={(e) => setMsForm({ ...msForm, status: e.target.value })}>
              {milestoneStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setMsModal(false)}>Cancel</Button>
            <Button onClick={saveMilestone}>{msEditId ? 'Save' : 'Add Milestone'}</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
