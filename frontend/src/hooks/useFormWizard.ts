import { useRef, useState } from 'react'
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form'

type FormWizardStep<TValues extends FieldValues, TStepId extends string> = {
  id: TStepId
  fields: () => readonly FieldPath<TValues>[]
  canAdvance?: () => boolean
}

type FormWizardOptions<TValues extends FieldValues, TStepId extends string> = {
  form: Pick<UseFormReturn<TValues>, 'trigger' | 'getValues'>
  steps: readonly [
    FormWizardStep<TValues, TStepId>,
    ...FormWizardStep<TValues, TStepId>[],
  ]
  initialStepId?: TStepId
}

export const useFormWizard = <
  TValues extends FieldValues,
  TStepId extends string,
>({
  form,
  steps,
  initialStepId,
}: FormWizardOptions<TValues, TStepId>) => {
  const [activeId, setActiveId] = useState<TStepId>(() =>
    initialStepId && steps.some((step) => step.id === initialStepId)
      ? initialStepId
      : steps[0].id,
  )
  const [isAdvancing, setIsAdvancing] = useState(false)
  const advancing = useRef(false)
  const foundIndex = steps.findIndex((step) => step.id === activeId)
  const currentIndex = foundIndex < 0 ? 0 : foundIndex
  const currentStepId = steps[currentIndex].id

  const next = async (): Promise<boolean> => {
    if (advancing.current || currentIndex === steps.length - 1) return false
    advancing.current = true
    setIsAdvancing(true)
    try {
      const step = steps[currentIndex]
      if (step.canAdvance && !step.canAdvance()) return false
      const fields = step.fields()
      const values = fields.map((field) => form.getValues(field))
      if (fields.length > 0 && !(await form.trigger([...fields]))) return false
      if (
        fields.some(
          (field, index) => !Object.is(values[index], form.getValues(field)),
        )
      )
        return false
      setActiveId(steps[currentIndex + 1].id)
      return true
    } finally {
      advancing.current = false
      setIsAdvancing(false)
    }
  }

  const back = () => {
    if (advancing.current || currentIndex === 0) return
    setActiveId(steps[currentIndex - 1].id)
  }

  return {
    currentStepId,
    currentIndex,
    stepCount: steps.length,
    isFirstStep: currentIndex === 0,
    isLastStep: currentIndex === steps.length - 1,
    isAdvancing,
    next,
    back,
  }
}
