import { z } from 'zod'

import type { components } from '@/lib/api/openapi'

export type ActionForm = {
  title: string
  submit_label: string
  context?: components['schemas']['ActionFormContext']
  fields: components['schemas']['DispatchActionField'][]
}

export function createActionModalSchema(fields: ActionForm['fields']) {
  return z
    .record(z.string(), z.union([z.string(), z.boolean()]))
    .superRefine((values, context) => {
      for (const field of fields) {
        const value = values[field.key]
        if (field.type === 'boolean') continue
        if (typeof value !== 'string' || (field.required && !value.trim())) {
          context.addIssue({
            code: 'custom',
            path: [field.key],
            message: `Заполните поле «${field.label}».`,
          })
        } else if (
          field.type === 'select' &&
          value &&
          !field.options.some(
            (option) =>
              option.value === value &&
              (!field.depends_on ||
                option.parent_key === values[field.depends_on]),
          )
        ) {
          context.addIssue({
            code: 'custom',
            path: [field.key],
            message: `Выберите доступное значение поля «${field.label}».`,
          })
        } else if (field.type === 'textarea' && value.length > 5000) {
          context.addIssue({
            code: 'custom',
            path: [field.key],
            message: 'Не больше 5000 символов.',
          })
        }
      }
    })
}

export type ActionModalValues = z.infer<
  ReturnType<typeof createActionModalSchema>
>
