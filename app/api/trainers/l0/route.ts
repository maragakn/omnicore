import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"
import { z } from "zod"
import { TrainerL0CreateSchema } from "@/lib/validations/trainerL0"
import { parseOptionalDateInput } from "@/lib/trainers/dateInput"

const ListQuerySchema = z.object({
  stage: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = ListQuerySchema.safeParse({
      stage: searchParams.get("stage") ?? undefined,
    })
    const stage = parsed.success ? parsed.data.stage : undefined

    const rows = await prisma.trainerL0Training.findMany({
      where: stage ? { l0Stage: stage } : undefined,
      orderBy: { updatedAt: "desc" },
    })
    return NextResponse.json({ enrollments: rows })
  } catch (err) {
    console.error("List L0 training error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = TrainerL0CreateSchema.parse(body)

    const row = await prisma.trainerL0Training.create({
      data: {
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: !data.email || data.email === "" ? null : data.email,
        employeeRef: data.employeeRef?.trim() || null,
        notes: data.notes?.trim() || null,
        l0Stage: data.l0Stage ?? "NOT_STARTED",
        sourceOnboardingId: data.sourceOnboardingId?.trim() || null,
        startDate: parseOptionalDateInput(data.startDate),
        endDate: parseOptionalDateInput(data.endDate),
      },
    })
    return NextResponse.json({ enrollment: row }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 }
      )
    }
    console.error("Create L0 training error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
