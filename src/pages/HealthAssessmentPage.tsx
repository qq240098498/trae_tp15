import { useMemo } from 'react';
import {
  Activity,
  Apple,
  Heart,
  Leaf,
  Ruler,
  Sparkles,
  User,
  Info,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { BMICategory } from '@/types';
import { calculateBMI, getWeightStats } from '@/utils';

export default function HealthAssessmentPage() {
  const { userProfile, weightRecords, updateUserProfile } = useAppStore();
  const stats = getWeightStats(weightRecords);
  const currentWeight = stats.latest?.weight || 70;

  const result = useMemo(
    () => calculateBMI(currentWeight, userProfile.height || 170),
    [currentWeight, userProfile.height],
  );

  const categoryRanges: { key: BMICategory; label: string; range: string; color: string; bg: string; pct: number }[] = [
    { key: 'underweight', label: '偏瘦', range: '<18.5', color: 'text-sky-600', bg: 'bg-sky-500', pct: 18.5 },
    { key: 'normal', label: '正常', range: '18.5-24', color: 'text-emerald-600', bg: 'bg-emerald-500', pct: 24 - 18.5 },
    { key: 'overweight', label: '超重', range: '24-28', color: 'text-amber-600', bg: 'bg-amber-500', pct: 28 - 24 },
    { key: 'obese', label: '肥胖', range: '≥28', color: 'text-rose-600', bg: 'bg-rose-500', pct: 40 - 28 },
  ];
  const totalPct = 40;
  const indicatorPct = Math.min(100, Math.max(0, (Math.min(result.bmi, 40) / totalPct) * 100));

  const idealMin = Number((18.5 * Math.pow(userProfile.height / 100, 2)).toFixed(1));
  const idealMax = Number((23.9 * Math.pow(userProfile.height / 100, 2)).toFixed(1));

  const tips = [
    { icon: Apple, title: '均衡饮食', desc: '每日摄入蛋白质、碳水、脂肪比例合理，多吃蔬菜水果', tone: 'from-emerald-50 to-emerald-100 text-emerald-600 border-emerald-200' },
    { icon: Activity, title: '规律运动', desc: '每周至少150分钟中等强度有氧运动，保持身体活力', tone: 'from-sky-50 to-sky-100 text-sky-600 border-sky-200' },
    { icon: Heart, title: '充足睡眠', desc: '保证7-8小时高质量睡眠，促进代谢和身体恢复', tone: 'from-rose-50 to-rose-100 text-rose-600 border-rose-200' },
    { icon: Leaf, title: '多喝水', desc: '每日饮水1.5-2升，提高新陈代谢，帮助能量消耗', tone: 'from-cyan-50 to-cyan-100 text-cyan-600 border-cyan-200' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
          <h2 className="text-lg font-bold text-stone-800 mb-5 flex items-center gap-2">
            <User className="text-emerald-600" size={20} />
            个人信息
          </h2>
          <div className="space-y-4">
            <InfoField label="性别">
              <div className="flex gap-2">
                {(['male', 'female'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => updateUserProfile({ gender: g })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                      userProfile.gender === g
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                        : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                  >
                    {g === 'male' ? '男' : '女'}
                  </button>
                ))}
              </div>
            </InfoField>
            <InfoField label="身高" icon={Ruler}>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={userProfile.height}
                  onChange={(e) => updateUserProfile({ height: Number(e.target.value) || 0 })}
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                />
                <span className="text-stone-500 text-sm pr-1">cm</span>
              </div>
            </InfoField>
            <InfoField label="年龄">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={userProfile.age}
                  onChange={(e) => updateUserProfile({ age: Number(e.target.value) || 0 })}
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                />
                <span className="text-stone-500 text-sm pr-1">岁</span>
              </div>
            </InfoField>
            <InfoField label="目标体重">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={userProfile.targetWeight || ''}
                  onChange={(e) => updateUserProfile({ targetWeight: Number(e.target.value) || undefined })}
                  placeholder="可选"
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                />
                <span className="text-stone-500 text-sm pr-1">kg</span>
              </div>
            </InfoField>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-stone-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-emerald-100/50 to-teal-100/30 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                  <Sparkles className={result.color} size={20} />
                  BMI 健康指数
                </h2>
                <p className="text-sm text-stone-500 mt-1">基于身高 {userProfile.height}cm · 体重 {currentWeight}kg</p>
              </div>
              <div className={`px-4 py-2 rounded-2xl bg-white shadow-sm border border-stone-100 ${result.color} font-bold text-lg`}>
                {result.label}
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-8">
              <div className="relative">
                <svg viewBox="0 0 200 120" className="w-56 h-36">
                  <defs>
                    <linearGradient id="arcGrad" x1="0" x2="1">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="33%" stopColor="#10b981" />
                      <stop offset="66%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 15 105 A 85 85 0 0 1 185 105"
                    fill="none"
                    stroke="#f5f5f4"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 15 105 A 85 85 0 0 1 185 105"
                    fill="none"
                    stroke="url(#arcGrad)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray="267"
                    strokeDashoffset="267"
                    className="animate-[arcFill_1.2s_ease-out_forwards]"
                  />
                  <g style={{ transform: `rotate(${-90 + indicatorPct * 1.8}deg)`, transformOrigin: '100px 105px' }}>
                    <circle cx="100" cy="35" r="7" fill="#1c1917" />
                    <line x1="100" y1="105" x2="100" y2="45" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
                  </g>
                  <circle cx="100" cy="105" r="6" fill="#1c1917" />
                </svg>
                <div className="absolute inset-0 flex items-end justify-center pb-2">
                  <div className="text-center">
                    <div className={`text-5xl font-extrabold ${result.color}`}>
                      {result.bmi.toFixed(1)}
                    </div>
                    <div className="text-xs text-stone-400 mt-1">BMI 指数</div>
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full">
                <div className="flex h-4 rounded-full overflow-hidden mb-3 shadow-inner">
                  {categoryRanges.map((r) => (
                    <div key={r.key} className={`${r.bg}`} style={{ flex: r.pct }} />
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {categoryRanges.map((r) => (
                    <div
                      key={r.key}
                      className={`px-2 py-2 rounded-xl text-center transition ${
                        result.category === r.key
                          ? 'bg-stone-50 ring-2 ring-offset-1 ring-stone-200 shadow-sm'
                          : ''
                      }`}
                    >
                      <div className={`text-xs font-semibold ${r.color}`}>{r.label}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{r.range}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-stone-50 to-stone-100/70 border border-stone-100">
                  <div className="flex items-start gap-2.5">
                    <Info className="text-stone-400 mt-0.5 flex-shrink-0" size={15} />
                    <div className="text-sm text-stone-600 leading-relaxed">
                      您的标准体重范围应在 <span className="font-bold text-emerald-600">{idealMin}kg - {idealMax}kg</span>，
                      当前体重 {result.category === 'normal' ? '非常健康，继续保持！' : `距离标准体重${currentWeight < idealMin ? '偏轻' : '偏重'}，` +
                        `建议${result.category === 'underweight' ? '适当增加营养摄入' : '科学减脂塑形'}。`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 md:p-7 text-white shadow-xl shadow-emerald-500/25 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-60 h-60 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -left-6 bottom-0 w-40 h-40 rounded-full bg-teal-300/25 blur-2xl" />
          <div className="relative">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
              <Sparkles size={20} />
              专属建议
            </h3>
            <div className="text-white/85 text-sm mb-5">{result.advice.title}</div>
            <p className="text-white/95 leading-relaxed mb-5">{result.advice.description}</p>
            <ul className="space-y-2.5">
              {result.advice.tips.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs flex-shrink-0 font-bold">
                    {i + 1}
                  </span>
                  <span className="text-white/95 text-sm leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-stone-800 px-1">日常健康小贴士</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tips.map((t, i) => {
              const I = t.icon;
              return (
                <div
                  key={i}
                  className={`bg-gradient-to-br ${t.tone} border rounded-2xl p-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center mb-3 shadow-sm">
                    <I size={20} />
                  </div>
                  <h4 className="font-bold mb-1">{t.title}</h4>
                  <p className="text-xs opacity-80 leading-relaxed">{t.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-stone-500 mb-1.5 flex items-center gap-1.5">
        {Icon && <Icon size={12} className="text-stone-400" />}
        {label}
      </label>
      {children}
    </div>
  );
}
