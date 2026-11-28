import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { RiskBadge } from '../components/ui/RiskBadge';
import { EmptyState } from '../components/ui/StateFeedback';
import type { AlertItem, AlertStatus, RiskLevel, Village } from '../types/village';

export type DateRangeFilter = 'all' | '7d' | '14d' | '30d';

interface AlertsPageProps {
  alerts: AlertItem[];
  villages: Village[];
  searchQuery: string;
  villageFilter: string;
  riskFilter: 'All' | RiskLevel;
  dateFilter: DateRangeFilter;
  onVillageFilterChange: (villageId: string) => void;
  onRiskFilterChange: (risk: 'All' | RiskLevel) => void;
  onDateFilterChange: (dateRange: DateRangeFilter) => void;
  onClearFilters: () => void;
  onUpdateStatus: (alertId: string, status: AlertStatus) => void;
  onOpenVillageDetail: (villageId: string) => void;
}

const REFERENCE_TODAY_MS = new Date('2026-11-25T00:00:00Z').getTime();

const STATUS_STYLES: Record<AlertStatus, string> = {
  New: 'border-red-200 bg-red-50 text-red-700',
  Acknowledged: 'border-amber-200 bg-amber-50 text-amber-800',
  'In progress': 'border-[#c5e0b4] bg-[#e8f5e0] text-[#163300]',
  Resolved: 'border-[#d4dbd0] bg-[#f4f6f3] text-[#5c6b54]',
};

const ALL_STATUSES: AlertStatus[] = ['New', 'Acknowledged', 'In progress', 'Resolved'];

