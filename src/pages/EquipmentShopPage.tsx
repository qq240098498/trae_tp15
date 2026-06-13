import { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Star,
  Plus,
  Minus,
  Trash2,
  ChevronLeft,
  Check,
  Package,
  Settings,
  X,
  Search,
  Tag,
  ArrowRight,
  ShoppingBag,
  Truck,
  CreditCard,
  ShieldCheck,
  Pencil,
  PlusCircle,
  MessageSquare,
  RotateCcw,
  AlertCircle,
  Clock,
  ThumbsUp,
  Image as ImageIcon,
  Send,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Equipment, EquipmentCategory, Order, Review, RefundRequest } from '@/types';

type View = 'list' | 'detail' | 'cart' | 'orders' | 'checkout' | 'checkoutSuccess' | 'manage' | 'review' | 'refund' | 'orderDetail' | 'refundDetail';

const CATEGORIES: EquipmentCategory[] = ['有氧器械', '力量器械', '自由重量', '瑜伽拉伸', '补剂营养', '健身配件'];

const CATEGORY_COLORS: Record<EquipmentCategory, string> = {
  '有氧器械': 'from-sky-500 to-blue-600',
  '力量器械': 'from-rose-500 to-pink-600',
  '自由重量': 'from-amber-500 to-orange-600',
  '瑜伽拉伸': 'from-emerald-500 to-teal-600',
  '补剂营养': 'from-violet-500 to-purple-600',
  '健身配件': 'from-stone-500 to-gray-600',
};

const CATEGORY_BG_COLORS: Record<EquipmentCategory, string> = {
  '有氧器械': 'bg-sky-50 text-sky-700 border-sky-200',
  '力量器械': 'bg-rose-50 text-rose-700 border-rose-200',
  '自由重量': 'bg-amber-50 text-amber-700 border-amber-200',
  '瑜伽拉伸': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '补剂营养': 'bg-violet-50 text-violet-700 border-violet-200',
  '健身配件': 'bg-stone-50 text-stone-700 border-stone-200',
};

