import { useState } from 'react';
import {
  Camera,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  Send,
  Share2,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
  ImagePlus,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { SocialPost } from '@/types';
import { getWeightStats, relativeTime, todayStr } from '@/utils';

export default function SocialFeedPage() {
  const {
    socialPosts,
    userProfile,
    currentUserId,
    weightRecords,
    addSocialPost,
    toggleLike,
    addComment,
    deletePost,
  } = useAppStore();

  const [content, setContent] = useState('');
  const [shareWeight, setShareWeight] = useState(false);
  const [activeComments, setActiveComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [publishing, setPublishing] = useState(false);

  const stats = getWeightStats(weightRecords);
  const weightChange = stats.first && stats.latest ? Number((stats.latest.weight - stats.first.weight).toFixed(1)) : 0;

  const handlePublish = () => {
    if (!content.trim() && !shareWeight) return;
    setPublishing(true);
    setTimeout(() => {
      addSocialPost({
        userId: currentUserId,
        userName: userProfile.name,
        userAvatar: userProfile.avatar,
        content: content.trim(),
        date: todayStr(),
        images: [],
        ...(shareWeight && stats.latest
          ? { weightChange, currentWeight: stats.latest.weight }
          : {}),
      });
      setContent('');
      setShareWeight(false);
      setPublishing(false);
    }, 300);
  };

  const submitComment = (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    addComment(postId, text);
    setCommentText({ ...commentText, [postId]: '' });
  };

  const sortedPosts = [...socialPosts].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      <div className="lg:col-span-2 space-y-5">
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
          <div className="flex gap-4">
            <img src={userProfile.avatar} alt="" className="w-12 h-12 rounded-2xl bg-stone-100 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="分享你的减重心得、饮食记录或运动日常..."
                rows={3}
                className="w-full resize-none px-4 py-3 rounded-2xl bg-stone-50 border border-transparent focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm text-stone-700 placeholder:text-stone-400 transition"
              />
              {shareWeight && stats.latest && (
                <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center">
                      <Sparkles className="text-emerald-600" size={16} />
                    </div>
                    <div>
                      <div className="text-xs text-stone-500">同步体重变化</div>
                      <div className="text-sm font-bold text-stone-800 flex items-center gap-2">
                        当前 {stats.latest.weight}kg
                        <span className={weightChange <= 0 ? 'text-emerald-600' : 'text-amber-600'}>
                          {weightChange === 0 ? '—' : weightChange < 0 ? (
                            <span className="inline-flex items-center gap-0.5">
                              <TrendingDown size={13} />{weightChange}kg
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5">
                              <TrendingUp size={13} />+{weightChange}kg
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setShareWeight(false)} className="w-7 h-7 rounded-lg hover:bg-white/70 text-stone-400 flex items-center justify-center">
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <ToolButton icon={ImagePlus} label="图片" disabled />
                  <ToolButton
                    icon={Sparkles}
                    label={shareWeight ? '已添加体重' : '同步体重'}
                    active={shareWeight}
                    onClick={() => setShareWeight(!shareWeight)}
                    disabled={!stats.latest}
                  />
                  <ToolButton icon={Camera} label="打卡" disabled />
                </div>
                <button
                  onClick={handlePublish}
                  disabled={publishing || (!content.trim() && !shareWeight)}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {publishing ? '发布中...' : '发布动态'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {sortedPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isOwner={post.userId === currentUserId}
            liked={post.likedBy.includes(currentUserId)}
            activeComments={activeComments === post.id}
            commentText={commentText[post.id] || ''}
            onLike={() => toggleLike(post.id)}
            onToggleComments={() =>
              setActiveComments(activeComments === post.id ? null : post.id)
            }
            onCommentChange={(v) => setCommentText({ ...commentText, [post.id]: v })}
            onSubmitComment={() => submitComment(post.id)}
            onDelete={() => {
              if (confirm('确定删除这条动态吗？')) deletePost(post.id);
            }}
          />
        ))}
      </div>

      <div className="space-y-5">
        <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl p-6 text-white shadow-xl shadow-violet-500/25 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <img src={userProfile.avatar} alt="" className="w-16 h-16 rounded-2xl bg-white/20 ring-4 ring-white/30 mb-4" />
            <div className="text-xl font-bold">{userProfile.name}</div>
            <div className="text-white/80 text-sm mt-1">减重打卡 · 一起变更好</div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/15 backdrop-blur rounded-2xl py-3">
                <div className="text-2xl font-bold">{stats.count}</div>
                <div className="text-[10px] text-white/75 mt-0.5">记录天数</div>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-2xl py-3">
                <div className="text-2xl font-bold">{socialPosts.filter(p => p.userId === currentUserId).length}</div>
                <div className="text-[10px] text-white/75 mt-0.5">发布动态</div>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-2xl py-3">
                <div className="text-2xl font-bold">
                  {weightChange === 0 ? '—' : weightChange < 0 ? weightChange : '+' + weightChange}
                </div>
                <div className="text-[10px] text-white/75 mt-0.5">累计变化(kg)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
          <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Sparkles className="text-amber-500" size={18} />
            本周减重之星
          </h3>
          <div className="space-y-3">
            {[
              { name: '老王', avatar: 'laowang', change: -3.8, rank: 1 },
              { name: '美美', avatar: 'meimei', change: -2.6, rank: 2 },
              { name: '小红', avatar: 'xiaohong', change: -1.9, rank: 3 },
            ].map((u) => (
              <div key={u.avatar} className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-stone-50 transition">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  u.rank === 1 ? 'bg-amber-100 text-amber-600' :
                  u.rank === 2 ? 'bg-stone-100 text-stone-500' :
                  'bg-orange-50 text-orange-600'
                }`}>
                  {u.rank}
                </div>
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.avatar}&backgroundColor=ffd5dc`}
                  className="w-10 h-10 rounded-xl bg-stone-100 flex-shrink-0"
                  alt=""
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-stone-800">{u.name}</div>
                  <div className="text-xs text-stone-400">本周减重</div>
                </div>
                <div className="text-sm font-bold text-emerald-600 flex items-center gap-0.5">
                  <TrendingDown size={13} />
                  {u.change}kg
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
          <h3 className="font-bold text-stone-800 mb-4">💬 励志语录</h3>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
            <p className="text-sm text-stone-700 leading-relaxed">
              "不要因为走得慢而放弃，每一步都在让你变得更好。今天流的汗，就是明天自信的模样。"
            </p>
            <div className="mt-3 text-xs text-stone-500 text-right">— 每日打卡</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolButton({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
}: {
  icon: any;
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition ${
        active
          ? 'bg-emerald-50 text-emerald-600'
          : 'text-stone-500 hover:bg-stone-100'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Icon size={15} />
      <span>{label}</span>
    </button>
  );
}

function PostCard({
  post,
  isOwner,
  liked,
  activeComments,
  commentText,
  onLike,
  onToggleComments,
  onCommentChange,
  onSubmitComment,
  onDelete,
}: {
  post: SocialPost;
  isOwner: boolean;
  liked: boolean;
  activeComments: boolean;
  commentText: string;
  onLike: () => void;
  onToggleComments: () => void;
  onCommentChange: (v: string) => void;
  onSubmitComment: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5 hover:shadow-md transition">
      <div className="flex gap-3.5">
        <img src={post.userAvatar} className="w-11 h-11 rounded-2xl bg-stone-100 flex-shrink-0" alt="" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold text-stone-800">{post.userName}</div>
              <div className="text-xs text-stone-400 mt-0.5">{relativeTime(post.timestamp)} · {post.date}</div>
            </div>
            {isOwner && (
              <button
                onClick={onDelete}
                className="w-8 h-8 rounded-xl hover:bg-rose-50 text-stone-400 hover:text-rose-600 flex items-center justify-center transition"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>

          {(post.weightChange !== undefined || post.currentWeight !== undefined) && (
            <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <TrendingDown className="text-emerald-600" size={18} />
              </div>
              <div className="flex-1">
                <div className="text-xs text-stone-500">累计减重</div>
                <div className="text-lg font-bold text-emerald-600 flex items-baseline gap-2">
                  {post.weightChange === 0 ? '0.0 kg' : post.weightChange! < 0 ? `${post.weightChange} kg` : `+${post.weightChange} kg`}
                  {post.currentWeight && (
                    <span className="text-xs font-medium text-stone-500">当前 {post.currentWeight}kg</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {post.content && (
            <p className="mt-3 text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          )}

          {post.images.length > 0 && (
            <div className={`mt-4 grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {post.images.map((img, i) => (
                <div key={i} className="rounded-2xl overflow-hidden aspect-[3/2] bg-stone-100">
                  <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-1 pt-3 border-t border-stone-100">
            <button
              onClick={onLike}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition ${
                liked ? 'text-rose-500 bg-rose-50' : 'text-stone-500 hover:bg-stone-50'
              }`}
            >
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} className={liked ? 'animate-pulse' : ''} />
              <span className="text-sm font-medium">{post.likes}</span>
            </button>
            <button
              onClick={onToggleComments}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition ${
                activeComments ? 'text-sky-600 bg-sky-50' : 'text-stone-500 hover:bg-stone-50'
              }`}
            >
              <MessageCircle size={16} />
              <span className="text-sm font-medium">{post.comments.length}</span>
            </button>
            <div className="flex-1" />
            <button className="w-9 h-9 rounded-xl text-stone-400 hover:bg-stone-50 hover:text-stone-600 flex items-center justify-center transition">
              <Share2 size={15} />
            </button>
          </div>

          {activeComments && (
            <div className="mt-4 pt-4 border-t border-stone-100 space-y-3 animate-slideDown">
              {post.comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <img src={c.userAvatar} className="w-8 h-8 rounded-xl bg-stone-100 flex-shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 rounded-2xl bg-stone-50">
                      <div className="text-xs font-semibold text-stone-700">{c.userName}</div>
                      <div className="text-sm text-stone-600 mt-0.5">{c.content}</div>
                    </div>
                    <div className="text-[10px] text-stone-400 mt-1 ml-3">{relativeTime(c.timestamp)}</div>
                  </div>
                </div>
              ))}
              <div className="flex gap-2.5">
                <img src={post.userAvatar || ''} className="w-8 h-8 rounded-xl bg-stone-100 flex-shrink-0 opacity-0" alt="" />
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => onCommentChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSubmitComment()}
                    placeholder="写点什么鼓励一下..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-stone-50 border border-transparent focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                  />
                  <button
                    onClick={onSubmitComment}
                    disabled={!commentText.trim()}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/35 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
