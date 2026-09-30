import { Button, Input, Typography } from '@maxhub/max-ui'
import { Camera } from 'lucide-react'
import { useFormContext, useWatch } from 'react-hook-form'

import type { CaseType } from '../api/endpoints'
import type { CreateCaseFormValues } from '../helpers/createCaseForm'
import { getAvailableOptions } from '../helpers/getAvailableOptions'
import { CaseChoiceGroup } from './CaseChoiceGroup'
import { CaseFieldError } from './CaseFieldError'
import { PhotoPreview } from './PhotoPreview'

export const CaseDetailsStep = ({ caseType }: { caseType: CaseType }) => {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CreateCaseFormValues>()
  const photos = useWatch({ control, name: 'photos' })
  const answers = useWatch({ control, name: 'answers' })

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('photos', [...photos, ...Array.from(event.target.files ?? [])], {
      shouldValidate: true,
      shouldDirty: true,
    })
    event.target.value = ''
  }

  return (
    <section
      className="grid gap-(--spacing-size3xl)"
      aria-labelledby="create-case-heading"
    >
      <div>
        <Typography.Title variant="large-strong" asChild>
          <h1 id="create-case-heading">Где и когда?</h1>
        </Typography.Title>
        <p className="mt-(--spacing-size-m) text-(length:--font-size-action-small) text-(--text-secondary)">
          Добавьте факты, которые помогут найти и проверить проблему.
        </p>
      </div>
      {caseType.constructor.fields
        .filter((field) => field.key !== 'problem')
        .map((field) => (
          <CaseChoiceGroup
            key={field.key}
            name={`answers.${field.key}`}
            label={field.label}
            options={getAvailableOptions(field, answers)}
            variant="rows"
            error={errors.answers?.[field.key]?.message}
          />
        ))}
      <div className="grid gap-(--spacing-size-m)">
        <label
          htmlFor="case-location"
          className="text-(--font-size-action-small) font-semibold"
        >
          Уточнение места <span className="font-normal">(необязательно)</span>
        </label>
        <Input
          id="case-location"
          placeholder="Например, подъезд 3, подвал"
          aria-invalid={Boolean(errors.locationDetails)}
          className={
            errors.locationDetails
              ? 'border border-(--text-negative)'
              : undefined
          }
          {...register('locationDetails')}
        />
        {errors.locationDetails && (
          <CaseFieldError message={errors.locationDetails.message ?? ''} />
        )}
      </div>
      <div className="grid gap-(--spacing-size-m)">
        <label
          htmlFor="case-start-date"
          className="text-(--font-size-action-small) font-semibold"
        >
          Когда началось?
        </label>
        <input
          id="case-start-date"
          type="date"
          required
          max={new Date().toLocaleDateString('sv-SE')}
          aria-invalid={Boolean(errors.startDate)}
          className={`w-full rounded-(--app-radius-control) border bg-(--background-primary) p-(--spacing-size-xl) text-(--font-size-action-small) ${errors.startDate ? 'border-(--text-negative)' : 'border-(--divider-primary)'}`}
          {...register('startDate')}
        />
        {errors.startDate && (
          <CaseFieldError message={errors.startDate.message ?? ''} />
        )}
      </div>
      <div className="grid gap-(--spacing-size-m)">
        <label
          htmlFor="case-photos"
          className={`cursor-pointer rounded-(--app-radius-card) border-2 border-dashed bg-(--background-primary) px-(--spacing-size2xl) py-(--spacing-size3xl) text-center focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-(--text-themed) ${errors.photos ? 'border-(--text-negative)' : 'border-(--divider-primary)'}`}
        >
          <span
            className="mb-(--spacing-size-xs) flex justify-center"
            aria-hidden="true"
          >
            <Camera size={24} strokeWidth={1.75} />
          </span>
          <strong className="block text-(--font-size-action-small)">
            Добавить фотографии
          </strong>
          <small className="block text-(--font-size-label)">
            По желанию · до 5 изображений, каждое до 10 МиБ
          </small>
          <input
            id="case-photos"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
            multiple
            onChange={handleFiles}
            className="sr-only"
            aria-invalid={Boolean(errors.photos)}
          />
        </label>
        {errors.photos && (
          <CaseFieldError message={errors.photos.message ?? ''} />
        )}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-(--spacing-size-m)">
            {photos.map((file, index) => (
              <div key={`${file.name}-${index}`} className="min-w-0">
                <PhotoPreview file={file} />
                <p
                  className="mt-(--spacing-size-xs) truncate text-(--font-size-label)"
                  title={file.name}
                >
                  {file.name}
                </p>
                <Button
                  type="button"
                  size="small"
                  variant="ghost"
                  onClick={() =>
                    setValue(
                      'photos',
                      photos.filter((_, itemIndex) => itemIndex !== index),
                      { shouldValidate: true, shouldDirty: true },
                    )
                  }
                >
                  Убрать
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
