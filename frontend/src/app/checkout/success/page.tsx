import { redirect } from "next/navigation";

/** Legacy route — purchase flow now goes to order tracking → spin */
export default async function CheckoutSuccessRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") q.set(key, value);
  }
  redirect(`/order/tracking?${q.toString()}`);
}
