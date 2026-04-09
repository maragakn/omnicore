"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatPaise } from "@/lib/leads/quote"
import { MODULE_PRICING_LABEL } from "@/lib/constants/enums"

interface PricingConfig {
  moduleKey: string
  pricingType: string
  defaultOneTimeFee: number | null
  defaultMonthlyFee: number | null
  defaultTakeRatePct: number | null
}

interface LineItem {
  moduleKey: string
  pricingType: string
  oneTimeFee: number | null
  monthlyFee: number | null
  takeRatePct: number | null
}

interface Props {
  leadId: string
  selectedModules: string[]
  pricingConfigs: PricingConfig[]
  existingQuote: { id: string; status: string; notes: string | null; lineItems: LineItem[] } | null
}

export function QuoteBuilder({ leadId, selectedModules, pricingConfigs, existingQuote }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState(existingQuote?.notes ?? "")

  const configByModule = Object.fromEntries(pricingConfigs.map((c) => [c.moduleKey, c]))

  const initLineItems = () =>
    selectedModules.map((moduleKey) => {
      const cfg = configByModule[moduleKey]
      const existing = existingQuote?.lineItems.find((li) => li.moduleKey === moduleKey)
      return {
        moduleKey,
        pricingType: cfg?.pricingType ?? "MONTHLY",
        oneTimeFee: existing?.oneTimeFee ?? cfg?.defaultOneTimeFee ?? 0,
        monthlyFee: existing?.monthlyFee ?? cfg?.defaultMonthlyFee ?? 0,
        takeRatePct: existing?.takeRatePct ?? cfg?.defaultTakeRatePct ?? 0,
      }
    })

  const [lineItems, setLineItems] = useState(initLineItems)

  const updateItem = (moduleKey: string, field: string, value: number) => {
    setLineItems((prev) =>
      prev.map((li) =>
        li.moduleKey === moduleKey ? { ...li, [field]: value } : li
      )
    )
  }

  const totalOneTime = lineItems.reduce((sum, li) => sum + (li.oneTimeFee ?? 0), 0)
  const totalMonthly = lineItems.reduce((sum, li) => sum + (li.monthlyFee ?? 0), 0)

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/leads/${leadId}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes,
          lineItems: lineItems.map((li) => ({
            moduleKey: li.moduleKey,
            pricingType: li.pricingType,
            oneTimeFee: li.oneTimeFee || undefined,
            monthlyFee: li.monthlyFee || undefined,
            takeRatePct: li.takeRatePct || undefined,
          })),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to save quote")
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
      throw e // re-throw so callers like handleSend can abort
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    setSending(true)
    setError(null)
    try {
      await handleSave()
      const res = await fetch(`/api/leads/${leadId}/quote/send`, { method: "POST" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to send quote")
      router.push(`/cf-admin/leads/${leadId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-[#111111] rounded-xl border border-[#1f2937] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1f2937]">
          <h2 className="text-sm font-medium text-[#e5e7eb]">Line Items</h2>
        </div>

        <div className="divide-y divide-[#1f2937]">
          {lineItems.map((li) => (
            <QuoteLineItemRow key={li.moduleKey} item={li} onUpdate={updateItem} />
          ))}
        </div>

        <div className="px-6 py-4 border-t border-[#1f2937] bg-[#0a0a0a] space-y-1">
          {totalOneTime > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#6b7280]">Total One-time</span>
              <span className="text-[#e5e7eb] font-medium">{formatPaise(totalOneTime)}</span>
            </div>
          )}
          {totalMonthly > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#6b7280]">Total Monthly</span>
              <span className="text-[#e5e7eb] font-medium">{formatPaise(totalMonthly)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="form-input resize-none"
          placeholder="Any special terms or comments for the RWA Admin…"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-[#1f2937] text-[#e5e7eb] text-sm font-medium rounded-lg hover:bg-[#374151] disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving…" : "Save Draft"}
        </button>
        <button
          onClick={handleSend}
          disabled={sending || loading}
          className="px-4 py-2 bg-[#f97316] text-white text-sm font-medium rounded-lg hover:bg-[#ea6c0c] disabled:opacity-50 transition-colors"
        >
          {sending ? "Sending…" : "Send Quote to RWA Admin"}
        </button>
      </div>
    </div>
  )
}

interface QuoteLineItemRowProps {
  item: {
    moduleKey: string
    pricingType: string
    oneTimeFee: number | null
    monthlyFee: number | null
    takeRatePct: number | null
  }
  onUpdate: (moduleKey: string, field: string, value: number) => void
}

function QuoteLineItemRow({ item, onUpdate }: QuoteLineItemRowProps) {
  const label = MODULE_PRICING_LABEL[item.moduleKey as keyof typeof MODULE_PRICING_LABEL] ?? item.moduleKey

  return (
    <div className="px-6 py-4 flex flex-wrap items-center gap-4">
      <div className="flex-1 min-w-[120px]">
        <p className="text-sm font-medium text-[#e5e7eb]">{item.moduleKey}</p>
        <p className="text-xs text-[#6b7280]">{label}</p>
      </div>

      {(item.pricingType === "ONE_TIME" || item.pricingType === "ONE_TIME_PLUS_TAKE_RATE") && (
        <div className="space-y-0.5">
          <label className="text-xs text-[#6b7280]">One-time (₹)</label>
          <input
            type="number"
            className="form-input w-32 text-sm"
            value={(item.oneTimeFee ?? 0) / 100}
            onChange={(e) => onUpdate(item.moduleKey, "oneTimeFee", Math.round(parseFloat(e.target.value || "0") * 100))}
          />
        </div>
      )}

      {(item.pricingType === "MONTHLY" || item.pricingType === "ONE_TIME_PLUS_TAKE_RATE") && (
        <div className="space-y-0.5">
          <label className="text-xs text-[#6b7280]">Monthly (₹)</label>
          <input
            type="number"
            className="form-input w-32 text-sm"
            value={(item.monthlyFee ?? 0) / 100}
            onChange={(e) => onUpdate(item.moduleKey, "monthlyFee", Math.round(parseFloat(e.target.value || "0") * 100))}
          />
        </div>
      )}

      {item.pricingType === "ONE_TIME_PLUS_TAKE_RATE" && (
        <div className="space-y-0.5">
          <label className="text-xs text-[#6b7280]">Take Rate (%)</label>
          <input
            type="number"
            className="form-input w-24 text-sm"
            value={item.takeRatePct ?? 0}
            min={0}
            max={100}
            step={0.5}
            onChange={(e) => onUpdate(item.moduleKey, "takeRatePct", parseFloat(e.target.value || "0"))}
          />
        </div>
      )}
    </div>
  )
}
