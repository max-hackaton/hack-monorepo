import { Button } from '@maxhub/max-ui'

import { Accordion } from '@/components/Accordion'
import { CaseRecalculationHistory } from '@/modules/cases/components/CaseRecalculationHistory'
import type { DispatchActionIntent, DispatchDetail } from '../api/endpoints'

type DispatchActionDetailsProps = {
  detail: DispatchDetail
  onPrepare: (intent: DispatchActionIntent) => void
}

export const DispatchActionDetails = ({
  detail,
  onPrepare,
}: DispatchActionDetailsProps) => {
  const workflow = detail.case.workflow
  const canChangeClassification = detail.next_action.can_change_classification
  const canChangeContractor = detail.next_action.can_change_contractor
  if (
    !workflow?.clarification &&
    !workflow?.recalculation_requests.length &&
    !canChangeClassification &&
    !canChangeContractor
  ) {
    return null
  }

  return (
    <Accordion mode="multiple" className="grid gap-(--spacing-size-xl)">
      {workflow?.clarification && (
        <Accordion.Item
          value="clarification"
          className="text-(length:--font-size-action-small)"
        >
          <Accordion.Trigger className="text-(--app-accent-text)">
            Переписка по уточнению
          </Accordion.Trigger>
          <Accordion.Content className="mt-(--spacing-size-m) grid gap-(--spacing-size-m) rounded-(--app-radius-small) bg-(--background-secondary) p-(--spacing-size-xl)">
            <p className="whitespace-pre-wrap">
              Вопрос: {workflow.clarification.question}
            </p>
            {workflow.clarification.answer && (
              <p className="whitespace-pre-wrap">
                Ответ: {workflow.clarification.answer}
              </p>
            )}
          </Accordion.Content>
        </Accordion.Item>
      )}
      {workflow && workflow.recalculation_requests.length > 0 && (
        <Accordion.Item
          value="recalculation"
          className="text-(length:--font-size-action-small)"
        >
          <Accordion.Trigger className="text-(--app-accent-text)">
            Передача на перерасчёт
          </Accordion.Trigger>
          <Accordion.Content>
            <CaseRecalculationHistory
              requests={workflow.recalculation_requests}
            />
          </Accordion.Content>
        </Accordion.Item>
      )}
      {(canChangeClassification || canChangeContractor) && (
        <Accordion.Item value="more" variant="card">
          <Accordion.Trigger>Действия</Accordion.Trigger>
          <Accordion.Content className="grid gap-(--spacing-size-m)">
            {canChangeClassification && (
              <Button
                stretched
                variant="secondary"
                size="small"
                onClick={() => onPrepare('change_classification')}
              >
                Изменить категорию
              </Button>
            )}
            {canChangeContractor && (
              <Button
                stretched
                variant="secondary"
                size="small"
                onClick={() => onPrepare('change_contractor')}
              >
                {detail.assigned_contractor
                  ? 'Изменить исполнителя'
                  : 'Назначить исполнителя'}
              </Button>
            )}
          </Accordion.Content>
        </Accordion.Item>
      )}
    </Accordion>
  )
}
