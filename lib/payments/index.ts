export function formatCurrencyINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

export function calculateCarbonOffsetKg(km: number, passengers: number): number {
  return Math.round((km * 0.12 * Math.max(1, passengers)) * 10) / 10
}
