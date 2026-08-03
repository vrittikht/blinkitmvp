"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/commerce";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductImage({
  product,
  className,
  sizes = "160px",
}: {
  product: Pick<Product, "name" | "image_url">;
  className?: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (product.image_url && !failed) {
    return (
      <Image
        src={product.image_url}
        alt={product.name}
        fill
        sizes={sizes}
        className={cn("object-cover", className)}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="flex size-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-[#fff8e1] to-[#e8f5e9] px-2 text-center">
      <span className="text-2xl font-bold text-primary/80">{product.name.slice(0, 1)}</span>
      <span className="line-clamp-2 text-[10px] font-medium text-muted-foreground">{product.name}</span>
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem, items, setQuantity } = useCart();
  const inCart = items.find((i) => i.product.id === product.id);

  return (
    <article className="flex flex-col rounded-xl border border-border/80 bg-card p-2.5 shadow-[var(--shadow-soft)]">
      <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-secondary">
        <ProductImage product={product} />
      </div>
      <p className="text-[10px] font-medium text-muted-foreground">{product.unit}</p>
      <h3 className="mt-0.5 line-clamp-2 min-h-9 text-[13px] font-semibold leading-snug text-foreground">
        {product.name}
      </h3>
      <div className="mt-auto flex items-end justify-between gap-2 pt-2.5">
        <p className="text-[15px] font-bold text-foreground">{formatInr(product.price)}</p>
        {inCart ? (
          <div className="flex h-8 items-center rounded-lg border border-primary bg-primary/5 text-primary">
            <button
              type="button"
              className="px-2.5 text-lg leading-none"
              onClick={() => setQuantity(product.id, inCart.quantity - 1)}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="min-w-5 text-center text-sm font-semibold">{inCart.quantity}</span>
            <button
              type="button"
              className="px-2.5 text-lg leading-none"
              onClick={() => setQuantity(product.id, inCart.quantity + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="h-8 border-primary px-3 font-bold text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => addItem(product)}
          >
            ADD
          </Button>
        )}
      </div>
    </article>
  );
}

export function CategoryTile({
  id,
  name,
  icon,
  color,
}: {
  id: number;
  name: string;
  icon: string;
  color: string;
}) {
  return (
    <Link
      href={`/category/${id}`}
      className="flex flex-col items-center gap-2 rounded-2xl p-2 text-center transition-transform active:scale-[0.98]"
    >
      <span
        className="flex size-[4.5rem] items-center justify-center rounded-2xl text-3xl shadow-[var(--shadow-soft)]"
        style={{ backgroundColor: color }}
      >
        {icon}
      </span>
      <span className="line-clamp-2 text-xs font-medium leading-tight text-foreground">{name}</span>
    </Link>
  );
}
