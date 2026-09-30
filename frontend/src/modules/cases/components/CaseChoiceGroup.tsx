import { Check } from 'lucide-react'
import { useId } from 'react'
import type { ChangeEvent } from 'react'
import { useFormContext } from 'react-hook-form'

import type { CreateCaseFormValues } from '../helpers/createCaseForm'
import { CaseFieldError } from './CaseFieldError'

type CaseChoiceGroupProps = {
  name: `answers.${string}` | 'visibility'
  label: string
  hint?: string
  options: readonly { key: string; label: string; hint?: string }[]
  variant: 'rows' | 'chips'
  error?: string
  onChange?: (value: string) => void
}

export const CaseChoiceGroup = ({
  name,
  label,
  hint,
  options,
  variant,
  error,
  onChange,
}: CaseChoiceGroupProps) => {
  const { register } = useFormContext<CreateCaseFormValues>()
  const errorId = useId()

  return (
    <fieldset className="min-w-0">
      <legend className="mb-(--spacing-size-m) text-(--font-size-action-small) font-semibold">
        {label}
      </legend>
      {hint && (
        <p className="mb-(--spacing-size-xl) text-(length:--font-size-label) text-(--text-secondary)">
          {hint}
        </p>
      )}
      <div
        className={
          variant === 'chips'
            ? 'flex flex-wrap gap-(--spacing-size-m)'
            : 'grid gap-(--spacing-size-m)'
        }
      >
        {options.map((option) => (
          <label key={option.key} className="relative cursor-pointer">
            <input
              type="radio"
              value={option.key}
              className="peer sr-only"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              {...register(name, {
                onChange: (event: ChangeEvent<HTMLInputElement>) =>
                  onChange?.(event.target.value),
              })}
            />
            <span
              className={`border border-(--divider-primary) bg-(--background-primary) text-(--text-primary) peer-checked:border-(--text-themed) peer-checked:bg-(--background-tertiary) peer-checked:[&>svg]:opacity-100 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--text-themed) ${variant === 'chips' ? 'flex min-h-(--app-control-height) items-center rounded-full px-(--spacing-size2xl) py-(--spacing-size-m) text-(--font-size-action-small) font-medium' : 'flex min-h-(--app-control-height) items-center gap-(--spacing-size-xl) rounded-(--app-radius-card) px-(--spacing-size2xl) py-(--spacing-size-xl) text-(--font-size-action-small)'}`}
            >
              <span className="min-w-0 flex-1">
                <span className={variant === 'rows' ? 'block font-medium' : ''}>
                  {option.label}
                </span>
                {option.hint && (
                  <small className="mt-(--spacing-size-xs) block text-(length:--font-size-label) text-(--text-secondary)">
                    {option.hint}
                  </small>
                )}
              </span>
              {variant === 'rows' && (
                <Check
                  size={20}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="shrink-0 text-(--app-accent-text) opacity-0"
                />
              )}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <div id={errorId} className="mt-(--spacing-size-m)">
          <CaseFieldError message={error} />
        </div>
      )}
    </fieldset>
  )
}
