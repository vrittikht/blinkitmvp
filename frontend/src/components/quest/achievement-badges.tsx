"use client";

import { motion } from "framer-motion";

import type { QuestProgress } from "@/lib/types";
import { cn } from "@/lib/utils";

type Badge = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  unlocked: boolean;
};

export function buildBadges(progress: QuestProgress): Badge[] {
  return [
    {
      id: "starter",
      emoji: "🎉",
      title: "First Spin",
      description: "Unlocked your Starter Spin",
      unlocked: progress.starter_spin,
    },
    {
      id: "explorer",
      emoji: "🧭",
      title: "Category Explorer",
      description: "Shopped a new category",
      unlocked: progress.new_category_1,
    },
    {
      id: "champion",
      emoji: "🏆",
      title: "Quest Champion",
      description: "Completed monthly milestones",
      unlocked: progress.new_category_2 && progress.spins_earned >= progress.max_spins,
    },
  ];
}

export function AchievementBadges({ progress }: { progress: QuestProgress }) {
  const badges = buildBadges(progress);

  return (
    <div className="grid grid-cols-3 gap-2">
      {badges.map((badge, i) => (
        <motion.div
          key={badge.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i }}
          className={cn(
            "flex flex-col items-center rounded-2xl border px-2 py-3 text-center",
            badge.unlocked
              ? "border-primary/30 bg-primary/5"
              : "border-border bg-secondary/40 opacity-55",
          )}
        >
          <span className="text-xl" aria-hidden>
            {badge.emoji}
          </span>
          <p className="mt-1 text-[11px] font-semibold text-foreground">{badge.title}</p>
          <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{badge.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
