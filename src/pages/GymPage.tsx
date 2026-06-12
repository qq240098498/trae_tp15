import { useState, useMemo } from 'react';
import {
  MapPin,
  Star,
  Clock,
  Dumbbell,
  CreditCard,
  CalendarDays,
  ChevronLeft,
  Check,
  Zap,
  Shield,
  Timer,
  Users,
  Tag,
  ArrowRight,
  BadgeCheck,
  Navigation,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Gym, GymMembership, BookingActivity } from '@/types';
import { todayStr } from '@/utils';

const ACTIVITIES: BookingActivity[] = ['力量训练', '有氧运动', '瑜伽', '动感单车', '游泳', '团课', '自由训练'];

const TIME_SLOTS = [
  { label: '06:00 - 08:00', start: '06:00', end: '08:00' },
  { label: '08:00 - 10:00', start: '08:00', end: '10:00' },
  { label: '10:00 - 12:00', start: '10:00', end: '12:00' },
  { label: '12:00 - 14:00', start: '12:00', end: '14:00' },
  { label: '14:00 - 16:00', start: '14:00', end: '16:00' },
  { label: '16:00 - 18:00', start: '16:00', end: '18:00' },
  { label: '18:00 - 20:00', start: '18:00', end: '20:00' },
  { label: '20:00 - 22:00', start: '20:00', end: '22:00' },
];

type View = 'list' | 'detail' | 'purchase' | 'booking' | 'myMemberships' | 'myBookings';

