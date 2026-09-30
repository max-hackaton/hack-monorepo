import { Switch } from '@maxhub/max-ui'

import type { FieldRendererProps } from './fieldTypes'

export const BooleanField = ({ field, control }: FieldRendererProps) => (
  <label className="flex min-h-(--app-control-height) items-center justify-between gap-(--spacing-size-xl)">
    {field.label}
    <Switch
      name={control.name}
      checked={Boolean(control.value)}
      onChange={(event) => control.onChange(event.target.checked)}
    />
  </label>
)
