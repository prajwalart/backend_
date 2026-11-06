import { Menu } from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
  title: string;
}

export default function Topbar({ onMenuClick, title }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4 flex items-center gap-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-600 hover:text-slate-900"
      >
        <Menu className="h-6 w-6" />
      </button>
      <h1 className="text-lg font-semibold text-slate-900 flex-1">{title}</h1>
    </header>
  );
}