export function AlertsPage({
  alerts,
  villages,
  searchQuery,
  villageFilter,
  riskFilter,
  dateFilter,
  onVillageFilterChange,
  onRiskFilterChange,
  onDateFilterChange,
  onClearFilters,
  onUpdateStatus,
  onOpenVillageDetail,
}: AlertsPageProps) {
  const filteredAlerts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return alerts.filter((alert) => {
      if (villageFilter !== 'all' && alert.villageId !== villageFilter) {
        return false;
      }
      if (riskFilter !== 'All' && alert.riskLevel !== riskFilter) {
        return false;
      }
      if (dateFilter !== 'all') {
        const alertTime = new Date(`${alert.isoDate}T00:00:00Z`).getTime();
        const diffDays = (REFERENCE_TODAY_MS - alertTime) / (1000 * 60 * 60 * 24);
        const maxDays = dateFilter === '7d' ? 7 : dateFilter === '14d' ? 14 : 30;
        if (diffDays > maxDays) return false;
      }
      if (query) {
        const haystack =
          `${alert.villageName} ${alert.title} ${alert.description} ${alert.status}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [alerts, villageFilter, riskFilter, dateFilter, searchQuery]);

  const hasActiveFilters =
    villageFilter !== 'all' ||
    riskFilter !== 'All' ||
    dateFilter !== 'all' ||
    searchQuery.trim().length > 0;

  const riskOptions: { value: 'All' | RiskLevel; dotClass?: string }[] = [
    { value: 'All' },
    { value: 'High', dotClass: 'bg-red-600' },
    { value: 'Medium', dotClass: 'bg-amber-500' },
    { value: 'Low', dotClass: 'bg-emerald-600' },
  ];

  return (
    <div>
      {/* Band 1: White Hero Header */}
      <section className="bg-white py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-[#163300] sm:text-4xl">
            Alerts
          </h1>
          <p className="mt-2 text-sm text-[#45553d] sm:text-base">
            Every time a village crosses a risk threshold, it is logged here.
          </p>
        </div>
      </section>

      {/* Band 2: Lime Green (#9FE870) Filter Bar */}
      <section aria-label="Filter alerts" className="bg-[#9FE870] py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label
                  htmlFor="alert-village-filter"
                  className="block text-xs font-semibold text-[#5c6b54]"
                >
                  Village
                </label>
                <select
                  id="alert-village-filter"
                  value={villageFilter}
                  onChange={(e) => onVillageFilterChange(e.target.value)}
                  className="mt-1 h-9 rounded-full border border-[#d4dbd0] bg-[#f8faf7] px-3 text-sm font-medium text-[#163300] focus:border-[#163300] focus:bg-white focus:outline-none"
                >
                  <option value="all">All villages</option>
                  {villages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="alert-date-filter"
                  className="block text-xs font-semibold text-[#5c6b54]"
                >
                  Date
                </label>
                <select
                  id="alert-date-filter"
                  value={dateFilter}
                  onChange={(e) => onDateFilterChange(e.target.value as DateRangeFilter)}
                  className="mt-1 h-9 rounded-full border border-[#d4dbd0] bg-[#f8faf7] px-3 text-sm font-medium text-[#163300] focus:border-[#163300] focus:bg-white focus:outline-none"
                >
                  <option value="all">All dates</option>
                  <option value="7d">Last 7 days</option>
                  <option value="14d">Last 14 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#5c6b54]">
                  Risk level
                </span>
                <div
                  className="mt-1 flex flex-wrap items-center gap-1.5"
                  role="group"
                  aria-label="Filter by risk level"
                >
                  {riskOptions.map(({ value, dotClass }) => {
                    const active = riskFilter === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => onRiskFilterChange(value)}
                        className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors ${
                          active
                            ? 'border-[#163300] bg-[#163300] text-white'
                            : 'border-[#d4dbd0] bg-white text-[#163300] hover:bg-[#f4f6f3]'
                        }`}
                      >
                        {dotClass && (
                          <span
                            className={`h-2 w-2 rounded-full ${dotClass}`}
                            aria-hidden="true"
                          />
                        )}
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={!hasActiveFilters}
              onClick={onClearFilters}
              className="h-9 self-start rounded-full border border-[#d4dbd0] bg-white px-4 text-xs font-semibold text-[#163300] transition-colors hover:bg-[#f4f6f3] disabled:cursor-not-allowed disabled:opacity-40 lg:self-auto"
            >
              Clear filters
            </button>
          </div>
        </div>
      </section>

      {/* Band 3: Alerts Table / Mobile Cards */}
      <section className="bg-[#f4f6f3] py-8 sm:py-10">
        <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6">
          <p className="text-sm text-[#5c6b54]">
            Showing <strong className="font-semibold text-[#163300]">{filteredAlerts.length}</strong>{' '}
            of {alerts.length} alerts
          </p>

          {filteredAlerts.length === 0 ? (
            <EmptyState
              title="No alerts match these filters"
              description="Try clearing your search or selecting a broader date range or risk level."
              actionLabel={hasActiveFilters ? 'Clear filters' : undefined}
              onAction={hasActiveFilters ? onClearFilters : undefined}
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-2xl border border-[#e2e7df] bg-white md:block">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#e2e7df] bg-[#f8faf7] text-xs font-semibold text-[#5c6b54]">
                        <th className="px-4 py-3.5">Risk</th>
                        <th className="px-4 py-3.5">Village</th>
                        <th className="px-4 py-3.5">What happened</th>
                        <th className="px-4 py-3.5 text-right">Cases / 1,000</th>
                        <th className="px-4 py-3.5">Date</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf1eb]">
                      {filteredAlerts.map((alert) => (
                        <tr key={alert.id} className="hover:bg-[#f8faf7]">
                          <td className="whitespace-nowrap px-4 py-3.5">
                            <RiskBadge level={alert.riskLevel} />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-[#163300]">
                            {alert.villageName}
                          </td>
                          <td className="max-w-md px-4 py-3.5 text-[#45553d]">
                            {alert.description}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold text-[#163300] tabular-nums">
                            {alert.casesPer1000.toFixed(1)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-[#5c6b54]">
                            {alert.dateLabel}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5">
                            <label htmlFor={`status-${alert.id}`} className="sr-only">
                              Status for {alert.villageName} alert
                            </label>
                            <select
                              id={`status-${alert.id}`}
                              value={alert.status}
                              onChange={(e) =>
                                onUpdateStatus(alert.id, e.target.value as AlertStatus)
                              }
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold focus:outline-none ${STATUS_STYLES[alert.status]}`}
                            >
                              {ALL_STATUSES.map((status) => (
                                <option key={status} value={status} className="bg-white text-[#163300]">
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => onOpenVillageDetail(alert.villageId)}
                              className="inline-flex items-center gap-1 rounded-full bg-[#f4f6f3] px-3 py-1 text-xs font-semibold text-[#163300] transition-colors hover:bg-[#9FE870]"
                            >
                              View village
                              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile stacked cards */}
              <div className="space-y-3 md:hidden">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-2xl border border-[#e2e7df] bg-white p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <RiskBadge level={alert.riskLevel} />
                        <span className="text-sm font-bold text-[#163300]">
                          {alert.villageName}
                        </span>
                      </div>
                      <span className="text-xs text-[#5c6b54]">{alert.dateLabel}</span>
                    </div>

                    <p className="mt-2 text-sm text-[#45553d]">{alert.description}</p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#edf1eb] pt-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#5c6b54]">
                          Cases/1k:{' '}
                          <strong className="font-semibold text-[#163300] tabular-nums">
                            {alert.casesPer1000.toFixed(1)}
                          </strong>
                        </span>
                        <select
                          aria-label={`Status for ${alert.villageName} alert`}
                          value={alert.status}
                          onChange={(e) =>
                            onUpdateStatus(alert.id, e.target.value as AlertStatus)
                          }
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[alert.status]}`}
                        >
                          {ALL_STATUSES.map((status) => (
                            <option key={status} value={status} className="bg-white text-[#163300]">
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenVillageDetail(alert.villageId)}
                        className="inline-flex items-center gap-1 rounded-full bg-[#9FE870] px-3 py-1 text-xs font-semibold text-[#163300]"
                      >
                        View village
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
