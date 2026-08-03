"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

import type { WheelSegment } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLORS = ["#0C831F", "#F8CB46", "#318616", "#E8F5E9", "#0C831F", "#FFF8E1", "#2E7D32", "#F5F5F5"];

type Props = {
  segments: WheelSegment[];
  rotation: number;
  spinning: boolean;
};

export function SpinWheel({ segments, rotation, spinning }: Props) {
  const gradient = useMemo(() => {
    if (segments.length === 0) return "#e8e8e8";
    const slice = 360 / segments.length;
    const stops = segments.map((_, i) => {
      const color = COLORS[i % COLORS.length];
      return `${color} ${i * slice}deg ${(i + 1) * slice}deg`;
    });
    return `conic-gradient(from -90deg, ${stops.join(", ")})`;
  }, [segments]);

  const slice = segments.length ? 360 / segments.length : 45;

  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      {/* Pointer */}
      <div className="absolute -top-1 left-1/2 z-20 -translate-x-1/2">
        <div className="h-0 w-0 border-x-[10px] border-t-[18px] border-x-transparent border-t-primary drop-shadow" />
      </div>

      <motion.div
        className="relative aspect-square w-full rounded-full border-[6px] border-primary shadow-[var(--shadow-soft)]"
        style={{ background: gradient }}
        animate={{ rotate: rotation }}
        transition={
          spinning
            ? { duration: 3.5, ease: [0.15, 0.85, 0.2, 1] }
            : { duration: 0 }
        }
      >
        <div className="absolute inset-0">
          {segments.map((seg, i) => {
            const angle = -90 + slice * i + slice / 2;
            return (
              <div
                key={`${seg.template_id}-${i}`}
                className="absolute top-1/2 left-1/2 origin-left"
                style={{
                  width: "46%",
                  transform: `rotate(${angle}deg) translateX(12%)`,
                }}
              >
                <span
                  className={cn(
                    "block text-center text-[10px] font-bold leading-tight",
                    i % 2 === 0 ? "text-white" : "text-foreground",
                  )}
                >
                  {seg.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="absolute top-1/2 left-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-primary text-[9px] font-bold tracking-wide text-primary-foreground shadow">
          blinkit
        </div>
      </motion.div>
    </div>
  );
}
