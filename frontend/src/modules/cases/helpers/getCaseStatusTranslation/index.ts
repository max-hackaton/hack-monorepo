import type { CaseDetail } from '../../api/endpoints'

export const caseStatusTranslations: Record<
  CaseDetail['current_step']['status_key'],
  string
> = {
  new: 'Новый',
  in_progress: 'В работе',
  action_required: 'Ожидается ответ',
  closed_by_executor: 'Ожидается подтверждение',
  awaiting_recalculation: 'Ожидается перерасчёт',
  completed: 'Завершено',
}

export function getCaseStatusTranslation(
  statusKey: CaseDetail['current_step']['status_key'],
): string {
  return caseStatusTranslations[statusKey]
}
