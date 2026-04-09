import { prisma } from "@/lib/db/client"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { TrainerAttendanceCard } from "@/components/dashboard/TrainerAttendanceCard"

export default async function RWAAdminAttendancePage() {
  const center = await prisma.center.findFirst({
    where: { status: { in: ["ACTIVE", "ONBOARDING"] } },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  })

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <SectionHeader
        title="Trainer attendance"
        description={
          center
            ? `${center.name} · check-ins for the local calendar day (today).`
            : "Check-ins and attendance for trainers at your facility."
        }
        badge={
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 tracking-wide">
            READ ONLY
          </span>
        }
      />

      {center ? (
        <TrainerAttendanceCard centerId={center.id} />
      ) : (
        <div className="rounded-xl border border-dashed border-[#1f2937] bg-[#111827]/50 px-6 py-12 text-center">
          <p className="text-sm text-[#9ca3af]">No center is linked to this view yet.</p>
          <p className="text-xs text-[#6b7280] mt-2 max-w-md mx-auto">
            Once your society gym is set up in OmniCore, trainer attendance for that center will appear here.
          </p>
        </div>
      )}
    </div>
  )
}
