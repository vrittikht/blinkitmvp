import Link from "next/link";

import { ProductCard } from "@/components/catalog/product-card";
import { fetchProducts } from "@/lib/api";

export default async function OrderAgainPage() {
  let products: Awaited<ReturnType<typeof fetchProducts>> = [];
  try {
    products = await fetchProducts();
  } catch {
    /* empty */
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Reorder from your usual picks</p>
      <div className="grid grid-cols-2 gap-2.5">
        {products.slice(0, 6).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <Link href="/" className="block text-center text-sm font-semibold text-primary">
        Browse more on Home
      </Link>
    </div>
  );
}
