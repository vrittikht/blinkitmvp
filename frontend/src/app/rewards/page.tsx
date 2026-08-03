"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { AnimatedCouponCard } from "@/components/rewards/animated-coupon-card";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/ui/states";
import { fetchCoupons, redeemCoupon } from "@/lib/api";
import type { Coupon } from "@/lib/types";

export default function RewardsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const data = await fetchCoupons();
    setCoupons(data);
  }, []);

  useEffect(() => {
    load()
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  const onRedeem = async (id: number) => {
    try {
      const res = await redeemCoupon(id);
      setMessage(res.message);
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Redeem failed");
    }
  };

  if (loading) {
    return <LoadingBlock label="Loading your coupons…" />;
  }

  if (error) {
    return (
      <ErrorBlock
        title="Coupons unavailable"
        message={error}
        onRetry={() => {
          setLoading(true);
          load()
            .catch((e: Error) => setError(e.message))
            .finally(() => setLoading(false));
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">My Coupons</h1>
        <p className="text-sm text-muted-foreground">Saved from Category Quest spins</p>
      </div>

      {message && (
        <p className="rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">{message}</p>
      )}

      {coupons.length === 0 ? (
        <EmptyBlock
          title="No active coupons"
          message="Complete a quest spin to unlock savings on new categories."
          action={
            <Link href="/quest" className="text-sm font-semibold text-primary">
              Open Category Quest
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {coupons.map((c, i) => (
            <AnimatedCouponCard key={c.id} coupon={c} index={i} onRedeem={onRedeem} />
          ))}
        </ul>
      )}
    </div>
  );
}
