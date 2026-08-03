"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type Milestone = {
  id: string;
  label: string;
  done: boolean;
};

export function MilestoneList({ milestones }: { milestones: Milestone[] }) {
  return (
    <ul className="space-y-2.5">
      {milestones.map((m, index) => (
        <motion.li
          key={m.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.08, duration: 0.28 }}
          className="flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5">
            <motion.span
              initial={false}
              animate={
                m.done
                  ? { scale: [1, 1.15, 1], backgroundColor: "var(--primary)" }
                  : { scale: 1 }
              }
              transition={{ duration: 0.45 }}
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-[11px] font-bold",
                m.done
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              {m.done ? "✓" : index + 1}
            </motion.span>
            <span className={cn("text-sm", m.done ? "font-medium text-foreground" : "text-muted-foreground")}>
              {m.label}
            </span>
          </div>
          <span className={cn("text-sm", m.done ? "text-primary" : "text-muted-foreground")}>
            {m.done ? "Done" : "Pending"}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}

export function SpinMeter({
  earned,
  remaining,
  max,
}: {
  earned: number;
  remaining: number;
  max: number;
}) {
  const pct = Math.min(100, Math.round((earned / Math.max(max, 1)) * 100));

  return (
    <div className="rounded-xl bg-secondary/80 px-3 py-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Spins earned</span>
        <span className="font-semibold text-foreground">
          {earned} / {max}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <p className="mt-2 text-lg tracking-wide">
        {Array.from({ length: max }, (_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0.6, opacity: 0.4 }}
            animate={{ scale: i < earned ? 1 : 0.85, opacity: i < earned ? 1 : 0.35 }}
            transition={{ delay: 0.1 * i, type: "spring", stiffness: 320, damping: 18 }}
            className="inline-block"
          >
            {i < earned ? "⭐" : "☆"}
          </motion.span>
        ))}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Ready to spin: <span className="font-medium text-foreground">{remaining}</span>
      </p>
    </div>
  );
}
