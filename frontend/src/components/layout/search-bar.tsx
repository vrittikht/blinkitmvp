"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export function SearchBar() {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        placeholder="Search for atta, dal, banana..."
        className="h-11 rounded-xl border-border bg-secondary pl-10 text-sm shadow-none placeholder:text-muted-foreground"
        readOnly
        aria-label="Search products"
      />
    </div>
  );
}
