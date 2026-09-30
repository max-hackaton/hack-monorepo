import { useCaseAction } from '../api/hooks/useCaseAction'
import { caseDetailQueryKey } from '../api/hooks/useCaseDetail'
import { useQueryClient } from '@tanstack/react-query'
import type { CaseDetail } from '../api/endpoints'
import { ApiError } from '@/lib/api/httpClient'
import { CaseWorkflowActions } from './CaseWorkflowActions'

type CaseResidentActionsProps = {
  detail: CaseDetail
  houseId: string
  userId: string
}

export const CaseResidentActions = ({
  detail,
  houseId,
  userId,
}: CaseResidentActionsProps) => {
  const action = useCaseAction(houseId, userId, detail.id)
  const client = useQueryClient()
  const workflow = detail.workflow
  const hasWorkflowContent =
    workflow &&
    (workflow.available_actions.length > 0 ||
      workflow.return_reason ||
      workflow.clarification ||
      workflow.recalculation_requests.length > 0)

  if (!hasWorkflowContent && !action.isPending && !action.isError) {
    return null
  }

  return (
    <section className="mt-(--spacing-size-m)" aria-label="Действия заявителя">
      <CaseWorkflowActions
        detail={detail}
        role="resident"
        pending={action.isPending}
        submit={(body) => action.mutateAsync({ kind: 'workflow', body })}
        onStale={() => {
          client.invalidateQueries({
            queryKey: caseDetailQueryKey(houseId, userId, detail.id),
          })
        }}
        errorMessage={
          action.isError
            ? action.error instanceof ApiError &&
              [409, 422].includes(action.error.status)
              ? 'Заявка уже изменилась. Проверьте обновлённые данные перед повторным действием.'
              : 'Не удалось сохранить ответ. Проверьте соединение и попробуйте ещё раз.'
            : undefined
        }
      />
    </section>
  )
}
