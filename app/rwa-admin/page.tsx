import { Activity, Users, Wrench, Ticket } from "lucide-react"
import { prisma } from "@/lib/db/client"
import { StatCard } from "@/components/shared/StatCard"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { FootfallCard } from "@/components/dashboard/FootfallCard"
import { BookingFeed } from "@/components/dashboard/BookingFeed"
import { TrainerAttendanceCard } from "@/components/dashboard/TrainerAttendanceCard"

async function getCenter() {
  return prisma.center.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
  })
}

async function getStats(centerId: string) {
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  const [liveOccupancy, trainersIn, assetAlerts, openRequests] = await Promise.all([
    prisma.amenityBooking.count({
      where: { centerId, status: "BOOKED", slotDate: { gte: startOfDay, lt: endOfDay } },
    }),
    prisma.trainerAttendance.count({
      where: { centerId, date: { gte: startOfDay }, status: "PRESENT", checkIn: { not: null }, checkOut: null },
    }),
    prisma.equipmentAsset.count({
      where: { condition: { in: ["FAIR", "POOR"] } },
    }),
    prisma.serviceRequest.count({
      where: { status: { in: ["OPEN", "ASSIGNED"] } },
    }),
  ])

  return { liveOccupancy, trainersIn, assetAlerts, openRequests }
}

export default async function RWAAdminDashboardPage() {
  const center = await getCenter()

  if (!center) {
    return (
      <div className="p-8 flex items-center justify-center h-64 text-[#6b7280]">
        No active center found. Complete onboarding to get started.
      </div>
    )
  }

  const stats = await getStats(center.id)

  return (
    <div className="p-8 space-y-8">
      <SectionHeader
        title={center.name}
        description={`Resident dashboard — ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`}
      />

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Today's Footfall"
          value={stats.liveOccupancy}
          icon={Activity}
          accent="cyan"
          description="gym bookings"
        />
        <StatCard
          label="Trainers Active"
          value={stats.trainersIn}
          icon={Users}
          accent="emerald"
        />
        <StatCard
          label="Asset Alerts"
          value={stats.assetAlerts}
          icon={Wrench}
          accent={stats.assetAlerts > 0 ? "amber" : "emerald"}
          description={stats.assetAlerts > 0 ? "fair or poor condition" : "all green"}
        />
        <StatCard
          label="Open Requests"
          value={stats.openRequests}
          icon={Ticket}
          accent={stats.openRequests > 0 ? "red" : "emerald"}
          description={stats.openRequests > 0 ? "needs attention" : "all clear"}
        />
      </div>

      {/* Footfall chart + trainer attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FootfallCard centerId={center.id} />
        <TrainerAttendanceCard centerId={center.id} />
      </div>

      {/* Recent bookings feed */}
      <BookingFeed centerId={center.id} />
    </div>
  )
}
