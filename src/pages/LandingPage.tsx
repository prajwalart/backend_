import { Link } from 'react-router-dom';
import {
  ClipboardList,
  ShieldCheck,
  GitPullRequest,
  TrendingDown,
  CheckCircle2,
  ArrowRight,
  Layers,
  Clock,
  FileText,
  Lock,
} from 'lucide-react';
import Button from '../components/ui/Button';

const features = [
  {
    icon: Layers,
    title: 'Original Scope Management',
    description: 'Record and lock the agreed deliverables so the original contract is never silently overwritten.',
  },
  {
    icon: GitPullRequest,
    title: 'Change Request Workflow',
    description: 'Submit, approve, or reject scope changes separately from the original agreement with full audit trails.',
  },
  {
    icon: Clock,
    title: 'Milestone Tracking',
    description: 'Create milestones with deadlines, track progress, and calculate completion percentages automatically.',
  },
  {
    icon: FileText,
    title: 'Activity History',
    description: 'Every action is logged — see who did what, when, and why, with a complete change audit trail.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Private',
    description: 'JWT authentication and per-user ownership mean your projects are visible only to you.',
  },
  {
    icon: TrendingDown,
    title: 'Scope Creep Prevention',
    description: 'Keep approved and pending changes clearly separated from the original deliverables list.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Create a Project',
    description: 'Define the project name, client, budget, deadline, and revision limits.',
  },
  {
    number: '02',
    title: 'Record Original Scope',
    description: 'Add the agreed deliverables and lock the original scope snapshot.',
  },
  {
    number: '03',
    title: 'Track Change Requests',
    description: 'When the client asks for more, record it as a change request — not a silent edit.',
  },
  {
    number: '04',
    title: 'Approve or Reject',
    description: 'Review the impact on cost and timeline, then approve or reject each request.',
  },
];

const benefits = [
  'Never lose track of what was originally agreed',
  'See the real cost impact of every scope change',
  'Maintain a professional audit trail for clients',
  'Prevent unpaid work from scope creep',
  'Keep milestones and deadlines organized',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">FreelanceScope</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900">How it Works</a>
            <a href="#benefits" className="text-sm font-medium text-slate-600 hover:text-slate-900">Benefits</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-6">
                <ShieldCheck className="h-4 w-4" />
                Scope Creep Prevention
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
                Manage freelance project scope with{' '}
                <span className="text-indigo-600">clarity and control</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl">
                FreelanceScope helps you record original deliverables, track change requests
                separately, and keep an auditable history of every decision — so scope creep
                never goes unnoticed.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register">
                  <Button size="lg">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="outline" size="lg">Explore Features</Button>
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Project: Corporate Website</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                    In Progress
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Home Page</p>
                      <p className="text-xs text-slate-500">Original scope</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Login Page</p>
                      <p className="text-xs text-slate-500">Original scope</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <GitPullRequest className="h-5 w-5 text-amber-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Payment Gateway</p>
                      <p className="text-xs text-amber-700">Change request — +$800, +3 days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <GitPullRequest className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Admin Dashboard</p>
                      <p className="text-xs text-green-700">Approved — +$1,200, +5 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900">What is Scope Creep?</h2>
          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            Scope creep happens when a project grows beyond its original agreement — extra features,
            more revisions, new pages — without adjusted deadlines or budgets. The freelancer ends up
            doing unpaid work while the client expects everything was included.
          </p>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            FreelanceScope solves this by keeping the <strong className="text-slate-900">original agreed deliverables</strong> locked
            and recording every new request as a separate, trackable <strong className="text-slate-900">change request</strong> with
            its own cost, time, and approval status.
          </p>
        </div>
      </section>

      <section id="features" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-slate-900">Everything you need to manage scope</h2>
            <p className="mt-4 text-slate-600">
              A complete toolkit for freelancers who want professional project management.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-lg bg-indigo-50 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-900 text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-slate-900">How it works</h2>
            <p className="mt-4 text-slate-600">Four simple steps to keep your projects on track.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.number} className="relative">
                <div className="text-4xl font-bold text-indigo-100 mb-3">{s.number}</div>
                <h3 className="font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="py-20 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold">Why freelancers choose FreelanceScope</h2>
              <p className="mt-4 text-slate-300">
                Stop losing money to unrecorded scope changes. Keep your projects profitable and your clients informed.
              </p>
              <Link to="/register" className="inline-block mt-6">
                <Button size="lg">
                  Start Managing Scope
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-slate-200">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-indigo-600">
        <div className="max-w-3xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to take control of your freelance projects?</h2>
          <p className="mt-4 text-indigo-100">Create a free account and start managing scope today.</p>
          <Link to="/register" className="inline-block mt-6">
            <Button variant="secondary" size="lg">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-white">FreelanceScope</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/login" className="hover:text-white">Login</Link>
            <Link to="/register" className="hover:text-white">Register</Link>
            <span className="flex items-center gap-1 text-slate-500">
              <Lock className="h-3 w-3" /> Secure JWT Auth
            </span>
          </div>
          <p className="text-sm text-slate-500">MERN Stack Project — B.Tech CS CIA</p>
        </div>
      </footer>
    </div>
  );
}
