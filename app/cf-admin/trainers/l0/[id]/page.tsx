import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db/client"
import { TrainerL0DetailPanel } from "@/components/trainers/TrainerL0DetailPanel"
import { L0_STAGE_LABELS } from "@/lib/trainers/l0Stages"
import { toClientTrainerL0Enrollment } from "@/lib/trainers/trainerL0Client"

interface Props {
  params: Promise<{ id: string }>
}

export default async function TrainerL0DetailPage({ params }: Props) {
  const { id } = await params
  const enrollment = await prisma.trainerL0Training.findUnique({
    where: { id },
  })

  if (!enrollment) notFound()

  const stageLabel =
    L0_STAGE_LABELS[enrollment.l0Stage as keyof typeof L0_STAGE_LABELS] ?? enrollment.l0Stage

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/cf-admin/trainers/l0" className="text-[#6b7280] hover:text-[#e5e7eb] text-sm">
          ← Back to L0 training
        </Link>
      </div>

      <div>
        <p className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">{stageLabel}</p>
        <h1 className="text-2xl font-semibold text-[#e5e7eb] mt-1">{enrollment.name}</h1>
        {enrollment.employeeRef && (
          <p className="text-sm text-[#9ca3af] mt-1">Ref: {enrollment.employeeRef}</p>
        )}
      </div>

      <TrainerL0DetailPanel enrollment={toClientTrainerL0Enrollment(enrollment)} />
    </div>
  )
}
