"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Clock, Home, Search, Share2, ShoppingBag, Ticket } from "lucide-react";

import { ProductImage } from "@/components/catalog/product-card";
import { useCart } from "@/components/cart/cart-provider";
import {
  DELIVERY_FEE,
  FREE_DELIVERY_MIN,
  deliveryFeeFor,
  formatInr,
} from "@/lib/commerce";
import {
  applyCouponToBill,
  describeCouponEffect,
  isCouponApplicable,
} from "@/lib/coupons";
import { DEMO_PROFILE } from "@/lib/demo-profile";
import { redeemCoupon } from "@/lib/api";
import { getMockCoupons } from "@/lib/mock-quest";
import type { Coupon } from "@/lib/types";
import { cn } from "@/lib/utils";

function activeCoupons(list: Coupon[]) {
  return list.filter((c) => !c.status || c.status === "active");
}

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, setQuantity, removeItem, primaryCategory, clearCart } = useCart();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [placing, setPlacing] = useState(false);

  const reloadCoupons = () => {
    // Checkout only shows coupons won from the spin wheel (local spin wallet)
    setCoupons(activeCoupons(getMockCoupons()));
  };

  useEffect(() => {
    reloadCoupons();
    const onFocus = () => reloadCoupons();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const selected = useMemo(
    () => coupons.find((c) => c.id === selectedId) ?? null,
    [coupons, selectedId],
  );

  useEffect(() => {
    if (!selected) return;
    const check = isCouponApplicable(selected, items, subtotal);
    if (!check.ok) setSelectedId(null);
  }, [selected, items, subtotal]);

  const deliveryBefore = deliveryFeeFor(subtotal);
  const bill = applyCouponToBill(subtotal, deliveryBefore, selected, items);
  const remainingForFree = Math.max(0, FREE_DELIVERY_MIN - subtotal);
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <ShoppingBag className="size-10 text-muted-foreground" />
        <h1 className="text-lg font-semibold">Your cart is empty</h1>
        <p className="text-sm text-muted-foreground">
          Add items worth ₹{FREE_DELIVERY_MIN}+ for free delivery
        </p>
        <Link
          href="/"
          className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Browse products
        </Link>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (placing) return;
    setPlacing(true);
    const category = primaryCategory ?? items[0].product.category_name ?? "Unknown";

    if (selected) {
      try {
        await redeemCoupon(selected.id);
      } catch {
        /* local redeem handled in api */
      }
    }

    const params = new URLSearchParams({
      category,
      total: String(bill.toPay),
      subtotal: String(subtotal),
      delivery: String(bill.delivery),
      discount: String(bill.discount),
      items: String(itemCount),
      oid: String(Date.now()),
    });
    if (selected) params.set("coupon", selected.reward_name);
    clearCart();
    router.push(`/order/tracking?${params.toString()}`);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#f4f4f4] dark:bg-background">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-white px-3 py-3 dark:bg-card">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-8 items-center justify-center"
          aria-label="Back"
        >
          <ChevronLeft className="size-6" />
        </button>
        <h1 className="flex-1 text-center text-base font-bold">Checkout</h1>
        <button type="button" className="p-1" aria-label="Search">
          <Search className="size-5" />
        </button>
        <button type="button" className="p-1" aria-label="Share">
          <Share2 className="size-5" />
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3 pb-36">
        <div className="flex items-center justify-between rounded-xl border border-border bg-white px-3 py-3 dark:bg-card">
          <p className="text-sm text-foreground">
            Order for <span className="font-semibold">{DEMO_PROFILE.name}</span>,{" "}
            {DEMO_PROFILE.phone}
          </p>
          <button type="button" className="text-sm font-semibold text-primary">
            Change
          </button>
        </div>

        {/* Apply coupon — first thing after address */}
        <section className="rounded-xl border-2 border-[#F8CB46] bg-[#fff8e1] p-3 dark:border-primary dark:bg-accent">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-bold">
              <Ticket className="size-4 text-primary" />
              Apply coupon
            </h2>
            <button
              type="button"
              onClick={reloadCoupons}
              className="text-xs font-semibold text-primary"
            >
              Refresh
            </button>
          </div>

          {coupons.length === 0 ? (
            <div className="rounded-lg bg-white px-3 py-3 dark:bg-card">
              <p className="text-xs font-semibold text-foreground">No spin coupons yet</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Coupons appear here only after you win them on the spin wheel. Category coupons
                work only on that category (e.g. Personal Care ≠ Baby Care).
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {coupons.map((coupon) => {
                const check = isCouponApplicable(coupon, items, subtotal);
                const effect = describeCouponEffect(coupon);
                const active = selectedId === coupon.id;
                return (
                  <li key={coupon.id}>
                    <button
                      type="button"
                      disabled={!check.ok}
                      onClick={() => setSelectedId(active ? null : coupon.id)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border bg-white px-3 py-3 text-left dark:bg-card",
                        active
                          ? "border-primary ring-2 ring-primary/25"
                          : "border-border",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground",
                        )}
                      >
                        {active ? "✓" : ""}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-foreground">
                          {coupon.reward_name}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">
                          {check.ok ? effect.label : check.reason}
                        </span>
                      </span>
                      <span className={cn(
                        "shrink-0 rounded-md px-2 py-1 text-[10px] font-bold",
                        check.ok
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground",
                      )}>
                        {active ? "APPLIED" : check.ok ? "APPLY" : "LOCKED"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {selected && bill.discount > 0 && (
            <p className="mt-2 text-center text-xs font-bold text-primary">
              You save {formatInr(bill.discount)} on this bill
            </p>
          )}
        </section>

        <div className="rounded-xl border border-border bg-white px-3 py-3 dark:bg-card">
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-primary" />
            <div>
              <p className="text-sm font-bold text-foreground">Delivery in 9 minutes</p>
              <p className="text-xs text-muted-foreground">Shipment of {itemCount} items</p>
            </div>
          </div>
        </div>

        {remainingForFree > 0 ? (
          <div className="rounded-xl bg-white px-3 py-2.5 text-xs dark:bg-card">
            Add <span className="font-bold">{formatInr(remainingForFree)}</span> more for{" "}
            <span className="font-bold text-primary">FREE delivery</span>
          </div>
        ) : (
          <div className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
            Yay! FREE delivery on this order
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-border bg-white dark:bg-card">
          {items.map(({ product, quantity }, idx) => (
            <div
              key={product.id}
              className={
                idx < items.length - 1
                  ? "flex gap-3 border-b border-border px-3 py-3"
                  : "flex gap-3 px-3 py-3"
              }
            >
              <div className="relative size-[64px] shrink-0 overflow-hidden rounded-lg bg-secondary">
                <ProductImage product={product} sizes="64px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold leading-snug">{product.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{product.unit}</p>
                <button
                  type="button"
                  className="mt-1 text-xs text-muted-foreground"
                  onClick={() => removeItem(product.id)}
                >
                  Remove
                </button>
              </div>
              <div className="flex flex-col items-end justify-between">
                <div className="flex h-8 items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                  <button
                    type="button"
                    className="px-2.5"
                    onClick={() => setQuantity(product.id, quantity - 1)}
                  >
                    −
                  </button>
                  <span className="min-w-4 text-center">{quantity}</span>
                  <button
                    type="button"
                    className="px-2.5"
                    onClick={() => setQuantity(product.id, quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <p className="text-sm font-bold">{formatInr(product.price * quantity)}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-border bg-white p-3 dark:bg-card">
          <h2 className="text-sm font-bold">Bill details</h2>
          <dl className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Item total</dt>
              <dd className="font-medium">{formatInr(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery partner fee</dt>
              <dd className="font-medium">
                {bill.delivery === 0 ? (
                  <span className="text-primary">FREE</span>
                ) : (
                  formatInr(DELIVERY_FEE)
                )}
              </dd>
            </div>
            {bill.discount > 0 && (
              <div className="flex justify-between text-primary">
                <dt>Coupon discount</dt>
                <dd className="font-semibold">−{formatInr(bill.discount)}</dd>
              </div>
            )}
            {selected && (
              <p className="text-[11px] text-muted-foreground">{selected.reward_name}</p>
            )}
            <div className="flex justify-between border-t border-border pt-2 font-bold">
              <dt>To pay</dt>
              <dd>{formatInr(bill.toPay)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-white dark:bg-card">
        <div className="flex items-center gap-2 px-3 py-2">
          <Home className="size-5 text-[var(--blinkit-yellow-deep)]" fill="currentColor" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold">Delivering to Home</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {DEMO_PROFILE.addressFull}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            className="flex h-12 flex-col justify-center rounded-xl border border-border px-3 text-left"
          >
            <span className="text-[10px] text-muted-foreground">PAY USING</span>
            <span className="text-xs font-bold">Paytm UPI ▾</span>
          </button>
          <button
            type="button"
            disabled={placing}
            onClick={() => void handleCheckout()}
            className="flex h-12 flex-1 items-center justify-between rounded-xl bg-primary px-4 text-primary-foreground disabled:opacity-70"
          >
            <span className="text-sm font-bold">{formatInr(bill.toPay)} TOTAL</span>
            <span className="text-sm font-bold">Place Order ›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
