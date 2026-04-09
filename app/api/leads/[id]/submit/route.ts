import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"
import { z } from "zod"
import { LeadFormSubmitSchema } from "@/lib/validations/lead"

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const lead = await prisma.lead.findUnique({ where: { id } })

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }
    if (lead.status !== "INVITED") {
      return NextResponse.json({ error: "Form already submitted" }, { status: 409 })
    }

    const body = await req.json()
    const data = LeadFormSubmitSchema.parse(body)

    await prisma.lead.update({
      where: { id },
      data: {
        status: "FORM_SUBMITTED",
        formData: JSON.stringify(data),
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 }
      )
    }
    console.error("Lead submit error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
