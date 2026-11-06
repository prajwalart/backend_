import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitPullRequest, Search, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { Textarea, Select } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { changeRequestService } from '../services/changeRequestService';
import type { ChangeRequest } from '../types';
import {
  changeStatusColors,
  formatDate,
  formatDateTime,
  formatCurrency,
} from '../utils/helpers';

export default function ChangeRequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [crDecision, setCrDecision] = useState<{
    open: boolean;
    id: string;
    status: 'Approved' | 'Rejected';
    note: string;
  }>({
    open: false,
    id: '',
    status: 'Approved',
    note: '',
  });
  const [decisionLoading, setDecisionLoading] = useState(false);

  const fetchRequests = useCallback(() => {
    setLoading(true);
    changeRequestService
      .listAll(statusFilter || undefined)
      .then(setRequests)
      .catch((err) => {
        toast(err instanceof Error ? err.message : 'Failed to load change requests', 'error');
      })
      .finally(() => setLoading(false));
  }, [statusFilter, toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleDecisionSubmit = async () => {
    if (!crDecision.id) return;
    setDecisionLoading(true);
    try {
      await changeRequestService.updateStatus(
        crDecision.id,
        crDecision.status,
        crDecision.note || undefined
      );
      toast(`Change request ${crDecision.status.toLowerCase()} successfully`, 'success');
      setCrDecision({ open: false, id: '', status: 'Approved', note: '' });
      fetchRequests();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Action failed', 'error');
    } finally {
      setDecisionLoading(false);
    }
  };

  const filtered = requests.filter((r) => {
    const term = search.toLowerCase();
    const projectName =
      typeof r.projectId === 'object' && r.projectId !== null
        ? (r.projectId as { projectName?: string }).projectName || ''
        : '';
    return (
      r.title.toLowerCase().includes(term) ||
      (r.description && r.description.toLowerCase().includes(term)) ||
      (r.reason && r.reason.toLowerCase().includes(term)) ||
      projectName.toLowerCase().includes(term)
    );
  });

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const approvedCount = requests.filter((r) => r.status === 'Approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'Rejected').length;

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Change Requests</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Track and manage all scope changes requested across projects.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Pending Review</p>
              <p className="text-xl font-bold text-slate-900">{pendingCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-50 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Approved Changes</p>
              <p className="text-xl font-bold text-slate-900">{approvedCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-50 text-red-600">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Rejected Changes</p>
              <p className="text-xl font-bold text-slate-900">{rejectedCount}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search change requests, descriptions, or projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="sm:w-48">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <Spinner className="h-16 w-16" />
      ) : filtered.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            title="No change requests found"
            description={
              search || statusFilter
                ? 'Try adjusting your search query or status filter.'
                : 'Scope changes submitted for your projects will appear here.'
            }
            icon={<GitPullRequest className="h-8 w-8 text-slate-400" />}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((cr) => {
            const project =
              typeof cr.projectId === 'object' && cr.projectId !== null
                ? (cr.projectId as { _id?: string; projectName?: string; clientName?: string })
                : null;
            const projectId = project?._id || (typeof cr.projectId === 'string' ? cr.projectId : '');

            return (
              <Card key={cr._id} className="p-5" hover>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <p className="font-semibold text-slate-900 text-base">{cr.title}</p>
                      <Badge className={changeStatusColors[cr.status]}>{cr.status}</Badge>
                      {project?.projectName && (
                        <Link
                          to={`/projects/${projectId}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded"
                        >
                          {project.projectName}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>

                    {cr.description && (
                      <p className="text-sm text-slate-600 mt-1.5">{cr.description}</p>
                    )}
                    {cr.reason && (
                      <p className="text-xs text-slate-500 mt-1">
                        <span className="font-medium text-slate-600">Scope justification:</span>{' '}
                        {cr.reason}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">
                        Extra Cost: {formatCurrency(cr.additionalCost)}
                      </span>
                      <span>Extra Effort: {cr.additionalEffort || '—'}</span>
                      <span>Extra Time: +{cr.additionalTime} days</span>
                      <span>Submitted: {formatDate(cr.createdAt)}</span>
                      {cr.decisionAt && <span>Decided: {formatDateTime(cr.decisionAt)}</span>}
                    </div>

                    {cr.decisionNote && (
                      <p className="text-xs text-slate-600 mt-1.5 italic bg-slate-50 p-2 rounded border border-slate-200">
                        Decision Note: {cr.decisionNote}
                      </p>
                    )}
                  </div>

                  {cr.status === 'Pending' && (
                    <div className="flex items-center gap-2 self-start lg:self-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-700 border-green-200 hover:bg-green-50"
                        onClick={() =>
                          setCrDecision({
                            open: true,
                            id: cr._id,
                            status: 'Approved',
                            note: '',
                          })
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-700 border-red-200 hover:bg-red-50"
                        onClick={() =>
                          setCrDecision({
                            open: true,
                            id: cr._id,
                            status: 'Rejected',
                            note: '',
                          })
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Approve / Reject Decision Modal */}
      <Modal
        open={crDecision.open}
        onClose={() => setCrDecision({ open: false, id: '', status: 'Approved', note: '' })}
        title={`${crDecision.status} Change Request`}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {crDecision.status === 'Approved'
              ? 'Approving this change request records the extra budget and effort as agreed additional scope, maintaining the integrity of the original baseline.'
              : 'Rejecting this request will mark the scope change as decline without altering project deliverables.'}
          </p>
          <Textarea
            label="Decision Note (Optional)"
            placeholder="Add comments, client confirmation details, or reasoning..."
            value={crDecision.note}
            onChange={(e) => setCrDecision({ ...crDecision, note: e.target.value })}
            rows={3}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setCrDecision({ open: false, id: '', status: 'Approved', note: '' })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDecisionSubmit}
              loading={decisionLoading}
              className={
                crDecision.status === 'Approved'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              Confirm {crDecision.status}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
