import { Button, CellList, CellSimple } from '@maxhub/max-ui'

import { Skeleton } from '@/components/Skeleton'

import type { useCaseType } from '../api/hooks/useCaseType'
import type { useCaseTypes } from '../api/hooks/useCaseTypes'
import { CaseCategoryStep } from './CaseCategoryStep'
import { CaseDetailsStep } from './CaseDetailsStep'
import { CaseReviewStep } from './CaseReviewStep'

type CreateCaseWizardContentProps = {
  step: 'category' | 'details' | 'review'
  isAdvancing: boolean
  categories: ReturnType<typeof useCaseTypes>
  caseType: ReturnType<typeof useCaseType>
  onCategoryChange: (key: string) => void
  createError?: string
}

export const CreateCaseWizardContent = ({
  step,
  isAdvancing,
  categories,
  caseType,
  onCategoryChange,
  createError,
}: CreateCaseWizardContentProps) => (
  <>
    {step === 'category' && (
      <>
        <fieldset disabled={isAdvancing} className="min-w-0">
          <CaseCategoryStep
            categories={categories.data}
            categoriesPending={categories.isPending}
            categoriesError={categories.isError}
            retryCategories={() => categories.refetch()}
            caseType={caseType.data}
            caseTypePending={caseType.isPending}
            caseTypeError={caseType.isError}
            retryCaseType={() => caseType.refetch()}
            onCategoryChange={onCategoryChange}
          />
        </fieldset>
      </>
    )}
    {step !== 'category' && !caseType.data && caseType.isError && (
      <CellList mode="island">
        <CellSimple title="Не удалось загрузить вопросы" />
        <div className="px-(--spacing-size2xl) pb-(--spacing-size2xl)">
          <Button
            type="button"
            stretched
            variant="secondary"
            onClick={() => caseType.refetch()}
          >
            Повторить
          </Button>
        </div>
      </CellList>
    )}
    {step !== 'category' && !caseType.data && !caseType.isError && (
      <div
        role="status"
        aria-label="Загрузка вопросов"
        className="grid gap-(--spacing-size-xl)"
      >
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-12 w-full rounded-(--app-radius-control)" />
        <Skeleton className="h-12 w-full rounded-(--app-radius-control)" />
      </div>
    )}
    {step === 'details' && caseType.data && (
      <>
        <fieldset disabled={isAdvancing} className="min-w-0">
          <CaseDetailsStep caseType={caseType.data} />
        </fieldset>
      </>
    )}
    {step === 'review' && caseType.data && (
      <CaseReviewStep caseType={caseType.data} createError={createError} />
    )}
  </>
)
