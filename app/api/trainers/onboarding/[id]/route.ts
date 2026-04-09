import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"
import { z } from "zod"
import { TrainerOnboardingUpdateSchema } from "@/lib/validations/trainerOnboarding"
import { normalizeLanguagesInput } from "@/lib/trainers/languages"
import { parseOptionalDateInput } from "@/lib/trainers/dateInput"

interface Ctx {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params
    const row = await prisma.trainerOnboarding.findUnique({
      where: { id },
    })
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ onboarding: row })
  } catch (err) {
    console.error("Get trainer onboarding error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params
    const existing = await prisma.trainerOnboarding.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const body = await req.json()
    const data = TrainerOnboardingUpdateSchema.parse(body)

    let languagesJson: string | null | undefined
    if (data.languagesKnown !== undefined) {
      languagesJson = normalizeLanguagesInput(data.languagesKnown)
    }

    const opt = (s: string | undefined) => {
      if (s === undefined) return undefined
      const t = s.trim()
      return t === "" ? null : t
    }

    const row = await prisma.trainerOnboarding.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.phone !== undefined && { phone: data.phone.trim() }),
        ...(data.email !== undefined && {
          email: !data.email || data.email.trim() === "" ? null : data.email.trim(),
        }),
        ...(data.employeeRef !== undefined && { employeeRef: opt(data.employeeRef) ?? null }),
        ...(data.govtIdentityId !== undefined && { govtIdentityId: opt(data.govtIdentityId) ?? null }),
        ...(data.areaLocality !== undefined && { areaLocality: opt(data.areaLocality) ?? null }),
        ...(data.experience !== undefined && { experience: opt(data.experience) ?? null }),
        ...(languagesJson !== undefined && { languagesKnown: languagesJson }),
        ...(data.imageUrl !== undefined && {
          imageUrl: !data.imageUrl || data.imageUrl.trim() === "" ? null : data.imageUrl.trim(),
        }),
        ...(data.address !== undefined && { address: opt(data.address) ?? null }),
        ...(data.pipelineStage !== undefined && { pipelineStage: data.pipelineStage }),
        ...(data.tentativeStartDate !== undefined && {
          tentativeStartDate: parseOptionalDateInput(data.tentativeStartDate),
        }),
        ...(data.joinedOn !== undefined && {
          joinedOn: parseOptionalDateInput(data.joinedOn),
        }),
      },
    })
    return NextResponse.json({ onboarding: row })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 }
      )
    }
    console.error("Update trainer onboarding error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params
    const result = await prisma.trainerOnboarding.deleteMany({ where: { id } })
    if (result.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Delete trainer onboarding error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
