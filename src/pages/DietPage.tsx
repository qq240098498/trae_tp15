import { useState, useMemo, useRef } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Camera,
  Apple,
  Sun,
  Moon,
  Coffee,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Info,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Clock,
  Upload,
  Loader2,
  Image as ImageIcon,
  Minus,
  Sparkles,
  Activity,
  Target,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { MealType, MealFood, FoodItem, MealRecord } from '@/types';
import { todayStr, formatDate, getWeightStats } from '@/utils';
import {
  FOOD_DATABASE,
  FOOD_CATEGORIES,
  searchFoods,
  foodToMealFood,
  recognizeFoodFromPhoto,
  calculateTargetCalories,
  assessDietHealth,
  RecognitionResult,
  fileToBase64,
} from '@/utils/foodDatabase';

const MEAL_TYPE_CONFIG: Record<MealType, { label: string; icon: typeof Sun; color: string; bgColor: string }> = {
  breakfast: { label: '早餐', icon: Coffee, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  lunch: { label: '午餐', icon: Sun, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  dinner: { label: '晚餐', icon: Moon, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  snack: { label: '加餐', icon: Apple, color: 'text-pink-600', bgColor: 'bg-pink-50' },
};

export default function DietPage() {
  const { mealRecords, addMealRecord, updateMealRecord, deleteMealRecord, userProfile, weightRecords } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [editingRecord, setEditingRecord] = useState<MealRecord | null>(null);

  const stats = getWeightStats(weightRecords);
  const latestWeight = stats.latest?.weight || 70;

  const targetCalories = useMemo(() => {
    return calculateTargetCalories(
      latestWeight,
      userProfile.height,
      userProfile.age,
      userProfile.gender,
      'light',
    );
  }, [latestWeight, userProfile]);

  const mealsOfDay = useMemo(() => {
    return mealRecords
      .filter((r) => r.date === selectedDate)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [mealRecords, selectedDate]);

  const dailySummary = useMemo(() => {
    const totalCalories = mealsOfDay.reduce((sum, m) => sum + m.totalCalories, 0);
    const totalProtein = mealsOfDay.reduce((sum, m) => sum + m.totalProtein, 0);
    const totalCarbs = mealsOfDay.reduce((sum, m) => sum + m.totalCarbs, 0);
    const totalFat = mealsOfDay.reduce((sum, m) => sum + m.totalFat, 0);
    return { totalCalories, totalProtein, totalCarbs, totalFat, mealCount: mealsOfDay.length };
  }, [mealsOfDay]);

  const healthAssessment = useMemo(() => {
    if (dailySummary.totalCalories === 0) return null;
    return assessDietHealth(
      dailySummary.totalCalories,
      dailySummary.totalProtein,
      dailySummary.totalCarbs,
      dailySummary.totalFat,
      targetCalories,
    );
  }, [dailySummary, targetCalories]);

  const caloriesProgress = Math.min(100, (dailySummary.totalCalories / targetCalories) * 100);

  const goToPrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const goToNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleAddMeal = (type: MealType) => {
    setSelectedMealType(type);
    setEditingRecord(null);
    setShowAddModal(true);
  };

  const handleEditMeal = (record: MealRecord) => {
    setSelectedMealType(record.mealType);
    setEditingRecord(record);
    setShowAddModal(true);
  };

  const handleSaveMeal = (data: { mealType: MealType; foods: MealFood[]; note?: string; image?: string }) => {
    if (editingRecord) {
      updateMealRecord(editingRecord.id, data);
    } else {
      addMealRecord({
        date: selectedDate,
        ...data,
      });
    }
    setShowAddModal(false);
  };

  const isToday = selectedDate === todayStr();

  const getMealsByType = (type: MealType) => mealsOfDay.filter((m) => m.mealType === type);

  const getMacroColor = (status: 'low' | 'normal' | 'high') => {
    switch (status) {
      case 'normal': return 'bg-emerald-500';
      case 'low': return 'bg-amber-500';
      case 'high': return 'bg-rose-500';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={goToPrevDay}
            className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 hover:border-stone-300 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <div className="text-xl font-bold text-stone-800">{formatDate(new Date(selectedDate))}</div>
            <div className="text-xs text-stone-500">{isToday ? '今天' : ''}</div>
          </div>
          <button
            onClick={goToNextDay}
            className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 hover:border-stone-300 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        {!isToday && (
          <button
            onClick={() => setSelectedDate(todayStr())}
            className="px-4 py-2 rounded-xl text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition"
          >
            回到今天
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl p-6 md:p-7 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-8 bottom-0 w-40 h-40 rounded-full bg-teal-300/20 blur-xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
              <Flame size={16} />
              <span>今日摄入</span>
            </div>
            <div className="flex items-end gap-4 flex-wrap">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-bold tracking-tight">
                  {Math.round(dailySummary.totalCalories)}
                </span>
                <span className="text-xl text-white/80 mb-2">千卡</span>
              </div>
              <div className="text-white/70 text-sm mb-2">
                / 目标 {targetCalories} 千卡
              </div>
            </div>
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs mb-2 text-white/80">
                <span>热量进度</span>
                <span>{Number(caloriesProgress).toFixed(0)}%</span>
              </div>
              <div className="h-3 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-300 to-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${caloriesProgress}%` }}
                />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
              <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-white/70 text-xs mb-1">
                  <Beef size={12} /> 蛋白质
                </div>
                <div className="font-semibold text-lg">
                  {dailySummary.totalProtein.toFixed(0)}g
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-white/70 text-xs mb-1">
                  <Wheat size={12} /> 碳水
                </div>
                <div className="font-semibold text-lg">
                  {dailySummary.totalCarbs.toFixed(0)}g
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-white/70 text-xs mb-1">
                  <Droplets size={12} /> 脂肪
                </div>
                <div className="font-semibold text-lg">
                  {dailySummary.totalFat.toFixed(0)}g
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
          <div className="flex items-center gap-2 text-stone-700 font-semibold mb-4">
            <CheckCircle2 className="text-emerald-600" size={18} />
            健康评分
          </div>
          {healthAssessment ? (
            <div className="text-center">
              <div className={`text-5xl font-bold mb-2 ${healthAssessment.statusColor}`}>
                {healthAssessment.score}
              </div>
              <div className={`text-lg font-semibold ${healthAssessment.statusColor} mb-4`}>
                {healthAssessment.statusLabel}
              </div>
              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">热量摄入</span>
                  <span className={`font-medium ${
                    healthAssessment.calories.status === 'normal' ? 'text-emerald-600' :
                    healthAssessment.calories.status === 'high' ? 'text-rose-600' : 'text-amber-600'
                  }`}>
                    {healthAssessment.calories.status === 'normal' ? '正常' :
                     healthAssessment.calories.status === 'high' ? '偏高' : '偏低'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">营养均衡</span>
                  <span className="font-medium text-stone-700">
                    {healthAssessment.protein.status === 'normal' &&
                     healthAssessment.carbs.status === 'normal' &&
                     healthAssessment.fat.status === 'normal' ? '均衡' : '待调整'}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-100">
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                    <span>营养比例分析</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-stone-600">蛋白质 {healthAssessment.protein.ratio}%</span>
                        <span className="text-stone-400">目标 25%</span>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${getMacroColor(healthAssessment.protein.status)}`} style={{ width: `${Math.min(100, healthAssessment.protein.ratio * 2)}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-stone-600">碳水 {healthAssessment.carbs.ratio}%</span>
                        <span className="text-stone-400">目标 50%</span>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${getMacroColor(healthAssessment.carbs.status)}`} style={{ width: `${Math.min(100, healthAssessment.carbs.ratio)}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-stone-600">脂肪 {healthAssessment.fat.ratio}%</span>
                        <span className="text-stone-400">目标 25%</span>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${getMacroColor(healthAssessment.fat.status)}`} style={{ width: `${Math.min(100, healthAssessment.fat.ratio * 2)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-stone-400">
              <Info size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无饮食记录</p>
              <p className="text-xs mt-1">添加餐食后显示健康评分</p>
            </div>
          )}
        </div>
      </div>

      {healthAssessment && healthAssessment.suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <div className="font-semibold text-amber-800 mb-2">饮食建议</div>
              <ul className="space-y-1.5">
                {healthAssessment.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {healthAssessment && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
                <Target className="text-rose-500" size={18} />
              </div>
              <span className="text-xs text-stone-500">蛋白质</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-stone-800">{Math.round(healthAssessment.protein.current)}</span>
              <span className="text-xs text-stone-400">/ {healthAssessment.protein.target}g</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <TrendingUp className="text-amber-500" size={18} />
              </div>
              <span className="text-xs text-stone-500">碳水</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-stone-800">{Math.round(healthAssessment.carbs.current)}</span>
              <span className="text-xs text-stone-400">/ {healthAssessment.carbs.target}g</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center">
                <Activity className="text-sky-500" size={18} />
              </div>
              <span className="text-xs text-stone-500">脂肪</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-stone-800">{Math.round(healthAssessment.fat.current)}</span>
              <span className="text-xs text-stone-400">/ {healthAssessment.fat.target}g</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <BarChart3 className="text-emerald-500" size={18} />
              </div>
              <span className="text-xs text-stone-500">热量差值</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${healthAssessment.calories.diff > 0 ? 'text-rose-600' : healthAssessment.calories.diff < 0 ? 'text-emerald-600' : 'text-stone-800'}`}>
                {healthAssessment.calories.diff > 0 ? '+' : ''}{Math.round(healthAssessment.calories.diff)}
              </span>
              <span className="text-xs text-stone-400">千卡</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <UtensilsCrossed size={20} className="text-emerald-600" />
            今日饮食
          </h2>
          <span className="text-sm text-stone-500">共 {dailySummary.mealCount} 餐</span>
        </div>

        {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => {
          const config = MEAL_TYPE_CONFIG[type];
          const Icon = config.icon;
          const meals = getMealsByType(type);
          const totalCal = meals.reduce((sum, m) => sum + m.totalCalories, 0);

          return (
            <div key={type} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between border-b border-stone-50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center`}>
                    <Icon className={config.color} size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-800">{config.label}</div>
                    <div className="text-xs text-stone-500">{Math.round(totalCal)} 千卡</div>
                  </div>
                </div>
                <button
                  onClick={() => handleAddMeal(type)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition flex items-center gap-1"
                >
                  <Plus size={14} />
                  添加
                </button>
              </div>
              {meals.length === 0 ? (
                <div className="px-5 py-6 text-center text-stone-400 text-sm">
                  还没有{config.label}记录
                </div>
              ) : (
                <div className="divide-y divide-stone-50">
                  {meals.map((meal) => (
                    <div key={meal.id} className="px-5 py-4 group">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs text-stone-400">
                          <Clock size={12} />
                          {new Date(meal.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                          {meal.note && <span className="text-stone-500">· {meal.note}</span>}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleEditMeal(meal)}
                            className="w-8 h-8 rounded-lg hover:bg-sky-50 text-stone-400 hover:text-sky-600 flex items-center justify-center transition"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('确定删除这条记录吗？')) deleteMealRecord(meal.id);
                            }}
                            className="w-8 h-8 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 flex items-center justify-center transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {meal.foods.map((food, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-stone-700">
                              {food.foodName} × {food.quantity}
                            </span>
                            <span className="text-stone-500">
                              {Math.round(food.calories * food.quantity)} 千卡
                            </span>
                          </div>
                        ))}
                      </div>
                      {meal.image && (
                        <div className="mt-3">
                          <img
                            src={meal.image}
                            alt=""
                            className="w-20 h-20 object-cover rounded-xl"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <AddMealModal
          mealType={selectedMealType}
          setMealType={setSelectedMealType}
          editingRecord={editingRecord}
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveMeal}
        />
      )}
    </div>
  );
}

interface AddMealModalProps {
  mealType: MealType;
  setMealType: (type: MealType) => void;
  editingRecord: MealRecord | null;
  onClose: () => void;
  onSave: (data: { mealType: MealType; foods: MealFood[]; note?: string; image?: string }) => void;
}

function AddMealModal({ mealType, setMealType, editingRecord, onClose, onSave }: AddMealModalProps) {
  const [mode, setMode] = useState<'photo' | 'manual'>(editingRecord ? 'manual' : 'photo');
  const [recognizing, setRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [selectedFoods, setSelectedFoods] = useState<MealFood[]>(
    editingRecord ? editingRecord.foods : []
  );
  const [note, setNote] = useState(editingRecord?.note || '');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [uploadedImage, setUploadedImage] = useState<string | undefined>(editingRecord?.image);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const filteredFoods = searchFoods(searchKeyword, selectedCategory);

  const handleRecognize = async (file?: File) => {
    setRecognizing(true);
    setRecognitionResult(null);
    try {
      let base64Img: string | undefined;
      if (file) {
        base64Img = await fileToBase64(file);
        setUploadedImage(base64Img);
      }
      const result = await recognizeFoodFromPhoto(file, base64Img);
      setRecognitionResult(result);
      setSelectedFoods(result.foods);
    } finally {
      setRecognizing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleRecognize(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleRecognize(file);
    }
  };

  const addFood = (food: FoodItem) => {
    const existing = selectedFoods.find((f) => f.foodId === food.id);
    if (existing) {
      setSelectedFoods(
        selectedFoods.map((f) =>
          f.foodId === food.id ? { ...f, quantity: Number((f.quantity + 1).toFixed(1)) } : f
        )
      );
    } else {
      setSelectedFoods([...selectedFoods, foodToMealFood(food, 1)]);
    }
  };

  const updateFoodQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedFoods(selectedFoods.filter((f) => f.foodId !== foodId));
    } else {
      setSelectedFoods(
        selectedFoods.map((f) =>
          f.foodId === foodId ? { ...f, quantity: Number(quantity.toFixed(1)) } : f
        )
      );
    }
  };

  const removeFood = (foodId: string) => {
    setSelectedFoods(selectedFoods.filter((f) => f.foodId !== foodId));
  };

  const totalCalories = selectedFoods.reduce((sum, f) => sum + f.calories * f.quantity, 0);
  const totalProtein = selectedFoods.reduce((sum, f) => sum + f.protein * f.quantity, 0);
  const totalCarbs = selectedFoods.reduce((sum, f) => sum + f.carbs * f.quantity, 0);
  const totalFat = selectedFoods.reduce((sum, f) => sum + f.fat * f.quantity, 0);

  const handleSave = () => {
    if (selectedFoods.length === 0) {
      alert('请至少添加一种食物');
      return;
    }
    onSave({
      mealType,
      foods: selectedFoods,
      note: note.trim() || undefined,
      image: uploadedImage,
    });
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center animate-fadeIn">
      <div className="bg-white w-full md:max-w-2xl md:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-stone-800">
              {editingRecord ? '编辑餐食' : '添加餐食'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">记录饮食，追踪卡路里摄入</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-stone-100 text-stone-400 flex items-center justify-center transition">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-stone-100 flex gap-2 overflow-x-auto flex-shrink-0">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => {
            const config = MEAL_TYPE_CONFIG[type];
            const Icon = config.icon;
            return (
              <button
                key={type}
                onClick={() => setMealType(type)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                  mealType === type
                    ? `${config.bgColor} ${config.color} border`
                    : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                }`}
                style={mealType === type ? { borderColor: 'currentColor' } : {}}
              >
                <Icon size={15} />
                {config.label}
              </button>
            );
          })}
        </div>

        {!editingRecord && (
          <div className="px-6 py-3 border-b border-stone-100 flex gap-2 flex-shrink-0">
            <button
              onClick={() => setMode('photo')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-1.5 ${
                mode === 'photo'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Camera size={16} />
              拍照识别
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-1.5 ${
                mode === 'manual'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Plus size={16} />
              手动添加
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {mode === 'photo' && !editingRecord && (
            <div className="p-6 space-y-5">
              {!uploadedImage ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer ${
                    isDragging
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {recognizing ? (
                    <div className="py-8">
                      <Loader2 size={40} className="mx-auto text-emerald-500 animate-spin mb-3" />
                      <div className="text-stone-700 font-medium mb-1">AI 正在识别食物...</div>
                      <div className="text-xs text-stone-500">分析营养成分和热量信息</div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center mb-4">
                        <ImageIcon size={28} className="text-emerald-500" />
                      </div>
                      <div className="text-stone-700 font-medium mb-1">上传餐食照片</div>
                      <div className="text-xs text-stone-500 mb-4">拖拽图片到此处，或点击选择文件</div>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium flex items-center gap-1.5 shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30 transition"
                        >
                          <Camera size={15} />
                          拍照
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                          className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-sm font-medium flex items-center gap-1.5 hover:bg-stone-200 transition"
                        >
                          <Upload size={15} />
                          从相册选择
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border border-stone-100">
                    <img src={uploadedImage} alt="上传的餐食" className="w-full h-52 object-cover" />
                    <button
                      onClick={() => { setUploadedImage(undefined); setRecognitionResult(null); }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition backdrop-blur-sm"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {recognitionResult && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="text-emerald-600" size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-semibold text-emerald-800">识别结果</div>
                            <div className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                              置信度 {Number(recognitionResult.confidence * 100).toFixed(0)}%
                            </div>
                          </div>
                          <p className="text-sm text-emerald-700">{recognitionResult.description}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRecognize()}
                      disabled={recognizing}
                      className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-stone-50 transition disabled:opacity-50"
                    >
                      {recognizing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                      重新识别
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-stone-50 transition"
                    >
                      <Upload size={15} />
                      更换图片
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {mode === 'manual' && (
            <div className="p-6 space-y-4">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="搜索食物名称..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {FOOD_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? 'bg-emerald-500 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 -mr-1">
                {filteredFoods.length === 0 ? (
                  <div className="text-center py-8 text-stone-400 text-sm">
                    未找到匹配的食物
                  </div>
                ) : (
                  filteredFoods.map((food) => (
                    <div
                      key={food.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition cursor-pointer"
                      onClick={() => addFood(food)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-stone-800 text-sm">{food.name}</div>
                        <div className="text-xs text-stone-500 mt-0.5">
                          每{food.servingSize}({food.servingGrams}g) · {food.calories}千卡
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-stone-400">
                          蛋白{food.protein}g · 碳水{food.carbs}g · 脂肪{food.fat}g
                        </div>
                      </div>
                      <button className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition flex-shrink-0">
                        <Plus size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {selectedFoods.length > 0 && (
            <div className="px-6 pb-4">
              <div className="bg-gradient-to-br from-stone-50 to-stone-100/50 rounded-2xl p-5 border border-stone-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-stone-800">已选食物</h4>
                  <span className="text-xs text-stone-500">{selectedFoods.length} 项</span>
                </div>
                <div className="space-y-2 mb-4">
                  {selectedFoods.map((food) => (
                    <div key={food.foodId} className="bg-white rounded-xl p-3 border border-stone-100">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-stone-800 text-sm">{food.foodName}</div>
                          <div className="text-xs text-stone-500 mt-0.5">
                            {Math.round(food.calories * food.quantity)} 千卡 · 蛋白{(food.protein * food.quantity).toFixed(1)}g
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-stone-50 rounded-lg p-1">
                          <button
                            onClick={() => updateFoodQuantity(food.foodId, food.quantity - 0.5)}
                            className="w-7 h-7 rounded-md bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition"
                          >
                            <Minus size={13} />
                          </button>
                          <input
                            type="number"
                            value={food.quantity}
                            step={0.5}
                            min={0}
                            onChange={(e) => updateFoodQuantity(food.foodId, parseFloat(e.target.value) || 0)}
                            className="w-14 text-center text-sm font-medium bg-transparent focus:outline-none text-stone-800"
                          />
                          <button
                            onClick={() => updateFoodQuantity(food.foodId, food.quantity + 0.5)}
                            className="w-7 h-7 rounded-md bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFood(food.foodId)}
                          className="w-8 h-8 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2 text-center pt-4 border-t border-stone-200">
                  <div>
                    <div className="text-lg font-bold text-emerald-600">{Math.round(totalCalories)}</div>
                    <div className="text-xs text-stone-500">千卡</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-rose-500">{totalProtein.toFixed(1)}</div>
                    <div className="text-xs text-stone-500">蛋白(g)</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-amber-500">{totalCarbs.toFixed(1)}</div>
                    <div className="text-xs text-stone-500">碳水(g)</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-sky-500">{totalFat.toFixed(1)}</div>
                    <div className="text-xs text-stone-500">脂肪(g)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="px-6 pb-4">
            <label className="block">
              <span className="text-sm font-medium text-stone-700 mb-2 block">备注（可选）</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="记录用餐心情、地点等..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
              />
            </label>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/50 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-stone-600">
              合计热量
              <span className="text-2xl font-bold text-emerald-600 ml-2">{Math.round(totalCalories)}</span>
              <span className="text-xs text-stone-500 ml-1">千卡</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-stone-200 bg-white text-stone-600 text-sm font-medium hover:bg-stone-50 transition"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={selectedFoods.length === 0}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingRecord ? '保存修改' : '添加记录'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
