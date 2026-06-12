import { useState } from 'react';
import {
  Scale,
  Plus,
  TrendingDown,
  TrendingUp,
  Minus,
  Trash2,
  Edit3,
  X,
  Target,
  Activity,
  CalendarDays,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { WeightRecord } from '@/types';
import { getWeightStats, todayStr } from '@/utils';

export default function WeightRecordPage() {
  const { weightRecords, addWeightRecord, updateWeightRecord, deleteWeightRecord, userProfile } =
    useAppStore();

  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(todayStr());
  const [note, setNote] = useState('');
  const [editing, setEditing] = useState<WeightRecord | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNote, setEditNote] = useState('');

  const stats = getWeightStats(weightRecords);
  const sortedDesc = [...weightRecords].sort((a, b) => b.timestamp - a.timestamp);

  const handleAdd = () => {
    const w = parseFloat(weight);
    if (!w || w < 20 || w > 300) {
      alert('请输入有效的体重（20-300kg）');
      return;
    }
    addWeightRecord({ weight: w, date, note: note.trim() || undefined });
    setWeight('');
    setNote('');
    setDate(todayStr());
  };

  const openEdit = (r: WeightRecord) => {
    setEditing(r);
    setEditWeight(String(r.weight));
    setEditDate(r.date);
    setEditNote(r.note || '');
  };

  const saveEdit = () => {
    if (!editing) return;
    const w = parseFloat(editWeight);
    if (!w || w < 20 || w > 300) return;
    updateWeightRecord(editing.id, { weight: w, date: editDate, note: editNote.trim() || undefined });
    setEditing(null);
  };

  const changeBadge = () => {
    if (stats.change === 0) return { icon: Minus, color: 'bg-stone-100 text-stone-600', label: '无变化' };
    if (stats.change < 0) return { icon: TrendingDown, color: 'bg-emerald-100 text-emerald-600', label: '减轻' };
    return { icon: TrendingUp, color: 'bg-amber-100 text-amber-600', label: '增加' };
  };

  const BadgeIcon = changeBadge().icon;
  const targetProgress = userProfile.targetWeight && stats.latest
    ? Math.min(
        100,
        Math.max(
          0,
          ((stats.first!.weight - stats.latest.weight) /
            (stats.first!.weight - userProfile.targetWeight)) *
            100,
        ),
      )
    : null;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-3xl p-6 md:p-7 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-8 bottom-0 w-40 h-40 rounded-full bg-teal-300/20 blur-xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
              <Scale size={16} />
              <span>当前体重</span>
            </div>
            <div className="flex items-end gap-4 flex-wrap">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-bold tracking-tight">
                  {stats.latest ? stats.latest.weight.toFixed(1) : '--'}
                </span>
                <span className="text-xl text-white/80 mb-2">kg</span>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${changeBadge().color}`}>
                <BadgeIcon size={14} />
                {stats.change === 0 ? '0.0' : stats.change > 0 ? '+' : ''}
                {stats.change} kg
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
              <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                <div className="text-white/70 text-xs mb-1">累计变化</div>
                <div className="font-semibold text-lg">
                  {stats.change === 0 ? '0.0' : stats.change > 0 ? '+' : ''}
                  {stats.change}%
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                <div className="text-white/70 text-xs mb-1">最轻体重</div>
                <div className="font-semibold text-lg">{stats.min?.toFixed(1) || '--'}</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                <div className="text-white/70 text-xs mb-1">记录天数</div>
                <div className="font-semibold text-lg">{stats.count} 天</div>
              </div>
            </div>
            {userProfile.targetWeight && targetProgress !== null && (
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs mb-2 text-white/80">
                  <span className="flex items-center gap-1">
                    <Target size={12} /> 目标 {userProfile.targetWeight}kg
                  </span>
                  <span>{Number(targetProgress).toFixed(0)}%</span>
                </div>
                <div className="h-2.5 bg-white/15 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-300 to-amber-500 rounded-full transition-all duration-700"
                    style={{ width: `${targetProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
          <div className="flex items-center gap-2 text-stone-700 font-semibold mb-4">
            <Plus className="text-emerald-600" size={18} />
            添加记录
          </div>
          <div className="space-y-3.5">
            <div>
              <label className="text-xs text-stone-500 mb-1.5 block">体重 (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="例如：70.5"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1.5 block flex items-center gap-1">
                <CalendarDays size={12} /> 日期
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1.5 block">备注（选填）</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="记录当天状态..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
              />
            </div>
            <button
              onClick={handleAdd}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              + 保存记录
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '平均体重', value: stats.avg ? `${stats.avg.toFixed(1)}kg` : '--', icon: Activity, tone: 'from-sky-50 to-sky-100 text-sky-600' },
          { label: '最高体重', value: stats.max ? `${stats.max.toFixed(1)}kg` : '--', icon: TrendingUp, tone: 'from-rose-50 to-rose-100 text-rose-600' },
          { label: '最低体重', value: stats.min ? `${stats.min.toFixed(1)}kg` : '--', icon: TrendingDown, tone: 'from-emerald-50 to-emerald-100 text-emerald-600' },
          { label: '起始体重', value: stats.first ? `${stats.first.weight.toFixed(1)}kg` : '--', icon: Scale, tone: 'from-violet-50 to-violet-100 text-violet-600' },
        ].map((item, i) => {
          const I = item.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm hover:shadow-md transition">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.tone} flex items-center justify-center mb-3`}>
                <I size={18} />
              </div>
              <div className="text-xs text-stone-500 mb-1">{item.label}</div>
              <div className="text-2xl font-bold text-stone-800">{item.value}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-800">历史记录</h2>
            <p className="text-sm text-stone-500 mt-0.5">共 {weightRecords.length} 条记录</p>
          </div>
        </div>
        <div className="divide-y divide-stone-100 max-h-[520px] overflow-y-auto">
          {sortedDesc.length === 0 && (
            <div className="p-10 text-center text-stone-400">暂无记录，先添加一条吧～</div>
          )}
          {sortedDesc.map((r, idx) => {
            const prev = sortedDesc[idx + 1];
            const diff = prev ? Number((r.weight - prev.weight).toFixed(1)) : 0;
            return (
              <div key={r.id} className="px-6 py-4 hover:bg-stone-50/60 transition group">
                <div className="flex items-center gap-4">
                  <div className="w-14 text-center">
                    <div className="text-[10px] text-stone-400 uppercase tracking-wide">
                      {r.date.slice(5, 7)}月
                    </div>
                    <div className="text-2xl font-bold text-stone-800">{r.date.slice(8)}</div>
                    <div className="text-[10px] text-stone-400">{r.date.slice(0, 4)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-bold text-stone-800">{r.weight.toFixed(1)}</span>
                      <span className="text-sm text-stone-400">kg</span>
                      {diff !== 0 && (
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            diff < 0
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {diff > 0 ? '+' : ''}
                          {diff}
                        </span>
                      )}
                    </div>
                    {r.note && <div className="text-sm text-stone-500 mt-1 truncate">{r.note}</div>}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => openEdit(r)}
                      className="w-9 h-9 rounded-xl hover:bg-sky-50 text-stone-400 hover:text-sky-600 flex items-center justify-center transition"
                      title="编辑"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定删除这条记录吗？')) deleteWeightRecord(r.id);
                      }}
                      className="w-9 h-9 rounded-xl hover:bg-rose-50 text-stone-400 hover:text-rose-600 flex items-center justify-center transition"
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-stone-800">编辑记录</h3>
              <button onClick={() => setEditing(null)} className="w-9 h-9 rounded-xl hover:bg-stone-100 text-stone-400 flex items-center justify-center">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-stone-500 mb-1.5 block">体重 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1.5 block">日期</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1.5 block">备注</label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition"
                >
                  取消
                </button>
                <button
                  onClick={saveEdit}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
