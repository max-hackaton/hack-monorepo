import { ChevronDown } from 'lucide-react'

import { Select } from '@/components/Select'
import { triggerClass } from './fieldStyles'
import type { FieldRendererProps } from './fieldTypes'

export const SelectField = ({
  field,
  control,
  values,
  error,
  onSelectChange,
}: FieldRendererProps) => {
  const options = field.options.filter(
    (option) =>
      !field.depends_on || option.parent_key === values[field.depends_on],
  )
  const selected = options.find((option) => option.value === control.value)

  return (
    <>
      <span id={`${field.key}-label`}>{field.label}</span>
      <Select
        mode="single"
        value={typeof control.value === 'string' ? control.value : null}
        onValueChange={(value) => {
          control.onChange(value)
          onSelectChange(field.key)
        }}
      >
        <Select.Trigger>
          {(props) => (
            <button
              {...props}
              type="button"
              aria-labelledby={`${field.key}-label`}
              aria-invalid={Boolean(error)}
              disabled={Boolean(field.depends_on && !values[field.depends_on])}
              className={triggerClass}
            >
              <span className="min-w-0 flex-1 truncate text-left">
                {selected?.label ?? `Выберите: ${field.label.toLowerCase()}`}
              </span>
              <ChevronDown size={16} aria-hidden="true" />
            </button>
          )}
        </Select.Trigger>
        <Select.Content aria-label={field.label} floating>
          {options.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </>
  )
}
