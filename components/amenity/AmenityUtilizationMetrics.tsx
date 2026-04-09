import type { CenterUtilization } from "@/lib/amenity/utilization"
import { Percent } from "lucide-react"

function formatSlice(label: string, u: CenterUtilization["mtd"]) {
  if (u.booked === 0) {
    return (
      <div>
        <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-[#6b7280] mt-1">—</p>
        <p className="text-[11px] text-[#4b5563] mt-0.5">No bookings in window</p>
      </div>
    )
  }
  const pct = u.ratePct != null ? `${u.ratePct}%` : "—"
  return (
    <div>
      <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-cyan-400 font-mono-metric mt-1">{pct}</p>
      <p className="text-[11px] text-[#9ca3af] mt-0.5 tabular-nums">
        {u.attended} attended / {u.booked} booked
      </p>
    </div>
  )
}

/** Amenity slot utilization: attended ÷ booked for MTD and rolling six calendar months. */
export function AmenityUtilizationMetrics({
  data,
  compact = false,
}: {
  data: CenterUtilization
  /** Single row, smaller type (e.g. center list cards) */
  compact?: boolean
}) {
  if (compact) {
    const m = data.mtd
    const s = data.lastSixMonths
    const mStr = m.booked === 0 ? "MTD —" : `MTD ${m.ratePct ?? 0}%`
    const sStr = s.booked === 0 ? "6mo —" : `6mo ${s.ratePct ?? 0}%`
    return (
      <span className="text-[10px] text-[#6b7280] tabular-nums" title="Amenity utilization (attended / booked)">
        {mStr} · {sStr}
      </span>
    )
  }

  return (
    <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/[0.04] overflow-hidden">
      <div className="px-4 py-3 border-b border-cyan-500/10 flex items-center gap-2">
        <Percent className="w-4 h-4 text-cyan-400 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-[#e5e7eb]">Amenity utilization</p>
          <p className="text-[11px] text-[#6b7280]">Share of booked slots with a kiosk check-in (attended / booked)</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 py-4">
        {formatSlice("Month to date", data.mtd)}
        {formatSlice("Last 6 months", data.lastSixMonths)}
      </div>
    </div>
  )
}
