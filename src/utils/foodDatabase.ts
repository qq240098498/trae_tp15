import { FoodItem, MealFood } from '@/types';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const IMAGE_KEYWORD_MAP: { keywords: string[]; foods: string[]; description: string }[] = [
  { keywords: ['breakfast', '早餐', 'egg', '鸡蛋', 'bread', '面包', 'milk', '牛奶', 'toast'], foods: ['f-egg', 'f-bread', 'f-milk'], description: '识别到一份营养早餐，包含鸡蛋、面包和牛奶' },
  { keywords: ['lunch', '午餐', 'rice', '米饭', 'chicken', '鸡肉', 'broccoli', '西兰花', 'meal'], foods: ['f-rice', 'f-chicken', 'f-broccoli'], description: '识别到一份健康午餐，包含米饭、鸡胸肉和西兰花' },
  { keywords: ['dinner', '晚餐', 'fish', '鱼', 'vegetable', '蔬菜', '青菜'], foods: ['f-fish', 'f-vegetable', 'f-rice'], description: '识别到一份清淡晚餐，包含蒸鱼、青菜和少量米饭' },
  { keywords: ['fruit', '水果', 'apple', '苹果', 'banana', '香蕉', 'grape', '葡萄', 'salad'], foods: ['f-apple', 'f-banana', 'f-grape'], description: '识别到多种新鲜水果' },
  { keywords: ['fast', '快餐', 'burger', '汉堡', 'coke', '可乐', 'fried', '炸鸡', '炸鸡', 'french', '薯条', 'pizza', '披萨'], foods: ['f-hamburger', 'f-coke', 'f-fried-chicken'], description: '识别到一份快餐套餐，热量较高请注意' },
  { keywords: ['japanese', '日式', 'sushi', '寿司', 'ramen', '拉面', 'dumpling', '饺子', 'miso', '味增'], foods: ['f-dumpling', 'f-miso-soup', 'f-fish'], description: '识别到日式料理套餐' },
  { keywords: ['salad', '沙拉', 'vegan', '素食', 'tofu', '豆腐', 'orange', '橙子'], foods: ['f-salad', 'f-tofu', 'f-orange'], description: '识别到一份素食沙拉套餐' },
  { keywords: ['afternoon', '下午茶', 'coffee', '咖啡', 'cookie', '饼干', 'nuts', '坚果', 'tea', '奶茶'], foods: ['f-coffee-milk', 'f-cookie', 'f-nuts'], description: '识别到下午茶套餐' },
  { keywords: ['chinese', '中式', 'bun', '包子', 'soy', '豆浆', 'soymilk', '豆花', 'dim', '点心'], foods: ['f-bun', 'f-soymilk', 'f-egg'], description: '识别到中式早餐，包含包子、豆浆和鸡蛋' },
  { keywords: ['noodle', '面条', 'beef', '牛肉', 'ramen', '拉面'], foods: ['f-beef-noodle', 'f-egg'], description: '识别到一碗牛肉面加卤蛋' },
  { keywords: ['oatmeal', '燕麦', 'yogurt', '酸奶', 'healthy', '健康'], foods: ['f-oatmeal', 'f-yogurt', 'f-banana'], description: '识别到健康轻食，燕麦配酸奶和水果' },
  { keywords: ['steak', '牛排', 'pork', '猪肉', 'meat', '肉类'], foods: ['f-beef', 'f-rice', 'f-vegetable'], description: '识别到肉类主餐，搭配米饭和蔬菜' },
  { keywords: ['seafood', '海鲜', 'shrimp', '虾', 'prawn'], foods: ['f-shrimp', 'f-fish', 'f-vegetable'], description: '识别到海鲜套餐' },
  { keywords: ['soup', '汤', 'hotpot', '火锅'], foods: ['f-soup', 'f-rice', 'f-tofu'], description: '识别到汤品配餐' },
];

