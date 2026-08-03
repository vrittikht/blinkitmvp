"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronRight,
  FileText,
  Gift,
  Heart,
  HelpCircle,
  Map,
  ShoppingBasket,
  Sparkles,
  Sun,
  Trophy,
  User,
  Wallet,
} from "lucide-react";

import { useTheme } from "@/components/theme/theme-provider";
import { AnimatedCouponCard } from "@/components/rewards/animated-coupon-card";
import { DEMO_PROFILE } from "@/lib/demo-profile";
import { fetchCoupons, fetchProgress } from "@/lib/api";
import type { Coupon, QuestProgress } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function AccountPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [progress, setProgress] = useState<QuestProgress | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    void Promise.all([fetchProgress(), fetchCoupons()])
      .then(([prog, coups]) => {
        setProgress(prog);
        setCoupons(coups);
      })
      .catch(() => {
        setProgress(null);
        setCoupons([]);
      });
  }, []);

  const infoLinks = [
    { href: "/quest", label: "Category Quest", icon: Trophy, highlight: true },
    { href: "/rewards", label: "My coupons", icon: Gift },
    { href: "#", label: "Address book", icon: BookOpen },
    { href: "#", label: "Your wishlist", icon: Heart },
    { href: "#", label: "GST details", icon: FileText },
    { href: "#", label: "E-gift cards", icon: Gift },
  ];

  const milestonesDone = progress
    ? [progress.starter_spin, progress.new_category_1, progress.new_category_2].filter(Boolean)
        .length
    : 0;

  return (
    <div className="min-h-dvh bg-[#f4f4f4] pb-8 dark:bg-background">
      <div className="bg-gradient-to-b from-[#ffe145] to-[#f4f4f4] px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] dark:from-[#c9a82e] dark:to-background">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-9 items-center justify-center rounded-full bg-white shadow-sm"
          aria-label="Back"
        >
          ‹
        </button>

        <div className="mt-4 flex flex-col items-center pb-4">
          <div className="flex size-20 items-center justify-center rounded-full bg-white shadow-sm">
            <User className="size-10 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="mt-3 text-xl font-bold text-foreground">{DEMO_PROFILE.name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{DEMO_PROFILE.phone}</p>
        </div>
      </div>

      <div className="space-y-3 px-3">
        {/* Quest progress card */}
        <section className="rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] dark:bg-card">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold tracking-wide text-primary uppercase">
                Category Quest
              </p>
              <h2 className="mt-0.5 text-base font-bold text-foreground">Your progress</h2>
            </div>
            <Link href="/quest" className="text-xs font-semibold text-primary">
              Details ›
            </Link>
          </div>

          {progress ? (
            <>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-[#fff8e1] px-2 py-2.5 dark:bg-accent">
                  <p className="text-lg font-bold text-foreground">{progress.spins_earned}</p>
                  <p className="text-[10px] font-medium text-muted-foreground">Spins earned</p>
                </div>
                <div className="rounded-xl bg-[#fff8e1] px-2 py-2.5 dark:bg-accent">
                  <p className="text-lg font-bold text-foreground">{progress.spins_remaining}</p>
                  <p className="text-[10px] font-medium text-muted-foreground">Spins left</p>
                </div>
                <div className="rounded-xl bg-[#fff8e1] px-2 py-2.5 dark:bg-accent">
                  <p className="text-lg font-bold text-foreground">
                    {progress.explored_categories.length}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground">Categories</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>Milestones</span>
                  <span>
                    {milestonesDone}/3 · max {progress.max_spins} spins
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(milestonesDone / 3) * 100}%` }}
                  />
                </div>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li className={progress.starter_spin ? "text-primary font-medium" : ""}>
                    {progress.starter_spin ? "✓" : "○"} Starter Spin
                  </li>
                  <li className={progress.new_category_1 ? "text-primary font-medium" : ""}>
                    {progress.new_category_1 ? "✓" : "○"} New Category #1
                  </li>
                  <li className={progress.new_category_2 ? "text-primary font-medium" : ""}>
                    {progress.new_category_2 ? "✓" : "○"} New Category #2
                  </li>
                </ul>
              </div>

              {progress.spins_remaining > 0 && (
                <Link
                  href="/spin"
                  className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#F8CB46] text-sm font-bold text-[#1f1f1f]"
                >
                  <Sparkles className="size-4" />
                  Spin Now ({progress.spins_remaining} left)
                </Link>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Place an order to start Category Quest.
            </p>
          )}
        </section>

        {/* Coupons preview */}
        <section className="rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] dark:bg-card">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-wide text-primary uppercase">Rewards</p>
              <h2 className="text-base font-bold text-foreground">My coupons</h2>
            </div>
            <Link href="/rewards" className="text-xs font-semibold text-primary">
              See all ›
            </Link>
          </div>

          {coupons.length === 0 ? (
            <p className="rounded-xl bg-secondary/60 px-3 py-4 text-center text-sm text-muted-foreground">
              No coupons yet — spin the wheel after checkout to win one.
            </p>
          ) : (
            <ul className="space-y-2">
              {coupons.slice(0, 3).map((c, i) => (
                <AnimatedCouponCard key={c.id} coupon={c} index={i} />
              ))}
            </ul>
          )}
        </section>

        <Link
          href="/quest"
          className="flex items-center justify-between rounded-2xl bg-[#fff8e1] px-4 py-3 dark:bg-accent"
        >
          <div>
            <p className="text-sm font-bold text-foreground">Full quest dashboard</p>
            <p className="mt-0.5 text-xs font-semibold text-primary">
              {progress
                ? `${progress.spins_remaining} spins left · ${progress.explored_categories.length} categories explored ›`
                : "Explore categories & earn spins ›"}
            </p>
          </div>
          <Sparkles className="size-8 text-[var(--blinkit-yellow-deep)]" />
        </Link>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Your orders", icon: ShoppingBasket, href: "/order-again" },
            { label: "Blinkit Money", icon: Wallet, href: "#" },
            { label: "Need help?", icon: HelpCircle, href: "#" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white px-2 py-4 text-center shadow-[var(--shadow-soft)] dark:bg-card"
            >
              <item.icon className="size-6 text-foreground" strokeWidth={1.5} />
              <span className="text-[11px] font-semibold leading-tight text-foreground">
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-[var(--shadow-soft)] dark:bg-card"
        >
          <Sun className="size-5 text-foreground" strokeWidth={1.5} />
          <span className="flex-1 text-left text-sm font-semibold">Appearance</span>
          <span className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
            {theme} ▾
          </span>
        </button>

        <section className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)] dark:bg-card">
          <h2 className="px-4 pt-4 pb-2 text-base font-bold text-foreground">Your information</h2>
          <ul>
            {infoLinks.map((item, i) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5",
                    i < infoLinks.length - 1 && "border-b border-border/70",
                    item.highlight && "bg-primary/5",
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-5",
                      item.highlight ? "text-primary" : "text-muted-foreground",
                    )}
                    strokeWidth={1.5}
                  />
                  <span
                    className={cn(
                      "flex-1 text-sm",
                      item.highlight ? "font-bold text-primary" : "font-medium text-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                  {item.highlight && progress && (
                    <span className="mr-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {progress.spins_earned}/{progress.max_spins}
                    </span>
                  )}
                  {item.label === "My coupons" && coupons.length > 0 && (
                    <span className="mr-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {coupons.length}
                    </span>
                  )}
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground">
          <Map className="size-3" /> Category Quest MVP · blinkit-style demo
        </p>
      </div>
    </div>
  );
}
