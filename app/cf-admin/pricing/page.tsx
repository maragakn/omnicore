import { prisma } from "@/lib/db/client"
import { PricingConfigTable } from "@/components/leads/PricingConfigTable"

export default async function PricingPage() {
  const configs = await prisma.servicePricingConfig.findMany({
    orderBy: { moduleKey: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#e5e7eb]">Default Pricing</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          These defaults are pre-filled in quote builder. Adjust per-lead in the quote.
        </p>
      </div>
      <PricingConfigTable configs={configs} />
    </div>
  )
}