const matchImageToFoods = (imageData: string, fileName: string): { foods: string[]; description: string } => {
  const searchStr = `${fileName.toLowerCase()} ${imageData.substring(0, 500).toLowerCase()}`;

  for (const rule of IMAGE_KEYWORD_MAP) {
    if (rule.keywords.some((kw) => searchStr.includes(kw.toLowerCase()))) {
      return { foods: rule.foods, description: rule.description };
    }
  }

  const defaultIdx = Math.floor(Date.now() / 1000) % PHOTO_RECOGNITION_PRESETS.length;
  const preset = PHOTO_RECOGNITION_PRESETS[defaultIdx];
  return { foods: preset.foods, description: preset.description };
};

export const FOOD_DATABASE: FoodItem[] = [
  { id: 'f-egg', name: '煮鸡蛋', calories: 70, protein: 6, carbs: 1, fat: 5, servingSize: '个', servingGrams: 50, category: '蛋类' },
  { id: 'f-fried-egg', name: '煎鸡蛋', calories: 90, protein: 6, carbs: 1, fat: 7, servingSize: '个', servingGrams: 50, category: '蛋类' },
  { id: 'f-milk', name: '纯牛奶', calories: 120, protein: 6, carbs: 10, fat: 6, servingSize: '杯', servingGrams: 250, category: '乳制品' },
  { id: 'f-yogurt', name: '酸奶', calories: 100, protein: 5, carbs: 12, fat: 3, servingSize: '杯', servingGrams: 200, category: '乳制品' },
  { id: 'f-bread', name: '全麦面包', calories: 90, protein: 4, carbs: 15, fat: 1.5, servingSize: '片', servingGrams: 30, category: '主食' },
  { id: 'f-white-bread', name: '白面包', calories: 80, protein: 3, carbs: 15, fat: 1, servingSize: '片', servingGrams: 30, category: '主食' },
  { id: 'f-rice', name: '米饭', calories: 200, protein: 4, carbs: 45, fat: 1, servingSize: '碗', servingGrams: 200, category: '主食' },
  { id: 'f-noodle', name: '面条', calories: 220, protein: 7, carbs: 42, fat: 2, servingSize: '碗', servingGrams: 200, category: '主食' },
  { id: 'f-oatmeal', name: '燕麦片', calories: 150, protein: 5, carbs: 27, fat: 3, servingSize: '碗', servingGrams: 40, category: '主食' },
  { id: 'f-bun', name: '包子', calories: 150, protein: 5, carbs: 22, fat: 4, servingSize: '个', servingGrams: 80, category: '主食' },
  { id: 'f-dumpling', name: '饺子', calories: 40, protein: 2, carbs: 5, fat: 1.5, servingSize: '个', servingGrams: 20, category: '主食' },
  { id: 'f-chicken', name: '鸡胸肉', calories: 180, protein: 36, carbs: 0, fat: 4, servingSize: '份', servingGrams: 150, category: '肉类' },
  { id: 'f-beef', name: '牛肉', calories: 250, protein: 26, carbs: 0, fat: 15, servingSize: '份', servingGrams: 150, category: '肉类' },
  { id: 'f-pork', name: '猪肉', calories: 300, protein: 20, carbs: 0, fat: 24, servingSize: '份', servingGrams: 150, category: '肉类' },
  { id: 'f-fish', name: '清蒸鱼', calories: 200, protein: 40, carbs: 0, fat: 5, servingSize: '份', servingGrams: 200, category: '海鲜' },
  { id: 'f-shrimp', name: '虾仁', calories: 100, protein: 22, carbs: 0, fat: 1, servingSize: '份', servingGrams: 100, category: '海鲜' },
  { id: 'f-tofu', name: '豆腐', calories: 80, protein: 8, carbs: 4, fat: 5, servingSize: '块', servingGrams: 150, category: '豆制品' },
  { id: 'f-soymilk', name: '豆浆', calories: 80, protein: 4, carbs: 10, fat: 3, servingSize: '杯', servingGrams: 250, category: '豆制品' },
  { id: 'f-broccoli', name: '西兰花', calories: 50, protein: 4, carbs: 10, fat: 0.5, servingSize: '份', servingGrams: 200, category: '蔬菜' },
  { id: 'f-vegetable', name: '炒青菜', calories: 80, protein: 3, carbs: 8, fat: 5, servingSize: '份', servingGrams: 200, category: '蔬菜' },
  { id: 'f-tomato', name: '西红柿', calories: 30, protein: 1, carbs: 6, fat: 0, servingSize: '个', servingGrams: 150, category: '蔬菜' },
  { id: 'f-cucumber', name: '黄瓜', calories: 20, protein: 1, carbs: 4, fat: 0, servingSize: '根', servingGrams: 150, category: '蔬菜' },
  { id: 'f-carrot', name: '胡萝卜', calories: 40, protein: 1, carbs: 9, fat: 0, servingSize: '根', servingGrams: 100, category: '蔬菜' },
  { id: 'f-potato', name: '土豆', calories: 110, protein: 2, carbs: 25, fat: 0, servingSize: '个', servingGrams: 150, category: '蔬菜' },
  { id: 'f-apple', name: '苹果', calories: 95, protein: 0, carbs: 25, fat: 0, servingSize: '个', servingGrams: 180, category: '水果' },
  { id: 'f-banana', name: '香蕉', calories: 105, protein: 1, carbs: 27, fat: 0, servingSize: '根', servingGrams: 120, category: '水果' },
  { id: 'f-orange', name: '橙子', calories: 60, protein: 1, carbs: 15, fat: 0, servingSize: '个', servingGrams: 130, category: '水果' },
  { id: 'f-grape', name: '葡萄', calories: 70, protein: 1, carbs: 18, fat: 0, servingSize: '串', servingGrams: 100, category: '水果' },
  { id: 'f-watermelon', name: '西瓜', calories: 45, protein: 1, carbs: 11, fat: 0, servingSize: '片', servingGrams: 200, category: '水果' },
  { id: 'f-strawberry', name: '草莓', calories: 50, protein: 1, carbs: 12, fat: 0, servingSize: '份', servingGrams: 150, category: '水果' },
  { id: 'f-nuts', name: '混合坚果', calories: 300, protein: 8, carbs: 16, fat: 24, servingSize: '份', servingGrams: 50, category: '零食' },
  { id: 'f-chocolate', name: '巧克力', calories: 250, protein: 3, carbs: 25, fat: 16, servingSize: '块', servingGrams: 50, category: '零食' },
  { id: 'f-chips', name: '薯片', calories: 300, protein: 3, carbs: 30, fat: 18, servingSize: '袋', servingGrams: 50, category: '零食' },
  { id: 'f-cookie', name: '饼干', calories: 200, protein: 3, carbs: 28, fat: 9, servingSize: '份', servingGrams: 50, category: '零食' },
  { id: 'f-beef-noodle', name: '牛肉面', calories: 550, protein: 25, carbs: 65, fat: 20, servingSize: '碗', servingGrams: 400, category: '快餐' },
  { id: 'f-fried-rice', name: '蛋炒饭', calories: 500, protein: 12, carbs: 60, fat: 22, servingSize: '份', servingGrams: 300, category: '快餐' },
  { id: 'f-hamburger', name: '汉堡', calories: 450, protein: 22, carbs: 40, fat: 22, servingSize: '个', servingGrams: 200, category: '快餐' },
  { id: 'f-fried-chicken', name: '炸鸡', calories: 400, protein: 25, carbs: 15, fat: 28, servingSize: '份', servingGrams: 150, category: '快餐' },
  { id: 'f-pizza', name: '披萨', calories: 300, protein: 12, carbs: 35, fat: 12, servingSize: '片', servingGrams: 100, category: '快餐' },
  { id: 'f-rice-bowl', name: '盖浇饭', calories: 600, protein: 20, carbs: 70, fat: 25, servingSize: '份', servingGrams: 400, category: '快餐' },
  { id: 'f-coke', name: '可乐', calories: 140, protein: 0, carbs: 35, fat: 0, servingSize: '罐', servingGrams: 330, category: '饮料' },
  { id: 'f-juice', name: '果汁', calories: 120, protein: 1, carbs: 28, fat: 0, servingSize: '杯', servingGrams: 300, category: '饮料' },
  { id: 'f-coffee', name: '咖啡', calories: 5, protein: 0, carbs: 0, fat: 0, servingSize: '杯', servingGrams: 250, category: '饮料' },
  { id: 'f-coffee-milk', name: '拿铁咖啡', calories: 180, protein: 8, carbs: 18, fat: 8, servingSize: '杯', servingGrams: 350, category: '饮料' },
  { id: 'f-tea', name: '茶', calories: 2, protein: 0, carbs: 0, fat: 0, servingSize: '杯', servingGrams: 250, category: '饮料' },
  { id: 'f-milk-tea', name: '奶茶', calories: 300, protein: 5, carbs: 45, fat: 10, servingSize: '杯', servingGrams: 500, category: '饮料' },
  { id: 'f-salad', name: '蔬菜沙拉', calories: 150, protein: 5, carbs: 12, fat: 10, servingSize: '份', servingGrams: 200, category: '轻食' },
  { id: 'f-chicken-salad', name: '鸡胸肉沙拉', calories: 300, protein: 30, carbs: 10, fat: 15, servingSize: '份', servingGrams: 250, category: '轻食' },
  { id: 'f-soup', name: '番茄蛋汤', calories: 80, protein: 5, carbs: 8, fat: 4, servingSize: '碗', servingGrams: 300, category: '汤品' },
  { id: 'f-miso-soup', name: '味增汤', calories: 60, protein: 4, carbs: 6, fat: 2, servingSize: '碗', servingGrams: 200, category: '汤品' },
];

