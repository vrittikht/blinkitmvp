"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Clock, Home, Search, Share2, ShoppingBag } from "lucide-react";

import { ProductImage } from "@/components/catalog/product-card";
import { useCart } from "@/components/cart/cart-provider";
import {
  DELIVERY_FEE,
  FREE_DELIVERY_MIN,
  deliveryFeeFor,
  formatInr,
} from "@/lib/commerce";
import { DEMO_PROFILE } from "@/lib/demo-profile";

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, setQuantity, removeItem, primaryCategory, clearCart } = useCart();

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

  const delivery = deliveryFeeFor(subtotal);
  const toPay = subtotal + delivery;
  const remainingForFree = Math.max(0, FREE_DELIVERY_MIN - subtotal);
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  const handleCheckout = () => {
    const category = primaryCategory ?? items[0].product.category_name ?? "Unknown";
    const params = new URLSearchParams({
      category,
      total: String(toPay),
      subtotal: String(subtotal),
      delivery: String(delivery),
      items: String(itemCount),
      oid: String(Date.now()),
    });
    clearCart();
    router.push(`/order/tracking?${params.toString()}`);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#f4f4f4] dark:bg-background">
      {/* Checkout header */}
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
          <div className="rounded-xl bg-[#fff8e1] px-3 py-2.5 text-xs dark:bg-accent">
            Add <span className="font-bold">{formatInr(remainingForFree)}</span> more for{" "}
            <span className="font-bold text-primary">FREE delivery</span>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_MIN) * 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
            Yay! FREE delivery on this order (₹{FREE_DELIVERY_MIN}+)
          </div>
        )}

        {/* Items */}
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
                  Move to wishlist
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

        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#fff4d4] to-[#ffe9a8] px-3 py-3 dark:from-accent dark:to-accent">
          <span className="text-2xl">🎁</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">Make this a gift!</p>
            <p className="text-xs text-muted-foreground">Special gift bag for just ₹30</p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-primary px-3 py-1.5 text-xs font-bold text-primary"
          >
            Select
          </button>
        </div>

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
                {delivery === 0 ? (
                  <span className="text-primary">FREE</span>
                ) : (
                  formatInr(DELIVERY_FEE)
                )}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-bold">
              <dt>To pay</dt>
              <dd>{formatInr(toPay)}</dd>
            </div>
          </dl>
        </section>
      </div>

      {/* Sticky place order footer */}
      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-white dark:bg-card">
        <div className="flex items-center gap-2 px-3 py-2">
          <Home className="size-5 text-[var(--blinkit-yellow-deep)]" fill="currentColor" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold">
              Delivering to Home{" "}
              <button type="button" className="font-semibold text-primary">
                Change
              </button>
            </p>
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
            onClick={handleCheckout}
            className="flex h-12 flex-1 items-center justify-between rounded-xl bg-primary px-4 text-primary-foreground"
          >
            <span className="text-sm font-bold">{formatInr(toPay)} TOTAL</span>
            <span className="text-sm font-bold">
              Place Order <span aria-hidden>›</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
