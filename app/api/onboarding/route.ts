import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"
import { z } from "zod"

const OnboardingPayloadSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(3),
  address: z.string().min(5),
  city: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/),
  capacity: z.number().int().min(1),
  gymSqFt: z.number().optional(),
  rwaName: z.string().min(2),
  totalUnits: z.number().int().min(1),
  contactPersonName: z.string().min(2),
  contactPersonPhone: z.string(),
  contactPersonEmail: z.string().email(),
  selectedModules: z.array(z.string()),
  trainerIds: z.array(z.string()).optional(),
  myGateSocietyId: z.string().optional(),
  myGateApiKey: z.string().optional(),
  myGateWebhookUrl: z.string().optional(),
  displayName: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = OnboardingPayloadSchema.parse(body)

    // Check for duplicate code
    const existing = await prisma.center.findUnique({
      where: { code: data.code },
    })
    if (existing) {
      return NextResponse.json(
        { error: `A center with code "${data.code}" already exists.` },
        { status: 409 }
      )
    }

    // Create the center with all related data in a transaction
    const center = await prisma.$transaction(async (tx) => {
      // 1. Create Center
      const center = await tx.center.create({
        data: {
          name: data.name,
          code: data.code,
          status: "ONBOARDING",
          address: data.address,
          city: data.city,
          pincode: data.pincode,
          capacity: data.capacity,
        },
      })

      // 2. Residential Details
      await tx.residentialDetails.create({
        data: {
          centerId: center.id,
          rwaName: data.rwaName,
          totalUnits: data.totalUnits,
          contactPersonName: data.contactPersonName,
          contactPersonPhone: data.contactPersonPhone,
          contactPersonEmail: data.contactPersonEmail,
        },
      })

      // 3. Center Modules
      if (data.selectedModules.length > 0) {
        await tx.centerModule.createMany({
          data: data.selectedModules.map((moduleKey) => ({
            centerId: center.id,
            moduleKey,
            isEnabled: true,
          })),
        })
      }

      // 4. MyGate Config (if MYGATE module selected and credentials provided)
      if (
        data.selectedModules.includes("MYGATE") &&
        data.myGateSocietyId &&
        data.myGateApiKey
      ) {
        await tx.myGateConfig.create({
          data: {
            centerId: center.id,
            societyId: data.myGateSocietyId,
            apiKey: data.myGateApiKey,
            webhookUrl: data.myGateWebhookUrl || null,
            isActive: false,
          },
        })
      }

      // 5. Trainer Mappings (if trainers selected)
      if (data.trainerIds && data.trainerIds.length > 0) {
        await tx.centerTrainerMapping.createMany({
          data: data.trainerIds.map((trainerId) => ({
            centerId: center.id,
            trainerId,
            isActive: true,
          })),
        })
      }

      return center
    })

    return NextResponse.json({ centerId: center.id, code: center.code }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 })
    }
    console.error("Onboarding error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
