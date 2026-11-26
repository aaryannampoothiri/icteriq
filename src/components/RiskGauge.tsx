import type { RiskDriver, RiskLevel } from '../types/village';
import { RiskBadge } from './ui/RiskBadge';

interface RiskGaugeProps {
  score: number;
  riskLevel: RiskLevel;
  drivers: RiskDriver[];
}

export function RiskGauge({ score, riskLevel, drivers }: RiskGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  // Angle from -90 deg (left, score 0) to +90 deg (right, score 100)
  const angleDeg = -90 + (clampedScore / 100) * 180;
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;

  const cx = 120;
  const cy = 112;
  const needleLen = 66;

  const needleX = cx + needleLen * Math.cos(angleRad);
  const needleY = cy + needleLen * Math.sin(angleRad);

  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-base font-semibold text-slate-900">Outbreak risk score</h2>

      <div className="mt-3 flex flex-col items-center">
        <svg
          viewBox="0 0 240 135"
          className="w-full max-w-[240px]"
          role="img"
          aria-label={`Outbreak risk score ${clampedScore} out of 100, ${riskLevel} risk`}
        >
          {/* Low zone: 0 - 33 */}
          <path
            d="M 36 112 A 84 84 0 0 1 78 39.2"
            fill="none"
            stroke="#059669"
            strokeWidth="16"
            strokeLinecap="butt"
          />
          {/* Medium zone: 34 - 66 */}
          <path
            d="M 81.5 37.3 A 84 84 0 0 1 158.5 37.3"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="16"
            strokeLinecap="butt"
          />
          {/* High zone: 67 - 100 */}
          <path
            d="M 162 39.2 A 84 84 0 0 1 204 112"
            fill="none"
            stroke="#dc2626"
            strokeWidth="16"
            strokeLinecap="butt"
          />

          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke="#0f172a"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r="6" fill="#0f172a" />

          {/* Min / Max labels */}
          <text x="32" y="130" textAnchor="middle" className="fill-slate-500 text-[11px]">
            0
          </text>
          <text x="208" y="130" textAnchor="middle" className="fill-slate-500 text-[11px]">
            100
          </text>
        </svg>

        <div className="-mt-1 flex items-baseline gap-1">
          <span className="text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
            {clampedScore}
          </span>
          <span className="text-sm font-medium text-slate-500">/100</span>
        </div>

        <div className="mt-2">
          <RiskBadge level={riskLevel} size="md" />
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4">
        <h3 className="text-xs font-semibold text-slate-700">What is driving this score</h3>
        <div className="mt-3 space-y-2.5">
          {drivers.map((driver) => (
            <div key={driver.label} className="grid grid-cols-12 items-center gap-2 text-xs">
              <span className="col-span-6 truncate text-slate-600">{driver.label}</span>
              <div className="col-span-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-teal-600"
                  style={{ width: `${Math.min(100, driver.contributionPct * 2.2)}%` }}
                />
              </div>
              <span className="col-span-2 text-right font-medium text-slate-800 tabular-nums">
                {driver.contributionPct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
