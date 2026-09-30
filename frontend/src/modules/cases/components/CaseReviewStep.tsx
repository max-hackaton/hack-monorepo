import { CellList, CellSimple, Textarea, Typography } from '@maxhub/max-ui'
import { useFormContext, useWatch } from 'react-hook-form'

import type { CaseType } from '../api/endpoints'
import type { CreateCaseFormValues } from '../helpers/createCaseForm'
import { CaseChoiceGroup } from './CaseChoiceGroup'
import { CaseFieldError } from './CaseFieldError'

type CaseReviewStepProps = {
  caseType: CaseType
  createError?: string
}

export const CaseReviewStep = ({
  caseType,
  createError,
}: CaseReviewStepProps) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateCaseFormValues>()
  const values = useWatch({ control })
  const photoNames = values.photos?.map((file) => file.name).join(', ') || 'Нет'

  return (
    <section
      className="grid gap-(--spacing-size3xl)"
      aria-labelledby="create-case-heading"
    >
      <div>
        <Typography.Title variant="large-strong" asChild>
          <h1 id="create-case-heading">Проверьте заявку</h1>
        </Typography.Title>
        <p className="mt-(--spacing-size-m) text-(length:--font-size-action-small) text-(--text-secondary)">
          Эти сведения сохранятся в одной истории проблемы.
        </p>
      </div>
      <CellList mode="island">
        <CellSimple
          title={caseType.name}
          subtitle={values.locationDetails || 'Место не уточнено'}
        />
        <CellSimple title="Начало нарушения" subtitle={values.startDate} />
        <CellSimple title="Фото" subtitle={photoNames} />
        <CellSimple
          title="Аварийная ситуация"
          subtitle={values.isEmergency ? 'Да' : 'Нет'}
        />
      </CellList>
      <div className="grid gap-(--spacing-size-m)">
        <label
          htmlFor="case-description"
          className="text-(--font-size-action-small) font-semibold"
        >
          Описание
        </label>
        <Textarea
          id="case-description"
          rows={6}
          aria-invalid={Boolean(errors.description)}
          className={
            errors.description ? 'border border-(--text-negative)' : undefined
          }
          {...register('description')}
        />
        {errors.description && (
          <CaseFieldError message={errors.description.message ?? ''} />
        )}
      </div>
      <CaseChoiceGroup
        name="visibility"
        label="Кто увидит заявку?"
        options={[
          {
            key: 'public',
            label: 'Жители дома',
            hint: 'Соседи видят проблему и могут нажать «У меня так же».',
          },
          {
            key: 'private',
            label: 'Только я',
            hint: 'Заявка и материалы не публикуются соседям.',
          },
        ]}
        variant="rows"
        error={errors.visibility?.message}
      />
      {createError && <CaseFieldError message={createError} />}
    </section>
  )
}
