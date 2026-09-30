import { z } from 'zod'

export const dispatchHouseSelectionSchema = z.object({
  houseIds: z
    .array(z.string({ error: 'Проверьте выбранные дома.' }), {
      error: 'Проверьте выбранные дома.',
    })
    .max(1000, 'Можно выбрать не больше 1000 домов.')
    .refine(
      (ids) => ids.every((id) => /^[1-9]\d*$/.test(id)),
      'Проверьте выбранные дома.',
    ),
})

export type DispatchHouseSelectionFormValues = z.infer<
  typeof dispatchHouseSelectionSchema
>
