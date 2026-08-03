import Link from "next/link";

import { CategoryTile, ProductCard } from "@/components/catalog/product-card";
import { fetchCategories, fetchProducts } from "@/lib/api";


const CHIPS = [
  { label: "All", active: true },
  { label: "Snacks", active: false },
  { label: "Dairy", active: false },
  { label: "Pharmacy", active: false },
  { label: "Beauty", active: false },
];

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof fetchCategories>> = [];
  let products: Awaited<ReturnType<typeof fetchProducts>> = [];
  let error: string | null = null;

  try {
    [categories, products] = await Promise.all([fetchCategories(), fetchProducts()]);
  } catch {
    error = "Could not load catalog. Is the API running?";
  }

  const frequent = products.slice(0, 8);

  return (
    <div className="flex flex-col">
      {/* Category chips under yellow header */}
      <div className="bg-[var(--blinkit-yellow)] px-2 pb-2 dark:bg-[var(--blinkit-yellow-deep)]">
        <div className="flex gap-3 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              className="flex min-w-[52px] flex-col items-center gap-1"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-white/70 text-lg shadow-sm">
                {chip.label === "All" ? "🛍️" : chip.label === "Snacks" ? "🍿" : chip.label === "Dairy" ? "🥛" : chip.label === "Pharmacy" ? "💊" : "✨"}
              </span>
              <span
                className={
                  chip.active
                    ? "border-b-2 border-foreground pb-0.5 text-[11px] font-bold text-foreground"
                    : "text-[11px] font-medium text-foreground/80"
                }
              >
                {chip.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 px-3 pt-3">
        {error && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}

        {/* Promo mosaic */}
        <section>
          <p className="text-center text-[11px] font-bold tracking-[0.2em] text-foreground/70">
            CELEBRATE
          </p>
          <h2 className="mb-3 text-center text-xl font-extrabold tracking-tight text-foreground">
            CATEGORY QUEST
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/account"
              className="row-span-2 flex flex-col justify-between rounded-2xl bg-white p-3 shadow-[var(--shadow-soft)] dark:bg-card"
            >
              <div>
                <p className="text-sm font-bold text-foreground">Earn spins & coupons</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Explore new categories every month
                </p>
              </div>
              <p className="mt-4 text-xs font-semibold text-primary">View in Account →</p>
            </Link>
            <Link
              href={categories.find((c) => c.name === "Snacks") ? `/category/${categories.find((c) => c.name === "Snacks")!.id}` : "/categories"}
              className="rounded-2xl bg-white p-3 shadow-[var(--shadow-soft)] dark:bg-card"
            >
              <p className="text-xs font-bold">Snacks corner</p>
              <p className="mt-1 text-[10px] text-muted-foreground">Chips, namkeen & more</p>
            </Link>
            <Link
              href={categories.find((c) => c.name === "Pharmacy") ? `/category/${categories.find((c) => c.name === "Pharmacy")!.id}` : "/categories"}
              className="rounded-2xl bg-white p-3 shadow-[var(--shadow-soft)] dark:bg-card"
            >
              <p className="text-xs font-bold">Pharmacy</p>
              <p className="mt-1 text-[10px] text-muted-foreground">Daily essentials</p>
            </Link>
          </div>
        </section>

        <Link
          href="/categories"
          className="flex items-center justify-between rounded-2xl bg-[#1e3a5f] px-4 py-3 text-white"
        >
          <div>
            <p className="text-sm font-bold">Shop all categories</p>
            <p className="text-xs text-white/80">Groceries delivered in minutes</p>
          </div>
          <span className="text-lg">›</span>
        </Link>

        {/* Frequently bought */}
        <section>
          <h2 className="mb-2 text-base font-bold text-foreground">Frequently bought</h2>
          <div className="flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {frequent.map((p) => (
              <div key={p.id} className="w-[132px] shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>

        {/* Categories grid */}
        <section id="categories" className="pb-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Shop by category</h2>
            <Link href="/categories" className="text-xs font-semibold text-primary">
              See all
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2 rounded-2xl bg-white p-3 dark:bg-card">
            {categories.slice(0, 8).map((category) => (
              <CategoryTile key={category.id} {...category} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
