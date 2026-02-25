const TOKENS_PER_MILLION = 1_000_000

export function formatModelPrice(pricePerTokenUsd: string, decimals = 2): string {
  const parsed = Number(pricePerTokenUsd)
  if (!Number.isFinite(parsed)) return "-"

  const perMillion = parsed * TOKENS_PER_MILLION
  return `$${perMillion.toFixed(decimals)}`
}