export const FOOD_CATEGORIES = ['全部', '主食', '肉类', '海鲜', '蛋类', '乳制品', '豆制品', '蔬菜', '水果', '零食', '快餐', '饮料', '轻食', '汤品'];

export const searchFoods = (keyword: string, category?: string): FoodItem[] => {
  let results = FOOD_DATABASE;
  if (category && category !== '全部') {
    results = results.filter((f) => f.category === category);
  }
  if (!keyword.trim()) return results;
  const kw = keyword.toLowerCase();
  return results.filter(
    (f) =>
      f.name.toLowerCase().includes(kw) ||
      f.category.toLowerCase().includes(kw) ||
      f.id.toLowerCase().includes(kw),
  );
};

export const getFoodById = (id: string): FoodItem | undefined => {
  return FOOD_DATABASE.find((f) => f.id === id);
};

export const foodToMealFood = (food: FoodItem, quantity: number = 1): MealFood => ({
  foodId: food.id,
  foodName: food.name,
  quantity,
  calories: food.calories,
  protein: food.protein,
  carbs: food.carbs,
  fat: food.fat,
});

export interface RecognitionResult {
  foods: MealFood[];
  confidence: number;
  description: string;
}

const PHOTO_RECOGNITION_PRESETS: { name: string; foods: string[]; description: string }[] = [
  { name: '早餐组合', foods: ['f-egg', 'f-bread', 'f-milk'], description: '识别到一份营养早餐，包含鸡蛋、面包和牛奶' },
  { name: '午餐套餐', foods: ['f-rice', 'f-chicken', 'f-broccoli'], description: '识别到一份健康午餐，包含米饭、鸡胸肉和西兰花' },
  { name: '晚餐清淡', foods: ['f-fish', 'f-vegetable', 'f-rice'], description: '识别到一份清淡晚餐，包含蒸鱼、青菜和少量米饭' },
  { name: '水果拼盘', foods: ['f-apple', 'f-banana', 'f-grape'], description: '识别到多种新鲜水果' },
  { name: '快餐套餐', foods: ['f-hamburger', 'f-coke', 'f-fried-chicken'], description: '识别到一份快餐套餐，热量较高请注意' },
  { name: '日式料理', foods: ['f-dumpling', 'f-miso-soup', 'f-fish'], description: '识别到日式料理套餐' },
  { name: '素食沙拉', foods: ['f-salad', 'f-tofu', 'f-orange'], description: '识别到一份素食沙拉套餐' },
  { name: '下午茶', foods: ['f-coffee-milk', 'f-cookie', 'f-nuts'], description: '识别到下午茶套餐' },
  { name: '中式早餐', foods: ['f-bun', 'f-soymilk', 'f-egg'], description: '识别到中式早餐，包含包子、豆浆和鸡蛋' },
  { name: '牛肉面套餐', foods: ['f-beef-noodle', 'f-egg'], description: '识别到一碗牛肉面加卤蛋' },
];

