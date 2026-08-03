"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { fetchProgress } from "@/lib/api";
import type { QuestProgress } from "@/lib/types";
import { cn } from "@/lib/utils";

function Milestone({ done, label, delay }: { done: boolean; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.25 }}
      className="flex items-center gap-2 text-sm"
    >
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-md text-xs font-bold",
          done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
        )}
      >
        {done ? "✓" : ""}
      </span>
      <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </motion.div>
  );
}

export function QuestProgressCard() {
  const [progress, setProgress] = useState<QuestProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchProgress()
      .then((data) => {
        if (!cancelled) setProgress(data);
      })
      .catch(() => {
        if (!cancelled) setError("Quest progress unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Link href="/quest" className="mt-2 inline-block text-xs font-semibold text-primary">
          Open Quest
        </Link>
      </section>
    );
  }

  if (!progress) {
    return (
      <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
        <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
        <div className="mt-3 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-secondary" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-secondary" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-secondary" />
        </div>
      </section>
    );
  }

  const monthLabel = (() => {
    const [y, m] = progress.month.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleString("en-IN", { month: "long" });
  })();

  const fill = Math.min(100, Math.round((progress.spins_earned / progress.max_spins) * 100));

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">Category Quest</p>
          <h2 className="text-base font-bold text-foreground">{monthLabel} Category Quest</h2>
        </div>
        <Link
          href="/quest"
          className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
        >
          View Progress
        </Link>
      </div>

      <div className="space-y-2">
        <Milestone done={progress.starter_spin} label="Starter Spin" delay={0.05} />
        <Milestone done={progress.new_category_1} label="Explore 1 New Category" delay={0.1} />
        <Milestone done={progress.new_category_2} label="Explore 2 New Categories" delay={0.15} />
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Spins remaining</span>
          <span className="font-bold text-foreground">
            {progress.spins_remaining} / {progress.max_spins}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${fill}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {progress.explored_categories.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Explored: {progress.explored_categories.join(" · ")}
        </p>
      )}

      {progress.spins_remaining > 0 && (
        <Link
          href="/spin"
          className="mt-3 inline-flex text-xs font-semibold text-primary"
        >
          You have spins waiting → Spin Now
        </Link>
      )}
    </section>
  );
}
