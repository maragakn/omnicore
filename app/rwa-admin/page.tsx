import { Activity, Users, Wrench, Ticket } from "lucide-react"

export default function RWAAdminDashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            RWA Admin — Live Dashboard
          </h1>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 tracking-wide">
            READ ONLY
          </span>
        </div>
        <p className="text-[#9ca3af] text-sm">
          Live footfall, trainer attendance, asset health, and facility status.
        </p>
      </div>

      {/* Quick stat placeholders */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        {[
          { label: "Live Occupancy", value: "—", icon: Activity, accent: "cyan" },
          { label: "Trainers In", value: "—", icon: Users, accent: "emerald" },
          { label: "Assets: Alerts", value: "—", icon: Wrench, accent: "amber" },
          { label: "Open Requests", value: "—", icon: Ticket, accent: "red" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[#1f2937] bg-[#111827] p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#6b7280] font-medium uppercase tracking-wider">
                {stat.label}
              </span>
              <stat.icon className="w-4 h-4 text-[#374151]" />
            </div>
            <p className="text-3xl font-bold font-mono-metric text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Coming soon note */}
      <div className="rounded-xl border border-dashed border-[#1f2937] bg-[#111827]/50 p-8 text-center">
        <p className="text-[#6b7280] text-sm">
          Live footfall feed, trainer table, and asset widgets coming in Phase 4.
        </p>
      </div>
    </div>
  )
}
