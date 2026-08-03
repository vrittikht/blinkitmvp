"use client";

import { motion } from "framer-motion";
import { Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Coupon } from "@/lib/types";

export function AnimatedCouponCard({
  coupon,
  index = 0,
  onRedeem,
}: {
  coupon: Coupon;
  index?: number;
  onRedeem?: (id: number) => void;
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 280, damping: 22 }}
      whileHover={{ y: -2 }}
      className="list-none overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]"
    >
      <div className="flex">
        <motion.div
          className="flex w-24 shrink-0 flex-col items-center justify-center bg-primary px-2 py-4 text-center text-primary-foreground"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <Ticket className="mb-1 size-4 opacity-90" />
          <span className="text-sm font-bold leading-tight">{coupon.discount}</span>
        </motion.div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <p className="text-sm font-semibold text-foreground">{coupon.reward_name}</p>
          {coupon.category && (
            <p className="text-xs text-muted-foreground">Valid on {coupon.category}</p>
          )}
          <p className="text-xs text-muted-foreground">Expires in {coupon.days_remaining} days</p>
          {onRedeem && (
            <Button
              size="sm"
              variant="outline"
              className="mt-1 w-fit border-primary text-primary"
              onClick={() => onRedeem(coupon.id)}
            >
              Redeem
            </Button>
          )}
        </div>
      </div>
    </motion.li>
  );
}
