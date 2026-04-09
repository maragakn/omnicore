import Link from "next/link"
import { TrainerOnboardingForm } from "@/components/trainers/TrainerOnboardingForm"

export default function NewTrainerOnboardingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/cf-admin/trainers/hiring" className="text-[#6b7280] hover:text-[#e5e7eb] text-sm">
          ← Back to hiring pipeline
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-[#e5e7eb]">New trainer candidate</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Capture profile details for the hiring process (stops at offer accepted).
        </p>
      </div>
      <TrainerOnboardingForm />
    </div>
  )
}
