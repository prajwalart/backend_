interface ProgressBarProps {
  value: number;
  className?: string;
  color?: string;
}

export default function ProgressBar({ value, className = '', color = 'bg-indigo-600' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={`w-full bg-slate-200 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
