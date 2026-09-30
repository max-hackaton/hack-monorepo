import type { ControllerRenderProps } from 'react-hook-form'

import type { components } from '@/lib/api/openapi'
import type { ActionModalValues } from './actionModalSchema'

export type ActionField = components['schemas']['DispatchActionField']

export type FieldRendererProps = {
  field: ActionField
  control: ControllerRenderProps<ActionModalValues, string>
  values: Partial<ActionModalValues>
  error?: string
  onSelectChange: (key: string) => void
}
