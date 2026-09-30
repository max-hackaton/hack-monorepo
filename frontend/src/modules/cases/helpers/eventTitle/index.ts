import { formatCaseStatusChange } from '../formatCaseStatusChange'
import type { CaseEventsResponse } from '../../api/endpoints'

type CaseEvent = CaseEventsResponse['events'][number]

export function eventTitle(event: CaseEvent) {
  switch (event.event_type) {
    case 'work_started':
      return 'Заявка в работе'
    case 'work_finished':
      return 'Работы завершены, ожидается подтверждение жителя'
    case 'clarification_requested':
      return 'Диспетчер запросил уточнение'
    case 'clarification_answered':
      return 'Житель ответил на уточнение'
    case 'repair_confirmed':
      return 'Житель подтвердил устранение проблемы'
    case 'repair_rejected':
      return 'Проблема не устранена, заявка возвращена в работу'
    case 'recalculation_submitted':
      return 'Передача на перерасчёт принята'
    case 'recalculation_failed':
      return 'Не удалось передать данные на перерасчёт'
    case 'recalculation_retried':
      return 'Создана повторная попытка передачи на перерасчёт'
    case 'recalculation_resumed':
      return 'Возобновлена передача на перерасчёт'
    case 'recalculation_confirmed':
      return 'Житель подтвердил перерасчёт'
    case 'recalculation_missing':
      return 'Перерасчёт не отражён, заявка возвращена в работу'
    case 'case_created':
      return 'Заявка создана'
    case 'confirmation_added':
      return 'Проблему подтвердили'
    case 'message_added':
      return event.data.sender_role === 'dispatcher'
        ? 'Сообщение от диспетчера'
        : event.data.sender_role === 'resident'
          ? 'Сообщение от заявителя'
          : 'Сообщение'
    case 'status_changed':
      return formatCaseStatusChange(event.data)
    case 'classification_confirmed':
      return event.data.from.case_type_key !== event.data.to.case_type_key
        ? 'Диспетчер изменил категорию'
        : 'Категория подтверждена диспетчером'
    case 'contractor_assigned':
      return event.data.contractor
        ? `Назначен исполнитель: ${event.data.contractor.name}`
        : 'Назначение исполнителя снято'
  }
}
