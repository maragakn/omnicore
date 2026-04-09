import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"
import { z } from "zod"
import { TrainerOnboardingCreateSchema } from "@/lib/validations/trainerOnboarding"
import { normalizeLanguagesInput } from "@/lib/trainers/languages"
import { parseOptionalDateInput } from "@/lib/trainers/dateInput"
import { TRAINER_ONBOARDING_STAGES } from "@/lib/trainers/onboardingStages"

const ListQuerySchema = z.object({
  stage: z.enum(TRAINER_ONBOARDING_STAGES).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = ListQuerySchema.safeParse({
      stage: searchParams.get("stage") ?? undefined,
    })
    const stage = parsed.success ? parsed.data.stage : undefined

    const rows = await prisma.trainerOnboarding.findMany({
      where: stage ? { pipelineStage: stage } : undefined,
      orderBy: { updatedAt: "desc" },
    })
    return NextResponse.json({ onboardings: rows })
  } catch (err) {
    console.error("List trainer onboarding error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = TrainerOnboardingCreateSchema.parse(body)
    const languagesJson = normalizeLanguagesInput(data.languagesKnown)

    const trim = (s: string | undefined) => {
      if (s === undefined) return null
      const t = s.trim()
      return t === "" ? null : t
    }

    const row = await prisma.trainerOnboarding.create({
      data: {
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: !data.email || data.email === "" ? null : data.email,
        employeeRef: trim(data.employeeRef),
        govtIdentityId: trim(data.govtIdentityId),
        areaLocality: trim(data.areaLocality),
        experience: trim(data.experience),
        languagesKnown: languagesJson,
        imageUrl: !data.imageUrl || data.imageUrl === "" ? null : data.imageUrl,
        address: trim(data.address) ?? null,
        pipelineStage: data.pipelineStage ?? "HIRING",
        tentativeStartDate: parseOptionalDateInput(data.tentativeStartDate),
        joinedOn: parseOptionalDateInput(data.joinedOn),
      },
    })
    return NextResponse.json({ onboarding: row }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 }
      )
    }
    console.error("Create trainer onboarding error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
