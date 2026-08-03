import type { CartItem, Coupon } from "@/lib/types";

export type CouponEffect =
  | { kind: "amount"; amount: number; label: string }
  | { kind: "free_delivery"; label: string }
  | { kind: "points"; amount: number; label: string };

/** Map reward labels → catalog category names */
const CATEGORY_ALIASES: Record<string, string> = {
  beauty: "Personal Care",
  "personal care": "Personal Care",
  pharmacy: "Pharmacy",
  snacks: "Snacks",
  dairy: "Dairy",
  bakery: "Bakery",
  stationery: "Stationery",
  "home cleaning": "Home Cleaning",
  "kitchen essentials": "Kitchen Essentials",
  "frozen foods": "Frozen Foods",
  "pet care": "Pet Care",
  "baby care": "Baby Care",
  "fruits & vegetables": "Fruits & Vegetables",
  "fruits and vegetables": "Fruits & Vegetables",
};

export function normalizeCategoryName(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  if (CATEGORY_ALIASES[key]) return CATEGORY_ALIASES[key];
  // Title-case fallback to catalog-style name
  return raw.trim();
}

/** Pull ₹ amount from strings like "₹50 OFF" / "₹50 OFF Pharmacy". */
export function parseRupeeOff(text: string): number | null {
  const m = text.match(/₹\s*(\d+)/);
  return m ? Number(m[1]) : null;
}

/** Infer target catalog category from coupon (null = any cart / global). */
export function couponTargetCategory(coupon: Coupon): string | null {
  if (/free delivery/i.test(coupon.reward_name) || /2\s*[×x]/i.test(coupon.reward_name) || /points/i.test(coupon.reward_name)) {
    return null;
  }
  if (coupon.category) return normalizeCategoryName(coupon.category);
  const off = coupon.reward_name.match(/OFF\s+(.+)$/i);
  if (off?.[1]) return normalizeCategoryName(off[1].trim());
  return null;
}

export function describeCouponEffect(coupon: Coupon): CouponEffect {
  const blob = `${coupon.reward_name} ${coupon.discount}`;
  if (/free delivery/i.test(blob)) {
    return { kind: "free_delivery", label: "Free delivery" };
  }
  if (/2\s*[×x]/i.test(blob) || /points/i.test(blob)) {
    return { kind: "points", amount: 25, label: "2× points (₹25 demo credit)" };
  }
  const amount = parseRupeeOff(blob) ?? parseRupeeOff(coupon.discount) ?? 0;
  const cat = couponTargetCategory(coupon);
  return {
    kind: "amount",
    amount,
    label: amount > 0 ? (cat ? `₹${amount} off ${cat}` : `₹${amount} off`) : "Coupon",
  };
}

export function cartCategories(items: CartItem[]): Set<string> {
  return new Set(
    items
      .map((i) => normalizeCategoryName(i.product.category_name))
      .filter((c): c is string => Boolean(c)),
  );
}

export function cartHasCategory(items: CartItem[], target: string): boolean {
  const want = normalizeCategoryName(target);
  if (!want) return false;
  return [...cartCategories(items)].some((c) => c.toLowerCase() === want.toLowerCase());
}

/** Subtotal of items that belong to the coupon’s category only. */
export function categoryEligibleSubtotal(items: CartItem[], target: string): number {
  const want = normalizeCategoryName(target);
  if (!want) return 0;
  return items.reduce((sum, i) => {
    const cat = normalizeCategoryName(i.product.category_name);
    if (!cat || cat.toLowerCase() !== want.toLowerCase()) return sum;
    return sum + i.product.price * i.quantity;
  }, 0);
}

export function isCouponApplicable(
  coupon: Coupon,
  items: CartItem[],
  subtotal: number,
): { ok: boolean; reason?: string } {
  if (coupon.status && coupon.status !== "active") {
    return { ok: false, reason: "Already used" };
  }
  if (subtotal <= 0) return { ok: false, reason: "Cart is empty" };

  const target = couponTargetCategory(coupon);
  if (target) {
    if (!cartHasCategory(items, target)) {
      return { ok: false, reason: `Only for ${target} items` };
    }
    if (categoryEligibleSubtotal(items, target) <= 0) {
      return { ok: false, reason: `Only for ${target} items` };
    }
  }

  const effect = describeCouponEffect(coupon);
  if (effect.kind === "amount" && effect.amount <= 0) {
    return { ok: false, reason: "Invalid coupon" };
  }
  return { ok: true };
}

export type AppliedBill = {
  subtotal: number;
  deliveryBefore: number;
  delivery: number;
  discount: number;
  toPay: number;
  effect: CouponEffect | null;
  couponLabel: string | null;
};

export function applyCouponToBill(
  subtotal: number,
  deliveryBefore: number,
  coupon: Coupon | null,
  items: CartItem[] = [],
): AppliedBill {
  if (!coupon) {
    return {
      subtotal,
      deliveryBefore,
      delivery: deliveryBefore,
      discount: 0,
      toPay: subtotal + deliveryBefore,
      effect: null,
      couponLabel: null,
    };
  }

  // Safety: never apply if cart doesn't qualify
  const check = isCouponApplicable(coupon, items, subtotal);
  if (!check.ok) {
    return {
      subtotal,
      deliveryBefore,
      delivery: deliveryBefore,
      discount: 0,
      toPay: subtotal + deliveryBefore,
      effect: null,
      couponLabel: null,
    };
  }

  const effect = describeCouponEffect(coupon);
  let delivery = deliveryBefore;
  let discount = 0;
  const target = couponTargetCategory(coupon);

  if (effect.kind === "free_delivery") {
    discount = deliveryBefore;
    delivery = 0;
  } else if (effect.kind === "amount" || effect.kind === "points") {
    const base =
      target && effect.kind === "amount"
        ? categoryEligibleSubtotal(items, target)
        : subtotal;
    discount = Math.min(effect.amount, base);
  }

  const toPay = Math.max(0, subtotal - (effect.kind === "free_delivery" ? 0 : discount) + delivery);

  return {
    subtotal,
    deliveryBefore,
    delivery,
    discount,
    toPay,
    effect,
    couponLabel: coupon.reward_name,
  };
}
