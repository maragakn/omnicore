import { prisma } from "@/lib/db/client"

export default async function TrainersMappedPage() {
  const mappings = await prisma.centerTrainerMapping.findMany({
    where: { isActive: true },
    orderBy: [{ center: { name: "asc" } }, { trainer: { name: "asc" } }],
    include: {
      center: { select: { id: true, name: true, code: true, city: true } },
      trainer: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          trainerType: true,
          specialization: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#e5e7eb]">Assigned to centers</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Active <code className="text-[#6b7280]">CenterTrainerMapping</code> rows — who works where. Distinct from
          hiring, L0, or “posted” placeholders; this is the operational roster link only.
        </p>
      </div>

      {mappings.length === 0 ? (
        <div className="rounded-xl border border-[#1f2937] bg-[#111827]/50 px-6 py-10 text-center text-sm text-[#6b7280]">
          No center–trainer mappings yet.
        </div>
      ) : (
        <div className="rounded-xl border border-[#1f2937] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1f2937] bg-[#0d1117] text-left text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
                <th className="px-4 py-3">Center</th>
                <th className="px-4 py-3">Trainer</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Assigned</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((m) => (
                <tr key={m.id} className="border-b border-[#1f2937]/80 hover:bg-[#141c2e]/60">
                  <td className="px-4 py-3">
                    <span className="font-medium text-[#e5e7eb]">{m.center.name}</span>
                    <span className="text-[#6b7280] ml-2">({m.center.code})</span>
                    <p className="text-[11px] text-[#6b7280] mt-0.5">{m.center.city}</p>
                  </td>
                  <td className="px-4 py-3 text-[#e5e7eb]">{m.trainer.name}</td>
                  <td className="px-4 py-3 text-[#9ca3af]">{m.trainer.trainerType}</td>
                  <td className="px-4 py-3 text-[#9ca3af] tabular-nums">{m.trainer.phone}</td>
                  <td className="px-4 py-3 text-[#6b7280] tabular-nums">
                    {m.assignedOn.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
