import { z } from 'zod'

import type { CaseType } from '../../api/endpoints'
import { getAvailableOptions } from '../getAvailableOptions'
import { validatePhotos } from '../validatePhotos'

export const createCaseDefaults: CreateCaseFormValues = {
  category: '',
  answers: {},
  customProblem: '',
  description: '',
  locationDetails: '',
  visibility: 'public',
  isEmergency: false,
  startDate: '',
  photos: [],
}

export function createCaseSchema(caseType: CaseType | undefined) {
  return z
    .object({
      category: z
        .string({ error: 'Выберите категорию.' })
        .min(1, 'Выберите категорию.'),
      answers: z.record(
        z.string({ error: 'Некорректный вопрос.' }),
        z.string({ error: 'Выберите вариант ответа.' }),
        { error: 'Выберите ответы на вопросы.' },
      ),
      customProblem: z.string({ error: 'Коротко опишите проблему.' }),
      description: z
        .string({ error: 'Напишите описание проблемы.' })
        .refine(
          (value) => value.trim().length > 0,
          'Напишите описание проблемы.',
        ),
      locationDetails: z.string({
        error: 'Уточнение места должно быть текстом.',
      }),
      visibility: z.enum(['public', 'private'], {
        error: 'Выберите, кто увидит заявку.',
      }),
      isEmergency: z.boolean({ error: 'Укажите, аварийная ли ситуация.' }),
      startDate: z
        .string({ error: 'Укажите дату начала.' })
        .min(1, 'Укажите дату начала.'),
      photos: z.array(z.instanceof(File, { error: 'Выберите изображение.' }), {
        error: 'Проверьте прикреплённые фотографии.',
      }),
    })
    .superRefine((values, context) => {
      if (!caseType || caseType.key !== values.category) {
        context.addIssue({
          code: 'custom',
          path: ['category'],
          message: 'Выберите доступную категорию.',
        })
        return
      }
      if (caseType.steps.length === 0) {
        context.addIssue({
          code: 'custom',
          path: ['category'],
          message: 'Для этой категории пока нельзя создать заявку.',
        })
      }
      for (const field of caseType.constructor.fields) {
        const option = getAvailableOptions(field, values.answers).find(
          (item) => item.key === values.answers[field.key],
        )
        if (!option) {
          context.addIssue({
            code: 'custom',
            path: ['answers', field.key],
            message: `Выберите ответ: ${field.label}.`,
          })
        }
        if (option?.input_label && !values.customProblem.trim()) {
          context.addIssue({
            code: 'custom',
            path: ['customProblem'],
            message: 'Коротко опишите проблему.',
          })
        }
      }
      if (values.startDate) {
        const date = new Date(`${values.startDate}T12:00:00`)
        const today = new Date()
        const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        const sameDate =
          date.getFullYear() === Number(values.startDate.slice(0, 4)) &&
          date.getMonth() + 1 === Number(values.startDate.slice(5, 7)) &&
          date.getDate() === Number(values.startDate.slice(8, 10))
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(values.startDate) ||
          Number.isNaN(date.getTime()) ||
          !sameDate ||
          values.startDate > todayString
        ) {
          context.addIssue({
            code: 'custom',
            path: ['startDate'],
            message: 'Укажите сегодняшнюю или прошедшую дату.',
          })
        }
      }
      const photoError = validatePhotos(values.photos)
      if (photoError)
        context.addIssue({
          code: 'custom',
          path: ['photos'],
          message: photoError,
        })
    })
}

export type CreateCaseFormValues = z.infer<ReturnType<typeof createCaseSchema>>