export default function GymPage() {
  const {
    gyms,
    purchasedMemberships,
    bookings,
    purchaseMembership,
    addBooking,
    cancelBooking,
    completeBooking,
  } = useAppStore();

  const [view, setView] = useState<View>('list');
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [selectedMembership, setSelectedMembership] = useState<GymMembership | null>(null);
  const [bookingDate, setBookingDate] = useState(todayStr());
  const [bookingTimeSlot, setBookingTimeSlot] = useState<number | null>(null);
  const [bookingActivity, setBookingActivity] = useState<BookingActivity>('自由训练');
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState<number>(0);

  const DISTANCE_TABS = [
    { label: '全部', value: 0 },
    { label: '1km内', value: 1 },
    { label: '3km内', value: 3 },
    { label: '5km内', value: 5 },
  ];

  const filteredGyms = useMemo(() => {
    const sorted = [...gyms].sort((a, b) => a.distance - b.distance);
    if (distanceFilter === 0) return sorted;
    return sorted.filter((g) => g.distance <= distanceFilter);
  }, [gyms, distanceFilter]);

  const openDetail = (gym: Gym) => {
    setSelectedGym(gym);
    setView('detail');
  };

  const openPurchase = (membership: GymMembership) => {
    setSelectedMembership(membership);
    setPurchaseSuccess(false);
    setView('purchase');
  };

  const openBooking = (gym: Gym) => {
    setSelectedGym(gym);
    setBookingDate(todayStr());
    setBookingTimeSlot(null);
    setBookingActivity('自由训练');
    setBookingSuccess(false);
    setView('booking');
  };

  const handlePurchase = () => {
    if (!selectedGym || !selectedMembership) return;
    purchaseMembership(selectedGym.id, selectedMembership);
    setPurchaseSuccess(true);
  };

  const handleBooking = () => {
    if (!selectedGym || bookingTimeSlot === null) return;
    const hasActiveMembership = activeMemberships.some((m) => m.gymId === selectedGym.id);
    if (!hasActiveMembership) return;
    const slot = TIME_SLOTS[bookingTimeSlot];
    addBooking({
      gymId: selectedGym.id,
      gymName: selectedGym.name,
      date: bookingDate,
      startTime: slot.start,
      endTime: slot.end,
      activity: bookingActivity,
    });
    setBookingSuccess(true);
  };

  const activeMemberships = purchasedMemberships.filter((m) => m.remainingDays > 0);
  const activeBookings = bookings.filter((b) => b.status === 'confirmed');

  if (view === 'purchase' && selectedGym && selectedMembership) {
    return (
      <div className="animate-fadeIn">
        <BackHeader title="确认购买" onBack={() => setView('detail')} />

        {purchaseSuccess ? (
          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <Check className="text-emerald-500" size={36} />
            </div>
            <h2 className="text-xl font-bold text-stone-800 mb-2">购买成功！</h2>
            <p className="text-stone-500 mb-1">{selectedGym.name}</p>
            <p className="text-stone-500 mb-6">
              {selectedMembership.name} · ¥{selectedMembership.price}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => openBooking(selectedGym)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/35 transition"
              >
                立即预约锻炼
              </button>
              <button
                onClick={() => setView('list')}
                className="px-6 py-3 rounded-2xl bg-stone-100 text-stone-700 font-medium hover:bg-stone-200 transition"
              >
                返回列表
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800">{selectedGym.name}</h3>
                  <p className="text-sm text-stone-500 mt-0.5">{selectedGym.address}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/25 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={16} />
                  <span className="text-sm font-medium text-white/80">{selectedMembership.description}</span>
                </div>
                <div className="text-3xl font-extrabold mb-1">
                  ¥{selectedMembership.price}
                  <span className="text-base font-normal text-white/70 ml-1">/{selectedMembership.name}</span>
                </div>
                <div className="text-sm text-white/70">有效期 {selectedMembership.days} 天</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6">
              <h3 className="font-bold text-stone-800 mb-4">包含权益</h3>
              <div className="space-y-3">
                {selectedMembership.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <Check className="text-emerald-600" size={12} />
                    </div>
                    <span className="text-sm text-stone-700">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handlePurchase}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              确认支付 ¥{selectedMembership.price}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (view === 'booking' && selectedGym) {
    const slot = bookingTimeSlot !== null ? TIME_SLOTS[bookingTimeSlot] : null;
    const hasActiveMembership = activeMemberships.some((m) => m.gymId === selectedGym.id);

    return (
      <div className="animate-fadeIn">
        <BackHeader title="预约锻炼" onBack={() => setView(view === 'booking' && hasActiveMembership ? 'myMemberships' : 'detail')} />

        {bookingSuccess ? (
          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="text-emerald-500" size={36} />
            </div>
            <h2 className="text-xl font-bold text-stone-800 mb-2">预约成功！</h2>
            <p className="text-stone-500 mb-1">{selectedGym.name}</p>
            <p className="text-stone-500 mb-6">
              {bookingDate} · {slot?.label} · {bookingActivity}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setView('myBookings')}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium shadow-md shadow-emerald-500/25 transition"
              >
                查看预约
              </button>
              <button
                onClick={() => setView('list')}
                className="px-6 py-3 rounded-2xl bg-stone-100 text-stone-700 font-medium hover:bg-stone-200 transition"
              >
                返回列表
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="text-emerald-600" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800">{selectedGym.name}</h3>
                  <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                    <Clock size={12} />
                    {selectedGym.openTime} - {selectedGym.closeTime}
                  </p>
                </div>
              </div>
              {hasActiveMembership ? (
                <div className="mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-2">
                  <BadgeCheck className="text-emerald-600" size={16} />
                  <span className="text-sm text-emerald-700 font-medium">已有有效会员卡，可免费预约</span>
                </div>
              ) : (
                <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-2">
                  <CreditCard className="text-amber-600" size={16} />
                  <span className="text-sm text-amber-700 font-medium">请先购买会员卡后再预约锻炼</span>
                </div>
              )}
            </div>

            <div className={`bg-white rounded-3xl shadow-sm border border-stone-100 p-5 ${!hasActiveMembership ? 'opacity-50 pointer-events-none' : ''}`}>
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                <CalendarDays size={18} className="text-emerald-500" />
                选择日期
              </h3>
              <input
                type="date"
                value={bookingDate}
                min={todayStr()}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
              />
            </div>

            <div className={`bg-white rounded-3xl shadow-sm border border-stone-100 p-5 ${!hasActiveMembership ? 'opacity-50 pointer-events-none' : ''}`}>
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Timer size={18} className="text-emerald-500" />
                选择时段
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {TIME_SLOTS.map((ts, i) => (
                  <button
                    key={i}
                    onClick={() => setBookingTimeSlot(i)}
                    className={`px-4 py-3 rounded-2xl text-sm font-medium transition ${
                      bookingTimeSlot === i
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                        : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {ts.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`bg-white rounded-3xl shadow-sm border border-stone-100 p-5 ${!hasActiveMembership ? 'opacity-50 pointer-events-none' : ''}`}>
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Zap size={18} className="text-emerald-500" />
                锻炼项目
              </h3>
              <div className="flex flex-wrap gap-2">
                {ACTIVITIES.map((act) => (
                  <button
                    key={act}
                    onClick={() => setBookingActivity(act)}
                    className={`px-4 py-2.5 rounded-2xl text-sm font-medium transition ${
                      bookingActivity === act
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                        : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {act}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveMembership ? (
              <button
                onClick={handleBooking}
                disabled={bookingTimeSlot === null || !bookingDate}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                确认预约
              </button>
            ) : (
              <button
                onClick={() => setView('detail')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
              >
                <CreditCard size={20} />
                购买会员卡后预约
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  if (view === 'detail' && selectedGym) {
    const hasActiveMembership = activeMemberships.some((m) => m.gymId === selectedGym.id);
    return (
      <div className="animate-fadeIn">
        <BackHeader title="健身房详情" onBack={() => setView('list')} />

        <div className="space-y-4">
          <div className="rounded-3xl overflow-hidden aspect-[16/9] bg-stone-100">
            <img src={selectedGym.image} alt="" className="w-full h-full object-cover" />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6">
            <h2 className="text-xl font-extrabold text-stone-800">{selectedGym.name}</h2>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <MapPin size={15} className="text-stone-400" />
                {selectedGym.address}
                <span className="text-emerald-600 font-semibold ml-auto flex items-center gap-0.5">
                  <Navigation size={13} />
                  {selectedGym.distance}km
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Star size={15} className="text-amber-400" fill="currentColor" />
                <span className="font-semibold text-stone-800">{selectedGym.rating}</span>
                <span className="text-stone-400">({selectedGym.reviewCount}条评价)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Clock size={15} className="text-stone-400" />
                {selectedGym.openTime} - {selectedGym.closeTime}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6">
            <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Shield size={18} className="text-emerald-500" />
              设施
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedGym.facilities.map((f) => (
                <span key={f} className="px-3 py-1.5 rounded-xl bg-stone-50 text-stone-600 text-sm font-medium border border-stone-100">
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div data-memberships-section className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6">
            <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-emerald-500" />
              会员卡
            </h3>
            <div className="space-y-3">
              {selectedGym.memberships.map((m) => (
                <div key={m.type} className="p-4 rounded-2xl bg-stone-50 border border-stone-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition cursor-pointer group" onClick={() => openPurchase(m)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        m.type === 'daily' ? 'bg-sky-50 text-sky-600' :
                        m.type === 'weekly' ? 'bg-amber-50 text-amber-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {m.type === 'daily' ? <Zap size={18} /> : m.type === 'weekly' ? <Timer size={18} /> : <CalendarDays size={18} />}
                      </div>
                      <div>
                        <div className="font-bold text-stone-800">{m.name}</div>
                        <div className="text-xs text-stone-500">{m.description}</div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <div className="text-lg font-extrabold text-stone-800">¥{m.price}</div>
                        <div className="text-[10px] text-stone-400">{m.days}天</div>
                      </div>
                      <ArrowRight size={16} className="text-stone-300 group-hover:text-emerald-500 transition" />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.features.map((f, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded-lg bg-white text-stone-500 border border-stone-100">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {hasActiveMembership ? (
            <button
              onClick={() => openBooking(selectedGym)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
            >
              <CalendarDays size={20} />
              预约锻炼
            </button>
          ) : (
            <button
              onClick={() => document.querySelector('[data-memberships-section]')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
            >
              <CreditCard size={20} />
              购买会员卡后预约
            </button>
          )}
        </div>
      </div>
    );
  }

  if (view === 'myMemberships') {
    return (
      <div className="animate-fadeIn">
        <BackHeader title="我的会员卡" onBack={() => setView('list')} />
        {activeMemberships.length === 0 ? (
          <EmptyState icon={CreditCard} title="暂无会员卡" desc="选择附近健身房购买会员卡" />
        ) : (
          <div className="space-y-4">
            {activeMemberships.map((m) => {
              const gym = gyms.find((g) => g.id === m.gymId);
              return (
                <div key={m.id} className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/25 relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                  <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/5 blur-xl" />
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-white/80 text-sm font-medium">{m.gymName}</div>
                        <div className="text-2xl font-extrabold mt-1">{m.name}</div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                        <Dumbbell size={22} />
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="bg-white/15 backdrop-blur rounded-2xl py-2.5 text-center">
                        <div className="text-xl font-bold">{m.remainingDays}</div>
                        <div className="text-[10px] text-white/75 mt-0.5">剩余天数</div>
                      </div>
                      <div className="bg-white/15 backdrop-blur rounded-2xl py-2.5 text-center">
                        <div className="text-sm font-bold">{m.startDate}</div>
                        <div className="text-[10px] text-white/75 mt-0.5">开始日期</div>
                      </div>
                      <div className="bg-white/15 backdrop-blur rounded-2xl py-2.5 text-center">
                        <div className="text-sm font-bold">{m.endDate}</div>
                        <div className="text-[10px] text-white/75 mt-0.5">到期日期</div>
                      </div>
                    </div>
                    {gym && (
                      <button
                        onClick={() => openBooking(gym)}
                        className="mt-4 w-full py-3 rounded-2xl bg-white/20 backdrop-blur text-white font-medium text-sm hover:bg-white/30 transition flex items-center justify-center gap-2"
                      >
                        <CalendarDays size={16} />
                        预约锻炼
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (view === 'myBookings') {
    return (
      <div className="animate-fadeIn">
        <BackHeader title="我的预约" onBack={() => setView('list')} />
        {bookings.length === 0 ? (
          <EmptyState icon={CalendarDays} title="暂无预约" desc="选择健身房预约锻炼时段" />
        ) : (
          <div className="space-y-3">
            {[...bookings].sort((a, b) => b.createdAt - a.createdAt).map((b) => (
              <div key={b.id} className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-stone-800">{b.gymName}</div>
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <CalendarDays size={14} className="text-stone-400" />
                        {b.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <Clock size={14} className="text-stone-400" />
                        {b.startTime} - {b.endTime}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <Zap size={14} className="text-stone-400" />
                        {b.activity}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                    b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                    b.status === 'completed' ? 'bg-stone-100 text-stone-500' :
                    'bg-rose-50 text-rose-600'
                  }`}>
                    {b.status === 'confirmed' ? '已确认' : b.status === 'completed' ? '已完成' : '已取消'}
                  </span>
                </div>
                {b.status === 'confirmed' && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => completeBooking(b.id)}
                      className="flex-1 py-2.5 rounded-2xl bg-emerald-50 text-emerald-700 font-medium text-sm hover:bg-emerald-100 transition"
                    >
                      完成锻炼
                    </button>
                    <button
                      onClick={() => cancelBooking(b.id)}
                      className="flex-1 py-2.5 rounded-2xl bg-rose-50 text-rose-600 font-medium text-sm hover:bg-rose-100 transition"
                    >
                      取消预约
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      <div className="lg:col-span-2 space-y-5">
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/25 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Navigation size={18} />
              <span className="text-sm font-medium text-white/80">附近健身房</span>
            </div>
            <h1 className="text-2xl font-extrabold">找到你的锻炼空间</h1>
            <p className="text-white/75 text-sm mt-2">选择就近健身房，购买会员卡并预约锻炼</p>
            <div className="mt-4 flex gap-4">
              <div className="bg-white/15 backdrop-blur rounded-2xl px-4 py-2.5 text-center">
                <div className="text-2xl font-bold">{filteredGyms.length}</div>
                <div className="text-[10px] text-white/75 mt-0.5">附近健身房</div>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-2xl px-4 py-2.5 text-center">
                <div className="text-2xl font-bold">{activeMemberships.length}</div>
                <div className="text-[10px] text-white/75 mt-0.5">有效会员卡</div>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-2xl px-4 py-2.5 text-center">
                <div className="text-2xl font-bold">{activeBookings.length}</div>
                <div className="text-[10px] text-white/75 mt-0.5">待锻炼预约</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {DISTANCE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setDistanceFilter(tab.value)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition ${
                distanceFilter === tab.value
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-emerald-200 hover:text-emerald-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredGyms.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-stone-300" size={28} />
              </div>
              <h3 className="font-bold text-stone-700 mb-1">附近没有健身房</h3>
              <p className="text-sm text-stone-400">请尝试扩大筛选范围</p>
            </div>
          ) : (
            filteredGyms.map((gym) => (
              <div
                key={gym.id}
                className="bg-white rounded-3xl shadow-sm border border-stone-100 p-4 hover:shadow-md transition group"
              >
                <div className="flex gap-4 cursor-pointer" onClick={() => openDetail(gym)}>
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-stone-100 flex-shrink-0">
                    <img src={gym.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-stone-800 truncate pr-2">{gym.name}</h3>
                      <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 flex-shrink-0">
                        <Navigation size={13} />
                        {gym.distance}km
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1 truncate">{gym.address}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <Star size={13} className="text-amber-400" fill="currentColor" />
                        <span className="text-sm font-semibold text-stone-800">{gym.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-stone-500">
                        <Clock size={12} />
                        {gym.openTime}-{gym.closeTime}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {gym.facilities.slice(0, 4).map((f) => (
                        <span key={f} className="text-[10px] px-2 py-0.5 rounded-lg bg-stone-50 text-stone-500 border border-stone-100">
                          {f}
                        </span>
                      ))}
                      {gym.facilities.length > 4 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-stone-50 text-stone-400">
                          +{gym.facilities.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={14} className="text-emerald-500" />
                    <span className="text-xs font-semibold text-stone-600">选择会员卡</span>
                  </div>
                  <div className="flex gap-2">
                    {gym.memberships.map((m) => (
                      <button
                        key={m.type}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGym(gym);
                          openPurchase(m);
                        }}
                        className={`flex-1 py-2.5 px-3 rounded-2xl text-center transition border ${
                          m.type === 'daily'
                            ? 'bg-sky-50 border-sky-200 hover:bg-sky-100 hover:border-sky-300'
                            : m.type === 'weekly'
                            ? 'bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
                            : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                        }`}
                      >
                        <div className={`text-xs font-bold ${
                          m.type === 'daily' ? 'text-sky-700' : m.type === 'weekly' ? 'text-amber-700' : 'text-emerald-700'
                        }`}>
                          {m.name}
                        </div>
                        <div className={`text-sm font-extrabold mt-0.5 ${
                          m.type === 'daily' ? 'text-sky-600' : m.type === 'weekly' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          ¥{m.price}
                        </div>
                      </button>
                    ))}
                    {(() => {
                      const hasGymMembership = activeMemberships.some((m) => m.gymId === gym.id);
                      if (hasGymMembership) {
                        return (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openBooking(gym);
                            }}
                            className="flex-1 py-2.5 px-3 rounded-2xl text-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/35 transition"
                          >
                            <div className="text-xs font-bold flex items-center justify-center gap-1">
                              <CalendarDays size={12} />
                              预约锻炼
                            </div>
                            <div className="text-[10px] mt-0.5 text-white/80">选择时段</div>
                          </button>
                        );
                      }
                      return (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(gym);
                          }}
                          className="flex-1 py-2.5 px-3 rounded-2xl text-center bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 hover:shadow-amber-500/35 transition"
                        >
                          <div className="text-xs font-bold flex items-center justify-center gap-1">
                            <CreditCard size={12} />
                            先办卡
                          </div>
                          <div className="text-[10px] mt-0.5 text-white/80">购买后预约</div>
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-5">
        <button
          onClick={() => setView('myMemberships')}
          className="w-full bg-white rounded-3xl p-5 shadow-sm border border-stone-100 hover:shadow-md transition text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
              <CreditCard className="text-emerald-600" size={20} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-stone-800">我的会员卡</div>
              <div className="text-sm text-stone-500">{activeMemberships.length} 张有效</div>
            </div>
            <ArrowRight size={16} className="text-stone-300 group-hover:text-emerald-500 transition" />
          </div>
          {activeMemberships.length > 0 && (
            <div className="mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
              <div className="text-sm font-semibold text-emerald-700">{activeMemberships[0].gymName}</div>
              <div className="text-xs text-emerald-600 mt-0.5">
                {activeMemberships[0].name} · 剩余 {activeMemberships[0].remainingDays} 天
              </div>
            </div>
          )}
        </button>

        <button
          onClick={() => setView('myBookings')}
          className="w-full bg-white rounded-3xl p-5 shadow-sm border border-stone-100 hover:shadow-md transition text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
              <CalendarDays className="text-amber-600" size={20} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-stone-800">我的预约</div>
              <div className="text-sm text-stone-500">{activeBookings.length} 个待锻炼</div>
            </div>
            <ArrowRight size={16} className="text-stone-300 group-hover:text-emerald-500 transition" />
          </div>
          {activeBookings.length > 0 && (
            <div className="mt-3 space-y-2">
              {activeBookings.slice(0, 2).map((b) => (
                <div key={b.id} className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
                  <div className="text-sm font-semibold text-amber-700">{b.gymName}</div>
                  <div className="text-xs text-amber-600 mt-0.5">
                    {b.date} · {b.startTime}-{b.endTime} · {b.activity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </button>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
          <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Users size={18} className="text-emerald-500" />
            健身小贴士
          </h3>
          <div className="space-y-3">
            {[
              { icon: '🏋️', title: '力量训练', tip: '每周3-4次，注意休息恢复' },
              { icon: '🏃', title: '有氧运动', tip: '每次30-45分钟，心率保持130-150' },
              { icon: '🧘', title: '拉伸放松', tip: '运动前后各5-10分钟拉伸' },
              { icon: '💧', title: '补充水分', tip: '运动中每15分钟补水150-200ml' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-stone-50 transition">
                <span className="text-lg">{item.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-stone-800">{item.title}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{item.tip}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl p-6 text-white shadow-xl shadow-violet-500/25 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <h3 className="font-bold text-lg mb-2">💪 新人福利</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              首次购买任意健身房会员卡，享受9折优惠！坚持锻炼，遇见更好的自己。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <button
        onClick={onBack}
        className="w-10 h-10 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-center hover:bg-stone-50 transition"
      >
        <ChevronLeft size={18} className="text-stone-600" />
      </button>
      <h2 className="text-lg font-bold text-stone-800">{title}</h2>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string; size?: string | number }>; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
        <Icon className="text-stone-300" size={28} />
      </div>
      <h3 className="font-bold text-stone-700 mb-1">{title}</h3>
      <p className="text-sm text-stone-400">{desc}</p>
    </div>
  );
}
