import { triggerClass } from './fieldStyles'
import type { FieldRendererProps } from './fieldTypes'

export const TextareaField = ({
  field,
  control,
  error,
}: FieldRendererProps) => (
  <label className="grid gap-(--spacing-size-m)">
    {field.label}
    <textarea
      className={`${triggerClass} min-h-28 py-(--spacing-size-m)`}
      value={String(control.value)}
      onChange={control.onChange}
      onBlur={control.onBlur}
      aria-invalid={Boolean(error)}
    />
  </label>
)
