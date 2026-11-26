import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { RiskBadge } from '../components/ui/RiskBadge';
import { getRiskColorHex } from '../utils/risk';
import { EmptyState } from '../components/ui/StateFeedback';
import { StatCard } from '../components/ui/StatCard';
import { VillageRiskMap } from '../components/VillageRiskMap';
import type { AlertItem, OverviewSummary, Village } from '../types/village';

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
      <EmptyState
        title="No village data available"
        description="Connect a data source or check that the village dataset is loaded."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          Dengue risk overview
        </h1>
        <p className="mt-1 text-sm text-slate-500">{summary.weekLabel}</p>
      </div>

      {/* Summary KPI cards */}
      <section aria-label="District risk summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
      </section>

      {/* Map + Recent alerts */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <VillageRiskMap
            villages={villages}
            selectedVillageId={selectedVillageId}
            onSelectVillage={onSelectVillage}
            onOpenVillageDetail={onOpenVillageDetail}
          />
        </div>

        <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 sm:p-5 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900">Recent alerts</h2>
            <button
              type="button"
              onClick={onViewAllAlerts}
              className="text-xs font-medium text-teal-700 transition-colors hover:text-teal-800"
            >
              View all
            </button>
          </div>

          <div className="flex-1 divide-y divide-slate-100">
            {recentAlerts.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No recent alerts logged.
              </p>
            ) : (
              recentAlerts.map((alert) => (
                <button
                  key={alert.id}
                  type="button"
                  onClick={() => onOpenVillageDetail(alert.villageId)}
                  className="flex w-full items-start gap-2.5 py-3 text-left transition-colors hover:bg-slate-50/80"
                >
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: getRiskColorHex(alert.riskLevel) }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {alert.title}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                      {alert.description}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {alert.dateLabel}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Highest-risk villages ranked list */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-slate-900">
            Highest-risk villages
          </h2>
          {villages.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAllVillages((prev) => !prev)}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800"
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

        <div className="mt-4">
          <div className="grid grid-cols-12 items-center gap-3 border-b border-slate-200 pb-2 text-xs font-medium text-slate-500 sm:px-2">
            <span className="col-span-1">#</span>
            <span className="col-span-5 sm:col-span-3">Village</span>
            <span className="col-span-6 hidden sm:col-span-4 sm:block">Risk index</span>
            <span className="col-span-2 text-right sm:col-span-1">Score</span>
            <span className="col-span-2 text-right">Level</span>
            <span className="col-span-2 text-right">Cases</span>
          </div>

          <div className="divide-y divide-slate-100">
          {rankedVillages.map((village, idx) => {
            const latestCases =
              village.weeklyCases[village.weeklyCases.length - 1]?.cases ?? 0;
            const barColor = getRiskColorHex(village.riskLevel);

            return (
              <button
                key={village.id}
                type="button"
                onClick={() => onOpenVillageDetail(village.id)}
                className="group grid w-full grid-cols-12 items-center gap-3 py-3 text-left transition-colors hover:bg-slate-50/80 sm:px-2"
              >
                <span className="col-span-1 text-xs font-medium text-slate-400 tabular-nums">
                  {idx + 1}
                </span>

                <span className="col-span-5 flex items-center gap-1.5 text-sm font-medium text-teal-800 group-hover:text-teal-900 sm:col-span-3">
                  <span className="truncate">{village.name}</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </span>

                <div className="col-span-6 hidden sm:col-span-4 sm:block">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${village.riskScore}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                </div>

                <span className="col-span-2 text-right text-sm font-semibold text-slate-900 tabular-nums sm:col-span-1">
                  {village.riskScore}
                </span>

                <div className="col-span-2 flex justify-end">
                  <RiskBadge level={village.riskLevel} />
                </div>

                <span className="col-span-2 text-right text-xs text-slate-500 tabular-nums">
                  {latestCases} {latestCases === 1 ? 'case' : 'cases'}
                </span>
              </button>
            );
          })}
          </div>
        </div>
      </section>
    </div>
  );
}

