import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { RiskBadge } from '../components/ui/RiskBadge';
import { EmptyState } from '../components/ui/StateFeedback';
import { StatCard } from '../components/ui/StatCard';
import { VillageRiskMap } from '../components/VillageRiskMap';
import type { AlertItem, OverviewSummary, Village } from '../types/village';
import { getRiskColorHex } from '../utils/risk';

interface OverviewPageProps {
  summary: OverviewSummary;
  villages: Village[];
  alerts: AlertItem[];
  selectedVillageId: string;
  onSelectVillage: (villageId: string) => void;
  onOpenVillageDetail: (villageId: string) => void;
  onViewAllAlerts: () => void;
}

export function OverviewPage({
  summary,
  villages,
  alerts,
  selectedVillageId,
  onSelectVillage,
  onOpenVillageDetail,
  onViewAllAlerts,
}: OverviewPageProps) {
  const [showAllVillages, setShowAllVillages] = useState(false);

  const rankedVillages = useMemo(() => {
    const sorted = [...villages].sort((a, b) => b.riskScore - a.riskScore);
    return showAllVillages ? sorted : sorted.slice(0, 6);
  }, [villages, showAllVillages]);

  const recentAlerts = useMemo(() => alerts.slice(0, 5), [alerts]);

  if (villages.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <EmptyState
          title="No village data available"
          description="Connect a data source or check that the village dataset is loaded."
        />
      </div>
    );
  }

  return (
    <div>
      {/* Band 1: White Hero + KPI Summary (Wise-style bold display header) */}
      <section className="bg-white py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="font-display text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-[#163300] sm:text-5xl">
                Jaundice risk overview
              </h1>
              <p className="mt-3 text-sm text-[#45553d] sm:text-base">
                {summary.weekLabel} · 100 km around Kothri, Madhya Pradesh
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onViewAllAlerts}
                className="rounded-full bg-[#9FE870] px-5 py-2.5 text-sm font-semibold text-[#163300] transition-colors hover:bg-[#8cd95c]"
              >
                Review alerts
              </button>
              <button
                type="button"
                onClick={() => onOpenVillageDetail(selectedVillageId)}
                className="rounded-full border border-[#163300] bg-white px-5 py-2.5 text-sm font-semibold text-[#163300] transition-colors hover:bg-[#f4f6f3]"
              >
                Inspect village
              </button>
            </div>
          </div>

          <div
            aria-label="District risk summary"
            className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
          >
            <StatCard
              label="Total villages"
              value={summary.totalVillages}
              subtitle="Monitored this week"
            />
            <StatCard
              label="High risk"
              value={summary.highRiskCount}
              accentTone="red"
              subtitle={summary.highRiskDeltaText}
            />
            <StatCard
              label="Medium risk"
              value={summary.mediumRiskCount}
              accentTone="amber"
              subtitle={summary.mediumRiskDeltaText}
            />
            <StatCard
              label="Low risk"
              value={summary.lowRiskCount}
              accentTone="green"
              subtitle={summary.lowRiskDeltaText}
            />
          </div>
        </div>
      </section>

      {/* Band 2: Wise Signature Bright Lime Section (#9FE870) — Map + Recent Alerts */}
      <section className="bg-[#9FE870] py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <VillageRiskMap
                villages={villages}
                selectedVillageId={selectedVillageId}
                onSelectVillage={onSelectVillage}
                onOpenVillageDetail={onOpenVillageDetail}
              />
            </div>

            <div className="flex flex-col rounded-2xl border border-[#84cf55] bg-white p-5 lg:col-span-4">
              <div className="flex items-center justify-between border-b border-[#edf1eb] pb-3">
                <h2 className="font-display text-base font-bold text-[#163300]">
                  Recent alerts
                </h2>
                <button
                  type="button"
                  onClick={onViewAllAlerts}
                  className="rounded-full bg-[#163300] px-3 py-1 text-xs font-semibold text-[#9FE870] transition-colors hover:bg-[#234d00]"
                >
                  View all
                </button>
              </div>

              <div className="flex-1 divide-y divide-[#edf1eb]">
                {recentAlerts.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#5c6b54]">
                    No recent alerts logged.
                  </p>
                ) : (
                  recentAlerts.map((alert) => (
                    <button
                      key={alert.id}
                      type="button"
                      onClick={() => onOpenVillageDetail(alert.villageId)}
                      className="flex w-full items-start gap-2.5 py-3 text-left transition-colors hover:bg-[#f8faf7]"
                    >
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: getRiskColorHex(alert.riskLevel) }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#163300]">
                          {alert.title}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-[#5c6b54]">
                          {alert.description}
                        </p>
                        <p className="mt-1 text-[11px] text-[#7a8973]">
                          {alert.dateLabel}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Band 3: Wise Signature Deep Forest Section (#163300) — Highest-risk villages */}
      <section className="bg-[#163300] py-10 text-white sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[#9FE870] sm:text-3xl">
                Highest-risk villages
              </h2>
              <p className="mt-1 text-sm text-[#c7d6be]">
                Ranked by current 0–100 outbreak risk score within 100 km of Kothri, MP.
              </p>
            </div>

            {villages.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAllVillages((prev) => !prev)}
                className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#9FE870] px-4 py-2 text-xs font-semibold text-[#163300] transition-colors hover:bg-[#8cd95c] sm:self-auto"
              >
                {showAllVillages ? (
                  <>
                    Show top 6 <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    Show all {villages.length}{' '}
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </>
                )}
              </button>
            )}
          </div>

          <div className="mt-6 rounded-2xl bg-white p-4 text-[#163300] sm:p-6">
            <div className="grid grid-cols-12 items-center gap-3 border-b border-[#e2e7df] pb-2.5 text-xs font-semibold text-[#5c6b54] sm:px-2">
              <span className="col-span-1">#</span>
              <span className="col-span-5 sm:col-span-3">Village</span>
              <span className="col-span-6 hidden sm:col-span-4 sm:block">Risk index</span>
              <span className="col-span-2 text-right sm:col-span-1">Score</span>
              <span className="col-span-2 text-right">Level</span>
              <span className="col-span-2 text-right">Cases</span>
            </div>

            <div className="divide-y divide-[#edf1eb]">
              {rankedVillages.map((village, idx) => {
                const latestCases =
                  village.weeklyCases[village.weeklyCases.length - 1]?.cases ?? 0;
                const barColor = getRiskColorHex(village.riskLevel);

                return (
                  <button
                    key={village.id}
                    type="button"
                    onClick={() => onOpenVillageDetail(village.id)}
                    className="group grid w-full grid-cols-12 items-center gap-3 py-3.5 text-left transition-colors hover:bg-[#f4f6f3] sm:px-2"
                  >
                    <span className="col-span-1 text-xs font-semibold text-[#7a8973] tabular-nums">
                      {idx + 1}
                    </span>

                    <span className="col-span-5 flex items-center gap-1.5 text-sm font-bold text-[#163300] sm:col-span-3">
                      <span className="truncate">{village.name}</span>
                      <ArrowRight
                        className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </span>

                    <div className="col-span-6 hidden sm:col-span-4 sm:block">
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#edf1eb]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${village.riskScore}%`,
                            backgroundColor: barColor,
                          }}
                        />
                      </div>
                    </div>

                    <span className="col-span-2 text-right text-sm font-bold text-[#163300] tabular-nums sm:col-span-1">
                      {village.riskScore}
                    </span>

                    <div className="col-span-2 flex justify-end">
                      <RiskBadge level={village.riskLevel} />
                    </div>

                    <span className="col-span-2 text-right text-xs font-semibold text-[#5c6b54] tabular-nums">
                      {latestCases} {latestCases === 1 ? 'case' : 'cases'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
