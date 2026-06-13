import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SocialPost, UserProfile, WeightRecord, Comment, Gym, PurchasedMembership, Booking, GymMembership, Equipment, CartItem, Order, Review, RefundRequest } from '@/types';
import { daysAgo, generateId, todayStr, formatDate } from '@/utils';

interface AppState {
  currentUserId: string;
  userProfile: UserProfile;
  weightRecords: WeightRecord[];
  socialPosts: SocialPost[];
  gyms: Gym[];
  purchasedMemberships: PurchasedMembership[];
  bookings: Booking[];

  addWeightRecord: (data: Omit<WeightRecord, 'id' | 'timestamp'>) => void;
  updateWeightRecord: (id: string, data: Partial<Omit<WeightRecord, 'id' | 'timestamp'>>) => void;
  deleteWeightRecord: (id: string) => void;

  updateUserProfile: (data: Partial<UserProfile>) => void;

  addSocialPost: (data: Omit<SocialPost, 'id' | 'timestamp' | 'likes' | 'likedBy' | 'comments'>) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  deletePost: (postId: string) => void;

  purchaseMembership: (gymId: string, membership: GymMembership) => void;
  cancelMembership: (membershipId: string) => void;
  addBooking: (data: Omit<Booking, 'id' | 'createdAt' | 'status'>) => void;
  cancelBooking: (bookingId: string) => void;
  completeBooking: (bookingId: string) => void;

  equipment: Equipment[];
  cart: CartItem[];
  orders: Order[];
  reviews: Review[];
  refundRequests: RefundRequest[];

  addEquipment: (data: Omit<Equipment, 'id'>) => void;
  updateEquipment: (id: string, data: Partial<Omit<Equipment, 'id'>>) => void;
  deleteEquipment: (id: string) => void;

  addToCart: (equipmentId: string, quantity?: number) => void;
  removeFromCart: (equipmentId: string) => void;
  updateCartQuantity: (equipmentId: string, quantity: number) => void;
  clearCart: () => void;

  createOrder: (address?: string, phone?: string, receiver?: string) => void;
  cancelOrder: (orderId: string) => void;
  completeOrder: (orderId: string) => void;

  addReview: (orderId: string, equipmentId: string, rating: number, content: string, images?: string[]) => void;
  requestRefund: (orderId: string, reason: string, description: string) => void;
  approveRefund: (refundId: string) => void;
  rejectRefund: (refundId: string) => void;
  completeRefund: (refundId: string) => void;

  resetToMock: () => void;
}

const MOCK_USER: UserProfile = {
  id: 'user-001',
  name: '小明同学',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming&backgroundColor=b6e3f4',
  height: 172,
  gender: 'male',
  age: 26,
  targetWeight: 68,
};

const INITIAL_RECORDS: WeightRecord[] = [
  { id: generateId(), weight: 78.5, date: daysAgo(45), note: '初始记录，开始减肥！', timestamp: Date.now() - 45 * 86400000 + 28800000 },
  { id: generateId(), weight: 77.8, date: daysAgo(42), timestamp: Date.now() - 42 * 86400000 + 28800000 },
  { id: generateId(), weight: 77.2, date: daysAgo(39), timestamp: Date.now() - 39 * 86400000 + 28800000 },
  { id: generateId(), weight: 76.5, date: daysAgo(35), note: '这周跑步5次', timestamp: Date.now() - 35 * 86400000 + 28800000 },
  { id: generateId(), weight: 76.0, date: daysAgo(32), timestamp: Date.now() - 32 * 86400000 + 28800000 },
  { id: generateId(), weight: 75.3, date: daysAgo(28), timestamp: Date.now() - 28 * 86400000 + 28800000 },
  { id: generateId(), weight: 74.8, date: daysAgo(24), timestamp: Date.now() - 24 * 86400000 + 28800000 },
  { id: generateId(), weight: 74.2, date: daysAgo(21), note: '控制饮食效果不错', timestamp: Date.now() - 21 * 86400000 + 28800000 },
  { id: generateId(), weight: 73.6, date: daysAgo(17), timestamp: Date.now() - 17 * 86400000 + 28800000 },
  { id: generateId(), weight: 73.9, date: daysAgo(14), note: '周末聚餐反弹了', timestamp: Date.now() - 14 * 86400000 + 28800000 },
  { id: generateId(), weight: 73.1, date: daysAgo(10), timestamp: Date.now() - 10 * 86400000 + 28800000 },
  { id: generateId(), weight: 72.5, date: daysAgo(7), timestamp: Date.now() - 7 * 86400000 + 28800000 },
  { id: generateId(), weight: 72.0, date: daysAgo(4), note: '加油！目标68kg', timestamp: Date.now() - 4 * 86400000 + 28800000 },
  { id: generateId(), weight: 71.3, date: daysAgo(1), timestamp: Date.now() - 86400000 + 28800000 },
  { id: generateId(), weight: 70.8, date: todayStr(), note: '早晨空腹称重', timestamp: Date.now() },
];

