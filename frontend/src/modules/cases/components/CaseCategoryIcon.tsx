import {
  ArrowUpDown,
  CircleQuestionMark,
  Droplets,
  Flame,
  GlassWater,
  Lightbulb,
  ShowerHead,
  Trees,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const categoryIcons: Record<string, LucideIcon> = {
  heating: Flame,
  elevator: ArrowUpDown,
  yard: Trees,
  leak: Droplets,
  hot_water: ShowerHead,
  cold_water: GlassWater,
  electricity: Lightbulb,
  other: CircleQuestionMark,
}

export const CaseCategoryIcon = ({
  categoryKey,
  size = 24,
}: {
  categoryKey: string
  size?: number
}) => {
  const Icon = categoryIcons[categoryKey] ?? CircleQuestionMark
  return <Icon size={size} strokeWidth={1.75} aria-hidden="true" />
}
