"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

import { InlineSpin } from "@/components/spin/inline-spin";
import type { Coupon } from "@/lib/types";

type Props = {
  open: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
  onComplete: (coupon: Coupon) => void;
};

export function SpinOfferPopup({ open, title, subtitle, onClose, onComplete }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Dismiss spin offer"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="spin-popup-title"
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative z-10 mx-3 mb-[max(0.75rem,env(safe-area-inset-bottom))] max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl dark:bg-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wide text-primary uppercase">
                  <Sparkles className="size-3.5" />
                  Category Quest
                </p>
                <h2 id="spin-popup-title" className="mt-1 text-xl font-bold text-foreground">
                  {title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4">
              <InlineSpin compact forceAvailable onComplete={onComplete} />
            </div>

            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Close anytime — your spin stays available below the map.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
