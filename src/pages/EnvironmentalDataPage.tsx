import { Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { EmptyState } from '../components/ui/StateFeedback';
import type { Village } from '../types/village';

interface EnvironmentalDataPageProps {
  villages: Village[];
  village?: Village;
  onSelectVillage: (villageId: string) => void;
}

type TimeframeWeeks = 8 | 12;

export function EnvironmentalDataPage({
  villages,
  village,
  onSelectVillage,
}: EnvironmentalDataPageProps) {
  const [timeframe, setTimeframe] = useState<TimeframeWeeks>(12);

  const history = useMemo(() => {
    if (!village) return [];
    const data = village.environmentalHistory;
    return timeframe === 8 ? data.slice(-8) : data;
  }, [village, timeframe]);

  const heavyRainWeeks = useMemo(
    () => history.filter((w) => w.rainfallMm > 100).length,
    [history]
  );

  const peakRain = useMemo(() => {
    if (history.length === 0) return { rainfallMm: 0, week: '—' };
    return history.reduce(
      (max, cur) => (cur.rainfallMm > max.rainfallMm ? cur : max),
      history[0]
    );
  }, [history]);

  const latest = history[history.length - 1];

  if (!village) {
    return (
      <EmptyState
        title="No village selected"
        description="Select a village to inspect weekly rainfall, temperature, humidity, and breeding conditions."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Timeframe */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Environmental data
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Weather that drives mosquito breeding in {village.name}, week by week.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="sm:hidden">
            <label htmlFor="env-village-select" className="sr-only">
              Select village
            </label>
            <select
              id="env-village-select"
              value={village.id}
              onChange={(e) => onSelectVillage(e.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-sm text-slate-700"
            >
              {villages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div
            className="inline-flex rounded-md border border-slate-200 bg-white p-0.5"
            role="group"
            aria-label="Timeframe"
          >
            {([8, 12] as TimeframeWeeks[]).map((weeks) => {
              const active = timeframe === weeks;
              return (
                <button
                  key={weeks}
                  type="button"
                  onClick={() => setTimeframe(weeks)}
                  className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Last {weeks} weeks
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contextual summary banner */}
      <div className="flex items-start gap-3 rounded-lg border border-teal-200 bg-teal-50/70 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
        <div className="text-sm">
          <p className="font-semibold text-teal-950">
            {heavyRainWeeks === 0
              ? `${village.name} had no heavy-rain weeks (>100 mm) in this period`
              : `${village.name} had ${heavyRainWeeks} heavy-rain ${heavyRainWeeks === 1 ? 'week' : 'weeks'} in this period`}
          </p>
          <p className="mt-0.5 text-xs text-teal-900 sm:text-sm">
            {heavyRainWeeks > 0
              ? 'Expect higher mosquito breeding over the next 2–8 weeks. '
              : 'Moderate rainfall keeps standing water lower. '}
            {latest
              ? `Latest week: ${latest.rainfallMm} mm rain, ${latest.humidity}% humidity.`
              : ''}
          </p>
        </div>
      </div>

      {/* Rainfall bar chart */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">
            Rainfall per week (mm)
          </h2>
          <span className="text-xs text-slate-600">
            Peak{' '}
            <strong className="font-semibold text-slate-900 tabular-nums">
              {peakRain.rainfallMm} mm
            </strong>{' '}
            in {peakRain.week}
          </span>
        </div>

        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={history} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [`${value} mm`, 'Rainfall']}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="rainfallMm" name="Rainfall (mm)" radius={[4, 4, 0, 0]} maxBarSize={38}>
                {history.map((entry) => (
                  <Cell
                    key={entry.week}
                    fill={entry.rainfallMm > 100 ? '#0f766e' : '#5eead4'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Darker teal bars mark weeks with more than 100 mm of rain. Dengue cases usually rise 2–8 weeks after heavy rain.
        </p>
      </section>

      {/* Temperature & Relative Humidity */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">
              Temperature (°C)
            </h2>
            <span className="text-xs text-slate-500">Ideal for mosquitoes: 26–32 °C</span>
          </div>

          <div className="mt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={history}
                margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[20, 36]}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <ReferenceArea y1={26} y2={32} fill="#fef3c7" fillOpacity={0.45} />
                <Line
                  type="monotone"
                  dataKey="tempMax"
                  name="Max (°C)"
                  stroke="#cbd5e1"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="tempAvg"
                  name="Average (°C)"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  dot={{ r: 2.5, fill: '#d97706' }}
                />
                <Line
                  type="monotone"
                  dataKey="tempMin"
                  name="Min (°C)"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">
              Relative humidity (%)
            </h2>
            <span className="text-xs text-slate-500">Dashed line: 75% threshold</span>
          </div>

          <div className="mt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={history}
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
                  domain={[50, 100]}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Humidity']}
                  contentStyle={{
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    boxShadow: '0 2px 6px rgba(15,23,42,0.06)',
                  }}
                />
                <ReferenceLine
                  y={75}
                  stroke="#334155"
                  strokeDasharray="4 4"
                  label={{
                    value: '75%',
                    position: 'insideTopRight',
                    fill: '#475569',
                    fontSize: 11,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity (%)"
                  stroke="#0d9488"
                  strokeWidth={2}
                  fill="#0d9488"
                  fillOpacity={0.09}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Soil moisture & Mosquito index */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">
            Soil moisture (%) &amp; Mosquito index (Breteau Index)
          </h2>
          <span className="text-xs text-slate-500">
            Tracks standing-water retention alongside larval density
          </span>
        </div>

        <div className="mt-4 h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={history}
              margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="soilMoisture"
                name="Soil moisture (%)"
                stroke="#0d9488"
                strokeWidth={2}
                dot={{ r: 2.5 }}
              />
              <Line
                type="monotone"
                dataKey="mosquitoIndex"
                name="Mosquito index (BI)"
                stroke="#dc2626"
                strokeWidth={2}
                dot={{ r: 2.5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

