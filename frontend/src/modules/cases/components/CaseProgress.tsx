import type { CaseDetail } from '../api/endpoints'

type CaseProgressProps = {
  currentStep: CaseDetail['current_step']
}

const stages = [
  'new',
  'in_progress',
  'closed_by_executor',
  'awaiting_recalculation',
  'completed',
] as const

export const CaseProgress = ({ currentStep }: CaseProgressProps) => {
  const currentStage =
    currentStep.status_key === 'action_required'
      ? 'in_progress'
      : currentStep.status_key
  const currentIndex = stages.indexOf(currentStage)
  return (
    <div
      className="mt-(--spacing-size-xl) grid grid-flow-col auto-cols-fr gap-(--spacing-size-xs)"
      role="img"
      aria-label={`Прогресс заявки: этап ${currentIndex + 1} из ${stages.length}, ${currentStep.title}`}
    >
      {stages.map((stage, index) => (
        <span
          key={stage}
          className={`h-1.5 rounded-full ${index < currentIndex ? 'bg-(--app-accent-muted)' : index === currentIndex ? 'bg-(--text-themed)' : 'bg-(--divider-primary)'}`}
        />
      ))}
    </div>
  )
}
