import {
  Button,
  CellList,
  CellSimple,
  Input,
  Switch,
  Typography,
} from '@maxhub/max-ui'
import { useId } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { Skeleton } from '@/components/Skeleton'

import type { CaseType, CaseTypesResponse } from '../api/endpoints'
import type { CreateCaseFormValues } from '../helpers/createCaseForm'
import { CaseChoiceGroup } from './CaseChoiceGroup'
import { CaseCategoryIcon } from './CaseCategoryIcon'
import { CaseFieldError } from './CaseFieldError'

type CaseCategoryStepProps = {
  categories?: CaseTypesResponse
  categoriesPending: boolean
  categoriesError: boolean
  retryCategories: () => void
  caseType?: CaseType
  caseTypePending: boolean
  caseTypeError: boolean
  retryCaseType: () => void
  onCategoryChange: (key: string) => void
}

export const CaseCategoryStep = ({
  categories,
  categoriesPending,
  categoriesError,
  retryCategories,
  caseType,
  caseTypePending,
  caseTypeError,
  retryCaseType,
  onCategoryChange,
}: CaseCategoryStepProps) => {
  const {
    register,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<CreateCaseFormValues>()
  const categoryErrorId = useId()
  const categoryRegistration = register('category')
  const category = useWatch({ control, name: 'category' })
  const problem = useWatch({ control, name: 'answers.problem' })
  const problemField = caseType?.constructor.fields.find(
    (field) => field.key === 'problem',
  )
  const problemOption = problemField?.options.find(
    (option) => option.key === problem,
  )

  const handleProblemChange = (key: string) => {
    const locationKey = getValues('answers.location')
    const location = caseType?.constructor.fields
      .find((field) => field.key === 'location')
      ?.options.find((option) => option.key === locationKey)

    if (location?.problem_keys && !location.problem_keys.includes(key)) {
      setValue('answers.location', '', {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
  }

  return (
    <section
      className="grid gap-(--spacing-size3xl)"
      aria-labelledby="create-case-heading"
    >
      <div>
        <Typography.Title variant="large-strong" asChild>
          <h1 id="create-case-heading">Что случилось?</h1>
        </Typography.Title>
      </div>
      {categoriesPending ? (
        <div role="status" aria-label="Загрузка категорий">
          <Skeleton className="mb-(--spacing-size-xl) h-5 w-40" />
          <div className="grid grid-cols-2 gap-(--spacing-size-m)">
            {[0, 1, 2, 3].map((item) => (
              <Skeleton
                key={item}
                className="h-20 w-full rounded-(--app-radius-card)"
              />
            ))}
          </div>
        </div>
      ) : categoriesError ? (
        <CellList mode="island">
          <CellSimple title="Не удалось загрузить категории" />
          <div className="px-(--spacing-size2xl) pb-(--spacing-size2xl)">
            <Button
              type="button"
              stretched
              variant="secondary"
              onClick={retryCategories}
            >
              Повторить
            </Button>
          </div>
        </CellList>
      ) : (
        <fieldset>
          <legend className="mb-(--spacing-size-xl) text-(--font-size-action-small) font-semibold">
            Категория проблемы
          </legend>
          <div className="grid grid-cols-2 gap-(--spacing-size-m)">
            {categories?.case_types.map((item) => (
              <label key={item.key} className="relative cursor-pointer">
                <input
                  type="radio"
                  value={item.key}
                  checked={category === item.key}
                  className="peer sr-only"
                  aria-invalid={Boolean(errors.category)}
                  aria-describedby={
                    errors.category ? categoryErrorId : undefined
                  }
                  {...categoryRegistration}
                  onChange={(event) => {
                    onCategoryChange(event.target.value)
                  }}
                />
                <span className="block min-h-20 rounded-(--app-radius-card) border border-(--divider-primary) bg-(--background-primary) p-(--spacing-size-xl) text-left text-(--font-size-action-small) font-semibold peer-checked:border-(--text-themed) peer-checked:bg-(--background-tertiary) peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--text-themed)">
                  <span
                    className="mb-(--spacing-size-xs) block"
                    aria-hidden="true"
                  >
                    <CaseCategoryIcon categoryKey={item.key} />
                  </span>
                  {item.name}
                </span>
              </label>
            ))}
          </div>
          {errors.category && (
            <div id={categoryErrorId} className="mt-(--spacing-size-m)">
              <CaseFieldError message={errors.category.message ?? ''} />
            </div>
          )}
        </fieldset>
      )}
      {category &&
        (caseTypePending ? (
          <div
            role="status"
            aria-label="Загрузка вариантов"
            className="grid gap-(--spacing-size-m)"
          >
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-12 w-full rounded-(--app-radius-control)" />
            <Skeleton className="h-12 w-full rounded-(--app-radius-control)" />
          </div>
        ) : caseTypeError ? (
          <CellList mode="island">
            <CellSimple title="Не удалось загрузить варианты проблемы" />
            <div className="px-(--spacing-size2xl) pb-(--spacing-size2xl)">
              <Button
                type="button"
                stretched
                variant="secondary"
                onClick={retryCaseType}
              >
                Повторить
              </Button>
            </div>
          </CellList>
        ) : (
          <>
            {caseType?.steps.length === 0 && (
              <p role="alert">
                Для этой категории пока нельзя создать заявку: шаги не
                настроены.
              </p>
            )}
            {problemField && (
              <CaseChoiceGroup
                name="answers.problem"
                label={problemField.label}
                options={problemField.options}
                variant="rows"
                error={errors.answers?.problem?.message}
                onChange={handleProblemChange}
              />
            )}
            {problemOption?.input_label && (
              <div className="grid gap-(--spacing-size-m)">
                <label
                  htmlFor="custom-problem"
                  className="text-(--font-size-action-small) font-semibold"
                >
                  {problemOption.input_label}
                </label>
                <Input
                  id="custom-problem"
                  maxLength={120}
                  required
                  className={
                    errors.customProblem
                      ? 'border border-(--text-negative)'
                      : undefined
                  }
                  aria-invalid={Boolean(errors.customProblem)}
                  {...register('customProblem')}
                />
                {errors.customProblem && (
                  <CaseFieldError
                    message={errors.customProblem.message ?? ''}
                  />
                )}
              </div>
            )}
            <label className="flex items-start justify-between gap-(--spacing-size2xl) rounded-(--app-radius-card) border border-(--divider-primary) bg-(--background-secondary) p-(--spacing-size2xl) text-(--text-primary)">
              <span>
                <strong className="block text-(--font-size-action-small)">
                  Аварийная ситуация
                </strong>
                <small className="mt-(--spacing-size-xs) block text-(length:--font-size-label) text-(--text-secondary)">
                  Отметьте, если требуется срочная помощь.
                </small>
              </span>
              <Switch {...register('isEmergency')} />
            </label>
          </>
        ))}
    </section>
  )
}
