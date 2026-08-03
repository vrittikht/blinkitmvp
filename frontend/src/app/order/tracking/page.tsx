"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Bike, MapPin, Phone, Sparkles, Star } from "lucide-react";

import { SpinOfferPopup } from "@/components/spin/spin-offer-popup";
import { postCheckout, savePendingSpin } from "@/lib/api";
import { formatInr } from "@/lib/commerce";
import { DEMO_PARTNER, DEMO_PROFILE } from "@/lib/demo-profile";
import { grantMockSpinFromUnlock } from "@/lib/mock-quest";
import type { CheckoutResult, Coupon } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Deduplicate Strict Mode / remount double checkout */
const checkoutInflight = new Map<string, Promise<CheckoutResult>>();

function checkoutOnce(key: string, category: string): Promise<CheckoutResult> {
  try {
    const cached = sessionStorage.getItem(key);
    if (cached) return Promise.resolve(JSON.parse(cached) as CheckoutResult);
  } catch {
    /* continue */
  }
  const existing = checkoutInflight.get(key);
  if (existing) return existing;
  const promise = postCheckout(category).then((data) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch {
      /* ignore */
    }
    checkoutInflight.delete(key);
    return data;
  });
  checkoutInflight.set(key, promise);
  return promise;
}

function TrackingContent() {
  const params = useSearchParams();
  const category = params.get("category") ?? "Snacks";
  const total = Number(params.get("total") ?? 0);
  const subtotal = Number(params.get("subtotal") ?? total);
  const delivery = Number(params.get("delivery") ?? 0);
  const items = params.get("items") ?? "1";
  const oid = params.get("oid") ?? "demo";

  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [eta] = useState(8);
  const [progressPct, setProgressPct] = useState(18);
  const [showSpinPopup, setShowSpinPopup] = useState(false);
  const [wonCoupon, setWonCoupon] = useState<Coupon | null>(null);

  const orderId = useMemo(
    () => `BK${Math.floor(100000 + Math.random() * 899999)}`,
    [],
  );

  useEffect(() => {
    let cancelled = false;
    const cacheKey = `cq-placed-${oid}`;

    void checkoutOnce(cacheKey, category)
      .then((data) => {
        if (cancelled) return;
        // Demo: after Place Order, always offer the wheel (main demo moment).
        // Real unlock message kept when the quest engine already granted a spin.
        const withSpin: CheckoutResult = {
          ...data,
          spinUnlocked: true,
          unlockType: data.unlockType ?? (data.spinUnlocked ? data.unlockType : "starter"),
          rewardEligible: true,
          message: data.spinUnlocked
            ? data.message
            : "Spin for a discount while your order is on the way.",
        };
        grantMockSpinFromUnlock();
        setResult(withSpin);
        savePendingSpin(withSpin);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, oid]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setProgressPct((p) => (p >= 82 ? p : p + 3));
    }, 800);
    return () => window.clearInterval(id);
  }, []);

  const spinUnlocked = Boolean(result?.spinUnlocked) || (result?.progress?.spins_remaining ?? 0) > 0;
  const spinAvailable = spinUnlocked && !wonCoupon;

  // Auto-open spin popup shortly after tracking loads
  useEffect(() => {
    if (loading || !result || wonCoupon) return;
    const unlocked =
      result.spinUnlocked || (result.progress?.spins_remaining ?? 0) > 0;
    if (!unlocked) return;
    grantMockSpinFromUnlock();
    const t = window.setTimeout(() => setShowSpinPopup(true), 700);
    return () => window.clearTimeout(t);
  }, [loading, result, wonCoupon]);

  if (loading || !result) {
    return (
      <p className="py-20 text-center text-sm text-muted-foreground">Placing your order…</p>
    );
  }

  const spinTitle =
    result.unlockType === "starter"
      ? "You earned your Starter Spin!"
      : "New category — Spin unlocked!";

  return (
    <div className="flex min-h-dvh flex-col bg-[#F7F7F7] dark:bg-background">
      <header className="bg-primary px-4 pb-6 pt-[max(1rem,env(safe-area-inset-top))] text-primary-foreground">
        <p className="text-xs font-medium text-primary-foreground/80">Order #{orderId}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Arriving in {eta} minutes</h1>
        <p className="mt-1 text-sm text-primary-foreground/90">
          Order confirmed for <span className="font-semibold">{DEMO_PROFILE.name}</span>
        </p>

        <div className="mt-5 rounded-2xl bg-white/15 p-3 backdrop-blur">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span>Order packed</span>
            <span>Out for delivery</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-[#F8CB46] transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Bike className="size-4" />
            <span>Delivery partner on the way</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-3 px-4 py-4 pb-28">
        {/* Live map */}
        <section className="overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-soft)]">
          <div className="relative h-44 w-full bg-[#e8f0e4]">
            <div
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  "linear-gradient(#cfd8cc 1px, transparent 1px), linear-gradient(90deg, #cfd8cc 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 360 176" fill="none">
              <path
                d="M40 140 C90 120, 120 80, 180 70 S280 50, 320 36"
                stroke="#0C831F"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="10 8"
              />
              <circle cx="40" cy="140" r="8" fill="#0C831F" />
              <circle cx="320" cy="36" r="10" fill="#F8CB46" stroke="#1f1f1f" strokeWidth="2" />
            </svg>
            <div className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold shadow-sm">
              {DEMO_PARTNER.name.split(" ")[0]} · {eta} min away
            </div>
            <div className="absolute top-3 right-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-white">
              LIVE
            </div>
          </div>
          <div className="flex items-start gap-3 border-t border-border p-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-secondary">
              <MapPin className="size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Delivering to {DEMO_PROFILE.addressLabel}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {DEMO_PROFILE.addressFull}
              </p>
            </div>
          </div>
        </section>

        {/* Spin offer — directly under map (visible if popup closed) */}
        {spinAvailable && (
          <section className="rounded-2xl border-2 border-[#F8CB46] bg-[#fff8e1] p-4 shadow-[var(--shadow-soft)] dark:bg-accent">
            <div className="flex items-start gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-[#F8CB46]">
                <Sparkles className="size-5 text-[#1f1f1f]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold tracking-wide text-primary uppercase">
                  Category Quest
                </p>
                <h2 className="text-base font-bold text-foreground">{spinTitle}</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Spin for a discount while your order is on the way.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSpinPopup(true)}
              className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground"
            >
              <Sparkles className="size-4" />
              Spin the wheel
            </button>
          </section>
        )}

        {wonCoupon && (
          <section className="rounded-2xl bg-primary p-4 text-primary-foreground shadow-[var(--shadow-soft)]">
            <p className="text-[11px] font-semibold uppercase opacity-90">Coupon unlocked</p>
            <h2 className="mt-1 text-lg font-bold">{wonCoupon.reward_name}</h2>
            <Link
              href="/rewards"
              className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#F8CB46] text-sm font-bold text-[#1f1f1f]"
            >
              View in My coupons
            </Link>
          </section>
        )}

        {/* Delivery partner */}
        <section className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#fff8e1] text-lg font-bold text-foreground">
              {DEMO_PARTNER.name
                .split(" ")
                .map((p) => p[0])
                .join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground">{DEMO_PARTNER.name}</p>
              <p className="text-xs text-muted-foreground">{DEMO_PARTNER.vehicle}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3 fill-[#F8CB46] text-[#F8CB46]" />
                {DEMO_PARTNER.rating} · Your delivery partner
              </p>
            </div>
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"
              aria-label="Call partner"
            >
              <Phone className="size-4" />
            </button>
          </div>
        </section>

        <section className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
          <h2 className="text-sm font-semibold text-foreground">Order summary</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {items} items · {result.orderCategory}
              </dt>
              <dd className="font-medium">{formatInr(subtotal || total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="font-medium">
                {delivery <= 0 ? <span className="text-primary">FREE</span> : formatInr(delivery)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <dt className="font-semibold">Paid (demo)</dt>
              <dd className="font-bold">{formatInr(total || subtotal)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-[11px] text-muted-foreground">
            This is a demo checkout — no real payment was made.
          </p>
        </section>

        {!spinUnlocked && (
          <section className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold text-foreground">Category Quest</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{result.message}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Tip: Buy from a <span className="font-semibold text-foreground">new category</span> to
              unlock another spin.
            </p>
            <Link href="/" className="mt-3 inline-block text-sm font-semibold text-primary">
              Continue shopping →
            </Link>
          </section>
        )}

        <Link
          href="/account"
          className="text-center text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
        >
          View quest in Your account
        </Link>
      </div>

      <div
        className={cn(
          "fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
        )}
      >
        {spinAvailable ? (
          <button
            type="button"
            onClick={() => setShowSpinPopup(true)}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#F8CB46] text-sm font-bold text-[#1f1f1f]"
          >
            <Sparkles className="size-4" />
            Spin for discount
          </button>
        ) : (
          <Link
            href="/"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
          >
            Back to home
          </Link>
        )}
      </div>

      <SpinOfferPopup
        open={showSpinPopup && spinAvailable}
        title={spinTitle}
        subtitle={`Spin now while ${DEMO_PARTNER.name.split(" ")[0]} delivers your order.`}
        onClose={() => setShowSpinPopup(false)}
        onComplete={(coupon) => {
          setWonCoupon(coupon);
          setShowSpinPopup(false);
        }}
      />
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<p className="py-20 text-center text-sm text-muted-foreground">Loading…</p>}>
      <TrackingContent />
    </Suspense>
  );
}
