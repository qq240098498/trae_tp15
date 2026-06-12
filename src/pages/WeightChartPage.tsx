import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Activity, Target, TrendingDown, Calendar } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { TimeRange } from '@/types';
import { filterByRange, getWeightStats } from '@/utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function WeightChartPage() {
  const { weightRecords, userProfile } = useAppStore();
  const [range, setRange] = useState<TimeRange>('30d');

  const ranges: { key: TimeRange; label: string }[] = [
    { key: '7d', label: '近7天' },
    { key: '30d', label: '近30天' },
    { key: '90d', label: '近90天' },
    { key: 'all', label: '全部' },
  ];

  const filtered = useMemo(() => filterByRange(weightRecords, range), [weightRecords, range]);
  const stats = useMemo(() => getWeightStats(filtered), [filtered]);

  const labels = filtered.map((r) => r.date.slice(5));
  const weights = filtered.map((r) => r.weight);

  const chartData = {
    labels,
    datasets: [
      {
        label: '体重',
        data: weights,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: (ctx: any) => {
          const { ctx: c, chartArea } = ctx.chart;
          if (!chartArea) return 'rgba(16,185,129,0.1)';
          const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(16,185,129,0.35)');
          gradient.addColorStop(1, 'rgba(16,185,129,0.01)');
          return gradient;
        },
        borderWidth: 3,
        tension: 0.45,
        fill: true,
        pointRadius: 3.5,
        pointBackgroundColor: '#fff',
        pointBorderColor: 'rgb(16, 185, 129)',
        pointBorderWidth: 2.5,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgb(16, 185, 129)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
      ...(userProfile.targetWeight
        ? [
            {
              label: '目标体重',
              data: labels.map(() => userProfile.targetWeight!),
              borderColor: 'rgb(249, 115, 22)',
              borderDash: [6, 6],
              borderWidth: 2,
              pointRadius: 0,
              fill: false,
              tension: 0,
            },
          ]
        : []),
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { usePointStyle: true, pointStyle: 'circle', padding: 16, color: '#78716c', font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: 'rgba(28,25,23,0.92)',
        padding: 12,
        cornerRadius: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleFont: { size: 13, weight: 600 as any },
        bodyFont: { size: 13 },
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} kg`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#a8a29e', maxRotation: 0, font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(245,245,244,1)' },
        ticks: {
          color: '#a8a29e',
          font: { size: 11 },
          callback: (v) => `${v} kg`,
          padding: 8,
        },
        border: { display: false },
        suggestedMin: stats.min ? Math.floor(stats.min - 2) : undefined,
        suggestedMax: stats.max ? Math.ceil(stats.max + 2) : undefined,
      },
    },
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-white rounded-3xl shadow-sm border border-stone-100 p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                <Activity className="text-emerald-600" size={20} />
                体重趋势
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                {labels.length} 条数据点 · {stats.change === 0 ? '无变化' : stats.change < 0 ? '下降' : '上升'}
                {stats.change !== 0 && ` ${Math.abs(stats.change)}kg`}
              </p>
            </div>
            <div className="flex gap-1.5 p-1.5 bg-stone-100 rounded-2xl">
              {ranges.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    range === r.key
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[380px]">
            {filtered.length > 0 ? (
              <Line data={chartData} options={options} />
            ) : (
              <div className="h-full flex items-center justify-center text-stone-400">
                <div className="text-center">
                  <Calendar size={40} className="mx-auto mb-3 opacity-50" />
                  暂无数据
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-5 text-white shadow-xl shadow-amber-500/25 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/15 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-white/85 text-sm mb-2">
                <Target size={14} /> 目标体重
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold">{userProfile.targetWeight || '--'}</span>
                <span className="text-sm text-white/80">kg</span>
              </div>
              {stats.latest && userProfile.targetWeight && (
                <div>
                  <div className="text-xs text-white/80 mb-2">
                    还差 {Math.max(0, stats.latest.weight - userProfile.targetWeight).toFixed(1)} kg
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.max(0, Math.min(100,
                          ((stats.first!.weight - stats.latest.weight) /
                            (stats.first!.weight - userProfile.targetWeight)) * 100,
                        ))}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
            <h3 className="font-bold text-stone-800 mb-4">区间统计</h3>
            <div className="space-y-3">
              <StatRow label="起始" value={stats.first ? `${stats.first.weight.toFixed(1)}kg` : '--'} tone="text-violet-600 bg-violet-50" />
              <StatRow label="当前" value={stats.latest ? `${stats.latest.weight.toFixed(1)}kg` : '--'} tone="text-emerald-600 bg-emerald-50" />
              <StatRow
                label="变化"
                value={stats.change === 0 ? '0.0kg' : `${stats.change > 0 ? '+' : ''}${stats.change}kg`}
                tone={stats.change <= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}
                icon={stats.change === 0 ? null : stats.change < 0 ? TrendingDown : null}
              />
              <StatRow label="平均" value={stats.avg ? `${stats.avg.toFixed(1)}kg` : '--'} tone="text-sky-600 bg-sky-50" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '最高', value: stats.max?.toFixed(1) || '--', sub: '峰值体重', accent: 'border-rose-200 bg-rose-50/40', numColor: 'text-rose-600' },
          { label: '最低', value: stats.min?.toFixed(1) || '--', sub: '历史低位', accent: 'border-emerald-200 bg-emerald-50/40', numColor: 'text-emerald-600' },
          { label: '平均', value: stats.avg?.toFixed(1) || '--', sub: '均值水平', accent: 'border-sky-200 bg-sky-50/40', numColor: 'text-sky-600' },
          { label: '波动', value: stats.min && stats.max ? (stats.max - stats.min).toFixed(1) : '--', sub: 'kg 区间', accent: 'border-violet-200 bg-violet-50/40', numColor: 'text-violet-600' },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl p-4 border ${s.accent}`}>
            <div className="text-xs text-stone-500 mb-1">{s.label}</div>
            <div className={`text-3xl font-bold ${s.numColor}`}>{s.value}</div>
            <div className="text-xs text-stone-400 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatRow({ label, value, tone, icon: Icon }: { label: string; value: string; tone: string; icon?: any }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-stone-500">{label}</span>
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-semibold ${tone}`}>
        {Icon && <Icon size={13} />}
        {value}
      </span>
    </div>
  );
}
