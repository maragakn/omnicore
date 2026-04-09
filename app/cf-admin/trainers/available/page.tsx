import { prisma } from "@/lib/db/client"

export default async function TrainersAvailablePage() {
  const trainers = await prisma.trainer.findMany({
    where: {
      isActive: true,
      centerMappings: { none: { isActive: true } },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      trainerType: true,
      specialization: true,
      joinedOn: true,
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#e5e7eb]">Available to map</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          <code className="text-[#6b7280]">Trainer</code> roster records with{" "}
          <span className="text-[#9ca3af]">no active center mapping</span>. Not the same as hiring candidates or
          L0 enrollments — add roster staff first, then assign in center onboarding or ops.
        </p>
      </div>

      {trainers.length === 0 ? (
        <div className="rounded-xl border border-[#1f2937] bg-[#111827]/50 px-6 py-10 text-center text-sm text-[#6b7280]">
          No trainers on the bench. Everyone is mapped to at least one center, or add roster records in your admin
          tools.
        </div>
      ) : (
        <div className="rounded-xl border border-[#1f2937] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1f2937] bg-[#0d1117] text-left text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Focus</th>
              </tr>
            </thead>
            <tbody>
              {trainers.map((t) => (
                <tr key={t.id} className="border-b border-[#1f2937]/80 hover:bg-[#141c2e]/60">
                  <td className="px-4 py-3 font-medium text-[#e5e7eb]">{t.name}</td>
                  <td className="px-4 py-3 text-[#9ca3af]">{t.trainerType}</td>
                  <td className="px-4 py-3 text-[#9ca3af] tabular-nums">{t.phone}</td>
                  <td className="px-4 py-3 text-[#9ca3af]">{t.email ?? "—"}</td>
                  <td className="px-4 py-3 text-[#6b7280]">{t.specialization ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