const makeComment = (userName: string, avatarSeed: string, content: string, daysAgoN: number): Comment => ({
  id: generateId(),
  userId: `u-${avatarSeed}`,
  userName,
  userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=ffd5dc`,
  content,
  timestamp: Date.now() - daysAgoN * 86400000 - Math.random() * 3600000,
});

const makePost = (
  userIdx: number,
  content: string,
  extra: Partial<SocialPost>,
  daysAgoN: number,
  comments: Comment[] = [],
): SocialPost => {
  const seeds = ['xiaohong', 'daxiong', 'meimei', 'laowang', 'tingting', 'jianjian'];
  const names = ['小红', '大雄', '美美', '老王', '婷婷', '健健'];
  const userName = names[userIdx] || '匿名';
  const seed = seeds[userIdx] || 'user';
  return {
    id: generateId(),
    userId: `u-${seed}`,
    userName,
    userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=c0aede`,
    content,
    date: daysAgo(daysAgoN),
    images: [],
    likes: Math.floor(Math.random() * 50) + 3,
    likedBy: [],
    comments,
    timestamp: Date.now() - daysAgoN * 86400000 - 3600000 * 4,
    ...extra,
  };
};

const INITIAL_POSTS: SocialPost[] = [
  makePost(
    0,
    '今天体重终于下70kg了！坚持了2个月，每天5公里跑步+控制饮食，真的很有成就感！给正在减肥的小伙伴们加油💪',
    { weightChange: -8.5, currentWeight: 69.8, images: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop'] },
    1,
    [
      makeComment('大雄', 'daxiong', '太棒了！向你学习！🔥', 0.5),
      makeComment('美美', 'meimei', '下一个目标是什么？', 0.2),
    ],
  ),
  makePost(
    1,
    '分享我的三餐搭配：早餐燕麦+牛奶，午餐鸡胸肉沙拉，晚餐粗粮+蔬菜。三个月瘦了12斤，体脂率下降5%，大家也要注意营养均衡哦～',
    { images: ['https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop'] },
    3,
    [makeComment('婷婷', 'tingting', '请问沙拉用什么酱汁呀？', 2)],
  ),
  makePost(
    2,
    '今日打卡：晨跑6公里，消耗约400千卡。最近加入了力量训练，感觉肌肉线条越来越明显了！🏃‍♀️💪',
    { weightChange: -0.6, currentWeight: 55.2, images: ['https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop'] },
    5,
    [],
  ),
  makePost(
    3,
    '减肥半年纪念一下~ 从180斤减到现在140斤，虽然还有很长的路，但至少迈开了第一步！感谢这个平台记录我的每一步变化📊',
    { weightChange: -40, currentWeight: 70, images: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop'] },
    9,
    [
      makeComment('健健', 'jianjian', '40斤我的天，太强了！', 8),
      makeComment('小红', 'xiaohong', '求详细攻略！！', 7),
      makeComment('美美', 'meimei', '恭喜恭喜！🎉', 6),
    ],
  ),
  makePost(4, '周末和朋友去爬山了，虽然体重没怎么变，但整个人精神状态好多了！健康生活，快乐减重~', { images: ['https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop'] }, 14, []),
];

const INITIAL_GYMS: Gym[] = [
  {
    id: 'gym-001',
    name: '乐动健身·朝阳店',
    address: '朝阳区建国路88号SOHO现代城B1层',
    distance: 0.8,
    rating: 4.8,
    reviewCount: 326,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern+gym+interior+with+equipment+and+natural+lighting+bright+clean+fitness+center&image_size=landscape_16_9',
    openTime: '06:00',
    closeTime: '23:00',
    facilities: ['力量区', '有氧区', '瑜伽室', '动感单车', '私教区', '淋浴间', '更衣室'],
    lat: 39.908,
    lng: 116.460,
    memberships: [
      { type: 'daily', name: '日卡', price: 39, days: 1, description: '单次入场体验', features: ['全场馆通练', '淋浴更衣', '免费储物'] },
      { type: 'weekly', name: '周卡', price: 149, days: 7, description: '一周畅练', features: ['全场馆通练', '淋浴更衣', '免费储物', '团课体验2次'] },
      { type: 'monthly', name: '月卡', price: 399, days: 30, description: '月度畅练', features: ['全场馆通练', '淋浴更衣', '免费储物', '团课无限次', '体测1次'] },
    ],
  },
  {
    id: 'gym-002',
    name: '超级猩猩·国贸店',
    address: '朝阳区国贸商城区域3层',
    distance: 1.5,
    rating: 4.6,
    reviewCount: 218,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=stylish+fitness+studio+with+group+class+area+colorful+lighting+modern+gym&image_size=landscape_16_9',
    openTime: '07:00',
    closeTime: '22:00',
    facilities: ['团课区', '瑜伽室', '动感单车', '淋浴间', '休息区'],
    lat: 39.909,
    lng: 116.459,
    memberships: [
      { type: 'daily', name: '日卡', price: 49, days: 1, description: '单次团课体验', features: ['团课1节', '淋浴更衣'] },
      { type: 'weekly', name: '周卡', price: 179, days: 7, description: '一周团课畅享', features: ['团课无限次', '淋浴更衣', '免费储物'] },
      { type: 'monthly', name: '月卡', price: 459, days: 30, description: '月度团课畅享', features: ['团课无限次', '淋浴更衣', '免费储物', '体测1次', '营养咨询'] },
    ],
  },
  {
    id: 'gym-003',
    name: '一兆韦德·望京店',
    address: '朝阳区望京SOHO塔2负1层',
    distance: 2.3,
    rating: 4.5,
    reviewCount: 189,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=large+fitness+gym+with+swimming+pool+and+weight+training+area+luxury+health+club&image_size=landscape_16_9',
    openTime: '06:00',
    closeTime: '22:30',
    facilities: ['力量区', '有氧区', '游泳池', '瑜伽室', '拳击区', '淋浴间', '桑拿房', '更衣室'],
    lat: 39.992,
    lng: 116.477,
    memberships: [
      { type: 'daily', name: '日卡', price: 59, days: 1, description: '含泳池体验', features: ['全场馆通练', '泳池使用', '淋浴更衣', '桑拿体验'] },
      { type: 'weekly', name: '周卡', price: 199, days: 7, description: '一周畅练含泳池', features: ['全场馆通练', '泳池无限次', '淋浴更衣', '桑拿体验'] },
      { type: 'monthly', name: '月卡', price: 529, days: 30, description: '尊享月卡', features: ['全场馆通练', '泳池无限次', '淋浴更衣', '桑拿无限次', '私教体验1次', '体测1次'] },
    ],
  },
  {
    id: 'gym-004',
    name: 'Keep健身·三里屯店',
    address: '朝阳区三里屯太古里南区B1',
    distance: 3.1,
    rating: 4.7,
    reviewCount: 412,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=trendy+smart+gym+with+digital+equipment+and+neon+lights+modern+workout+space&image_size=landscape_16_9',
    openTime: '06:30',
    closeTime: '23:30',
    facilities: ['智能器械区', '有氧区', '瑜伽室', '动感单车', '私教区', '淋浴间', '智能更衣柜'],
    lat: 39.934,
    lng: 116.454,
    memberships: [
      { type: 'daily', name: '日卡', price: 45, days: 1, description: '智能健身体验', features: ['全场馆通练', '智能器械', '淋浴更衣'] },
      { type: 'weekly', name: '周卡', price: 169, days: 7, description: '智能健身周卡', features: ['全场馆通练', '智能器械', '淋浴更衣', 'AI训练计划'] },
      { type: 'monthly', name: '月卡', price: 429, days: 30, description: '智能健身月卡', features: ['全场馆通练', '智能器械', '淋浴更衣', 'AI训练计划', '数据报告', '体测2次'] },
    ],
  },
  {
    id: 'gym-005',
    name: '威尔仕·中关村店',
    address: '海淀区中关村大街15号中关村广场B1',
    distance: 5.2,
    rating: 4.4,
    reviewCount: 156,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spacious+gym+with+basketball+court+and+weight+room+athletic+facility&image_size=landscape_16_9',
    openTime: '06:00',
    closeTime: '22:00',
    facilities: ['力量区', '有氧区', '篮球场', '瑜伽室', '拳击区', '淋浴间', '更衣室', '停车场'],
    lat: 39.981,
    lng: 116.311,
    memberships: [
      { type: 'daily', name: '日卡', price: 35, days: 1, description: '经济实惠', features: ['全场馆通练', '淋浴更衣'] },
      { type: 'weekly', name: '周卡', price: 129, days: 7, description: '性价比之选', features: ['全场馆通练', '淋浴更衣', '免费停车'] },
      { type: 'monthly', name: '月卡', price: 349, days: 30, description: '超值月卡', features: ['全场馆通练', '淋浴更衣', '免费停车', '团课4次', '体测1次'] },
    ],
  },
];

const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: 'eq-001',
    name: '智能跑步机 Pro',
    category: '有氧器械',
    price: 2999,
    originalPrice: 3999,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern+treadmill+smart+fitness+equipment+home+gym+cardio+machine&image_size=square',
    description: '高端智能跑步机，支持心率监测、多种训练模式、静音设计',
    features: ['10.1寸高清触控屏', '18档电动坡度调节', '静音直流马达', '心率监测', '12种训练模式', '可折叠收纳'],
    stock: 50,
    rating: 4.8,
    reviewCount: 128,
    sales: 356,
  },
  {
    id: 'eq-002',
    name: '动感单车 S1',
    category: '有氧器械',
    price: 1599,
    originalPrice: 1999,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spin+bike+stationary+cycling+indoor+exercise+bike+fitness+equipment&image_size=square',
    description: '静音磁控动感单车，模拟真实骑行体验',
    features: ['磁控阻力系统', '静音皮带传动', '可调节座椅把手', '心率把手', 'LCD显示屏', '带滚轮移动'],
    stock: 80,
    rating: 4.6,
    reviewCount: 256,
    sales: 892,
  },
  {
    id: 'eq-003',
    name: '综合训练器',
    category: '力量器械',
    price: 5999,
    originalPrice: 7999,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=multi+function+home+gym+strength+training+equipment+weight+machine&image_size=square',
    description: '家用综合力量训练器，一机多用全身锻炼',
    features: ['高低拉力器', '蝴蝶机', '腿部训练', '臂力训练', '重锤式设计', '承重200kg'],
    stock: 20,
    rating: 4.7,
    reviewCount: 64,
    sales: 128,
  },
  {
    id: 'eq-004',
    name: '哑铃套装 20kg',
    category: '自由重量',
    price: 399,
    originalPrice: 499,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=adjustable+dumbbell+set+weight+training+fitness+equipment+home+gym&image_size=square',
    description: '可调节哑铃套装，适合家用力量训练',
    features: ['重量可调节', '包胶防滑', '安全锁扣', '配套支架', '一对装'],
    stock: 200,
    rating: 4.9,
    reviewCount: 512,
    sales: 2340,
  },
  {
    id: 'eq-005',
    name: '瑜伽垫加厚版',
    category: '瑜伽拉伸',
    price: 129,
    originalPrice: 169,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga+mat+premium+thick+exercise+mat+fitness+accessories&image_size=square',
    description: '加厚防滑瑜伽垫，环保TPE材质',
    features: ['15mm加厚', 'TPE环保材质', '双面防滑', '送绑带网包', '多色可选'],
    stock: 500,
    rating: 4.8,
    reviewCount: 1024,
    sales: 5680,
  },
  {
    id: 'eq-006',
    name: '弹力带套装',
    category: '瑜伽拉伸',
    price: 89,
    originalPrice: 129,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=resistance+bands+set+fitness+elastic+bands+workout+equipment&image_size=square',
    description: '5条不同阻力级别弹力带，全身训练',
    features: ['5条不同阻力', '天然乳胶材质', '配门锚把手', '便携收纳袋', '训练指南'],
    stock: 300,
    rating: 4.7,
    reviewCount: 768,
    sales: 3200,
  },
  {
    id: 'eq-007',
    name: '乳清蛋白粉 5磅',
    category: '补剂营养',
    price: 299,
    originalPrice: 359,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=whey+protein+powder+supplement+fitness+nutrition+jar&image_size=square',
    description: '进口乳清蛋白粉，增肌健肌必备',
    features: ['5磅大容量', '80%蛋白含量', '易吸收', '多种口味', '增肌配方'],
    stock: 150,
    rating: 4.6,
    reviewCount: 856,
    sales: 2100,
  },
  {
    id: 'eq-008',
    name: '健身手套',
    category: '健身配件',
    price: 59,
    originalPrice: 79,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=weightlifting+gloves+fitness+workout+gloves+gym+accessories&image_size=square',
    description: '防滑透气健身手套，保护双手',
    features: ['透气网布', '硅胶防滑', '护腕设计', '多尺码可选', '耐磨耐用'],
    stock: 400,
    rating: 4.5,
    reviewCount: 623,
    sales: 1850,
  },
  {
    id: 'eq-009',
    name: '椭圆机 E3',
    category: '有氧器械',
    price: 2499,
    originalPrice: 3299,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elliptical+machine+cross+trainer+cardio+fitness+equipment+home+gym&image_size=square',
    description: '家用椭圆机，低冲击全身有氧训练',
    features: ['磁控静音系统', '16档阻力调节', '心率监测', 'LCD显示屏', '带滚轮移动'],
    stock: 35,
    rating: 4.7,
    reviewCount: 189,
    sales: 445,
  },
  {
    id: 'eq-010',
    name: '壶铃套装',
    category: '自由重量',
    price: 199,
    originalPrice: 259,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=kettlebell+set+weight+training+fitness+equipment+colorful+kettlebells&image_size=square',
    description: '彩色包胶壶铃，功能性训练必备',
    features: ['4kg/8kg/12kg三件套', '环保包胶', '平底设计', '宽握把设计', '多色标识'],
    stock: 120,
    rating: 4.8,
    reviewCount: 312,
    sales: 780,
  },
  {
    id: 'eq-011',
    name: '泡沫轴',
    category: '瑜伽拉伸',
    price: 69,
    originalPrice: 89,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=foam+roller+massage+roller+muscle+recovery+yoga+fitness+accessory&image_size=square',
    description: '高密度泡沫轴，肌肉放松筋膜按摩',
    features: ['高密度EVA材质', '凹凸纹理', '90cm长度', '轻便耐用', '多色可选'],
    stock: 350,
    rating: 4.6,
    reviewCount: 456,
    sales: 1560,
  },
  {
    id: 'eq-012',
    name: '运动护腰带',
    category: '健身配件',
    price: 89,
    originalPrice: 119,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=weightlifting+belt+gym+belt+fitness+waist+support+accessory&image_size=square',
    description: '举重深蹲护腰带，保护腰部',
    features: ['牛皮材质', '双排扣设计', '强力支撑', '透气舒适', '多尺码可选'],
    stock: 180,
    rating: 4.7,
    reviewCount: 289,
    sales: 920,
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUserId: MOCK_USER.id,
      userProfile: MOCK_USER,
      weightRecords: INITIAL_RECORDS,
      socialPosts: INITIAL_POSTS,
      gyms: INITIAL_GYMS,
      purchasedMemberships: [],
      bookings: [],
      equipment: INITIAL_EQUIPMENT,
      cart: [],
      orders: [],
      reviews: [],
      refundRequests: [],

      addWeightRecord: (data) =>
        set((s) => ({
          weightRecords: [
            ...s.weightRecords,
            { ...data, id: generateId(), timestamp: new Date(data.date).getTime() },
          ].sort((a, b) => a.timestamp - b.timestamp),
        })),

      updateWeightRecord: (id, data) =>
        set((s) => ({
          weightRecords: s.weightRecords.map((r) =>
            r.id === id ? { ...r, ...data, timestamp: data.date ? new Date(data.date).getTime() : r.timestamp } : r,
          ),
        })),

      deleteWeightRecord: (id) =>
        set((s) => ({ weightRecords: s.weightRecords.filter((r) => r.id !== id) })),

      updateUserProfile: (data) =>
        set((s) => ({ userProfile: { ...s.userProfile, ...data } })),

      addSocialPost: (data) =>
        set((s) => ({
          socialPosts: [
            { ...data, id: generateId(), timestamp: Date.now(), likes: 0, likedBy: [], comments: [] },
            ...s.socialPosts,
          ],
        })),

      toggleLike: (postId) =>
        set((s) => ({
          socialPosts: s.socialPosts.map((p) => {
            if (p.id !== postId) return p;
            const uid = get().currentUserId;
            const liked = p.likedBy.includes(uid);
            return {
              ...p,
              likes: liked ? p.likes - 1 : p.likes + 1,
              likedBy: liked ? p.likedBy.filter((u) => u !== uid) : [...p.likedBy, uid],
            };
          }),
        })),

      addComment: (postId, content) => {
        const user = get().userProfile;
        const comment: Comment = {
          id: generateId(),
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          content,
          timestamp: Date.now(),
        };
        set((s) => ({
          socialPosts: s.socialPosts.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, comment] } : p)),
        }));
      },

      deletePost: (postId) =>
        set((s) => ({ socialPosts: s.socialPosts.filter((p) => p.id !== postId) })),

      purchaseMembership: (gymId, membership) => {
        const gym = get().gyms.find((g) => g.id === gymId);
        if (!gym) return;
        const now = Date.now();
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + membership.days);
        const remainingDays = membership.days;
        const pm: PurchasedMembership = {
          id: generateId(),
          gymId,
          gymName: gym.name,
          type: membership.type,
          name: membership.name,
          price: membership.price,
          purchasedAt: now,
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          remainingDays,
        };
        set((s) => ({ purchasedMemberships: [...s.purchasedMemberships, pm] }));
      },

      cancelMembership: (membershipId) =>
        set((s) => ({
          purchasedMemberships: s.purchasedMemberships.filter((m) => m.id !== membershipId),
        })),

      addBooking: (data) => {
        const booking: Booking = {
          ...data,
          id: generateId(),
          createdAt: Date.now(),
          status: 'confirmed',
        };
        set((s) => ({ bookings: [...s.bookings, booking] }));
      },

      cancelBooking: (bookingId) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: 'cancelled' as const } : b,
          ),
        })),

      completeBooking: (bookingId) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: 'completed' as const } : b,
          ),
        })),

      addEquipment: (data) =>
        set((s) => ({
          equipment: [...s.equipment, { ...data, id: generateId() }],
        })),

      updateEquipment: (id, data) =>
        set((s) => ({
          equipment: s.equipment.map((e) =>
            e.id === id ? { ...e, ...data } : e,
          ),
        })),

      deleteEquipment: (id) =>
        set((s) => ({
          equipment: s.equipment.filter((e) => e.id !== id),
          cart: s.cart.filter((c) => c.equipmentId !== id),
        })),

      addToCart: (equipmentId, quantity = 1) =>
        set((s) => {
          const existing = s.cart.find((c) => c.equipmentId === equipmentId);
          if (existing) {
            return {
              cart: s.cart.map((c) =>
                c.equipmentId === equipmentId
                  ? { ...c, quantity: c.quantity + quantity }
                  : c,
              ),
            };
          }
          return {
            cart: [...s.cart, { equipmentId, quantity }],
          };
        }),

      removeFromCart: (equipmentId) =>
        set((s) => ({
          cart: s.cart.filter((c) => c.equipmentId !== equipmentId),
        })),

      updateCartQuantity: (equipmentId, quantity) =>
        set((s) => {
          if (quantity <= 0) {
            return {
              cart: s.cart.filter((c) => c.equipmentId !== equipmentId),
            };
          }
          return {
            cart: s.cart.map((c) =>
              c.equipmentId === equipmentId ? { ...c, quantity } : c,
            ),
          };
        }),

      clearCart: () => set({ cart: [] }),

      createOrder: (address, phone, receiver) => {
        const { cart, equipment } = get();
        if (cart.length === 0) return;

        const orderItems = cart
          .map((c) => {
            const eq = equipment.find((e) => e.id === c.equipmentId);
            if (!eq) return null;
            return { equipment: eq, quantity: c.quantity };
          })
          .filter((item): item is { equipment: Equipment; quantity: number } => item !== null);

        const totalPrice = orderItems.reduce(
          (sum, item) => sum + item.equipment.price * item.quantity,
          0,
        );

        const order: Order = {
          id: generateId(),
          items: orderItems,
          totalPrice,
          status: 'paid',
          createdAt: Date.now(),
          address,
          phone,
          receiver,
        };

        set((s) => ({
          orders: [order, ...s.orders],
          cart: [],
        }));
      },

      cancelOrder: (orderId) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'cancelled' as const } : o,
          ),
        })),

      completeOrder: (orderId) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'completed' as const } : o,
          ),
        })),

      addReview: (orderId, equipmentId, rating, content, images = []) => {
        const user = get().userProfile;
        const review: Review = {
          id: generateId(),
          orderId,
          equipmentId,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          rating,
          content,
          images,
          timestamp: Date.now(),
        };
        set((s) => ({
          reviews: [...s.reviews, review],
          orders: s.orders.map((o) =>
            o.id === orderId
              ? { ...o, reviewIds: [...(o.reviewIds || []), review.id] }
              : o,
          ),
          equipment: s.equipment.map((e) => {
            if (e.id !== equipmentId) return e;
            const allReviews = [...s.reviews, review].filter((r) => r.equipmentId === equipmentId);
            const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
            return { ...e, rating: Math.round(avg * 10) / 10, reviewCount: e.reviewCount + 1 };
          }),
        }));
      },

      requestRefund: (orderId, reason, description) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return;
        const refund: RefundRequest = {
          id: generateId(),
          orderId,
          reason,
          description,
          status: 'pending',
          refundAmount: order.totalPrice,
          createdAt: Date.now(),
        };
        set((s) => ({
          refundRequests: [...s.refundRequests, refund],
          orders: s.orders.map((o) =>
            o.id === orderId ? { ...o, refundId: refund.id } : o,
          ),
        }));
      },

      approveRefund: (refundId) =>
        set((s) => ({
          refundRequests: s.refundRequests.map((r) =>
            r.id === refundId ? { ...r, status: 'approved' as const, processedAt: Date.now() } : r,
          ),
        })),

      rejectRefund: (refundId) =>
        set((s) => ({
          refundRequests: s.refundRequests.map((r) =>
            r.id === refundId ? { ...r, status: 'rejected' as const, processedAt: Date.now() } : r,
          ),
        })),

      completeRefund: (refundId) => {
        const refund = get().refundRequests.find((r) => r.id === refundId);
        if (!refund) return;
        set((s) => ({
          refundRequests: s.refundRequests.map((r) =>
            r.id === refundId ? { ...r, status: 'completed' as const, processedAt: Date.now() } : r,
          ),
          orders: s.orders.map((o) =>
            o.id === refund.orderId ? { ...o, status: 'cancelled' as const } : o,
          ),
        }));
      },

      resetToMock: () =>
        set({
          userProfile: MOCK_USER,
          weightRecords: INITIAL_RECORDS,
          socialPosts: INITIAL_POSTS,
          gyms: INITIAL_GYMS,
          purchasedMemberships: [],
          bookings: [],
          equipment: INITIAL_EQUIPMENT,
          cart: [],
          orders: [],
          reviews: [],
          refundRequests: [],
        }),
    }),
    { name: 'weight-app-v1' },
  ),
);
