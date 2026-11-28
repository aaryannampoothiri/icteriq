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
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <EmptyState
          title="No village selected"
          description="Select a village to inspect weekly rainfall, temperature, humidity, and breeding conditions."
        />
      </div>
    );
  }

  return (
    <div>
      {/* Band 1: White Hero Header + Info Banner */}
      <section className="bg-white py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-[#163300] sm:text-4xl">
                Environmental data
              </h1>
              <p className="mt-2 text-sm text-[#45553d] sm:text-base">
                Weather and runoff conditions that drive jaundice outbreaks in {village.name}, week by week.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="md:hidden">
                <label htmlFor="env-village-select" className="sr-only">
                  Select village
                </label>
                <select
                  id="env-village-select"
                  value={village.id}
                  onChange={(e) => onSelectVillage(e.target.value)}
                  className="h-9 rounded-full border border-[#d4dbd0] bg-[#f4f6f3] px-3 text-sm font-semibold text-[#163300]"
                >
                  {villages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className="inline-flex rounded-full border border-[#d4dbd0] bg-[#f4f6f3] p-0.5"
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
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                        active
                          ? 'bg-[#163300] text-white'
                          : 'text-[#5c6b54] hover:text-[#163300]'
                      }`}
                    >
                      Last {weeks} weeks
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#c5e0b4] bg-[#e8f5e0] px-4 py-3.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#163300]" aria-hidden="true" />
            <div className="text-sm">
              <p className="font-bold text-[#163300]">
                {heavyRainWeeks === 0
                  ? `${village.name} had no heavy-rain weeks (>100 mm) in this period`
                  : `${village.name} had ${heavyRainWeeks} heavy-rain ${heavyRainWeeks === 1 ? 'week' : 'weeks'} in this period`}
              </p>
              <p className="mt-0.5 text-xs text-[#2d4d14] sm:text-sm">
                {heavyRainWeeks > 0
                  ? 'Expect higher water-contamination risk over the next 2–6 weeks. '
                  : 'Moderate rainfall keeps surface runoff lower. '}
                {latest
                  ? `Latest week: ${latest.rainfallMm} mm rain, ${latest.humidity}% humidity.`
                  : ''}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Band 2: Lime Green (#9FE870) Section — Rainfall */}
      <section className="bg-[#9FE870] py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-2xl bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-base font-bold text-[#163300]">
                Rainfall per week (mm)
              </h2>
              <span className="text-xs text-[#5c6b54]">
                Peak{' '}
                <strong className="font-semibold text-[#163300] tabular-nums">
                  {peakRain.rainfallMm} mm
                </strong>{' '}
                in {peakRain.week}
              </span>
            </div>

            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={history} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#edf1eb" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 12, fill: '#5c6b54' }}
                    axisLine={{ stroke: '#d4dbd0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#5c6b54' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} mm`, 'Rainfall']}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #d4dbd0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="rainfallMm" name="Rainfall (mm)" radius={[6, 6, 0, 0]} maxBarSize={38}>
                    {history.map((entry) => (
                      <Cell
                        key={entry.week}
                        fill={entry.rainfallMm > 100 ? '#163300' : '#9FE870'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="mt-3 text-xs text-[#5c6b54]">
              Dark forest bars mark weeks with more than 100 mm of rain. Waterborne jaundice cases usually rise 2–6 weeks after heavy runoff.
            </p>
          </div>
        </div>
      </section>

      {/* Band 3: White Section — Temperature & Relative Humidity */}
      <section className="bg-[#f4f6f3] py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#e2e7df] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-base font-bold text-[#163300]">
                  Temperature (°C)
                </h2>
                <span className="text-xs text-[#5c6b54]">Warm range: 26–32 °C</span>
              </div>

              <div className="mt-4 h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={history}
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
                      domain={[20, 36]}
                      tick={{ fontSize: 12, fill: '#5c6b54' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #d4dbd0',
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

            <div className="rounded-2xl border border-[#e2e7df] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-base font-bold text-[#163300]">
                  Relative humidity (%)
                </h2>
                <span className="text-xs text-[#5c6b54]">Dashed line: 75% threshold</span>
              </div>

              <div className="mt-4 h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={history}
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
                      domain={[50, 100]}
                      tick={{ fontSize: 12, fill: '#5c6b54' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Humidity']}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #d4dbd0',
                        fontSize: '12px',
                        boxShadow: '0 2px 6px rgba(22,51,0,0.08)',
                      }}
                    />
                    <ReferenceLine
                      y={75}
                      stroke="#163300"
                      strokeDasharray="4 4"
                      label={{
                        value: '75%',
                        position: 'insideTopRight',
                        fill: '#163300',
                        fontSize: 11,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="humidity"
                      name="Humidity (%)"
                      stroke="#163300"
                      strokeWidth={2}
                      fill="#9FE870"
                      fillOpacity={0.28}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Band 4: Deep Forest (#163300) Section — Soil Moisture & Mosquito Index */}
      <section className="bg-[#163300] py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-5">
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[#9FE870] sm:text-3xl">
              Soil moisture &amp; water contamination
            </h2>
            <p className="mt-1 text-sm text-[#c7d6be]">
              Tracks groundwater saturation alongside drinking-water contamination index.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 sm:p-6">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={history}
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
                    tick={{ fontSize: 12, fill: '#5c6b54' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #d4dbd0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="soilMoisture"
                    name="Soil moisture (%)"
                    stroke="#163300"
                    strokeWidth={2.2}
                    dot={{ r: 2.5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="waterContaminationIndex"
                    name="Water contamination index"
                    stroke="#dc2626"
                    strokeWidth={2}
                    dot={{ r: 2.5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
