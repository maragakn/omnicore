import { notFound } from "next/navigation"
import { prisma } from "@/lib/db/client"
import { QuoteBuilder } from "@/components/leads/QuoteBuilder"
import Link from "next/link"

interface Props {
  params: Promise<{ id: string }>
}

export default async function QuotePage({ params }: Props) {
  const { id } = await params
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      quote: { include: { lineItems: true } },
    },
  })
  if (!lead) notFound()

  const pricingConfigs = await prisma.servicePricingConfig.findMany()

  const formData = lead.formData ? (() => {
    try { return JSON.parse(lead.formData) } catch { return null }
  })() : null

  const selectedModules: string[] = formData?.selectedModules ?? []

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/cf-admin/leads/${id}`} className="text-[#6b7280] hover:text-[#e5e7eb] text-sm">
          ← Back to Lead
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-[#e5e7eb]">Quote Builder</h1>
        <p className="text-sm text-[#6b7280] mt-1">{lead.societyName}</p>
      </div>
      <QuoteBuilder
        leadId={id}
        selectedModules={selectedModules}
        pricingConfigs={pricingConfigs}
        existingQuote={lead.quote}
      />
    </div>
  )
}
