"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

import { ConfettiBurst } from "@/components/spin/confetti-burst";
import { SpinWheel } from "@/components/spin/spin-wheel";
import { clearPendingSpin, postSpin } from "@/lib/api";
import { getMockProgress, getMockWheelSegments, grantMockSpinFromUnlock } from "@/lib/mock-quest";
import { playSpinTick, playSpinWhoosh, playWinChime } from "@/lib/sounds";
import type { Coupon, QuestProgress, WheelSegment } from "@/lib/types";

type Props = {
  onComplete?: (coupon: Coupon) => void;
  compact?: boolean;
  /** When true, button stays enabled even if progress says 0 (post-checkout unlock). */
  forceAvailable?: boolean;
};

export function InlineSpin({ onComplete, compact, forceAvailable = true }: Props) {
  const [segments, setSegments] = useState<WheelSegment[]>(() => getMockWheelSegments());
  const [progress, setProgress] = useState<QuestProgress | null>(() => {
    grantMockSpinFromUnlock();
    const p = getMockProgress();
    return { ...p, spins_remaining: Math.max(p.spins_remaining, 1) };
  });
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [won, setWon] = useState<Coupon | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    grantMockSpinFromUnlock();
    setSegments(getMockWheelSegments());
    const p = getMockProgress();
    setProgress({ ...p, spins_remaining: Math.max(p.spins_remaining, forceAvailable ? 1 : 0) });
  }, [forceAvailable]);

  const runSpin = useCallback(async () => {
    if (spinning || won) return;
    setError(null);
    setShowConfetti(false);
    setSpinning(true);
    grantMockSpinFromUnlock();

    try {
      playSpinWhoosh();
    } catch {
      /* ignore audio */
    }

    let tickId = 0;
    try {
      tickId = window.setInterval(() => {
        try {
          playSpinTick();
        } catch {
          /* ignore */
        }
      }, 180);

      const result = await postSpin();
      const segs =
        Array.isArray(result.segments) && result.segments.length > 0
          ? result.segments
          : getMockWheelSegments();
      const idx =
        typeof result.segment_index === "number" && result.segment_index >= 0
          ? result.segment_index % segs.length
          : 0;
      const slice = 360 / segs.length;
      const target = 5 * 360 + (360 - (idx * slice + slice / 2));

      setSegments(segs);
      setRotation((prev) => prev + target);
      setProgress(result.progress ?? getMockProgress());

      window.setTimeout(() => {
        window.clearInterval(tickId);
        setWon(result.coupon);
        setShowConfetti(true);
        setSpinning(false);
        clearPendingSpin();
        try {
          playWinChime();
        } catch {
          /* ignore */
        }
        onComplete?.(result.coupon);
      }, 3600);
    } catch (e) {
      window.clearInterval(tickId);
      setSpinning(false);
      setError(e instanceof Error ? e.message : "Spin failed — try again");
    }
  }, [onComplete, spinning, won]);

  const canSpin = !spinning && !won && (forceAvailable || (progress?.spins_remaining ?? 0) > 0);

  return (
    <div className="relative">
      <ConfettiBurst active={showConfetti} />

      {!won && (
        <p className="mb-3 text-center text-sm text-muted-foreground">
          Spins left:{" "}
          <span className="font-semibold text-foreground">
            {Math.max(progress?.spins_remaining ?? 0, canSpin ? 1 : 0)}
          </span>
        </p>
      )}

      <div className={compact ? "mx-auto max-w-[240px]" : undefined}>
        <SpinWheel segments={segments} rotation={rotation} spinning={spinning} />
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-4">
        {!won && (
          <button
            type="button"
            disabled={!canSpin}
            onClick={() => void runSpin()}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#F8CB46] text-base font-bold text-[#1f1f1f] disabled:opacity-50"
          >
            {spinning ? "Spinning…" : "Spin the wheel"}
          </button>
        )}
      </div>

      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-2xl border border-primary/30 bg-card p-4 text-center"
          >
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">You won</p>
            <h3 className="mt-1 text-xl font-bold text-foreground">{won.reward_name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Saved to coupons · {won.days_remaining} days left
            </p>
            <Link
              href="/rewards"
              className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
            >
              View coupon
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