export default function EquipmentShopPage() {
  const {
    equipment,
    cart,
    orders,
    reviews,
    refundRequests,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    createOrder,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    cancelOrder,
    completeOrder,
    addReview,
    requestRefund,
    approveRefund,
    rejectRefund,
    shipReturn,
    confirmReturnDelivered,
    completeRefund,
  } = useAppStore();

  const [view, setView] = useState<View>('list');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | '全部'>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'sales' | 'rating'>('default');

  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutReceiver, setCheckoutReceiver] = useState('');

  const [manageMode, setManageMode] = useState<'add' | 'edit'>('add');
  const [editingEquipment, setEditingEquipment] = useState<Partial<Equipment> | null>(null);
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundDescription, setRefundDescription] = useState('');
  const [refundType, setRefundType] = useState<'refund_only' | 'return_refund'>('refund_only');
  const [shippingCompany, setShippingCompany] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [returnAddress, setReturnAddress] = useState('');
  const [returnReceiver, setReturnReceiver] = useState('');
  const [returnPhone, setReturnPhone] = useState('');
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'good' | 'mid' | 'bad' | 'text'>('all');

  const filteredEquipment = useMemo(() => {
    let result = [...equipment];

    if (selectedCategory !== '全部') {
      result = result.filter((e) => e.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q),
      );
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'sales':
        result.sort((a, b) => b.sales - a.sales);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [equipment, selectedCategory, searchQuery, sortBy]);

  const cartItems = useMemo(() => {
    return cart
      .map((c) => {
        const eq = equipment.find((e) => e.id === c.equipmentId);
        if (!eq) return null;
        return { equipment: eq, quantity: c.quantity };
      })
      .filter((item): item is { equipment: Equipment; quantity: number } => item !== null);
  }, [cart, equipment]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.equipment.price * item.quantity, 0);
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const openDetail = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setView('detail');
  };

  const handleAddToCart = (eq: Equipment, quantity = 1) => {
    addToCart(eq.id, quantity);
    setCartMessage(`已将「${eq.name}」加入购物车`);
    setTimeout(() => setCartMessage(null), 2000);
  };

  const handleBuyNow = (eq: Equipment) => {
    addToCart(eq.id, 1);
    setView('checkout');
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setView('checkout');
  };

  const handlePlaceOrder = () => {
    if (!checkoutReceiver || !checkoutPhone || !checkoutAddress) return;
    createOrder(checkoutAddress, checkoutPhone, checkoutReceiver);
    setView('checkoutSuccess');
  };

  const openAddEquipment = () => {
    setManageMode('add');
    setEditingEquipment({
      name: '',
      category: '健身配件',
      price: 0,
      originalPrice: 0,
      image: '',
      description: '',
      features: [''],
      stock: 0,
      rating: 5,
      reviewCount: 0,
      sales: 0,
    });
    setView('manage');
  };

  const openEditEquipment = (eq: Equipment) => {
    setManageMode('edit');
    setEditingEquipment({ ...eq });
    setView('manage');
  };

  const handleSaveEquipment = () => {
    if (!editingEquipment || !editingEquipment.name || !editingEquipment.category) return;

    if (manageMode === 'add') {
      addEquipment({
        name: editingEquipment.name,
        category: editingEquipment.category as EquipmentCategory,
        price: editingEquipment.price || 0,
        originalPrice: editingEquipment.originalPrice,
        image: editingEquipment.image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fitness+equipment+product&image_size=square',
        description: editingEquipment.description || '',
        features: editingEquipment.features?.filter((f) => f.trim()) || [],
        stock: editingEquipment.stock || 0,
        rating: editingEquipment.rating || 5,
        reviewCount: editingEquipment.reviewCount || 0,
        sales: editingEquipment.sales || 0,
      });
    } else if (manageMode === 'edit' && editingEquipment.id) {
      updateEquipment(editingEquipment.id, {
        name: editingEquipment.name,
        category: editingEquipment.category as EquipmentCategory,
        price: editingEquipment.price,
        originalPrice: editingEquipment.originalPrice,
        image: editingEquipment.image,
        description: editingEquipment.description,
        features: editingEquipment.features?.filter((f) => f.trim()),
        stock: editingEquipment.stock,
        rating: editingEquipment.rating,
        reviewCount: editingEquipment.reviewCount,
        sales: editingEquipment.sales,
      });
    }

    setEditingEquipment(null);
    setView('list');
  };

  const handleDeleteEquipment = (id: string) => {
    if (confirm('确定要删除这个商品吗？')) {
      deleteEquipment(id);
    }
  };

  if (view === 'detail' && selectedEquipment) {
    return (
      <div className="animate-fadeIn">
        <BackHeader title="商品详情" onBack={() => setView('list')} />

        <div className="space-y-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100">
            <div className="aspect-square bg-stone-50">
              <img
                src={selectedEquipment.image}
                alt={selectedEquipment.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 border ${CATEGORY_BG_COLORS[selectedEquipment.category]}`}>
                  {selectedEquipment.category}
                </span>
                <h1 className="text-2xl font-extrabold text-stone-800">{selectedEquipment.name}</h1>
                <p className="text-sm text-stone-500 mt-2">{selectedEquipment.description}</p>
              </div>
            </div>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl font-extrabold text-rose-600">¥{selectedEquipment.price}</span>
              {selectedEquipment.originalPrice && (
                <span className="text-base text-stone-400 line-through">¥{selectedEquipment.originalPrice}</span>
              )}
              {selectedEquipment.originalPrice && (
                <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-medium">
                  省¥{selectedEquipment.originalPrice - selectedEquipment.price}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mt-4 text-sm text-stone-500">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-amber-400" fill="currentColor" />
                <span className="font-semibold text-stone-700">{selectedEquipment.rating}</span>
                <span>({selectedEquipment.reviewCount}条评价)</span>
              </div>
              <div>已售 {selectedEquipment.sales}</div>
              <div>库存 {selectedEquipment.stock}</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6">
            <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500" />
              产品特点
            </h3>
            <div className="space-y-3">
              {selectedEquipment.features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Check className="text-emerald-600" size={12} />
                  </div>
                  <span className="text-sm text-stone-700">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6">
            <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Truck size={18} className="text-emerald-500" />
              服务保障
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-2xl bg-stone-50">
                <Truck size={20} className="text-emerald-500 mx-auto mb-1" />
                <div className="text-xs font-medium text-stone-700">全国包邮</div>
              </div>
              <div className="text-center p-3 rounded-2xl bg-stone-50">
                <ShieldCheck size={20} className="text-emerald-500 mx-auto mb-1" />
                <div className="text-xs font-medium text-stone-700">正品保障</div>
              </div>
              <div className="text-center p-3 rounded-2xl bg-stone-50">
                <CreditCard size={20} className="text-emerald-500 mx-auto mb-1" />
                <div className="text-xs font-medium text-stone-700">7天无理由</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-800 flex items-center gap-2">
                <MessageSquare size={18} className="text-amber-500" />
                用户评价
                <span className="text-sm font-normal text-stone-400">
                  ({reviews.filter(r => r.equipmentId === selectedEquipment.id).length})
                </span>
              </h3>
            </div>

            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-stone-100">
              {[
                { label: '全部', value: 'all' },
                { label: '好评', value: 'good' },
                { label: '中评', value: 'mid' },
                { label: '差评', value: 'bad' },
                { label: '有文字', value: 'text' },
              ].map((tab) => {
                const eqReviews = reviews.filter(r => r.equipmentId === selectedEquipment.id);
                let count = eqReviews.length;
                if (tab.value === 'good') count = eqReviews.filter(r => r.rating >= 4).length;
                if (tab.value === 'mid') count = eqReviews.filter(r => r.rating === 3).length;
                if (tab.value === 'bad') count = eqReviews.filter(r => r.rating <= 2).length;
                if (tab.value === 'text') count = eqReviews.filter(r => r.content.trim().length > 0).length;

                return (
                  <button
                    key={tab.value}
                    onClick={() => setReviewFilter(tab.value as typeof reviewFilter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      reviewFilter === tab.value
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                        : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    {tab.label}
                    {count > 0 && <span className="ml-1 opacity-75">({count})</span>}
                  </button>
                );
              })}
            </div>

            {(() => {
              const eqReviews = reviews.filter(r => r.equipmentId === selectedEquipment.id);
              let filtered = eqReviews;
              if (reviewFilter === 'good') filtered = eqReviews.filter(r => r.rating >= 4);
              if (reviewFilter === 'mid') filtered = eqReviews.filter(r => r.rating === 3);
              if (reviewFilter === 'bad') filtered = eqReviews.filter(r => r.rating <= 2);
              if (reviewFilter === 'text') filtered = eqReviews.filter(r => r.content.trim().length > 0);

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-6">
                    <MessageSquare className="text-stone-200 mx-auto mb-2" size={32} />
                    <p className="text-sm text-stone-400">暂无该类型评价</p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filtered.slice(0, 5).map(review => (
                    <ReviewItem key={review.id} review={review} />
                  ))}
                  {filtered.length > 5 && (
                    <div className="text-center">
                      <button className="text-sm text-emerald-600 font-medium hover:underline">
                        查看全部 {filtered.length} 条评价
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="flex gap-3 sticky bottom-4 bg-white/95 backdrop-blur-xl rounded-3xl p-3 border border-stone-200 shadow-lg">
            <button
              onClick={() => setView('cart')}
              className="relative w-14 h-14 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition flex-shrink-0"
            >
              <ShoppingCart size={22} className="text-stone-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleAddToCart(selectedEquipment)}
              className="flex-1 py-4 rounded-2xl bg-amber-500 text-white font-bold text-lg shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              加入购物车
            </button>
            <button
              onClick={() => handleBuyNow(selectedEquipment)}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-lg shadow-lg shadow-rose-500/25 hover:shadow-rose-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              立即购买
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'cart') {
    return (
      <div className="animate-fadeIn">
        <BackHeader title="购物车" onBack={() => setView('list')} />

        {cartItems.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="购物车是空的" desc="去逛逛，挑选心仪的健身器材吧" />
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.equipment.id}
                  className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 flex gap-4"
                >
                  <div
                    className="w-20 h-20 rounded-xl overflow-hidden bg-stone-50 flex-shrink-0 cursor-pointer"
                    onClick={() => openDetail(item.equipment)}
                  >
                    <img
                      src={item.equipment.image}
                      alt={item.equipment.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-stone-800 truncate">{item.equipment.name}</div>
                    <div className="text-xs text-stone-500 mt-0.5">{item.equipment.category}</div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-extrabold text-rose-600">¥{item.equipment.price}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.equipment.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition"
                        >
                          <Minus size={14} className="text-stone-600" />
                        </button>
                        <span className="w-8 text-center font-bold text-stone-700">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.equipment.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition"
                        >
                          <Plus size={14} className="text-stone-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.equipment.id)}
                    className="text-stone-400 hover:text-rose-500 transition p-1 h-fit"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-stone-600">商品数量</span>
                <span className="font-semibold text-stone-800">{cartCount} 件</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-stone-600">运费</span>
                <span className="font-semibold text-emerald-600">免运费</span>
              </div>
              <div className="border-t border-stone-100 pt-3 flex items-center justify-between">
                <span className="text-stone-700 font-semibold">合计</span>
                <span className="text-2xl font-extrabold text-rose-600">¥{cartTotal}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => clearCart()}
                className="px-6 py-3.5 rounded-2xl bg-stone-100 text-stone-600 font-medium hover:bg-stone-200 transition"
              >
                清空购物车
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-lg shadow-lg shadow-rose-500/25 hover:shadow-rose-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                去结算
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === 'checkout') {
    return (
      <div className="animate-fadeIn">
        <BackHeader title="确认订单" onBack={() => setView('cart')} />

        <div className="space-y-4">
          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
            <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Package size={18} className="text-emerald-500" />
              收货信息
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-stone-600 mb-1.5 block">收货人</label>
                <input
                  type="text"
                  value={checkoutReceiver}
                  onChange={(e) => setCheckoutReceiver(e.target.value)}
                  placeholder="请输入收货人姓名"
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-stone-600 mb-1.5 block">联系电话</label>
                <input
                  type="tel"
                  value={checkoutPhone}
                  onChange={(e) => setCheckoutPhone(e.target.value)}
                  placeholder="请输入手机号码"
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-stone-600 mb-1.5 block">收货地址</label>
                <textarea
                  value={checkoutAddress}
                  onChange={(e) => setCheckoutAddress(e.target.value)}
                  placeholder="请输入详细收货地址"
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
            <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
              <ShoppingBag size={18} className="text-emerald-500" />
              商品清单
            </h3>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.equipment.id} className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-50 flex-shrink-0">
                    <img
                      src={item.equipment.image}
                      alt={item.equipment.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-stone-800 text-sm truncate">{item.equipment.name}</div>
                    <div className="text-xs text-stone-500">x{item.quantity}</div>
                  </div>
                  <span className="font-bold text-stone-700">¥{item.equipment.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-stone-600">商品金额</span>
              <span className="font-medium text-stone-800">¥{cartTotal}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-stone-600">运费</span>
              <span className="font-medium text-emerald-600">免运费</span>
            </div>
            <div className="border-t border-stone-100 pt-3 mt-3 flex items-center justify-between">
              <span className="text-stone-700 font-bold">实付金额</span>
              <span className="text-2xl font-extrabold text-rose-600">¥{cartTotal}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={!checkoutReceiver || !checkoutPhone || !checkoutAddress}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-lg shadow-lg shadow-rose-500/25 hover:shadow-rose-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            提交订单
          </button>
        </div>
      </div>
    );
  }

  if (view === 'checkoutSuccess') {
    return (
      <div className="animate-fadeIn">
        <BackHeader title="支付成功" onBack={() => setView('orders')} />

        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <Check className="text-emerald-500" size={36} />
          </div>
          <h2 className="text-xl font-bold text-stone-800 mb-2">下单成功！</h2>
          <p className="text-stone-500 mb-6">您的健身器材将很快送达</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setView('orders')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium shadow-md shadow-emerald-500/25 transition"
            >
              查看订单
            </button>
            <button
              onClick={() => setView('list')}
              className="px-6 py-3 rounded-2xl bg-stone-100 text-stone-700 font-medium hover:bg-stone-200 transition"
            >
              继续购物
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'orders') {
    return (
      <div className="animate-fadeIn">
        <BackHeader title="我的订单" onBack={() => setView('list')} />

        {orders.length === 0 ? (
          <EmptyState icon={Package} title="暂无订单" desc="去商城挑选心仪的健身器材吧" />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                reviews={reviews}
                refundRequests={refundRequests}
                onCancel={cancelOrder}
                onComplete={completeOrder}
                onReview={(o) => {
                  setSelectedOrder(o);
                  setReviewRating(5);
                  setReviewContent('');
                  setView('review');
                }}
                onRefund={(o) => {
                  setSelectedOrder(o);
                  setRefundReason('');
                  setRefundDescription('');
                  setView('refund');
                }}
                onViewDetail={(o) => {
                  setSelectedOrder(o);
                  setView('orderDetail');
                }}
                onViewRefund={(r) => {
                  setSelectedRefund(r);
                  setView('refundDetail');
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === 'manage' && editingEquipment) {
    return (
      <div className="animate-fadeIn">
        <BackHeader
          title={manageMode === 'add' ? '新增商品' : '编辑商品'}
          onBack={() => {
            setEditingEquipment(null);
            setView('list');
          }}
        />

        <div className="space-y-4">
          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">商品名称 *</label>
              <input
                type="text"
                value={editingEquipment.name || ''}
                onChange={(e) => setEditingEquipment({ ...editingEquipment, name: e.target.value })}
                placeholder="请输入商品名称"
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">商品分类 *</label>
              <select
                value={editingEquipment.category || '健身配件'}
                onChange={(e) =>
                  setEditingEquipment({ ...editingEquipment, category: e.target.value as EquipmentCategory })
                }
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1.5 block">售价 *</label>
                <input
                  type="number"
                  value={editingEquipment.price || ''}
                  onChange={(e) =>
                    setEditingEquipment({ ...editingEquipment, price: Number(e.target.value) })
                  }
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1.5 block">原价</label>
                <input
                  type="number"
                  value={editingEquipment.originalPrice || ''}
                  onChange={(e) =>
                    setEditingEquipment({ ...editingEquipment, originalPrice: Number(e.target.value) })
                  }
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">商品图片</label>
              <input
                type="text"
                value={editingEquipment.image || ''}
                onChange={(e) => setEditingEquipment({ ...editingEquipment, image: e.target.value })}
                placeholder="请输入图片URL"
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">商品描述</label>
              <textarea
                value={editingEquipment.description || ''}
                onChange={(e) => setEditingEquipment({ ...editingEquipment, description: e.target.value })}
                placeholder="请输入商品描述"
                rows={3}
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">产品特点</label>
              <div className="space-y-2">
                {(editingEquipment.features || []).map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={f}
                      onChange={(e) => {
                        const newFeatures = [...(editingEquipment.features || [])];
                        newFeatures[i] = e.target.value;
                        setEditingEquipment({ ...editingEquipment, features: newFeatures });
                      }}
                      placeholder={`特点 ${i + 1}`}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                    />
                    <button
                      onClick={() => {
                        const newFeatures = (editingEquipment.features || []).filter((_, idx) => idx !== i);
                        setEditingEquipment({ ...editingEquipment, features: newFeatures });
                      }}
                      className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newFeatures = [...(editingEquipment.features || []), ''];
                    setEditingEquipment({ ...editingEquipment, features: newFeatures });
                  }}
                  className="w-full py-2.5 rounded-xl border border-dashed border-stone-300 text-stone-500 text-sm hover:border-emerald-400 hover:text-emerald-600 transition flex items-center justify-center gap-1"
                >
                  <Plus size={16} />
                  添加特点
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1.5 block">库存数量</label>
                <input
                  type="number"
                  value={editingEquipment.stock || ''}
                  onChange={(e) =>
                    setEditingEquipment({ ...editingEquipment, stock: Number(e.target.value) })
                  }
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1.5 block">评分</label>
                <input
                  type="number"
                  step="0.1"
                  max="5"
                  value={editingEquipment.rating || ''}
                  onChange={(e) =>
                    setEditingEquipment({ ...editingEquipment, rating: Number(e.target.value) })
                  }
                  placeholder="5.0"
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditingEquipment(null);
                setView('list');
              }}
              className="flex-1 py-3.5 rounded-2xl bg-stone-100 text-stone-600 font-medium hover:bg-stone-200 transition"
            >
              取消
            </button>
            <button
              onClick={handleSaveEquipment}
              disabled={!editingEquipment.name}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'review' && selectedOrder) {
    const hasReviewedItems = selectedOrder.items.filter(
      (item) => !(selectedOrder.reviewIds || []).some(rid => {
        const r = reviews.find(rv => rv.id === rid);
        return r && r.equipmentId === item.equipment.id;
      })
    );

    return (
      <div className="animate-fadeIn">
        <BackHeader title="评价订单" onBack={() => setView('orders')} />

        <div className="space-y-4">
          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
            <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Package size={18} className="text-emerald-500" />
              订单商品
            </h3>
            <div className="space-y-3">
              {selectedOrder.items.map((item) => (
                <div key={item.equipment.id} className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-50 flex-shrink-0">
                    <img
                      src={item.equipment.image}
                      alt={item.equipment.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-stone-800 text-sm truncate">{item.equipment.name}</div>
                    <div className="text-xs text-stone-500">x{item.quantity}</div>
                  </div>
                  {(selectedOrder.reviewIds || []).some(rid => {
                    const r = reviews.find(rv => rv.id === rid);
                    return r && r.equipmentId === item.equipment.id;
                  }) && (
                    <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium">
                      已评价
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {hasReviewedItems.length > 0 && (
            <>
              <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <Star size={18} className="text-amber-500" />
                  商品评分
                </h3>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={star <= reviewRating ? 'text-amber-400' : 'text-stone-200'}
                        fill={star <= reviewRating ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-lg font-bold text-amber-600">{reviewRating}.0</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <Pencil size={18} className="text-emerald-500" />
                  评价内容
                </h3>
                <textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="分享你的使用体验，帮助其他用户做出选择..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm resize-none"
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 text-stone-400">
                    <ImageIcon size={14} />
                    <span className="text-xs">添加图片（暂不支持）</span>
                  </div>
                  <span className={`text-xs ${reviewContent.length > 500 ? 'text-rose-500' : 'text-stone-400'}`}>
                    {reviewContent.length}/500
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!selectedOrder || !reviewContent.trim()) return;
                  const itemToReview = hasReviewedItems[0];
                  addReview(selectedOrder.id, itemToReview.equipment.id, reviewRating, reviewContent.trim());
                  setView('orders');
                }}
                disabled={!reviewContent.trim() || reviewContent.length > 500}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                <Send size={20} />
                提交评价
              </button>
            </>
          )}

          {hasReviewedItems.length === 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <Check className="text-emerald-500" size={28} />
              </div>
              <h3 className="font-bold text-stone-800 mb-2">全部商品已评价</h3>
              <p className="text-sm text-stone-500 mb-4">感谢您的评价！</p>
              <button
                onClick={() => setView('orders')}
                className="px-6 py-3 rounded-2xl bg-stone-100 text-stone-700 font-medium hover:bg-stone-200 transition"
              >
                返回订单
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'refund' && selectedOrder) {
    const existingRefund = refundRequests.find(r => r.orderId === selectedOrder.id);

    return (
      <div className="animate-fadeIn">
        <BackHeader title="申请退款" onBack={() => setView('orders')} />

        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700">退款须知</p>
              <ul className="text-xs text-amber-600 mt-1 space-y-1">
                <li>• 签收后7天内可申请无理由退货</li>
                <li>• 退款审核通过后1-3个工作日原路退回</li>
                <li>• 商品需保持原样，不影响二次销售</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
            <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Package size={18} className="text-emerald-500" />
              退款商品
            </h3>
            <div className="space-y-3">
              {selectedOrder.items.map((item) => (
                <div key={item.equipment.id} className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-50 flex-shrink-0">
                    <img
                      src={item.equipment.image}
                      alt={item.equipment.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-stone-800 text-sm truncate">{item.equipment.name}</div>
                    <div className="text-xs text-stone-500">x{item.quantity}</div>
                  </div>
                  <span className="font-bold text-rose-600">¥{item.equipment.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 mt-4 pt-4 flex items-center justify-between">
              <span className="font-medium text-stone-700">退款金额</span>
              <span className="text-2xl font-extrabold text-rose-600">¥{selectedOrder.totalPrice}</span>
            </div>
          </div>

          {!existingRefund ? (
            <>
              <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
                <h3 className="font-bold text-stone-800 mb-4">退款类型</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setRefundType('refund_only')}
                    className={`w-full text-left p-4 rounded-2xl transition ${
                      refundType === 'refund_only'
                        ? 'bg-rose-50 border-2 border-rose-300'
                        : 'bg-stone-50 border-2 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        refundType === 'refund_only' ? 'border-rose-500' : 'border-stone-300'
                      }`}>
                        {refundType === 'refund_only' && <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-stone-800">仅退款</span>
                          <CreditCard size={18} className="text-rose-500" />
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          商品已收到且无需退回，直接申请退款
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setRefundType('return_refund')}
                    className={`w-full text-left p-4 rounded-2xl transition ${
                      refundType === 'return_refund'
                        ? 'bg-rose-50 border-2 border-rose-300'
                        : 'bg-stone-50 border-2 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        refundType === 'return_refund' ? 'border-rose-500' : 'border-stone-300'
                      }`}>
                        {refundType === 'return_refund' && <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-stone-800">退货退款</span>
                          <Truck size={18} className="text-rose-500" />
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          将商品寄回商家，收到退货后退款
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
                <h3 className="font-bold text-stone-800 mb-4">退款原因</h3>
                <div className="space-y-2">
                  {['商品质量问题', '与描述不符', '收到商品损坏', '不想要了', '其他原因'].map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setRefundReason(reason)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition ${
                        refundReason === reason
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{reason}</span>
                        {refundReason === reason && <Check size={16} className="text-rose-500" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
                <h3 className="font-bold text-stone-800 mb-3">补充说明</h3>
                <textarea
                  value={refundDescription}
                  onChange={(e) => setRefundDescription(e.target.value)}
                  placeholder="请详细描述退款原因，以便我们更快处理..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm resize-none"
                />
              </div>

              <button
                onClick={() => {
                  if (!selectedOrder || !refundReason) return;
                  requestRefund(selectedOrder.id, refundType, refundReason, refundDescription);
                  setView('orders');
                }}
                disabled={!refundReason}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-lg shadow-lg shadow-rose-500/25 hover:shadow-rose-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                提交{refundType === 'return_refund' ? '退货退款' : '退款'}申请
              </button>
            </>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <Clock className="text-amber-500" size={28} />
              </div>
              <h3 className="font-bold text-stone-800 mb-2">已提交{existingRefund.type === 'return_refund' ? '退货退款' : '退款'}申请</h3>
              <p className="text-sm text-stone-500">请等待审核，审核结果将及时通知您</p>
              <button
                onClick={() => {
                  setSelectedRefund(existingRefund);
                  setView('refundDetail');
                }}
                className="mt-4 px-6 py-3 rounded-2xl bg-rose-50 text-rose-600 font-medium hover:bg-rose-100 transition"
              >
                查看{existingRefund.type === 'return_refund' ? '退货退款' : '退款'}进度
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'orderDetail' && selectedOrder) {
    const orderReviews = reviews.filter(r => (selectedOrder.reviewIds || []).includes(r.id));
    const orderRefund = refundRequests.find(r => r.orderId === selectedOrder.id);

    return (
      <div className="animate-fadeIn">
        <BackHeader title="订单详情" onBack={() => setView('orders')} />

        <div className="space-y-4">
          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-800 flex items-center gap-2">
                <Package size={18} className="text-emerald-500" />
                订单信息
              </h3>
              <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${ORDER_STATUS_COLOR[selectedOrder.status]}`}>
                {ORDER_STATUS_TEXT[selectedOrder.status]}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">订单编号</span>
                <span className="text-stone-700 font-mono">{selectedOrder.id.slice(0, 16)}...</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">下单时间</span>
                <span className="text-stone-700">{new Date(selectedOrder.createdAt).toLocaleString('zh-CN')}</span>
              </div>
              {selectedOrder.receiver && (
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">收货人</span>
                  <span className="text-stone-700">{selectedOrder.receiver}</span>
                </div>
              )}
              {selectedOrder.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">联系电话</span>
                  <span className="text-stone-700">{selectedOrder.phone}</span>
                </div>
              )}
              {selectedOrder.address && (
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">收货地址</span>
                  <span className="text-stone-700 text-right max-w-[200px]">{selectedOrder.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
            <h3 className="font-bold text-stone-800 mb-4">商品清单</h3>
            <div className="space-y-3">
              {selectedOrder.items.map((item) => (
                <div key={item.equipment.id} className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-50 flex-shrink-0">
                    <img
                      src={item.equipment.image}
                      alt={item.equipment.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-stone-800 text-sm truncate">{item.equipment.name}</div>
                    <div className="text-xs text-stone-500">x{item.quantity} · ¥{item.equipment.price}/件</div>
                  </div>
                  <span className="font-bold text-stone-700">¥{item.equipment.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 mt-4 pt-4 flex items-center justify-between">
              <span className="font-medium text-stone-700">订单金额</span>
              <span className="text-xl font-extrabold text-rose-600">¥{selectedOrder.totalPrice}</span>
            </div>
          </div>

          {orderReviews.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                <MessageSquare size={18} className="text-amber-500" />
                我的评价
              </h3>
              <div className="space-y-4">
                {orderReviews.map(review => (
                  <ReviewItem key={review.id} review={review} />
                ))}
              </div>
            </div>
          )}

          {orderRefund && (
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                <RotateCcw size={18} className="text-rose-500" />
                退款信息
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">退款原因</span>
                  <span className="text-stone-700">{orderRefund.reason}</span>
                </div>
                {orderRefund.description && (
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">补充说明</span>
                    <span className="text-stone-700">{orderRefund.description}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">退款金额</span>
                  <span className="font-bold text-rose-600">¥{orderRefund.refundAmount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">退款状态</span>
                  <span className={`font-medium ${REFUND_STATUS_COLOR[orderRefund.status]}`}>
                    {REFUND_STATUS_TEXT[orderRefund.status]}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedRefund(orderRefund);
                  setView('refundDetail');
                }}
                className="w-full mt-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 text-sm font-medium hover:bg-rose-100 transition"
              >
                查看退款详情
              </button>
            </div>
          )}

          <div className="flex gap-3">
            {selectedOrder.status === 'completed' && !(selectedOrder.reviewIds || []).length && (
              <button
                onClick={() => {
                  setReviewRating(5);
                  setReviewContent('');
                  setView('review');
                }}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 transition flex items-center justify-center gap-2"
              >
                <Star size={18} />
                去评价
              </button>
            )}
            {(selectedOrder.status === 'paid' || selectedOrder.status === 'shipped' || selectedOrder.status === 'completed') && !orderRefund && (
              <button
                onClick={() => {
                  setRefundReason('');
                  setRefundDescription('');
                  setView('refund');
                }}
                className="flex-1 py-3.5 rounded-2xl bg-stone-100 text-stone-600 font-medium hover:bg-stone-200 transition flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                申请退款
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'refundDetail' && selectedRefund) {
    const isReturnRefund = selectedRefund.type === 'return_refund';
    const hasShipped = selectedRefund.returnStatus === 'shipped';
    const hasDelivered = selectedRefund.returnStatus === 'delivered';

    return (
      <div className="animate-fadeIn">
        <BackHeader title={isReturnRefund ? '退货退款详情' : '退款详情'} onBack={() => setView('orders')} />

        <div className="space-y-4">
          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${
                selectedRefund.status === 'completed' ? 'bg-emerald-50' :
                selectedRefund.status === 'rejected' ? 'bg-rose-50' :
                isReturnRefund && hasShipped && !hasDelivered ? 'bg-sky-50' :
                selectedRefund.status === 'approved' ? 'bg-sky-50' :
                'bg-amber-50'
              }`}>
                {selectedRefund.status === 'completed' ? <Check className="text-emerald-500" size={28} /> :
                 selectedRefund.status === 'rejected' ? <X className="text-rose-500" size={28} /> :
                 isReturnRefund && hasShipped && !hasDelivered ? <Truck className="text-sky-500" size={28} /> :
                 selectedRefund.status === 'approved' ? <ThumbsUp className="text-sky-500" size={28} /> :
                 <Clock className="text-amber-500" size={28} />}
              </div>
              <h3 className="text-lg font-bold text-stone-800">
                {selectedRefund.status === 'completed' ? '退款已完成' :
                 selectedRefund.status === 'rejected' ? '退款申请已拒绝' :
                 isReturnRefund && selectedRefund.status === 'approved' && !hasShipped ? '等待退货' :
                 isReturnRefund && hasShipped && !hasDelivered ? '退货运输中' :
                 isReturnRefund && hasDelivered ? '退货已签收，等待退款' :
                 selectedRefund.status === 'approved' ? '退款已通过' :
                 '审核中'}
              </h3>
              <p className="text-sm text-stone-500 mt-1">
                {selectedRefund.status === 'pending' && '我们将在1-2个工作日内审核您的申请'}
                {selectedRefund.status === 'approved' && !isReturnRefund && '退款已审核通过，正在处理退款'}
                {selectedRefund.status === 'approved' && isReturnRefund && !hasShipped && '请尽快将商品寄出，并填写物流信息'}
                {hasShipped && !hasDelivered && '商品正在运输中，商家签收后将处理退款'}
                {hasDelivered && '商家已签收退货，将在1-3个工作日内完成退款'}
                {selectedRefund.status === 'rejected' && '退款申请未通过审核'}
                {selectedRefund.status === 'completed' && '退款已完成，请查看您的账户'}
              </p>
            </div>

            <div className="space-y-0">
              <div className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check size={14} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-stone-800">提交申请</div>
                  <div className="text-xs text-stone-400">{new Date(selectedRefund.createdAt).toLocaleString('zh-CN')}</div>
                </div>
              </div>

              <div className="ml-4 w-0.5 h-4 bg-stone-200" />

              <div className="flex items-center gap-3 py-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedRefund.status !== 'pending' ? 'bg-emerald-100' : 'bg-amber-100'
                }`}>
                  {selectedRefund.status !== 'pending' ? (
                    <Check size={14} className="text-emerald-600" />
                  ) : (
                    <Clock size={14} className="text-amber-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-stone-800">审核处理</div>
                  <div className="text-xs text-stone-400">
                    {selectedRefund.processedAt
                      ? new Date(selectedRefund.processedAt).toLocaleString('zh-CN')
                      : '等待审核中...'}
                  </div>
                </div>
              </div>

              {isReturnRefund && (
                <>
                  <div className="ml-4 w-0.5 h-4 bg-stone-200" />

                  <div className="flex items-center gap-3 py-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      hasShipped ? 'bg-emerald-100' :
                      selectedRefund.status === 'approved' ? 'bg-amber-100' :
                      'bg-stone-100'
                    }`}>
                      {hasShipped ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : selectedRefund.status === 'approved' ? (
                        <Truck size={14} className="text-amber-500" />
                      ) : (
                        <Truck size={14} className="text-stone-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-stone-800">
                        {hasShipped ? '已寄出退货' : '寄出退货'}
                      </div>
                      <div className="text-xs text-stone-400">
                        {selectedRefund.shippedAt
                          ? new Date(selectedRefund.shippedAt).toLocaleString('zh-CN')
                          : selectedRefund.status === 'approved'
                          ? '审核通过后可填写物流信息'
                          : '待处理'}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 w-0.5 h-4 bg-stone-200" />

                  <div className="flex items-center gap-3 py-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      hasDelivered ? 'bg-emerald-100' :
                      hasShipped ? 'bg-amber-100' :
                      'bg-stone-100'
                    }`}>
                      {hasDelivered ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : hasShipped ? (
                        <Package size={14} className="text-amber-500" />
                      ) : (
                        <Package size={14} className="text-stone-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-stone-800">
                        {hasDelivered ? '商家已签收' : '商家签收'}
                      </div>
                      <div className="text-xs text-stone-400">
                        {selectedRefund.deliveredAt
                          ? new Date(selectedRefund.deliveredAt).toLocaleString('zh-CN')
                          : hasShipped
                          ? '运输中...'
                          : '待处理'}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="ml-4 w-0.5 h-4 bg-stone-200" />

              <div className="flex items-center gap-3 py-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedRefund.status === 'completed' ? 'bg-emerald-100' : 'bg-stone-100'
                }`}>
                  {selectedRefund.status === 'completed' ? (
                    <Check size={14} className="text-emerald-600" />
                  ) : (
                    <CreditCard size={14} className="text-stone-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-stone-800">退款到账</div>
                  <div className="text-xs text-stone-400">
                    {selectedRefund.refundedAt
                      ? new Date(selectedRefund.refundedAt).toLocaleString('zh-CN')
                      : selectedRefund.status === 'approved' && (!isReturnRefund || hasDelivered)
                      ? '处理中，预计1-3个工作日'
                      : '待处理'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isReturnRefund && selectedRefund.status === 'approved' && selectedRefund.returnAddress && (
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Truck size={18} className="text-emerald-500" />
                退货地址
              </h3>
              <div className="space-y-2 text-sm bg-stone-50 rounded-2xl p-4">
                {selectedRefund.returnReceiver && (
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500">收件人：</span>
                    <span className="text-stone-800 font-medium">{selectedRefund.returnReceiver}</span>
                    {selectedRefund.returnPhone && (
                      <span className="text-stone-600">{selectedRefund.returnPhone}</span>
                    )}
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <span className="text-stone-500 flex-shrink-0">详细地址：</span>
                  <span className="text-stone-800">{selectedRefund.returnAddress}</span>
                </div>
              </div>
            </div>
          )}

          {isReturnRefund && selectedRefund.status === 'approved' && !hasShipped && (
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Package size={18} className="text-sky-500" />
                填写退货物流
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">物流公司</label>
                  <select
                    value={shippingCompany}
                    onChange={(e) => setShippingCompany(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                  >
                    <option value="">请选择物流公司</option>
                    <option value="顺丰速运">顺丰速运</option>
                    <option value="圆通速递">圆通速递</option>
                    <option value="中通快递">中通快递</option>
                    <option value="申通快递">申通快递</option>
                    <option value="韵达快递">韵达快递</option>
                    <option value="百世快递">百世快递</option>
                    <option value="中国邮政">中国邮政</option>
                    <option value="京东物流">京东物流</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">物流单号</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="请输入物流单号"
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                  />
                </div>
                <button
                  onClick={() => {
                    if (!shippingCompany || !trackingNumber) return;
                    shipReturn(selectedRefund.id, shippingCompany, trackingNumber);
                    setSelectedRefund({
                      ...selectedRefund,
                      returnStatus: 'shipped',
                      shippingCompany,
                      trackingNumber,
                      shippedAt: Date.now(),
                    });
                  }}
                  disabled={!shippingCompany || !trackingNumber}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-lg shadow-sky-500/25 hover:shadow-sky-500/35 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Truck size={18} />
                  确认寄出
                </button>
              </div>
            </div>
          )}

          {isReturnRefund && hasShipped && (
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Truck size={18} className="text-sky-500" />
                物流信息
              </h3>
              <div className="space-y-3 text-sm bg-stone-50 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">物流公司</span>
                  <span className="text-stone-800 font-medium">{selectedRefund.shippingCompany}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">物流单号</span>
                  <span className="text-stone-800 font-mono">{selectedRefund.trackingNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">寄出时间</span>
                  <span className="text-stone-700">{selectedRefund.shippedAt && new Date(selectedRefund.shippedAt).toLocaleString('zh-CN')}</span>
                </div>
              </div>
              {!hasDelivered && (
                <button
                  onClick={() => {
                    confirmReturnDelivered(selectedRefund.id);
                    setSelectedRefund({
                      ...selectedRefund,
                      returnStatus: 'delivered',
                      deliveredAt: Date.now(),
                    });
                  }}
                  className="w-full mt-4 py-3 rounded-2xl bg-emerald-50 text-emerald-600 font-medium hover:bg-emerald-100 transition flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  确认商家已签收
                </button>
              )}
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
            <h3 className="font-bold text-stone-800 mb-4">退款信息</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">退款类型</span>
                <span className={`font-medium ${isReturnRefund ? 'text-sky-600' : 'text-rose-600'}`}>
                  {isReturnRefund ? '退货退款' : '仅退款'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">退款原因</span>
                <span className="text-stone-700">{selectedRefund.reason}</span>
              </div>
              {selectedRefund.description && (
                <div className="flex items-start justify-between">
                  <span className="text-stone-500 flex-shrink-0">补充说明</span>
                  <span className="text-stone-700 text-right max-w-[200px]">{selectedRefund.description}</span>
                </div>
              )}
              <div className="border-t border-stone-100 pt-3 flex items-center justify-between">
                <span className="text-stone-700 font-medium">退款金额</span>
                <span className="text-xl font-extrabold text-rose-600">¥{selectedRefund.refundAmount}</span>
              </div>
            </div>
          </div>

          {selectedRefund.status === 'pending' && (
            <div className="space-y-3">
              {isReturnRefund && (
                <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5">
                  <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <Truck size={18} className="text-emerald-500" />
                    设置退货地址（审核通过）
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">收件人</label>
                      <input
                        type="text"
                        value={returnReceiver}
                        onChange={(e) => setReturnReceiver(e.target.value)}
                        placeholder="请输入收件人姓名"
                        className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">联系电话</label>
                      <input
                        type="text"
                        value={returnPhone}
                        onChange={(e) => setReturnPhone(e.target.value)}
                        placeholder="请输入联系电话"
                        className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">退货地址</label>
                      <input
                        type="text"
                        value={returnAddress}
                        onChange={(e) => setReturnAddress(e.target.value)}
                        placeholder="请输入详细退货地址"
                        className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (isReturnRefund && (!returnAddress || !returnReceiver)) return;
                    approveRefund(
                      selectedRefund.id,
                      isReturnRefund ? returnAddress : undefined,
                      isReturnRefund ? returnReceiver : undefined,
                      isReturnRefund ? returnPhone : undefined,
                    );
                    setSelectedRefund({
                      ...selectedRefund,
                      status: 'approved',
                      processedAt: Date.now(),
                      returnAddress: isReturnRefund ? returnAddress : undefined,
                      returnReceiver: isReturnRefund ? returnReceiver : undefined,
                      returnPhone: isReturnRefund ? returnPhone : undefined,
                    });
                  }}
                  disabled={isReturnRefund && (!returnAddress || !returnReceiver)}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ThumbsUp size={18} />
                  通过审核
                </button>
                <button
                  onClick={() => {
                    rejectRefund(selectedRefund.id);
                    setSelectedRefund({ ...selectedRefund, status: 'rejected', processedAt: Date.now() });
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-stone-100 text-stone-600 font-medium hover:bg-stone-200 transition flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  拒绝退款
                </button>
              </div>
            </div>
          )}

          {selectedRefund.status === 'approved' && (!isReturnRefund || hasDelivered) && (
            <button
              onClick={() => {
                completeRefund(selectedRefund.id);
                setSelectedRefund({
                  ...selectedRefund,
                  status: 'completed',
                  processedAt: Date.now(),
                  refundedAt: Date.now(),
                });
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2"
            >
              <CreditCard size={18} />
              确认退款到账
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn relative">
      {cartMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-500/30">
            <Check size={18} />
            <span className="font-medium text-sm">{cartMessage}</span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-800">健身器材商城</h1>
          <p className="text-sm text-stone-500 mt-1">精选健身装备，助力你的健身之路</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openAddEquipment}
            className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center hover:bg-emerald-100 transition"
            title="新增商品"
          >
            <PlusCircle size={20} className="text-emerald-600" />
          </button>
          <button
            onClick={() => setView('orders')}
            className="w-10 h-10 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition relative"
            title="我的订单"
          >
            <Package size={20} className="text-stone-600" />
          </button>
          <button
            onClick={() => setView('cart')}
            className="w-10 h-10 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition relative"
            title="购物车"
          >
            <ShoppingCart size={20} className="text-stone-600" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 rounded-3xl p-6 text-white shadow-xl shadow-rose-500/25 relative overflow-hidden mb-5">
        <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative">
          <h2 className="text-xl font-extrabold">🔥 夏日健身季</h2>
          <p className="text-white/80 text-sm mt-1">全场满300减50，精选器材限时特惠</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2 text-center">
              <div className="text-lg font-bold">{equipment.length}</div>
              <div className="text-[10px] text-white/75">款商品</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2 text-center">
              <div className="text-lg font-bold">免费</div>
              <div className="text-[10px] text-white/75">配送</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-4 shadow-sm border border-stone-100 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索健身器材..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('全部')}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition ${
              selectedCategory === '全部'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            全部
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition ${
                selectedCategory === cat
                  ? `bg-gradient-to-r ${CATEGORY_COLORS[cat]} text-white shadow-md`
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-100">
          <span className="text-xs text-stone-500">排序：</span>
          {[
            { label: '综合', value: 'default' },
            { label: '销量', value: 'sales' },
            { label: '价格↑', value: 'price-asc' },
            { label: '价格↓', value: 'price-desc' },
            { label: '评分', value: 'rating' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setSortBy(item.value as typeof sortBy)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                sortBy === item.value
                  ? 'bg-emerald-50 text-emerald-600 font-semibold'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {filteredEquipment.length === 0 ? (
        <EmptyState icon={Search} title="没有找到相关商品" desc="试试其他关键词或分类" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredEquipment.map((eq) => (
            <EquipmentCard
              key={eq.id}
              equipment={eq}
              onView={() => openDetail(eq)}
              onAddToCart={() => handleAddToCart(eq)}
              onBuyNow={() => handleBuyNow(eq)}
              onEdit={() => openEditEquipment(eq)}
              onDelete={() => handleDeleteEquipment(eq.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EquipmentCard({
  equipment,
  onView,
  onAddToCart,
  onBuyNow,
  onEdit,
  onDelete,
}: {
  equipment: Equipment;
  onView: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const discount = equipment.originalPrice
    ? Math.round(((equipment.originalPrice - equipment.price) / equipment.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden group hover:shadow-md transition">
      <div className="aspect-square bg-stone-50 relative cursor-pointer" onClick={onView}>
        <img
          src={equipment.image}
          alt={equipment.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-rose-500 text-white text-xs font-bold">
            -{discount}%
          </span>
        )}
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-medium border ${CATEGORY_BG_COLORS[equipment.category]}`}>
          {equipment.category}
        </span>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center mr-2 hover:bg-white transition"
          >
            <Pencil size={16} className="text-stone-700" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-rose-50 transition"
          >
            <Trash2 size={16} className="text-rose-500" />
          </button>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-stone-800 text-sm truncate cursor-pointer" onClick={onView}>
          {equipment.name}
        </h3>
        <div className="flex items-center gap-1 mt-1.5">
          <Star size={12} className="text-amber-400" fill="currentColor" />
          <span className="text-xs font-semibold text-stone-700">{equipment.rating}</span>
          <span className="text-[10px] text-stone-400">· 已售{equipment.sales}</span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg font-extrabold text-rose-600">¥{equipment.price}</span>
          {equipment.originalPrice && (
            <span className="text-[10px] text-stone-400 line-through">¥{equipment.originalPrice}</span>
          )}
        </div>
        <div className="flex gap-1.5 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            className="flex-1 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium hover:bg-stone-100 transition flex items-center justify-center gap-1"
          >
            <ShoppingCart size={12} />
            加入购物车
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBuyNow();
            }}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-medium shadow-sm shadow-rose-500/20 hover:shadow-rose-500/30 transition flex items-center justify-center gap-1"
          >
            立即购买
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  reviews,
  refundRequests,
  onCancel,
  onComplete,
  onReview,
  onRefund,
  onViewDetail,
  onViewRefund,
}: {
  order: Order;
  reviews: Review[];
  refundRequests: RefundRequest[];
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  onReview: (order: Order) => void;
  onRefund: (order: Order) => void;
  onViewDetail: (order: Order) => void;
  onViewRefund: (refund: RefundRequest) => void;
}) {
  const hasReview = (order.reviewIds || []).length > 0;
  const refund = refundRequests.find(r => r.orderId === order.id);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 cursor-pointer hover:shadow-md transition" onClick={() => onViewDetail(order)}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-stone-500">
          订单号：{order.id.slice(0, 8)}...
        </div>
        <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${ORDER_STATUS_COLOR[order.status]}`}>
          {ORDER_STATUS_TEXT[order.status]}
        </span>
      </div>

      <div className="space-y-3">
        {order.items.slice(0, 2).map((item) => (
          <div key={item.equipment.id} className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-50 flex-shrink-0">
              <img
                src={item.equipment.image}
                alt={item.equipment.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-stone-800 text-sm truncate">{item.equipment.name}</div>
              <div className="text-xs text-stone-500">x{item.quantity}</div>
            </div>
            <span className="font-semibold text-stone-700 text-sm">¥{item.equipment.price * item.quantity}</span>
          </div>
        ))}
        {order.items.length > 2 && (
          <div className="text-xs text-stone-500 text-center py-1">
            等共 {order.items.length} 件商品
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
        <div className="text-sm text-stone-600">
          共 {order.items.reduce((sum, i) => sum + i.quantity, 0)} 件商品，
          <span className="text-rose-600 font-bold text-lg">¥{order.totalPrice}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
        {order.status === 'paid' && (
          <button
            onClick={() => onCancel(order.id)}
            className="px-4 py-2 rounded-xl bg-stone-100 text-stone-600 text-sm font-medium hover:bg-stone-200 transition"
          >
            取消订单
          </button>
        )}
        {(order.status === 'paid' || order.status === 'shipped') && (
          <button
            onClick={() => onComplete(order.id)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/35 transition"
          >
            确认收货
          </button>
        )}
        {order.status === 'completed' && !hasReview && (
          <button
            onClick={() => onReview(order)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium shadow-md shadow-amber-500/25 hover:shadow-amber-500/35 transition flex items-center gap-1"
          >
            <Star size={14} fill="currentColor" />
            评价
          </button>
        )}
        {order.status === 'completed' && hasReview && (
          <span className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-medium flex items-center gap-1">
            <Check size={14} />
            已评价
          </span>
        )}
        {(order.status === 'paid' || order.status === 'shipped' || order.status === 'completed') && !refund && (
          <button
            onClick={() => onRefund(order)}
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-sm font-medium hover:bg-rose-100 transition flex items-center gap-1"
          >
            <RotateCcw size={14} />
            退款
          </button>
        )}
        {refund && (
          <button
            onClick={() => onViewRefund(refund)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1 ${REFUND_STATUS_COLOR[refund.status]}`}
          >
            <RotateCcw size={14} />
            {REFUND_STATUS_TEXT[refund.status]}
          </button>
        )}
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

function EmptyState({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string; size?: string | number }>;
  title: string;
  desc: string;
}) {
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

const ORDER_STATUS_TEXT: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
};

const ORDER_STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600',
  paid: 'bg-sky-50 text-sky-600',
  shipped: 'bg-violet-50 text-violet-600',
  completed: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-stone-100 text-stone-500',
};

const REFUND_STATUS_TEXT: Record<string, string> = {
  pending: '审核中',
  approved: '已通过',
  rejected: '已拒绝',
  completed: '已退款',
};

const REFUND_STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600',
  approved: 'bg-sky-50 text-sky-600',
  rejected: 'bg-rose-50 text-rose-600',
  completed: 'bg-emerald-50 text-emerald-600',
};

function ReviewItem({ review }: { review: Review }) {
  return (
    <div className="border-b border-stone-100 last:border-b-0 pb-4 last:pb-0">
      <div className="flex items-center gap-3 mb-2">
        <img
          src={review.userAvatar}
          alt={review.userName}
          className="w-8 h-8 rounded-full bg-stone-100"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-stone-800">{review.userName}</div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={10}
                className={star <= review.rating ? 'text-amber-400' : 'text-stone-200'}
                fill={star <= review.rating ? 'currentColor' : 'none'}
              />
            ))}
          </div>
        </div>
        <span className="text-xs text-stone-400">
          {new Date(review.timestamp).toLocaleDateString('zh-CN')}
        </span>
      </div>
      <p className="text-sm text-stone-600 pl-11">{review.content}</p>
    </div>
  );
}
