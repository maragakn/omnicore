import Link from "next/link"
import { prisma } from "@/lib/db/client"
import { TrainerOnboardingTable } from "@/components/trainers/TrainerOnboardingTable"

export default async function TrainerHiringPipelinePage() {
  const onboardings = await prisma.trainerOnboarding.findMany({
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#e5e7eb]">Hiring pipeline</h1>
          <p className="text-sm text-[#6b7280] mt-1 max-w-3xl">
            <strong className="text-[#9ca3af]">Hiring</strong> is sourcing and early screening before structured
            interviews. Stages end at <strong className="text-[#9ca3af]">offer accepted</strong> (tentative / join
            dates below). L0 and center assignment live in other tabs.
          </p>
        </div>
        <Link
          href="/cf-admin/trainers/hiring/new"
          className="px-4 py-2 bg-[#f97316] text-white text-sm font-medium rounded-lg hover:bg-[#ea6c0c] transition-colors shrink-0"
        >
          + Add candidate
        </Link>
      </div>

      <TrainerOnboardingTable onboardings={onboardings} />
    </div>
  )
}
