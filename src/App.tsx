import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { Activity, Heart, MessageCircleHeart, Scale, Leaf, Sparkles, Dumbbell } from 'lucide-react';
import WeightRecordPage from '@/pages/WeightRecordPage';
import WeightChartPage from '@/pages/WeightChartPage';
import HealthAssessmentPage from '@/pages/HealthAssessmentPage';
import SocialFeedPage from '@/pages/SocialFeedPage';
import GymPage from '@/pages/GymPage';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { path: '/', label: '体重记录', icon: Scale, desc: '每日打卡' },
  { path: '/chart', label: '体重曲线', icon: Activity, desc: '趋势分析' },
  { path: '/health', label: '健康评估', icon: Heart, desc: 'BMI 分析' },
  { path: '/gym', label: '附近健身房', icon: Dumbbell, desc: '健身预约' },
  { path: '/social', label: '朋友圈', icon: MessageCircleHeart, desc: '分享互动' },
];

function Layout() {
  const { userProfile } = useAppStore();
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-stone-50/75 border-b border-stone-200/60">
        <div className="container max-w-6xl">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Leaf className="text-white" size={20} />
              </div>
              <div>
                <div className="font-extrabold text-stone-800 text-lg leading-tight tracking-tight">
                  轻盈日记
                </div>
                <div className="text-[10px] text-stone-500 leading-none">LightWeight Diary</div>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1 p-1 bg-white/70 backdrop-blur rounded-2xl border border-stone-200/70 shadow-sm">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/25'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                      }`
                    }
                  >
                    <Icon size={16} />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <Sparkles className="hidden sm:block text-amber-400" size={18} />
              <div className="flex items-center gap-2.5 pl-3 border-l border-stone-200/70">
                <img
                  src={userProfile.avatar}
                  alt=""
                  className="w-9 h-9 rounded-xl bg-stone-100 ring-2 ring-white shadow-sm"
                />
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-stone-800 leading-none">
                    {userProfile.name}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-1">坚持中 💪</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl py-6 md:py-8 pb-28 md:pb-12">
        <Routes key={location.pathname}>
          <Route path="/" element={<WeightRecordPage />} />
          <Route path="/chart" element={<WeightChartPage />} />
          <Route path="/health" element={<HealthAssessmentPage />} />
          <Route path="/gym" element={<GymPage />} />
          <Route path="/social" element={<SocialFeedPage />} />
          <Route path="*" element={<WeightRecordPage />} />
        </Routes>
      </main>

      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-white/95 backdrop-blur-xl border border-stone-200/70 rounded-3xl shadow-2xl shadow-stone-900/10 px-2 py-2">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-2 rounded-2xl transition-all ${
                    isActive
                      ? 'text-emerald-600 bg-gradient-to-b from-emerald-50 to-teal-50'
                      : 'text-stone-500'
                  }`
                }
              >
                <Icon size={20} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
