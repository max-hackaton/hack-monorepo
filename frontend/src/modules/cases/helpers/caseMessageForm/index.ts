import { z } from 'zod'

export const caseMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Введите сообщение.')
    .max(5000, 'Сообщение должно быть не длиннее 5000 символов.'),
})

export type CaseMessageFormValues = z.infer<typeof caseMessageSchema>
