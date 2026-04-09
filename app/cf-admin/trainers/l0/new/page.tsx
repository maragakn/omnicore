import Link from "next/link"
import { TrainerL0Form } from "@/components/trainers/TrainerL0Form"

export default function NewTrainerL0Page() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/cf-admin/trainers/l0" className="text-[#6b7280] hover:text-[#e5e7eb] text-sm">
          ← Back to L0 training
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-[#e5e7eb]">New L0 enrollment</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Add someone who has accepted an offer and is entering L0 (not the same as hiring or roster).
        </p>
      </div>
      <TrainerL0Form />
    </div>
  )
}
