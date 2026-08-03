import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/catalog/product-card";
import { fetchCategory, fetchProducts } from "@/lib/api";

type Props = { params: Promise<{ id: string }> };

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  const categoryId = Number(id);
  if (Number.isNaN(categoryId)) notFound();

  let category;
  let products;

  try {
    [category, products] = await Promise.all([
      fetchCategory(categoryId),
      fetchProducts(categoryId),
    ]);
  } catch {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="flex size-9 items-center justify-center rounded-full bg-secondary text-foreground"
          aria-label="Back to home"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <div className="flex items-center gap-2">
          <span
            className="flex size-10 items-center justify-center rounded-xl text-xl"
            style={{ backgroundColor: category.color }}
          >
            {category.icon}
          </span>
          <div>
            <h1 className="text-lg font-bold text-foreground">{category.name}</h1>
            <p className="text-xs text-muted-foreground">{products.length} items</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
