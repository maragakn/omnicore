import { TrainersSectionNav } from "@/components/trainers/TrainersSectionNav"

export default function CFAdminTrainersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="px-8 pt-6 pb-10">
      <TrainersSectionNav />
      {children}
    </div>
  )
}
