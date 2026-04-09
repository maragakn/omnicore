export interface QuoteLineItemTotalsInput {
  oneTimeFee?: number | null
  monthlyFee?: number | null
}

export interface QuoteTotals {
  totalOneTimePaise: number
  totalMonthlyPaise: number
}

export function computeQuoteTotals(lineItems: QuoteLineItemTotalsInput[]): QuoteTotals {
  return lineItems.reduce(
    (acc, item) => ({
      totalOneTimePaise: acc.totalOneTimePaise + (item.oneTimeFee ?? 0),
      totalMonthlyPaise: acc.totalMonthlyPaise + (item.monthlyFee ?? 0),
    }),
    { totalOneTimePaise: 0, totalMonthlyPaise: 0 }
  )
}

export function formatPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`
}
