import { BMICategory, BMIResult, WeightRecord } from '@/types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const todayStr = (): string => formatDate(new Date());

export const daysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatDate(d);
};

export const parseDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const calculateBMI = (weight: number, heightCm: number): BMIResult => {
  const heightM = heightCm / 100;
  const bmi = Number((weight / (heightM * heightM)).toFixed(1));

  let category: BMICategory;
  let label: string;
  let color: string;
  let advice: BMIResult['advice'];

  if (bmi < 18.5) {
    category = 'underweight';
    label = '偏瘦';
    color = 'text-sky-500';
    advice = {
      title: '增加营养摄入',
      description: '您的体重偏轻，建议通过均衡饮食和适当力量训练增加健康体重。',
      tips: [
        '每日增加 300-500 千卡热量摄入',
        '多吃优质蛋白质：鸡蛋、鸡胸肉、鱼类、豆制品',
        '配合力量训练，增加肌肉量',
        '规律三餐，避免节食',
        '适量吃坚果、牛油果等健康脂肪',
      ],
    };
  } else if (bmi < 24) {
    category = 'normal';
    label = '正常';
    color = 'text-emerald-500';
    advice = {
      title: '继续保持健康生活',
      description: '恭喜！您的 BMI 在健康范围内，请继续保持良好的饮食和运动习惯。',
      tips: [
        '保持均衡饮食，多吃蔬菜水果',
        '每周 150 分钟中等强度有氧运动',
        '每天喝 1.5-2L 水',
        '保证 7-8 小时优质睡眠',
        '定期体检，关注身体变化',
      ],
    };
  } else if (bmi < 28) {
    category = 'overweight';
    label = '超重';
    color = 'text-amber-500';
    advice = {
      title: '适度减重计划',
      description: '您的体重略超健康范围，通过科学的饮食控制和运动可以回归健康。',
      tips: [
        '每日减少 300-500 千卡摄入',
        '控制碳水化合物，多吃粗粮',
        '每周 3-5 次有氧运动（跑步、游泳、骑行）',
        '减少含糖饮料和油炸食品',
        '循序渐进，目标每月减 2-3kg',
      ],
    };
  } else {
    category = 'obese';
    label = '肥胖';
    color = 'text-rose-500';
    advice = {
      title: '制定专业减重方案',
      description: '建议您在专业医生或营养师指导下制定系统的减重计划，关注心血管健康。',
      tips: [
        '咨询专业医生或营养师，制定个性化方案',
        '严格控制每日热量摄入，低脂低糖',
        '每天坚持 30-60 分钟中等强度运动',
        '定期监测血压、血糖、血脂',
        '保持积极心态，不要急于求成',
      ],
    };
  }

  return { bmi, category, label, color, advice };
};

export const getWeightStats = (records: WeightRecord[]) => {
  const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp);
  if (sorted.length === 0) {
    return { latest: null, first: null, change: 0, changePercent: 0, count: 0, min: null, max: null, avg: null };
  }
  const latest = sorted[sorted.length - 1];
  const first = sorted[0];
  const weights = sorted.map((r) => r.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const avg = Number((weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1));
  const change = Number((latest.weight - first.weight).toFixed(1));
  const changePercent = Number(((change / first.weight) * 100).toFixed(1));
  return { latest, first, change, changePercent, count: sorted.length, min, max, avg };
};

export const filterByRange = (records: WeightRecord[], range: '7d' | '30d' | '90d' | 'all'): WeightRecord[] => {
  if (range === 'all') return [...records].sort((a, b) => a.timestamp - b.timestamp);
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffTs = cutoff.getTime();
  return records.filter((r) => r.timestamp >= cutoffTs).sort((a, b) => a.timestamp - b.timestamp);
};

export const relativeTime = (ts: number): string => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}小时前`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}天前`;
  const date = new Date(ts);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};
