import type { CheckoutResult, Coupon, QuestProgress, SpinResult, WheelSegment } from "@/lib/types";

const EXPLORED_KEY = "cq-explored-categories";
const SPINS_KEY = "cq-spins-remaining";
const EARNED_KEY = "cq-spins-earned";
const STARTER_KEY = "cq-starter";
const COUPONS_KEY = "cq-coupons";

const MAX = 3;

export const MOCK_REWARDS = [
  "₹50 OFF Pharmacy",
  "₹75 OFF Kitchen Essentials",
  "₹45 OFF Snacks",
  "Free Delivery",
  "₹60 OFF Home Cleaning",
  "2× Reward Points",
  "₹40 OFF Beauty",
  "₹80 OFF Stationery",
] as const;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getMockWheelSegments(): WheelSegment[] {
  return MOCK_REWARDS.map((name, i) => ({
    template_id: i + 1,
    label: name.length > 16 ? name.slice(0, 14) + "…" : name,
    reward_name: name,
    discount: name,
    category: null,
  }));
}

export function getMockProgress(): QuestProgress {
  const explored = readJson<string[]>(EXPLORED_KEY, []);
  const spins_earned = readJson<number>(EARNED_KEY, 0);
  const spins_remaining = readJson<number>(SPINS_KEY, 0);
  const starter = readJson<boolean>(STARTER_KEY, false);
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return {
    user_id: 1,
    month,
    starter_spin: starter,
    new_category_1: explored.length >= 2,
    new_category_2: explored.length >= 3,
    explored_categories: explored,
    spins_earned,
    spins_remaining,
    max_spins: MAX,
  };
}

/** Grant at least one local spin after checkout unlocks (API or mock). */
export function grantMockSpinFromUnlock() {
  const remaining = readJson<number>(SPINS_KEY, 0);
  if (remaining < 1) writeJson(SPINS_KEY, 1);
  const earned = readJson<number>(EARNED_KEY, 0);
  if (earned < 1) writeJson(EARNED_KEY, 1);
  writeJson(STARTER_KEY, true);
}

/** Mirror a purchased category into local quest progress (for Account UI). */
export function syncExploredCategory(category: string, apiProgress?: QuestProgress | null) {
  const explored = readJson<string[]>(EXPLORED_KEY, []);
  if (category && !explored.includes(category)) {
    explored.push(category);
    writeJson(EXPLORED_KEY, explored);
  }
  if (apiProgress) {
    const earned = Math.max(readJson<number>(EARNED_KEY, 0), apiProgress.spins_earned ?? 0);
    const remaining = Math.max(
      readJson<number>(SPINS_KEY, 0),
      apiProgress.spins_remaining ?? 0,
    );
    writeJson(EARNED_KEY, earned);
    writeJson(SPINS_KEY, remaining);
    if (apiProgress.starter_spin) writeJson(STARTER_KEY, true);
    for (const c of apiProgress.explored_categories ?? []) {
      if (!explored.includes(c)) explored.push(c);
    }
    writeJson(EXPLORED_KEY, explored);
  }
}

export function mockCheckout(category: string): CheckoutResult {
  const explored = readJson<string[]>(EXPLORED_KEY, []);
  let spins_earned = readJson<number>(EARNED_KEY, 0);
  let spins_remaining = readJson<number>(SPINS_KEY, 0);
  let starter = readJson<boolean>(STARTER_KEY, false);

  const already = explored.includes(category);
  let spinUnlocked = false;
  let unlockType: "starter" | "new_category" | null = null;
  let message = "";

  if (!starter) {
    starter = true;
    writeJson(STARTER_KEY, true);
    if (!already) explored.push(category);
    if (spins_earned < MAX) {
      spins_earned += 1;
      spins_remaining += 1;
      spinUnlocked = true;
      unlockType = "starter";
      message = "Welcome to Category Quest! You earned your Starter Spin.";
    }
  } else if (already) {
    message = "No new spin earned. Explore another category to unlock your next Spin.";
  } else {
    explored.push(category);
    if (spins_earned < MAX) {
      spins_earned += 1;
      spins_remaining += 1;
      spinUnlocked = true;
      unlockType = "new_category";
      message = "New Category Unlocked! You earned another Spin.";
    } else {
      message = "Category explored! You've already earned all 3 spins this month.";
    }
  }

  writeJson(EXPLORED_KEY, explored);
  writeJson(EARNED_KEY, spins_earned);
  writeJson(SPINS_KEY, spins_remaining);

  return {
    spinUnlocked,
    message,
    rewardEligible: spinUnlocked,
    unlockType,
    orderCategory: category,
    progress: getMockProgress(),
  };
}

/** Always returns a win — never throws. Used for the demo spin wheel. */
export function mockSpin(): SpinResult {
  let spins_remaining = readJson<number>(SPINS_KEY, 0);
  if (spins_remaining <= 0) spins_remaining = 1;
  spins_remaining -= 1;
  writeJson(SPINS_KEY, spins_remaining);

  const segments = getMockWheelSegments();
  const segment_index = Math.floor(Math.random() * segments.length);
  const reward_name = segments[segment_index].reward_name;
  const discount = reward_name.includes("Free")
    ? "Free Delivery"
    : reward_name.includes("2×")
      ? "2× Points"
      : reward_name.split(" ").slice(0, 2).join(" ");

  const coupon: Coupon = {
    id: Date.now(),
    reward_name,
    discount,
    category: null,
    expiry_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    status: "active",
    days_remaining: 30,
  };

  const coupons = readJson<Coupon[]>(COUPONS_KEY, []);
  coupons.unshift(coupon);
  writeJson(COUPONS_KEY, coupons);

  return {
    coupon,
    template_id: segments[segment_index].template_id,
    segment_index,
    segments,
    progress: getMockProgress(),
    message: `You won ${reward_name}`,
  };
}

export function getMockCoupons(): Coupon[] {
  return readJson<Coupon[]>(COUPONS_KEY, []);
}

export function mockRedeemCoupon(id: number) {
  const coupons = getMockCoupons().filter((c) => c.id !== id);
  writeJson(COUPONS_KEY, coupons);
  return { id, status: "redeemed", message: "Coupon redeemed (demo)" };
}
