import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input, Textarea, Select } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { projectService, type ProjectInput } from '../services/projectService';
import { projectStatuses, priorities } from '../utils/helpers';

export default function ProjectFormPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProjectInput>({
    projectName: '',
    clientName: '',
    clientEmail: '',
    description: '',
    budget: 0,
    startDate: new Date().toISOString().split('T')[0],
    deadline: '',
    status: 'Planning',
    priority: 'Medium',
    revisionLimit: 3,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.projectName.trim()) e.projectName = 'Project name is required';
    if (!form.clientName.trim()) e.clientName = 'Client name is required';
    if (!form.clientEmail.trim()) e.clientEmail = 'Client email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.clientEmail)) e.clientEmail = 'Invalid email';
    if (!form.deadline) e.deadline = 'Deadline is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const project = await projectService.create({
        ...form,
        budget: Number(form.budget) || 0,
        revisionLimit: Number(form.revisionLimit) || 0,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        deadline: new Date(form.deadline).toISOString(),
      });
      toast('Project created successfully', 'success');
      navigate(`/projects/${project._id}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to create project', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <button
        onClick={() => navigate('/projects')}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </button>

      <Card className="p-6 max-w-2xl">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Create New Project</h2>
        <p className="text-sm text-slate-500 mb-6">Define the project details and original agreement terms.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g. Corporate Website Redesign"
            value={form.projectName}
            onChange={(e) => setForm({ ...form, projectName: e.target.value })}
            error={errors.projectName}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Client Name"
              placeholder="e.g. Acme Corp"
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              error={errors.clientName}
            />
            <Input
              label="Client Email"
              type="email"
              placeholder="contact@client.com"
              value={form.clientEmail}
              onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
              error={errors.clientEmail}
            />
          </div>
          <Textarea
            label="Description"
            placeholder="Project description..."
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Budget (USD)"
              type="number"
              min="0"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
            />
            <Input
              label="Revision Limit"
              type="number"
              min="0"
              value={form.revisionLimit}
              onChange={(e) => setForm({ ...form, revisionLimit: Number(e.target.value) })}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <Input
              label="Deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              error={errors.deadline}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ProjectInput['status'] })}
            >
              {projectStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            <Select
              label="Priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              {priorities.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => navigate('/projects')}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Project
            </Button>
          </div>
        </form>
      </Card>
    </DashboardLayout>
  );
}
