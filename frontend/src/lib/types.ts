export type Category = {
  id: number;
  name: string;
  icon: string;
  color: string;
};

export type Product = {
  id: number;
  category_id: number;
  name: string;
  price: number;
  unit: string;
  image_url: string | null;
  category_name: string | null;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type QuestProgress = {
  user_id: number;
  month: string;
  starter_spin: boolean;
  new_category_1: boolean;
  new_category_2: boolean;
  explored_categories: string[];
  spins_earned: number;
  spins_remaining: number;
  max_spins: number;
};

export type CheckoutResult = {
  spinUnlocked: boolean;
  message: string;
  rewardEligible: boolean;
  unlockType: "starter" | "new_category" | null;
  orderCategory: string;
  progress: QuestProgress;
};

export type WheelSegment = {
  template_id: number;
  label: string;
  reward_name: string;
  discount: string;
  category: string | null;
};

export type Coupon = {
  id: number;
  reward_name: string;
  discount: string;
  category: string | null;
  expiry_date: string;
  status: string;
  days_remaining: number;
};

export type SpinResult = {
  coupon: Coupon;
  template_id: number;
  segment_index: number;
  segments: WheelSegment[];
  progress: QuestProgress;
  message: string;
};