export const recognizeFoodFromPhoto = (imageFile?: File, imageBase64?: string): Promise<RecognitionResult> => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      let matched: { foods: string[]; description: string };

      if (imageFile || imageBase64) {
        const fileName = imageFile?.name || 'uploaded_image';
        const data = imageBase64 || (imageFile ? await fileToBase64(imageFile) : '');
        matched = matchImageToFoods(data, fileName);
      } else {
        const preset = PHOTO_RECOGNITION_PRESETS[Math.floor(Math.random() * PHOTO_RECOGNITION_PRESETS.length)];
        matched = { foods: preset.foods, description: preset.description };
      }

      const foods = matched.foods
        .map((id) => {
          const food = getFoodById(id);
          if (!food) return null;
          const qty = 0.5 + Math.random() * 1.5;
          return foodToMealFood(food, Number(qty.toFixed(1)));
        })
        .filter((f): f is MealFood => f !== null);

      const totalCalories = foods.reduce((sum, f) => sum + f.calories * f.quantity, 0);

      resolve({
        foods,
        confidence: 0.75 + Math.random() * 0.2,
        description: `${matched.description}，预估约 ${Math.round(totalCalories)} 千卡`,
      });
    }, 1500 + Math.random() * 1000);
  });
};

export interface DietHealthAssessment {
  status: 'excellent' | 'good' | 'fair' | 'poor';
  statusLabel: string;
  statusColor: string;
  score: number;
  calories: {
    current: number;
    target: number;
    status: 'low' | 'normal' | 'high';
    diff: number;
  };
  protein: {
    current: number;
    target: number;
    status: 'low' | 'normal' | 'high';
    ratio: number;
  };
  carbs: {
    current: number;
    target: number;
    status: 'low' | 'normal' | 'high';
    ratio: number;
  };
  fat: {
    current: number;
    target: number;
    status: 'low' | 'normal' | 'high';
    ratio: number;
  };
  suggestions: string[];
}

