import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

export async function GET() {
  const configs = await prisma.servicePricingConfig.findMany({
    orderBy: { moduleKey: "asc" },
  })
  return NextResponse.json({ configs })
}
