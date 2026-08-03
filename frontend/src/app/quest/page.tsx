"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Sparkles } from "lucide-react";

import { AchievementBadges } from "@/components/quest/achievement-badges";
import { MilestoneList, SpinMeter } from "@/components/quest/milestones";
import { AnimatedCouponCard } from "@/components/rewards/animated-coupon-card";
import { EmptyBlock, ErrorBlock, LoadingBlock, SectionCard } from "@/components/ui/states";
import { fetchCategories, fetchCoupons, fetchProgress } from "@/lib/api";
import type { Category, Coupon, QuestProgress } from "@/lib/types";

function monthTitle(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });
}

export default function QuestDashboardPage() {
  const [progress, setProgress] = useState<QuestProgress | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    const [prog, coups] = await Promise.all([fetchProgress(), fetchCoupons()]);
    let cats: Category[] = [];
    try {
      cats = await fetchCategories();
    } catch {
      cats = [];
    }
    setProgress(prog);
    setCategories(cats);
    setCoupons(coups);
  }, []);

  useEffect(() => {
    load()
      .catch(() => setError("Could not load quest dashboard. Is the API running?"))
      .finally(() => setLoading(false));
  }, [load]);

  const exploredSet = useMemo(
    () => new Set(progress?.explored_categories ?? []),
    [progress],
  );

  const remainingCategories = useMemo(
    () => categories.filter((c) => !exploredSet.has(c.name)),
    [categories, exploredSet],
  );

  if (loading) {
    return <LoadingBlock label="Loading your Category Quest…" />;
  }

  if (error || !progress) {
    return (
      <ErrorBlock
        title="Quest unavailable"
        message={error ?? "No progress data"}
        onRetry={() => {
          setLoading(true);
          load()
            .catch(() => setError("Could not load quest dashboard. Is the API running?"))
            .finally(() => setLoading(false));
        }}
      />
    );
  }

  const milestones = [
    { id: "starter", label: "Starter Spin", done: progress.starter_spin },
    { id: "cat1", label: "New Category #1", done: progress.new_category_1 },
    { id: "cat2", label: "New Category #2", done: progress.new_category_2 },
  ];

  const questComplete = milestones.every((m) => m.done);

  return (
    <div className="flex flex-col gap-4 pb-2">
      <div className="flex items-center gap-2">
        <Link
          href="/account"
          className="flex size-9 items-center justify-center rounded-full bg-secondary"
          aria-label="Back"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-primary uppercase">
            From Your account
          </p>
          <h1 className="text-lg font-bold text-foreground">{monthTitle(progress.month)}</h1>
        </div>
      </div>

      {questComplete && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-primary px-4 py-3 text-primary-foreground shadow-[var(--shadow-soft)]"
        >
          <p className="text-sm font-semibold">Quest complete for this month</p>
          <p className="text-xs text-primary-foreground/85">
            You’ve explored new categories and earned all milestone spins.
          </p>
        </motion.div>
      )}

      <SectionCard>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Achievements</h2>
        <AchievementBadges progress={progress} />
      </SectionCard>

      <SectionCard>
        <h2 className="text-sm font-semibold text-foreground">Progress</h2>
        <div className="mt-3">
          <MilestoneList milestones={milestones} />
        </div>
        <div className="mt-4">
          <SpinMeter
            earned={progress.spins_earned}
            remaining={progress.spins_remaining}
            max={progress.max_spins}
          />
        </div>
      </SectionCard>

      <SectionCard>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Categories</h2>
          <span className="text-xs text-muted-foreground">
            {progress.explored_categories.length} explored · {remainingCategories.length} left
          </span>
        </div>

        {categories.length === 0 ? (
          <EmptyBlock title="No categories" message="Catalog is empty — seed the API." />
        ) : (
          <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {categories.map((cat, i) => {
              const done = exploredSet.has(cat.name);
              return (
                <motion.li
                  key={cat.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4) }}
                >
                  <Link
                    href={`/category/${cat.id}`}
                    className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-secondary/80"
                  >
                    <span
                      className="flex size-9 items-center justify-center rounded-xl text-lg"
                      style={{ backgroundColor: cat.color }}
                    >
                      {cat.icon}
                    </span>
                    <span className="flex-1 text-sm font-medium text-foreground">{cat.name}</span>
                    <span
                      className={
                        done ? "text-xs font-semibold text-primary" : "text-xs text-muted-foreground"
                      }
                    >
                      {done ? "✓ Explored" : "Explore"}
                    </span>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      <SectionCard>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">My Coupons</h2>
          <Link href="/rewards" className="text-xs font-semibold text-primary">
            See all
          </Link>
        </div>

        {coupons.length === 0 ? (
          <EmptyBlock
            title="No coupons yet"
            message="Spin the wheel after unlocking a quest spin."
            action={
              progress.spins_remaining > 0 ? (
                <Link href="/spin" className="text-sm font-semibold text-primary">
                  Spin Now
                </Link>
              ) : (
                <Link href="/" className="text-sm font-semibold text-primary">
                  Shop to earn a spin
                </Link>
              )
            }
          />
        ) : (
          <ul className="space-y-2">
            {coupons.slice(0, 3).map((c, i) => (
              <AnimatedCouponCard key={c.id} coupon={c} index={i} />
            ))}
          </ul>
        )}
      </SectionCard>

      <div className="flex flex-col gap-2">
        {progress.spins_remaining > 0 && (
          <Link
            href="/spin"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
          >
            <Sparkles className="size-4" />
            Spin Now ({progress.spins_remaining} left)
          </Link>
        )}
        <Link
          href="/account"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border text-sm font-semibold text-foreground"
        >
          Back to account
        </Link>
      </div>
    </div>
  );
}
