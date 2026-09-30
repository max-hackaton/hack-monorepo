import type { CaseType } from '../../api/endpoints'

export function getAvailableOptions(
  field: CaseType['constructor']['fields'][number],
  answers: Record<string, string | undefined>,
) {
  return field.options.filter(
    (option) =>
      !option.problem_keys ||
      option.problem_keys.includes(answers.problem ?? ''),
  )
}
