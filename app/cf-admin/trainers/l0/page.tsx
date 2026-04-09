import Link from "next/link"
import { prisma } from "@/lib/db/client"
import { TrainerL0Table } from "@/components/trainers/TrainerL0Table"

export default async function TrainerL0Page() {
  const enrollments = await prisma.trainerL0Training.findMany({
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#e5e7eb]">L0 training</h1>
          <p className="text-sm text-[#6b7280] mt-1 max-w-3xl">
            Post-offer program with explicit <strong className="text-[#9ca3af]">start</strong> and{" "}
            <strong className="text-[#9ca3af]">end</strong> dates. Separate from hiring and from live center
            assignments.
          </p>
        </div>
        <Link
          href="/cf-admin/trainers/l0/new"
          className="px-4 py-2 bg-amber-500/90 text-[#0a0d14] text-sm font-medium rounded-lg hover:bg-amber-400 transition-colors shrink-0"
        >
          + Add enrollment
        </Link>
      </div>

      <TrainerL0Table enrollments={enrollments} />
    </div>
  )
}