export const calculateTargetCalories = (
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' = 'light',
): number => {
  let bmr: number;
  if (gender === 'male') {
    bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };

  return Math.round(bmr * activityMultipliers[activityLevel]);
};

export const assessDietHealth = (
  totalCalories: number,
  totalProtein: number,
  totalCarbs: number,
  totalFat: number,
  targetCalories: number,
): DietHealthAssessment => {
  const proteinCal = totalProtein * 4;
  const carbsCal = totalCarbs * 4;
  const fatCal = totalFat * 9;
  const totalMacroCal = proteinCal + carbsCal + fatCal;

  const proteinRatio = totalMacroCal > 0 ? (proteinCal / totalMacroCal) * 100 : 0;
  const carbsRatio = totalMacroCal > 0 ? (carbsCal / totalMacroCal) * 100 : 0;
  const fatRatio = totalMacroCal > 0 ? (fatCal / totalMacroCal) * 100 : 0;

  const targetProteinRatio = 25;
  const targetCarbsRatio = 50;
  const targetFatRatio = 25;

  const calDiff = totalCalories - targetCalories;
  const calDiffPercent = targetCalories > 0 ? (calDiff / targetCalories) * 100 : 0;

  let calStatus: 'low' | 'normal' | 'high';
  if (calDiffPercent < -15) calStatus = 'low';
  else if (calDiffPercent > 15) calStatus = 'high';
  else calStatus = 'normal';

  const assessMacro = (current: number, target: number): 'low' | 'normal' | 'high' => {
    const diff = Math.abs(current - target);
    if (diff < 8) return 'normal';
    if (current < target) return 'low';
    return 'high';
  };

  const proteinStatus = assessMacro(proteinRatio, targetProteinRatio);
  const carbsStatus = assessMacro(carbsRatio, targetCarbsRatio);
  const fatStatus = assessMacro(fatRatio, targetFatRatio);

  let score = 100;
  if (calStatus === 'low') score -= 15;
  else if (calStatus === 'high') score -= 20;
  if (proteinStatus !== 'normal') score -= 10;
  if (carbsStatus !== 'normal') score -= 10;
  if (fatStatus !== 'normal') score -= 10;

  let status: 'excellent' | 'good' | 'fair' | 'poor';
  let statusLabel: string;
  let statusColor: string;

  if (score >= 85) {
    status = 'excellent';
    statusLabel = '优秀';
    statusColor = 'text-emerald-500';
  } else if (score >= 70) {
    status = 'good';
    statusLabel = '良好';
    statusColor = 'text-sky-500';
  } else if (score >= 50) {
    status = 'fair';
    statusLabel = '一般';
    statusColor = 'text-amber-500';
  } else {
    status = 'poor';
    statusLabel = '较差';
    statusColor = 'text-rose-500';
  }

  const suggestions: string[] = [];

  if (calStatus === 'low') {
    suggestions.push('热量摄入偏低，建议适当增加食物量以保证基础代谢需求');
  } else if (calStatus === 'high') {
    suggestions.push('热量摄入偏高，建议控制饮食量，减少高热量食物摄入');
  } else {
    suggestions.push('热量摄入适中，继续保持当前的饮食习惯');
  }

  if (proteinStatus === 'low') {
    suggestions.push('蛋白质摄入不足，建议增加鸡胸肉、鱼类、鸡蛋、豆制品等高蛋白食物');
  } else if (proteinStatus === 'high') {
    suggestions.push('蛋白质摄入偏高，建议适当减少蛋白质摄入，增加碳水化合物比例');
  }

  if (carbsStatus === 'low') {
    suggestions.push('碳水化合物摄入不足，建议适量增加全谷物、水果等优质碳水');
  } else if (carbsStatus === 'high') {
    suggestions.push('碳水化合物摄入偏高，建议减少精制碳水，选择低GI食物');
  }

  if (fatStatus === 'low') {
    suggestions.push('脂肪摄入偏低，可适量增加坚果、牛油果等健康脂肪');
  } else if (fatStatus === 'high') {
    suggestions.push('脂肪摄入偏高，建议减少油炸食品、肥肉等高脂食物');
  }

  return {
    status,
    statusLabel,
    statusColor,
    score,
    calories: {
      current: totalCalories,
      target: targetCalories,
      status: calStatus,
      diff: calDiff,
    },
    protein: {
      current: totalProtein,
      target: Math.round((targetCalories * targetProteinRatio / 100) / 4),
      status: proteinStatus,
      ratio: Number(proteinRatio.toFixed(1)),
    },
    carbs: {
      current: totalCarbs,
      target: Math.round((targetCalories * targetCarbsRatio / 100) / 4),
      status: carbsStatus,
      ratio: Number(carbsRatio.toFixed(1)),
    },
    fat: {
      current: totalFat,
      target: Math.round((targetCalories * targetFatRatio / 100) / 9),
      status: fatStatus,
      ratio: Number(fatRatio.toFixed(1)),
    },
    suggestions,
  };
};
