import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SocialPost, UserProfile, WeightRecord, Comment } from '@/types';
import { daysAgo, generateId, todayStr } from '@/utils';

interface AppState {
  currentUserId: string;
  userProfile: UserProfile;
  weightRecords: WeightRecord[];
  socialPosts: SocialPost[];

  addWeightRecord: (data: Omit<WeightRecord, 'id' | 'timestamp'>) => void;
  updateWeightRecord: (id: string, data: Partial<Omit<WeightRecord, 'id' | 'timestamp'>>) => void;
  deleteWeightRecord: (id: string) => void;

  updateUserProfile: (data: Partial<UserProfile>) => void;

  addSocialPost: (data: Omit<SocialPost, 'id' | 'timestamp' | 'likes' | 'likedBy' | 'comments'>) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  deletePost: (postId: string) => void;

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

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUserId: MOCK_USER.id,
      userProfile: MOCK_USER,
      weightRecords: INITIAL_RECORDS,
      socialPosts: INITIAL_POSTS,

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

      resetToMock: () =>
        set({
          userProfile: MOCK_USER,
          weightRecords: INITIAL_RECORDS,
          socialPosts: INITIAL_POSTS,
        }),
    }),
    { name: 'weight-app-v1' },
  ),
);
