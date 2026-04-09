import Link from "next/link"
import { L0_STAGES, L0_STAGE_LABELS, L0_STAGE_DESCRIPTIONS, type L0Stage } from "@/lib/trainers/l0Stages"

export type TrainerL0Row = {
  id: string
  name: string
  phone: string
  email: string | null
  employeeRef: string | null
  l0Stage: string
  startDate: Date | null
  endDate: Date | null
  updatedAt: Date
}

function fmt(d: Date | null | undefined) {
  if (!d) return "—"
  const x = d instanceof Date ? d : new Date(d)
  return Number.isNaN(x.getTime()) ? "—" : x.toLocaleDateString()
}

function groupByStage(rows: TrainerL0Row[]) {
  const map = new Map<L0Stage, TrainerL0Row[]>()
  for (const s of L0_STAGES) {
    map.set(s, [])
  }
  for (const row of rows) {
    const stage = (L0_STAGES as readonly string[]).includes(row.l0Stage)
      ? (row.l0Stage as L0Stage)
      : "NOT_STARTED"
    map.get(stage)!.push(row)
  }
  for (const list of map.values()) {
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }
  return map
}

export function TrainerL0Table({ enrollments }: { enrollments: TrainerL0Row[] }) {
  const grouped = groupByStage(enrollments)

  if (enrollments.length === 0) {
    return (
      <div className="rounded-xl border border-[#1f2937] bg-[#111827]/50 px-6 py-10 text-center text-sm text-[#6b7280]">
        No L0 enrollments yet.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {L0_STAGES.map((stage) => {
        const rows = grouped.get(stage) ?? []
        const title = L0_STAGE_LABELS[stage]
        const blurb = L0_STAGE_DESCRIPTIONS[stage]
        return (
          <section key={stage} className="rounded-xl border border-[#1f2937] overflow-hidden bg-[#0d1117]/40">
            <div className="px-4 py-3 border-b border-[#1f2937] bg-[#111827]/80">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold text-[#e5e7eb] tracking-tight">{title}</h2>
                <span className="text-[11px] text-[#6b7280] tabular-nums">
                  {rows.length} enrollment{rows.length === 1 ? "" : "s"}
                </span>
              </div>
              <p className="text-[11px] text-[#6b7280] mt-1.5 leading-relaxed max-w-4xl">{blurb}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="border-b border-[#1f2937] bg-[#0d1117] text-left text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
                    <th className="px-4 py-2.5">Name</th>
                    <th className="px-4 py-2.5">Ref</th>
                    <th className="px-4 py-2.5">Phone</th>
                    <th className="px-4 py-2.5">Email</th>
                    <th className="px-4 py-2.5">Start date</th>
                    <th className="px-4 py-2.5">End date</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-xs text-[#4b5563]">
                        No one in this stage.
                      </td>
                    </tr>
                  ) : (
                    rows.map((o) => (
                      <tr
                        key={o.id}
                        className="border-b border-[#1f2937]/80 hover:bg-[#141c2e]/60 transition-colors"
                      >
                        <td className="px-4 py-3 align-top font-medium">
                          <Link
                            href={`/cf-admin/trainers/l0/${o.id}`}
                            className="text-amber-400/95 hover:text-amber-300 hover:underline"
                          >
                            {o.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 align-top text-[#9ca3af] tabular-nums">{o.employeeRef ?? "—"}</td>
                        <td className="px-4 py-3 align-top text-[#9ca3af] tabular-nums whitespace-nowrap">{o.phone}</td>
                        <td className="px-4 py-3 align-top text-[#9ca3af] max-w-[200px] truncate" title={o.email ?? ""}>
                          {o.email ?? "—"}
                        </td>
                        <td className="px-4 py-3 align-top text-[#9ca3af] tabular-nums whitespace-nowrap">
                          {fmt(o.startDate)}
                        </td>
                        <td className="px-4 py-3 align-top text-[#9ca3af] tabular-nums whitespace-nowrap">
                          {fmt(o.endDate)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}
    </div>
  )
}
