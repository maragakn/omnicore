import { Building2, Users, Wrench, Ticket } from "lucide-react"

export default function CFAdminOverviewPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">
          CF Admin — Operations Hub
        </h1>
        <p className="text-[#9ca3af] text-sm mt-1">
          Manage centers, trainers, assets, and service workflows across all facilities.
        </p>
      </div>

      {/* Quick stat placeholders */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        {[
          { label: "Active Centers", value: "—", icon: Building2, accent: "cyan" },
          { label: "Mapped Trainers", value: "—", icon: Users, accent: "purple" },
          { label: "Assets Tracked", value: "—", icon: Wrench, accent: "emerald" },
          { label: "Open Requests", value: "—", icon: Ticket, accent: "amber" },
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
          Center grid and detail views coming in Phase 3.
        </p>
      </div>
    </div>
  )
}
