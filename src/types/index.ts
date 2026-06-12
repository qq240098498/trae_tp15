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
