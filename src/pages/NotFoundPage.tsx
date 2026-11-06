import { Link } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
        <h2 className="text-xl font-semibold text-slate-800 mt-2">Page Not Found</h2>
        <p className="text-sm text-slate-500 mt-2 mb-8">
          The page or project resource you are looking for doesn't exist, has been moved, or you may need to sign in.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/dashboard">
            <Button>
              <Home className="h-4 w-4" /> Go to Dashboard
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" /> Landing Page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

