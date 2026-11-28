import { AlertTriangle, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RiskGauge } from '../components/RiskGauge';
import { RiskBadge } from '../components/ui/RiskBadge';
import { EmptyState } from '../components/ui/StateFeedback';
import { StatCard } from '../components/ui/StatCard';
import type { Village } from '../types/village';

interface VillageDetailPageProps {
  villages: Village[];
  village?: Village;
  onSelectVillage: (villageId: string) => void;
  onBackToOverview: () => void;
  onSeeVillageAlerts: (villageId: string) => void;
}

function getMetricTone(
  metric: 'rainfall' | 'temperature' | 'humidity' | 'soil' | 'contamination',
  value: number
): { text: string; tone: 'high' | 'elevated' | 'normal' } {
  switch (metric) {
    case 'rainfall':
      if (value >= 150) return { text: 'High', tone: 'high' };
      if (value >= 80) return { text: 'Elevated', tone: 'elevated' };
      return { text: 'Normal', tone: 'normal' };
    case 'temperature':
      if (value >= 28 && value <= 32) return { text: 'Elevated', tone: 'elevated' };
      return { text: 'Normal', tone: 'normal' };
    case 'humidity':
      if (value >= 80) return { text: 'High', tone: 'high' };
      if (value >= 72) return { text: 'Elevated', tone: 'elevated' };
      return { text: 'Normal', tone: 'normal' };
    case 'soil':
      if (value >= 68) return { text: 'High', tone: 'high' };
      if (value >= 55) return { text: 'Elevated', tone: 'elevated' };
      return { text: 'Normal', tone: 'normal' };
    case 'contamination':
      if (value >= 30) return { text: 'High', tone: 'high' };
      if (value >= 18) return { text: 'Elevated', tone: 'elevated' };
      return { text: 'Normal', tone: 'normal' };
  }
}

