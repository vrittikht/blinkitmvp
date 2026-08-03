import type {
  Category,
  CheckoutResult,
  Coupon,
  Product,
  QuestProgress,
  SpinResult,
  WheelSegment,
} from "@/lib/types";
import {
  getMockCoupons,
  getMockProgress,
  getMockWheelSegments,
  grantMockSpinFromUnlock,
  mockCheckout,
  mockRedeemCoupon,
  mockSpin,
  syncExploredCategory,
} from "@/lib/mock-quest";

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`API ${path} failed (${res.status})`);
  }
  return res.json();
}

async function apiPost<T>(path: string, body: unknown = {}): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`API ${path} failed (${res.status}): ${detail}`);
  }
  return res.json();
}

export async function fetchHealth(): Promise<{ status: string; service: string; phase?: number }> {
  return apiGet("/health");
}

export async function fetchCategories(): Promise<Category[]> {
  return apiGet("/categories");
}

export async function fetchCategory(id: number): Promise<Category> {
  return apiGet(`/categories/${id}`);
}

export async function fetchProducts(categoryId?: number): Promise<Product[]> {
  const query = categoryId != null ? `?category_id=${categoryId}` : "";
  return apiGet(`/products${query}`);
}

export async function fetchProgress(_userId?: number): Promise<QuestProgress> {
  const local = getMockProgress();
  try {
    const api = await apiGet<QuestProgress>("/progress");
    return mergeQuestProgress(api, local);
  } catch {
    return local;
  }
}

/** Combine API + localStorage so Account/Quest reflect demo spins & checkouts. */
function mergeQuestProgress(api: QuestProgress, local: QuestProgress): QuestProgress {
  const explored = Array.from(
    new Set([...(api.explored_categories ?? []), ...(local.explored_categories ?? [])]),
  );
  return {
    user_id: api.user_id ?? local.user_id,
    month: api.month || local.month,
    starter_spin: Boolean(api.starter_spin || local.starter_spin),
    new_category_1: Boolean(api.new_category_1 || local.new_category_1 || explored.length >= 2),
    new_category_2: Boolean(api.new_category_2 || local.new_category_2 || explored.length >= 3),
    explored_categories: explored,
    spins_earned: Math.max(api.spins_earned ?? 0, local.spins_earned ?? 0),
    spins_remaining: Math.max(api.spins_remaining ?? 0, local.spins_remaining ?? 0),
    max_spins: Math.max(api.max_spins ?? 3, local.max_spins ?? 3, 3),
  };
}

export async function postCheckout(category: string, _userId?: number): Promise<CheckoutResult> {
  let result: CheckoutResult;
  try {
    result = await apiPost("/checkout", { category });
  } catch {
    result = mockCheckout(category);
  }
  if (result.spinUnlocked) {
    grantMockSpinFromUnlock();
  }
  // Mirror explored category locally so Account quest progress updates
  if (result.orderCategory) {
    syncExploredCategory(result.orderCategory, result.progress);
  }
  return result;
}

export async function fetchWheelSegments(): Promise<WheelSegment[]> {
  try {
    const segs = await apiGet<WheelSegment[]>("/reward-templates");
    if (Array.isArray(segs) && segs.length > 0) return segs;
  } catch {
    /* fall through */
  }
  return getMockWheelSegments();
}

/**
 * Spin must never fail in the demo.
 * Prefer local mock when a post-checkout spin is pending (avoids API "no spins" mismatch).
 */
export async function postSpin(_userId?: number): Promise<SpinResult> {
  const pending =
    typeof window !== "undefined" && Boolean(sessionStorage.getItem(PENDING_SPIN_KEY));

  if (pending) {
    grantMockSpinFromUnlock();
    return mockSpin();
  }

  try {
    const result = await apiPost<SpinResult>("/spin", {});
    if (result?.coupon && Array.isArray(result.segments)) return result;
  } catch {
    /* fall through to mock */
  }

  grantMockSpinFromUnlock();
  return mockSpin();
}

export async function fetchCoupons(_userId?: number): Promise<Coupon[]> {
  const local = getMockCoupons();
  try {
    const api = await apiGet<Coupon[]>("/coupons");
    const byId = new Map<number, Coupon>();
    for (const c of api ?? []) byId.set(c.id, c);
    for (const c of local) byId.set(c.id, c); // local demo wins on id clash
    return Array.from(byId.values()).sort((a, b) => b.id - a.id);
  } catch {
    return local;
  }
}

export async function redeemCoupon(
  couponId: number,
): Promise<{ id: number; status: string; message: string }> {
  try {
    return await apiPost(`/coupons/${couponId}/redeem`, {});
  } catch {
    return mockRedeemCoupon(couponId);
  }
}

export const PENDING_SPIN_KEY = "category-quest-pending-spin";

export function savePendingSpin(result: CheckoutResult) {
  if (typeof window === "undefined") return;
  if (result.spinUnlocked) {
    sessionStorage.setItem(PENDING_SPIN_KEY, JSON.stringify(result));
    grantMockSpinFromUnlock();
  } else {
    sessionStorage.removeItem(PENDING_SPIN_KEY);
  }
}

export function clearPendingSpin() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_SPIN_KEY);
}

export function hasPendingSpin(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(sessionStorage.getItem(PENDING_SPIN_KEY));
}
