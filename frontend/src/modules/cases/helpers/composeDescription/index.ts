import type { CaseType } from '../../api/endpoints'
import { getAvailableOptions } from '../getAvailableOptions'

type Constructor = CaseType['constructor']

export function composeDescription(
  constructor: Constructor,
  answers: Record<string, string | undefined>,
  customProblem = '',
  startDate = '',
): string {
  const customText = customProblem.trim()
  const fragments = new Map<string, string>()

  for (const field of constructor.fields) {
    const answer = answers[field.key]
    const option = getAvailableOptions(field, answers).find(
      (item) => item.key === answer,
    )
    if (!option) return ''

    let text = option.text
    if (option.input_label) {
      if (!customText) return ''
      text = text ? `${text} ${customText}` : customText
    }

    fragments.set(field.key, text)
  }

  const description = constructor.description_template.replace(
    /\{([^{}]+)\}(\.)?/g,
    (match, key: string, period: string | undefined) => {
      const fragment = fragments.get(key)
      if (fragment === undefined) return match
      if (period && !/[.!?…]$/.test(fragment)) return `${fragment}.`
      return fragment
    },
  )

  if (!startDate || !description) return description
  const [year, month, day] = startDate.split('-')
  return `${description}\nДата начала нарушения: ${day}.${month}.${year}.`
}
