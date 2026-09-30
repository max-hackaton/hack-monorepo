import { useEffect, useLayoutEffect, useRef } from 'react'
import { Button } from '@maxhub/max-ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import type { FieldPath } from 'react-hook-form'

import { useFormWizard } from '@/hooks/useFormWizard'
import { AppPageContainer } from '@/components/AppPageContainer'
import { ApiError } from '@/lib/api/httpClient'
import { CreateCaseWizardContent } from '../components/CreateCaseWizardContent'
import { CreateCaseProgress } from '../components/CreateCaseProgress'
import { useCaseType } from '../api/hooks/useCaseType'
import { useCaseTypes } from '../api/hooks/useCaseTypes'
import { useCreateCaseMutation } from '../api/hooks/useCreateCaseMutation'
import { useGeneratedCaseDescription } from '../hooks/useGeneratedCaseDescription'
import { createCaseDefaults, createCaseSchema } from '../helpers/createCaseForm'
import { toViolationStartedAt } from '../helpers/toViolationStartedAt'
import type { CreateCaseFormValues } from '../helpers/createCaseForm'

type CaseWizardStepId = 'category' | 'details' | 'review'

const progressStep: Record<CaseWizardStepId, 1 | 2 | 3> = {
  category: 1,
  details: 2,
  review: 3,
}

type CaseDraft = {
  values: CreateCaseFormValues
  step: CaseWizardStepId
  previousGenerated: string
}

const drafts = new Map<string, CaseDraft>()
let activeDraftUserId: string | undefined

export const CreateCasePage = ({
  houseId,
  userId,
}: {
  houseId: string
  userId: string
}) => {
  const draftKey = JSON.stringify([userId, houseId])
  const initialDraft = drafts.get(draftKey)
  const navigate = useNavigate()
  const categories = useCaseTypes(houseId)
  const form = useForm<CreateCaseFormValues>({
    resolver: (values, context, options) =>
      zodResolver(createCaseSchema(caseType.data))(values, context, options),
    defaultValues: initialDraft?.values ?? {
      ...createCaseDefaults,
      startDate: new Date().toLocaleDateString('sv-SE'),
    },
    mode: 'onChange',
    shouldUnregister: false,
  })
  const categoryKey = useWatch({ control: form.control, name: 'category' })
  const caseType = useCaseType(houseId, categoryKey || undefined)
  const submitting = useRef(false)
  const completed = useRef(false)
  const mounted = useRef(true)
  const create = useCreateCaseMutation(
    houseId,
    userId,
    (id) => {
      completed.current = true
      drafts.delete(draftKey)
      if (mounted.current)
        navigate({
          to: '/cases/created/$id',
          params: { id },
          replace: true,
        })
    },
    () => {
      submitting.current = false
    },
  )
  const { previousGenerated, resetGenerated } = useGeneratedCaseDescription(
    form,
    caseType.data,
    initialDraft?.previousGenerated,
  )
  const wizard = useFormWizard<CreateCaseFormValues, CaseWizardStepId>({
    form,
    initialStepId: initialDraft?.step,
    steps: [
      {
        id: 'category',
        fields: () => ['category', 'answers.problem', 'customProblem'],
        canAdvance: () => Boolean(caseType.data?.steps.length),
      },
      {
        id: 'details',
        fields: () => [
          ...(caseType.data?.constructor.fields
            .filter((field) => field.key !== 'problem')
            .map(
              (field) =>
                `answers.${field.key}` as FieldPath<CreateCaseFormValues>,
            ) ?? []),
          'locationDetails',
          'startDate',
          'photos',
        ],
        canAdvance: () => Boolean(caseType.data),
      },
      { id: 'review', fields: () => [] },
    ],
  })
  const values = useWatch({ control: form.control })

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [wizard.currentStepId])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    if (activeDraftUserId !== userId) {
      drafts.clear()
      activeDraftUserId = userId
    }
  }, [userId])

  useEffect(() => {
    if (completed.current) return
    drafts.set(draftKey, {
      values: form.getValues(),
      step: wizard.currentStepId,
      previousGenerated: previousGenerated.current,
    })
  }, [draftKey, values, wizard.currentStepId, form])

  const handleCategoryChange = (key: string) => {
    if (key === categoryKey) return
    form.setValue('category', key, { shouldDirty: true })
    form.clearErrors(['category', 'answers', 'customProblem', 'description'])
    form.setValue('answers', {}, { shouldDirty: true })
    form.setValue('customProblem', '')
    form.setValue('description', '')
    resetGenerated()
  }

  const submit = (data: CreateCaseFormValues) => {
    if (
      !wizard.isLastStep ||
      submitting.current ||
      !caseType.data ||
      caseType.data.steps.length === 0
    )
      return
    submitting.current = true
    create.mutate({
      case_type_key: data.category,
      problem_key: data.answers.problem,
      description: data.description,
      location_details: data.locationDetails || null,
      visibility: data.visibility,
      is_emergency: data.isEmergency,
      violation_started_at: toViolationStartedAt(data.startDate),
      photos: data.photos,
    })
  }

  const createError =
    create.error instanceof ApiError && create.error.status === 403
      ? 'Доступ к дому не подтверждён. Проверьте выбранный дом и повторите попытку.'
      : create.isError
        ? 'Не удалось создать заявку. Проверьте данные и попробуйте ещё раз.'
        : undefined

  return (
    <AppPageContainer>
      <CreateCaseProgress step={progressStep[wizard.currentStepId]} />
      <FormProvider {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(submit)}
          className="grid gap-(--spacing-size4xl) pb-(--app-section-gap)"
        >
          <CreateCaseWizardContent
            step={wizard.currentStepId}
            isAdvancing={wizard.isAdvancing}
            categories={categories}
            caseType={caseType}
            onCategoryChange={handleCategoryChange}
            createError={createError}
          />
          <div className="flex gap-(--spacing-size-m)">
            <Button
              type="button"
              stretched
              variant="secondary"
              className="min-w-0 flex-1"
              disabled={wizard.isAdvancing || create.isPending}
              onClick={() =>
                wizard.isFirstStep
                  ? navigate({ to: '/cases', search: { scope: 'mine' } })
                  : wizard.back()
              }
            >
              Назад
            </Button>
            {wizard.currentStepId !== 'review' && (
              <Button
                type="button"
                stretched
                variant="primary"
                className="min-w-0 flex-1"
                disabled={
                  wizard.isAdvancing ||
                  !caseType.data ||
                  (wizard.isFirstStep && caseType.data.steps.length === 0)
                }
                onClick={() => wizard.next()}
              >
                Дальше
              </Button>
            )}
            {wizard.currentStepId === 'review' && caseType.data && (
              <Button
                type="submit"
                stretched
                variant="primary"
                className="min-w-0 flex-1"
                disabled={create.isPending}
                loading={create.isPending}
              >
                Создать
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
    </AppPageContainer>
  )
}
