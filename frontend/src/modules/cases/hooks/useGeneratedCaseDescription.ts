import { useEffect, useRef } from 'react'
import { useWatch } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'

import type { CaseType } from '../api/endpoints'
import { composeDescription } from '../helpers/composeDescription'
import { updateGeneratedDescription } from '../helpers/updateGeneratedDescription'
import type { CreateCaseFormValues } from '../helpers/createCaseForm'

export const useGeneratedCaseDescription = (
  form: UseFormReturn<CreateCaseFormValues>,
  caseType: CaseType | undefined,
  initialGenerated = '',
) => {
  const previousGenerated = useRef(initialGenerated)
  const answers = useWatch({ control: form.control, name: 'answers' })
  const customProblem = useWatch({
    control: form.control,
    name: 'customProblem',
  })
  const startDate = useWatch({ control: form.control, name: 'startDate' })

  useEffect(() => {
    if (!caseType) return

    const generated = composeDescription(
      caseType.constructor,
      answers,
      customProblem,
      startDate,
    )
    const current = form.getValues('description')
    const next = updateGeneratedDescription(
      current,
      previousGenerated.current,
      generated,
    )
    previousGenerated.current = generated
    if (next !== current)
      form.setValue('description', next, { shouldValidate: true })
  }, [answers, customProblem, startDate, caseType, form])

  const resetGenerated = () => {
    previousGenerated.current = ''
  }

  return { previousGenerated, resetGenerated }
}
