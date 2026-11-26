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
  metric: 'rainfall' | 'temperature' | 'humidity' | 'soil' | 'mosquito',
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
    case 'mosquito':
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
      <EmptyState
        title="Village not found"
        description="Select a village from the dropdown to inspect its dengue risk metrics and 12-week trend."
        actionLabel="Back to overview"
        onAction={onBackToOverview}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & header */}
      <div>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <button
            type="button"
            onClick={onBackToOverview}
            className="text-teal-700 hover:text-teal-800 hover:underline"
          >
            Overview
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-700">Village detail</span>
        </nav>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              {village.name}
            </h1>
            <RiskBadge level={village.riskLevel} size="md" />
            <span className="text-xs text-slate-500 sm:text-sm">
              Population {village.population.toLocaleString()} ·{' '}
              {village.nearestHealthCenterKm} km from nearest health centre
            </span>
          </div>

          <div className="sm:hidden">
            <label htmlFor="detail-village-select" className="sr-only">
              Select village
            </label>
            <select
              id="detail-village-select"
              value={village.id}
              onChange={(e) => onSelectVillage(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-sm text-slate-700"
            >
              {villages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.riskLevel})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action banner for High or Medium risk */}
      {village.riskLevel === 'High' && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3 sm:items-center">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 sm:mt-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-red-900">
                High risk: act this week
              </p>
              <p className="text-xs text-red-800 sm:text-sm">
                Send a vector-control team, start fogging and larval source removal, and alert the nearest health centre.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSeeVillageAlerts(village.id)}
            className="shrink-0 self-start rounded-md bg-teal-700 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-teal-800 sm:self-auto sm:text-sm"
          >
            See alerts for this village
          </button>
        </div>
      )}

      {village.riskLevel === 'Medium' && (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Medium risk: monitor closely
            </p>
            <p className="text-xs text-amber-800 sm:text-sm">
              Inspect stagnant water sites and prepare targeted larvicide teams if cases rise.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSeeVillageAlerts(village.id)}
            className="shrink-0 self-start rounded-md border border-amber-300 bg-white px-3.5 py-1.5 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-100/50 sm:self-auto sm:text-sm"
          >
            See alerts for this village
          </button>
        </div>
      )}

      {/* 5 Metric cards */}
      <section
        aria-label="Current environmental and vector metrics"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5"
      >
        <StatCard
          label="Rainfall (last 7 days)"
          value={village.rainfall}
          unit="mm"
          statusBadge={getMetricTone('rainfall', village.rainfall)}
          subtitle="Rain from 2–8 weeks ago drives breeding."
        />
        <StatCard
          label="Temperature"
          value={village.temperature}
          unit="°C"
          statusBadge={getMetricTone('temperature', village.temperature)}
          subtitle="26–32 °C is ideal for the dengue mosquito."
        />
        <StatCard
          label="Humidity"
          value={village.humidity}
          unit="%"
          statusBadge={getMetricTone('humidity', village.humidity)}
          subtitle="Above 75% helps mosquitoes survive longer."
        />
        <StatCard
          label="Soil moisture"
          value={village.soilMoisture}
          unit="%"
          statusBadge={getMetricTone('soil', village.soilMoisture)}
          subtitle="Wet soil means more standing water."
        />
        <StatCard
          label="Mosquito index (BI)"
          value={village.mosquitoIndex}
          statusBadge={getMetricTone('mosquito', village.mosquitoIndex)}
          subtitle="Breteau Index: containers with larvae per 100 houses."
        />
      </section>

      {/* Trend chart + Risk gauge */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 sm:p-5 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">
              Weekly dengue cases
            </h2>
            <span className="text-xs text-slate-500">12-week history + 2-week forecast</span>
          </div>

          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    boxShadow: '0 2px 6px rgba(15,23,42,0.06)',
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
                  stroke="#0d9488"
                  strokeWidth={2}
                  fill="#0d9488"
                  fillOpacity={0.08}
                  dot={{ r: 3, fill: '#ffffff', stroke: '#0d9488', strokeWidth: 2 }}
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

          <p className="mt-3 text-xs text-slate-500">
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
      </section>
    </div>
  );
}

