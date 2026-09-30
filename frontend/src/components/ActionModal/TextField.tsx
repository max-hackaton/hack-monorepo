import { triggerClass } from './fieldStyles'
import type { FieldRendererProps } from './fieldTypes'

export const TextField = ({ field, control, error }: FieldRendererProps) => (
  <label className="grid gap-(--spacing-size-m)">
    {field.label}
    <input
      className={triggerClass}
      value={String(control.value)}
      onChange={control.onChange}
      onBlur={control.onBlur}
      aria-invalid={Boolean(error)}
    />
  </label>
)
