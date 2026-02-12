export function formatModelPrice(price: string, decimals: number): string {
  const parsed = Number(price)
  if (Number.isNaN(parsed)) return "$0.00"
  return `$${parsed.toFixed(decimals)}`
}
