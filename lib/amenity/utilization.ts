import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db/client"

/** Slot window: inclusive of start day through end of “today” (local). */
export function utilizationDateRanges(now = new Date()) {
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)

  const sixMonthStart = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0)

  return {
    mtd: { gte: monthStart, lt: tomorrow } satisfies Prisma.DateTimeFilter,
    lastSixMonths: { gte: sixMonthStart, lt: tomorrow } satisfies Prisma.DateTimeFilter,
  }
}

export type UtilizationSlice = {
  booked: number
  attended: number
  /** 0–100, one decimal; null if booked === 0 */
  ratePct: number | null
}

function ratePct(attended: number, booked: number): number | null {
  if (booked <= 0) return null
  return Math.round((attended / booked) * 1000) / 10
}

export type CenterUtilization = {
  mtd: UtilizationSlice
  lastSixMonths: UtilizationSlice
}

async function slice(
  centerId: string,
  slotDate: Prisma.DateTimeFilter
): Promise<UtilizationSlice> {
  const base: Prisma.AmenityBookingWhereInput = {
    centerId,
    status: "BOOKED",
    slotDate,
  }
  const [booked, attended] = await Promise.all([
    prisma.amenityBooking.count({ where: base }),
    prisma.amenityBooking.count({
      where: { ...base, attendedAt: { not: null } },
    }),
  ])
  return { booked, attended, ratePct: ratePct(attended, booked) }
}

export async function getAmenityUtilizationForCenter(
  centerId: string,
  now = new Date()
): Promise<CenterUtilization> {
  const { mtd, lastSixMonths } = utilizationDateRanges(now)
  const [mtdSlice, sixSlice] = await Promise.all([
    slice(centerId, mtd),
    slice(centerId, lastSixMonths),
  ])
  return { mtd: mtdSlice, lastSixMonths: sixSlice }
}

const inRange = (d: Date, range: { gte: Date; lt: Date }) =>
  d.getTime() >= range.gte.getTime() && d.getTime() < range.lt.getTime()

/** Batch utilization for many centers (one query + in-memory split). */
export async function getAmenityUtilizationMapForCenters(
  centerIds: string[],
  now = new Date()
): Promise<Record<string, CenterUtilization>> {
  if (centerIds.length === 0) return {}
  const { mtd, lastSixMonths } = utilizationDateRanges(now)

  const rows = await prisma.amenityBooking.findMany({
    where: {
      centerId: { in: centerIds },
      status: "BOOKED",
      slotDate: lastSixMonths,
    },
    select: {
      centerId: true,
      slotDate: true,
      attendedAt: true,
    },
  })

  const emptySlice = (): UtilizationSlice => ({ booked: 0, attended: 0, ratePct: null })
  const map: Record<string, CenterUtilization> = {}
  for (const id of centerIds) {
    map[id] = {
      mtd: emptySlice(),
      lastSixMonths: emptySlice(),
    }
  }

  for (const r of rows) {
    const m = map[r.centerId]
    if (!m) continue
    if (inRange(r.slotDate, lastSixMonths)) {
      m.lastSixMonths.booked += 1
      if (r.attendedAt) m.lastSixMonths.attended += 1
    }
    if (inRange(r.slotDate, mtd)) {
      m.mtd.booked += 1
      if (r.attendedAt) m.mtd.attended += 1
    }
  }

  for (const id of centerIds) {
    const m = map[id]
    m.mtd.ratePct = ratePct(m.mtd.attended, m.mtd.booked)
    m.lastSixMonths.ratePct = ratePct(m.lastSixMonths.attended, m.lastSixMonths.booked)
  }

  return map
}
