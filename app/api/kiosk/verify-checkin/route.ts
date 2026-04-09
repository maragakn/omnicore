import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/client"
import { parseCheckinPayload } from "@/lib/demo/checkinPayload"

const BodySchema = z.object({
  /** Raw text from QR scanner (or pasted payload) */
  raw: z.string().min(1),
  /**
   * If true, booking must be for local “today” and current clock hour must match slotHour.
   * Default false: any BOOKED row is enough for demo.
   */
  strictSlot: z.boolean().optional(),
})

/**
 * Gym entrance device: POST the scanned string from the resident QR.
 * Demo-only; pairs with POST /api/demo/mygate-proxy/booking.
 */
export async function POST(req: NextRequest) {
  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
  }

  const bookingId = parseCheckinPayload(parsed.data.raw)
  if (!bookingId) {
    return NextResponse.json({ allowed: false, reason: "Unrecognized QR payload" }, { status: 400 })
  }

  const booking = await prisma.amenityBooking.findUnique({
    where: { id: bookingId },
    include: { center: { select: { id: true, name: true, code: true } } },
  })

  if (!booking) {
    return NextResponse.json({ allowed: false, reason: "Booking not found" }, { status: 404 })
  }

  if (booking.status !== "BOOKED") {
    return NextResponse.json({
      allowed: false,
      reason: `Booking is ${booking.status}`,
      bookingId: booking.id,
    })
  }

  if (parsed.data.strictSlot) {
    const now = new Date()
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)

    const slotOk =
      booking.slotDate >= start &&
      booking.slotDate < end &&
      booking.slotHour === now.getHours()

    if (!slotOk) {
      return NextResponse.json({
        allowed: false,
        reason: "Slot does not match current time (strict mode)",
        bookingId: booking.id,
        slotDate: booking.slotDate.toISOString(),
        slotHour: booking.slotHour,
      })
    }
  }

  const checkInTime = new Date()
  await prisma.amenityBooking.updateMany({
    where: { id: bookingId, attendedAt: null },
    data: { attendedAt: checkInTime },
  })

  return NextResponse.json({
    allowed: true,
    bookingId: booking.id,
    center: booking.center,
    memberName: booking.memberName,
    memberFlat: booking.memberFlat,
    slotHour: booking.slotHour,
    attendedAt: checkInTime.toISOString(),
  })
}
