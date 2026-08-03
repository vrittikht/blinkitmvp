"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, Search, User, Wallet } from "lucide-react";

import { BottomNav } from "@/components/layout/bottom-nav";
import { DEMO_PROFILE } from "@/lib/demo-profile";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive =
    pathname.startsWith("/order/tracking") ||
    pathname.startsWith("/spin") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/quest");

  if (immersive) {
    return <div className="mx-auto min-h-dvh w-full max-w-md bg-background">{children}</div>;
  }

  const isHome = pathname === "/";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-[#f4f4f4] shadow-[0_0_40px_rgb(0_0_0_/0.06)] dark:bg-background">
      {isHome ? <HomeHeader /> : <SimpleHeader title={headerTitle(pathname)} />}
      <main className={isHome ? "flex-1 overflow-y-auto pb-24" : "flex-1 overflow-y-auto px-3 pb-24 pt-3"}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

function headerTitle(pathname: string) {
  if (pathname.startsWith("/categories")) return "Categories";
  if (pathname.startsWith("/category")) return "Products";
  if (pathname.startsWith("/cart")) return "My Cart";
  if (pathname.startsWith("/rewards")) return "Coupons";
  if (pathname.startsWith("/quest")) return "Category Quest";
  if (pathname.startsWith("/order-again")) return "Order Again";
  if (pathname.startsWith("/print")) return "Print";
  return "blinkit";
}

function HomeHeader() {
  return (
    <header className="sticky top-0 z-40 bg-[var(--blinkit-yellow)] px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] dark:bg-[var(--blinkit-yellow-deep)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[22px] font-extrabold leading-none tracking-tight text-foreground">
              Blinkit in <span className="text-[26px]">8 minutes</span>
            </h1>
            <span className="rounded-full bg-teal-600/90 px-2 py-0.5 text-[10px] font-semibold text-white">
              1.4 km away
            </span>
          </div>
          <button type="button" className="mt-1.5 flex max-w-full items-center gap-1 text-left">
            <span className="truncate text-[13px] font-semibold text-foreground">
              {DEMO_PROFILE.addressLine}
            </span>
            <span className="text-xs">▼</span>
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="flex h-9 items-center gap-1 rounded-full bg-white px-2.5 text-xs font-semibold shadow-sm"
            aria-label="Wallet"
          >
            <Wallet className="size-3.5" />
            ₹0
          </button>
          <Link
            href="/account"
            className="flex size-9 items-center justify-center rounded-full bg-white shadow-sm"
            aria-label="Your account"
          >
            <User className="size-5 text-foreground" />
          </Link>
        </div>
      </div>

      <div className="relative mt-3">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          readOnly
          placeholder='Search "houseparty"'
          className="h-11 w-full rounded-xl border-0 bg-white pr-10 pl-10 text-sm shadow-sm outline-none placeholder:text-muted-foreground"
          aria-label="Search"
        />
        <Mic className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </header>
  );
}

function SimpleHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white px-3 py-3 dark:bg-card">
      <h1 className="text-lg font-bold text-foreground">{title}</h1>
    </header>
  );
}