export function VillageDetailPage({
  villages,
  village,
  onSelectVillage,
  onBackToOverview,
  onSeeVillageAlerts,
}: VillageDetailPageProps) {
  const chartData = useMemo(() => {
    if (!village) return [];
    const confirmed = village.weeklyCases.map((pt, idx) => ({
      week: pt.week,
      confirmed: pt.cases,
      forecast:
        idx === village.weeklyCases.length - 1 ? pt.cases : (null as number | null),
    }));
    const forecast = village.forecastCases.map((pt) => ({
      week: pt.week,
      confirmed: null as number | null,
      forecast: pt.cases,
    }));
    return [...confirmed, ...forecast];
  }, [village]);

  if (!village) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <EmptyState
          title="Location not found"
          description="Select a location from the dropdown to inspect its jaundice risk metrics and 12-week trend."
          actionLabel="Back to overview"
          onAction={onBackToOverview}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Band 1: White Hero Header + Action Callout */}
      <section className="bg-white py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs font-medium text-[#5c6b54]"
          >
            <button
              type="button"
              onClick={onBackToOverview}
              className="font-semibold text-[#163300] hover:underline"
            >
              Overview
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-[#7a8973]" aria-hidden="true" />
            <span className="text-[#45553d]">Village detail</span>
          </nav>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-[#163300] sm:text-4xl">
                  {village.name}
                </h1>
                <RiskBadge level={village.riskLevel} size="md" />
              </div>
              <p className="mt-2 text-sm text-[#45553d]">
                Population {village.population.toLocaleString()} ·{' '}
                {village.nearestHealthCenterKm} km from nearest health centre
              </p>
            </div>

            <div className="md:hidden">
              <label htmlFor="detail-village-select" className="sr-only">
                Select village
              </label>
              <select
                id="detail-village-select"
                value={village.id}
                onChange={(e) => onSelectVillage(e.target.value)}
                className="h-10 w-full rounded-full border border-[#d4dbd0] bg-[#f4f6f3] px-4 text-sm font-semibold text-[#163300]"
              >
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.riskLevel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {village.riskLevel === 'High' && (
            <div
              role="alert"
              className="mt-6 flex flex-col gap-3 rounded-2xl border border-red-200 border-l-4 border-l-red-600 bg-red-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3 sm:items-center">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 sm:mt-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold text-red-950">
                    High risk: act this week
                  </p>
                  <p className="text-xs text-red-800 sm:text-sm">
                    Deploy water-testing and chlorination teams, inspect piped supply and borewells for contamination, and alert the nearest health centre.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSeeVillageAlerts(village.id)}
                className="shrink-0 self-start rounded-full bg-[#163300] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#234d00] sm:self-auto sm:text-sm"
              >
                See alerts for this village
              </button>
            </div>
          )}

          {village.riskLevel === 'Medium' && (
            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-200 border-l-4 border-l-amber-500 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-amber-950">
                  Medium risk: monitor closely
                </p>
                <p className="text-xs text-amber-800 sm:text-sm">
                  Test drinking-water sources for coliforms and issue boiling/chlorination advisories if cases rise.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSeeVillageAlerts(village.id)}
                className="shrink-0 self-start rounded-full border border-amber-300 bg-white px-4 py-1.5 text-xs font-semibold text-amber-950 transition-colors hover:bg-amber-100/50 sm:self-auto sm:text-sm"
              >
                See alerts for this village
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Band 2: Lime Green (#9FE870) Section — 5 Metric Cards */}
      <section
        aria-label="Current environmental and vector metrics"
        className="bg-[#9FE870] py-8 sm:py-10"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
            <StatCard
              label="Rainfall (last 7 days)"
              value={village.rainfall}
              unit="mm"
              statusBadge={getMetricTone('rainfall', village.rainfall)}
              subtitle="Heavy runoff from 2–6 weeks ago contaminates water."
            />
            <StatCard
              label="Temperature"
              value={village.temperature}
              unit="°C"
              statusBadge={getMetricTone('temperature', village.temperature)}
              subtitle="26–32 °C supports pathogen survival in surface water."
            />
            <StatCard
              label="Humidity"
              value={village.humidity}
              unit="%"
              statusBadge={getMetricTone('humidity', village.humidity)}
              subtitle="Above 75% slows surface drying after rain."
            />
            <StatCard
              label="Soil moisture"
              value={village.soilMoisture}
              unit="%"
              statusBadge={getMetricTone('soil', village.soilMoisture)}
              subtitle="Saturated ground increases shallow-well seepage."
            />
            <StatCard
              label="Water contamination"
              value={village.waterContaminationIndex}
              statusBadge={getMetricTone('contamination', village.waterContaminationIndex)}
              subtitle="Coliform index: contaminated samples per 100 tests."
            />
          </div>
        </div>
      </section>

      {/* Band 3: Deep Forest (#163300) Section — Weekly Cases & Risk Gauge */}
      <section className="bg-[#163300] py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="flex flex-col rounded-2xl bg-white p-5 sm:p-6 lg:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-base font-bold text-[#163300]">
                  Weekly jaundice cases
                </h2>
                <span className="text-xs text-[#5c6b54]">
                  12-week history + 2-week forecast
                </span>
              </div>

              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#edf1eb" vertical={false} />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 12, fill: '#5c6b54' }}
                      axisLine={{ stroke: '#d4dbd0' }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: '#5c6b54' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #d4dbd0',
                        fontSize: '12px',
                        boxShadow: '0 2px 6px rgba(22,51,0,0.08)',
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ fontSize: '12px', paddingBottom: '8px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="confirmed"
                      name="Confirmed cases"
                      stroke="#163300"
                      strokeWidth={2.2}
                      fill="#9FE870"
                      fillOpacity={0.28}
                      dot={{ r: 3, fill: '#ffffff', stroke: '#163300', strokeWidth: 2 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      name="2-week forecast"
                      stroke="#d97706"
                      strokeWidth={2}
                      strokeDasharray="5 4"
                      dot={{ r: 3.5, fill: '#d97706' }}
                      connectNulls
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <p className="mt-3 text-xs text-[#5c6b54]">
                Week numbers on the horizontal axis. Dashed amber line shows the projected cases for the next 2 weeks.
              </p>
            </div>

            <div className="lg:col-span-5">
              <RiskGauge
                score={village.riskScore}
                riskLevel={village.riskLevel}
                drivers={village.riskDrivers}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
