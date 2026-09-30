import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFormState, useWatch } from 'react-hook-form'

import { createActionModalSchema } from './actionModalSchema'
import type { ActionForm, ActionModalValues } from './actionModalSchema'

type Options = {
  form: ActionForm
  onClose: () => void
  onSubmit: (values: ActionModalValues) => Promise<unknown>
}

export const useActionModalForm = ({ form, onClose, onSubmit }: Options) => {
  const fields = useForm<ActionModalValues>({
    resolver: zodResolver(createActionModalSchema(form.fields)),
    defaultValues: Object.fromEntries(
      form.fields.map((field) => [
        field.key,
        field.default_value ?? (field.type === 'boolean' ? false : ''),
      ]),
    ),
    mode: 'onChange',
  })
  const { errors } = useFormState({ control: fields.control })
  const values = useWatch({ control: fields.control })

  const onSelectChange = (key: string) => {
    const dependent = form.fields.find((field) => field.depends_on === key)
    if (dependent) {
      fields.setValue(dependent.key, '', { shouldValidate: true })
    }
  }

  const handleSubmit = fields.handleSubmit(async (data) => {
    try {
      await onSubmit(data)
      onClose()
    } catch {
      return
    }
  })

  return {
    control: fields.control,
    errors,
    values,
    onSelectChange,
    handleSubmit,
  }
}
