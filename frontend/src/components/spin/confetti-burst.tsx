"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = { active: boolean };

export function ConfettiBurst({ active }: Props) {
  const [pieces, setPieces] = useState<{ id: number; x: number; delay: number; color: string }[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }
    const colors = ["#0C831F", "#F8CB46", "#318616", "#E23744", "#FFFFFF"];
    setPieces(
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.25,
        color: colors[i % colors.length],
      })),
    );
  }, [active]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.span
            key={p.id}
            className="absolute top-0 h-2 w-2 rounded-sm"
            style={{ left: `${p.x}%`, backgroundColor: p.color }}
            initial={{ y: -10, opacity: 1, rotate: 0 }}
            animate={{ y: 420, opacity: 0, rotate: 240 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, delay: p.delay, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
