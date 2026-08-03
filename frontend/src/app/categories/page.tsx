import Link from "next/link";

import { CategoryTile } from "@/components/catalog/product-card";
import { fetchCategories } from "@/lib/api";

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof fetchCategories>> = [];
  try {
    categories = await fetchCategories();
  } catch {
    /* empty */
  }

  return (
    <div className="rounded-2xl bg-white p-3 dark:bg-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">{categories.length} categories</h2>
        <Link href="/" className="text-xs font-semibold text-primary">
          Home
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {categories.map((c) => (
          <CategoryTile key={c.id} {...c} />
        ))}
      </div>
    </div>
  );
}
