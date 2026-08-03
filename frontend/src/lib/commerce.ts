export const FREE_DELIVERY_MIN = 200;
export const DELIVERY_FEE = 25;

export function deliveryFeeFor(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
}

export function formatInr(amount: number) {
  return `₹${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}`;
}
