import QRCode from "qrcode"
import { AlertCircle, Database } from "lucide-react"
import type { ServiceRequestReportRow, ServiceRequestReportMeta } from "@/lib/reports/serviceRequests"

// ─── Colour helpers ────────────────────────────────────────────────────────────

function statusClass(status: string) {
  if (status === "RESOLVED")    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  if (status === "IN_PROGRESS") return "bg-cyan-500/10   text-cyan-400   border-cyan-500/20"
  if (status === "ASSIGNED")    return "bg-amber-500/10  text-amber-400  border-amber-500/20"
  return "bg-red-500/10 text-red-400 border-red-500/20"
}

function priorityClass(priority: string) {
  if (priority === "CRITICAL") return "text-red-400   font-semibold"
  if (priority === "HIGH")     return "text-amber-400 font-semibold"
  if (priority === "MEDIUM")   return "text-[#9ca3af]"
  return "text-[#6b7280]"
}

function roleClass(role: ServiceRequestReportRow["raisedByRole"]) {
  if (role === "TRAINER")   return "bg-purple-500/10 text-purple-400 border-purple-500/20"
  if (role === "RWA_ADMIN") return "bg-cyan-500/10   text-cyan-400   border-cyan-500/20"
  return "bg-[#1f2937] text-[#9ca3af] border-[#374151]"
}

// ─── Empty / error state ───────────────────────────────────────────────────────

function EmptyState({ meta }: { meta: ServiceRequestReportMeta }) {
  if (!meta.trinoEnabled) {
    return (
      <div className="rounded-2xl border border-dashed border-[#1f2937] p-16 flex flex-col items-center gap-3 text-center">
        <Database className="w-8 h-8 text-[#374151]" />
        <p className="text-sm font-semibold text-[#9ca3af]">Trino not configured</p>
        <p className="text-xs text-[#6b7280] max-w-sm">
          Add{" "}
          <code className="font-mono bg-[#1f2937] px-1.5 py-0.5 rounded text-[11px]">
            TRINO_HOST / TRINO_USER / TRINO_PASSWORD
          </code>{" "}
          to your <code className="font-mono text-[11px]">.env</code> to pull live AMS data.
        </p>
      </div>
    )
  }

  if (meta.error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-16 flex flex-col items-center gap-3 text-center">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-sm font-semibold text-red-300">Query error</p>
        <p className="text-xs font-mono text-[#9ca3af] max-w-xl">{meta.error}</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-dashed border-[#1f2937] p-16 flex flex-col items-center gap-3 text-center">
      <AlertCircle className="w-8 h-8 text-[#374151]" />
      <p className="text-sm font-semibold text-[#9ca3af]">No service requests found</p>
      {meta.centerIds.length > 0 && (
        <p className="text-xs text-[#6b7280]">
          Center IDs: <span className="font-mono">{meta.centerIds.join(", ")}</span>
        </p>
      )}
    </div>
  )
}

// ─── Main table ────────────────────────────────────────────────────────────────

export async function ServiceRequestReportTable({
  rows,
  meta,
  readonly,
}: {
  rows: ServiceRequestReportRow[]
  meta: ServiceRequestReportMeta
  readonly: boolean
}) {
  if (rows.length === 0) return <EmptyState meta={meta} />

  // Generate inline QR data-URLs server-side
  const qrMap = new Map<string, string>()
  await Promise.all(
    rows.map(async (row) => {
      const dataUrl = await QRCode.toDataURL(row.qrPayload, {
        margin: 0,
        width: 80,
        color: { dark: "#0d1117", light: "#0000" },
      })
      qrMap.set(row.requestId, dataUrl)
    }),
  )

  return (
    <div className="rounded-2xl border border-[#1f2937] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="bg-[#111827] border-b border-[#1f2937]">
            <tr className="text-left text-[11px] uppercase tracking-wider text-[#6b7280]">
              <th className="px-4 py-3 font-medium">Center</th>
              <th className="px-4 py-3 font-medium">Request</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Equipment</th>
              <th className="px-4 py-3 font-medium">Raised by</th>
              <th className="px-4 py-3 font-medium text-center">QR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f2937] bg-[#0a0d14]">
            {rows.map((row) => (
              <tr key={row.requestId} className="align-top hover:bg-[#111827]/60 transition-colors">

                {/* Center */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="font-semibold text-white leading-tight">{row.centerName}</p>
                  <p className="text-[11px] text-[#6b7280] font-mono mt-0.5">#{row.centerId}</p>
                </td>

                {/* Request */}
                <td className="px-4 py-3 max-w-[280px]">
                  <p className="font-medium text-white leading-snug">{row.title}</p>
                  {row.description && (
                    <p className="text-[11px] text-[#6b7280] mt-1 leading-relaxed line-clamp-2">
                      {row.description}
                    </p>
                  )}
                  <p className="text-[10px] text-[#4b5563] font-mono mt-1">
                    {row.requestId.slice(0, 16)}…
                    {" · "}
                    {new Date(row.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </td>

                {/* Status / Priority */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-0.5 rounded-full border text-[11px] font-semibold ${statusClass(row.status)}`}>
                    {row.status.replace("_", " ")}
                  </span>
                  <p className={`text-[11px] mt-1.5 ${priorityClass(row.priority)}`}>
                    {row.priority}
                  </p>
                </td>

                {/* Equipment */}
                <td className="px-4 py-3">
                  <p className="font-medium text-white leading-snug">{row.equipmentName}</p>
                  <p className="text-[11px] text-[#6b7280] mt-0.5">{row.equipmentCategory}</p>
                  <p className="text-[11px] font-mono text-[#4b5563] mt-0.5">{row.equipmentSerial}</p>
                </td>

                {/* Raised by */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="text-white leading-snug">{row.raisedBy}</p>
                  <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${roleClass(row.raisedByRole)}`}>
                    {row.raisedByRole.replace("_", " ")}
                  </span>
                </td>

                {/* QR */}
                <td className="px-4 py-3 text-center">
                  <div className="inline-block w-14 h-14 rounded-md border border-[#1f2937] bg-white/95 p-1">
                    <img
                      src={qrMap.get(row.requestId) ?? ""}
                      alt={`QR ${row.requestId}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {!readonly && (
                    <p className="text-[9px] text-[#4b5563] mt-1">AMS ref</p>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
