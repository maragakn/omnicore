import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"
import { z } from "zod"
import { TrainerL0UpdateSchema } from "@/lib/validations/trainerL0"
import { parseOptionalDateInput } from "@/lib/trainers/dateInput"

interface Ctx {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params
    const row = await prisma.trainerL0Training.findUnique({ where: { id } })
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ enrollment: row })
  } catch (err) {
    console.error("Get L0 training error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params
    const existing = await prisma.trainerL0Training.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const body = await req.json()
    const data = TrainerL0UpdateSchema.parse(body)

    const row = await prisma.trainerL0Training.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.phone !== undefined && { phone: data.phone.trim() }),
        ...(data.email !== undefined && {
          email: !data.email || data.email.trim() === "" ? null : data.email.trim(),
        }),
        ...(data.employeeRef !== undefined && { employeeRef: data.employeeRef?.trim() || null }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
        ...(data.l0Stage !== undefined && { l0Stage: data.l0Stage }),
        ...(data.startDate !== undefined && {
          startDate: parseOptionalDateInput(data.startDate),
        }),
        ...(data.endDate !== undefined && {
          endDate: parseOptionalDateInput(data.endDate),
        }),
      },
    })
    return NextResponse.json({ enrollment: row })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 }
      )
    }
    console.error("Update L0 training error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params
    const result = await prisma.trainerL0Training.deleteMany({ where: { id } })
    if (result.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Delete L0 training error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
