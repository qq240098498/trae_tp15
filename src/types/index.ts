export interface WeightRecord {
  id: string;
  weight: number;
  date: string;
  note?: string;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  height: number;
  gender: 'male' | 'female';
  age: number;
  targetWeight?: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: number;
}

export interface SocialPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  weightChange?: number;
  currentWeight?: number;
  date: string;
  images: string[];
  likes: number;
  likedBy: string[];
  comments: Comment[];
  timestamp: number;
}

export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export interface BMIResult {
  bmi: number;
  category: BMICategory;
  label: string;
  color: string;
  advice: {
    title: string;
    description: string;
    tips: string[];
  };
}

export type TimeRange = '7d' | '30d' | '90d' | 'all';

export type MembershipType = 'daily' | 'weekly' | 'monthly';

export interface GymMembership {
  type: MembershipType;
  name: string;
  price: number;
  days: number;
  description: string;
  features: string[];
}

export interface Gym {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  image: string;
  openTime: string;
  closeTime: string;
  facilities: string[];
  memberships: GymMembership[];
  lat: number;
  lng: number;
}

export interface PurchasedMembership {
  id: string;
  gymId: string;
  gymName: string;
  type: MembershipType;
  name: string;
  price: number;
  purchasedAt: number;
  startDate: string;
  endDate: string;
  remainingDays: number;
}

export interface Booking {
  id: string;
  gymId: string;
  gymName: string;
  date: string;
  startTime: string;
  endTime: string;
  activity: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: number;
  membershipId?: string;
}

export type BookingActivity = '力量训练' | '有氧运动' | '瑜伽' | '动感单车' | '游泳' | '团课' | '自由训练';

export type EquipmentCategory = '有氧器械' | '力量器械' | '自由重量' | '瑜伽拉伸' | '补剂营养' | '健身配件';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  features: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  sales: number;
}

export interface Review {
  id: string;
  orderId: string;
  equipmentId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  content: string;
  images: string[];
  timestamp: number;
}

export type RefundType = 'refund_only' | 'return_refund';
export type ReturnStatus = 'not_started' | 'shipped' | 'delivered';
export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface RefundRequest {
  id: string;
  orderId: string;
  type: RefundType;
  reason: string;
  description: string;
  status: RefundStatus;
  refundAmount: number;
  createdAt: number;
  processedAt?: number;
  returnStatus?: ReturnStatus;
  returnAddress?: string;
  returnReceiver?: string;
  returnPhone?: string;
  shippingCompany?: string;
  trackingNumber?: string;
  shippedAt?: number;
  deliveredAt?: number;
  refundedAt?: number;
}

export interface CartItem {
  equipmentId: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: { equipment: Equipment; quantity: number }[];
  totalPrice: number;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  createdAt: number;
  address?: string;
  phone?: string;
  receiver?: string;
  reviewIds?: string[];
  refundId?: string;
}

