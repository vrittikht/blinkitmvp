"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { ConfettiBurst } from "@/components/spin/confetti-burst";
import { SpinWheel } from "@/components/spin/spin-wheel";
import { Button } from "@/components/ui/button";
import { LoadingBlock } from "@/components/ui/states";
import { clearPendingSpin, postSpin } from "@/lib/api";
import { getMockProgress, getMockWheelSegments, grantMockSpinFromUnlock } from "@/lib/mock-quest";
import { playSpinTick, playSpinWhoosh, playWinChime } from "@/lib/sounds";
import type { Coupon, QuestProgress, WheelSegment } from "@/lib/types";

function SpinContent() {
  const router = useRouter();
  const search = useSearchParams();
  const autospin = search.get("autospin") === "1";
  const fromOrder = search.get("from") === "order";

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
  const [loading, setLoading] = useState(false);
  const autoStarted = useRef(false);

  const runSpin = useCallback(async () => {
    if (spinning || won) return;
    setError(null);
    setShowConfetti(false);
    setSpinning(true);
    grantMockSpinFromUnlock();

    try {
      playSpinWhoosh();
    } catch {
      /* ignore */
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
      }, 3600);
    } catch (e) {
      window.clearInterval(tickId);
      setSpinning(false);
      setError(e instanceof Error ? e.message : "Spin failed");
    }
  }, [spinning, won]);

  useEffect(() => {
    if (loading || autoStarted.current || !autospin || won) return;
    autoStarted.current = true;
    const t = window.setTimeout(() => void runSpin(), 600);
    return () => window.clearTimeout(t);
  }, [loading, autospin, runSpin, won]);

  const canSpin = !spinning && !won;

  return (
    <div className="relative flex min-h-dvh flex-col bg-background px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))]">
      <ConfettiBurst active={showConfetti} />

      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-primary uppercase">
            Category Quest
          </p>
          <h1 className="text-xl font-bold text-foreground">
            {fromOrder ? "Spin while you wait" : "Spin for a coupon"}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => router.push(fromOrder ? "/" : "/quest")}
          className="flex size-9 items-center justify-center rounded-full bg-secondary"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      </div>

      {fromOrder && !won && (
        <p className="mb-4 rounded-xl bg-secondary px-3 py-2 text-center text-xs text-muted-foreground">
          Your order is on the way — spin now to unlock savings on your next shop.
        </p>
      )}

      <p className="mb-3 text-center text-sm text-muted-foreground">
        Spins left:{" "}
        <span className="font-semibold text-foreground">
          {Math.max(progress?.spins_remaining ?? 0, canSpin ? 1 : 0)}
        </span>
      </p>

      <SpinWheel segments={segments} rotation={rotation} spinning={spinning} />

      {error && (
        <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-5">
        {!won && (
          <Button
            className="h-12 w-full text-base font-semibold"
            disabled={!canSpin}
            onClick={() => void runSpin()}
          >
            {spinning ? "Spinning…" : "Tap to spin"}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-2xl border border-primary/30 bg-card p-5 text-center shadow-[var(--shadow-soft)]"
          >
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">You won</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">{won.reward_name}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Coupon saved · Expires in {won.days_remaining} days
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/rewards"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
              >
                View coupon
              </Link>
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border text-sm font-semibold"
              >
                Keep shopping
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SpinPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Loading…" />}>
      <SpinContent />
    </Suspense>
  );
}
