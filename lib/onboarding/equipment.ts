import { type EquipmentSizeCategory } from "@/lib/constants/enums"

export interface EquipmentItem {
  name: string
  quantity: number
}

/**
 * Categorize gym size for equipment recommendations.
 * LARGE wins if either dimension is large; SMALL if both are below thresholds.
 */
export function deriveEquipmentCategory(
  gymSqFt: number,
  totalUnits: number
): EquipmentSizeCategory {
  if (gymSqFt > 2500 || totalUnits > 500) return "LARGE"
  if (gymSqFt >= 1000 || totalUnits >= 200) return "MEDIUM"
  return "SMALL"
}
