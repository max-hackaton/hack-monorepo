import { Button } from '@maxhub/max-ui'
import { useState } from 'react'

import { ActionModal } from '@/components/ActionModal'
import { ApiError } from '@/lib/api/httpClient'
import { getCaseActionForm } from '../api/endpoints'
import type {
  CaseActionForm,
  CaseDetail,
  CaseWorkflowInput,
} from '../api/endpoints'
import { getWorkflowReturnReasonMessage } from '../helpers/getWorkflowReturnReasonMessage'

type CaseWorkflowActionsProps = {
  detail: CaseDetail
  role: 'dispatcher' | 'resident'
  pending: boolean
  submit: (body: CaseWorkflowInput) => Promise<unknown>
  onStale: () => void
  errorMessage?: string
}

export const CaseWorkflowActions = ({
  detail,
  role,
  pending,
  submit,
  onStale,
  errorMessage,
}: CaseWorkflowActionsProps) => {
  const [form, setForm] = useState<CaseActionForm | null>(null)
  const [preparing, setPreparing] = useState(false)
  const [prepareError, setPrepareError] = useState<string | null>(null)
  const workflow = detail.workflow
  if (!workflow) return null
  const canAnswer = workflow.available_actions.includes('answer_clarification')
  const prepare = async (action: CaseWorkflowInput['action']) => {
    if (preparing || pending) return
    setPreparing(true)
    setPrepareError(null)
    try {
      const next = await getCaseActionForm(
        detail.id,
        action,
        detail.current_step.key,
        workflow.version,
      )
      if (next.fields.length === 0) {
        try {
          await submitAction(next, {})
        } catch {
          return
        }
      } else {
        setForm(next)
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        onStale()
        setPrepareError(
          'Заявка изменилась. Проверьте обновлённые данные и повторите действие.',
        )
      } else {
        setPrepareError(
          'Не удалось загрузить следующий шаг. Попробуйте ещё раз.',
        )
      }
    } finally {
      setPreparing(false)
    }
  }
  const submitAction = async (
    actionForm: CaseActionForm,
    values: Record<string, string | boolean>,
  ) => {
    try {
      await submit({
        action: actionForm.action,
        expected_current_step_key: actionForm.expected_current_step_key,
        expected_workflow_version: actionForm.expected_workflow_version,
        ...(actionForm.fields.some((field) => field.key === 'body')
          ? { body: String(values.body).trim() }
          : {}),
      })
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setForm(null)
        onStale()
        setPrepareError(
          'Заявка изменилась. Проверьте обновлённые данные и повторите действие.',
        )
      }
      throw error
    }
  }
  return (
    <div className="grid gap-(--spacing-size-m)">
      {workflow.return_reason && (
        <p
          role="status"
          className="text-(length:--font-size-action-small) text-(--app-attention-fg)"
        >
          {getWorkflowReturnReasonMessage(workflow.return_reason, role)}
        </p>
      )}
      {workflow.clarification && (
        <p className="text-(length:--font-size-action-small) text-(--text-secondary)">
          {canAnswer && 'Ожидается ваш ответ на уточнение'}
        </p>
      )}
      {workflow.available_actions.length > 0 && (
        <div className="grid gap-(--spacing-size-m)">
          {workflow.available_actions.map((action) => (
            <Button
              key={action}
              stretched
              disabled={pending || preparing}
              loading={preparing}
              onClick={() => prepare(action)}
            >
              {workflow.available_action_labels[action]}
            </Button>
          ))}
        </div>
      )}
      {prepareError && (
        <p role="alert" className="text-(--text-negative)">
          {prepareError}
        </p>
      )}
      {!form && !preparing && !prepareError && errorMessage && (
        <p role="alert" className="text-(--text-negative)">
          {errorMessage}
        </p>
      )}
      {form && (
        <ActionModal
          key={`${form.action}:${form.expected_workflow_version}`}
          form={form}
          pending={pending}
          errorMessage={errorMessage}
          onClose={() => setForm(null)}
          onSubmit={(values) => submitAction(form, values)}
        />
      )}
    </div>
  )
}
