import { Controller } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import type { ComponentType } from 'react'

import { BooleanField } from './BooleanField'
import { SelectField } from './SelectField'
import { TextField } from './TextField'
import { TextareaField } from './TextareaField'
import type { ActionModalValues } from './actionModalSchema'
import type { ActionField, FieldRendererProps } from './fieldTypes'

type Props = Omit<FieldRendererProps, 'control'> & {
  formControl: Control<ActionModalValues>
}

const fieldRenderers = new Map<
  ActionField['type'],
  ComponentType<FieldRendererProps>
>([
  ['boolean', BooleanField],
  ['select', SelectField],
  ['text', TextField],
  ['textarea', TextareaField],
])

function getFieldRenderer(type: ActionField['type']) {
  const renderer = fieldRenderers.get(type)
  if (!renderer) throw new Error(`Unsupported action field type: ${type}`)
  return renderer
}

export const ActionModalField = ({
  field,
  formControl,
  values,
  error,
  onSelectChange,
}: Props) => {
  const Renderer = getFieldRenderer(field.type)

  return (
    <div className="grid gap-(--spacing-size-m)">
      <Controller
        name={field.key}
        control={formControl}
        render={({ field: control }) => (
          <Renderer
            field={field}
            control={control}
            values={values}
            error={error}
            onSelectChange={onSelectChange}
          />
        )}
      />
      {error && (
        <p role="alert" className="text-(--text-negative)">
          {error}
        </p>
      )}
    </div>
  )
}
