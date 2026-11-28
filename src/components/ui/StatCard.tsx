interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  accentTone?: 'neutral' | 'red' | 'amber' | 'green';
  statusBadge?: {
    text: string;
    tone: 'high' | 'elevated' | 'normal';
  };
  subtitle: string;
}

const ACCENT_TEXT_MAP = {
  neutral: 'text-[#5c6b54]',
  red: 'text-red-700',
  amber: 'text-amber-700',
  green: 'text-[#163300]',
};

const BADGE_TONE_MAP = {
  high: 'bg-red-50 text-red-700 border-red-200',
  elevated: 'bg-amber-50 text-amber-800 border-amber-200',
  normal: 'bg-[#e8f5e0] text-[#163300] border-[#cce3bf]',
};

export function StatCard({
  label,
  value,
  unit,
  accentTone = 'neutral',
  statusBadge,
  subtitle,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[#e2e7df] bg-white p-5">
      <div className="text-xs font-medium text-[#5c6b54]">{label}</div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-2xl font-bold tracking-tight text-[#163300] tabular-nums">
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-[#5c6b54]">{unit}</span>}
      </div>

      {statusBadge && (
        <div className="mt-2">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${BADGE_TONE_MAP[statusBadge.tone]}`}
          >
            {statusBadge.text}
          </span>
        </div>
      )}

      <p className={`mt-2 text-xs leading-relaxed ${ACCENT_TEXT_MAP[accentTone]}`}>
        {subtitle}
      </p>
    </div>
  );
}

