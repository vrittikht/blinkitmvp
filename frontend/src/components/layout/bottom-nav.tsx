"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Printer, RotateCcw, LayoutGrid } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/order-again", label: "Order Again", icon: RotateCcw },
  { href: "/categories", label: "Categories", icon: LayoutGrid },
  { href: "/print", label: "Print", icon: Printer },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  if (
    pathname.startsWith("/order/tracking") ||
    pathname.startsWith("/spin") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/quest")
  ) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] dark:bg-card"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5 items-end px-1 pt-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon
                  className={cn("size-5", active && "text-[#f5c518]")}
                  strokeWidth={active ? 2.4 : 1.7}
                  fill={active && href === "/" ? "#f5c518" : "none"}
                />
                {label}
              </Link>
            </li>
          );
        })}
        <li className="flex justify-center pb-2">
          <Link
            href="/cart"
            className="relative flex h-8 items-center justify-center rounded-lg bg-[var(--district-purple)] px-2.5 text-[11px] font-bold tracking-tight text-white"
          >
            cart
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ffe145] px-1 text-[9px] font-bold text-foreground">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
