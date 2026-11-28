import type { RiskLevel } from '../../types/village';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md';
}

const RISK_STYLES: Record<RiskLevel, { bg: string; text: string; dot: string; label: string }> = {
  High: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    dot: 'bg-red-600',
    label: 'High risk',
  },
  Medium: {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
    label: 'Medium risk',
  },
  Low: {
    bg: 'bg-[#e8f5e0] border-[#c5e0b4]',
    text: 'text-[#163300]',
    dot: 'bg-[#163300]',
    label: 'Low risk',
  },
};

export function RiskBadge({ level, size = 'sm' }: RiskBadgeProps) {
  const style = RISK_STYLES[level];
  const padding = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${style.bg} ${style.text} ${padding}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {level}
    </span>
  );
}

