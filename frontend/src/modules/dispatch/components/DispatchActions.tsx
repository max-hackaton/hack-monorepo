import { Button } from '@maxhub/max-ui'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { ApiError } from '@/lib/api/httpClient'
import { ActionModal } from '@/components/ActionModal'
import { useMaxSession } from '@/modules/auth'
import { getWorkflowReturnReasonMessage } from '@/modules/cases/helpers/getWorkflowReturnReasonMessage'
import { useDispatchAction } from '../api/hooks/useDispatchAction'
import { useDispatchType } from '../api/hooks/useDispatchType'
import { getDispatchActionForm } from '../api/endpoints'
import type {
  DispatchAction,
  DispatchActionForm,
  DispatchActionIntent,
  DispatchDetail,
} from '../api/endpoints'
import { DispatchActionDetails } from './DispatchActionDetails'

type Values = Record<string, string | boolean>

export const DispatchActions = ({ detail }: { detail: DispatchDetail }) => {
  const [form, setForm] = useState<DispatchActionForm | null>(null)
  const [preparing, setPreparing] = useState(false)
  const [prepareError, setPrepareError] = useState<string | null>(null)
  const action = useDispatchAction(detail.case.id)
  const client = useQueryClient()
  const { id } = useMaxSession()
  const workflow = detail.case.workflow
  const currentType = useDispatchType(detail.case.case_type.key)
  const problemOptions = currentType.data?.constructor.fields.find(
    (field) => field.key === 'problem',
  )?.options
  const problemLabel = problemOptions?.find(
    (option) => option.key === detail.case.problem_key,
  )?.label
  const canClarify =
    workflow?.available_actions.includes('request_clarification') ?? false
  const actionError =
    action.error instanceof ApiError && action.error.status === 409
      ? 'Заявка уже изменена. Данные обновлены: проверьте их и повторите действие.'
      : 'Не удалось сохранить изменения. Проверьте данные и попробуйте ещё раз.'

  const prepare = async (
    intent: DispatchActionIntent,
    transitionKey?: string,
  ) => {
    if (preparing || action.isPending) return
    setPreparing(true)
    setPrepareError(null)
    action.reset()
    try {
      const next = await getDispatchActionForm(
        detail.case.id,
        intent,
        detail.case.current_step.key,
        workflow?.version ?? 0,
        detail.case.classification.version,
        transitionKey,
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
        client.invalidateQueries({
          queryKey: ['dispatch', id, 'case', detail.case.id],
        })
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
    actionForm: DispatchActionForm,
    values: Values,
  ) => {
    let next: DispatchAction
    if (actionForm.kind === 'classification') {
      next = {
        kind: 'classification',
        body: {
          case_type_key: String(values.case_type_key),
          problem_key: String(values.problem_key),
          is_emergency: Boolean(values.is_emergency),
          expected_classification_version:
            actionForm.expected_classification_version,
        },
      }
    } else if (actionForm.kind === 'assignment') {
      next = {
        kind: 'assignment',
        body: {
          contractor_id: String(values.contractor_id),
          expected_classification_version:
            actionForm.expected_classification_version,
        },
      }
    } else {
      if (!actionForm.action) throw new Error('Missing workflow action')
      next = {
        kind: 'workflow',
        body: {
          action: actionForm.action,
          expected_current_step_key: actionForm.expected_current_step_key,
          expected_workflow_version: actionForm.expected_workflow_version,
          ...(actionForm.fields.some((field) => field.key === 'body')
            ? { body: String(values.body) }
            : {}),
        },
      }
    }
    try {
      await action.mutateAsync(next)
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setForm(null)
        setPrepareError(
          'Заявка изменилась. Проверьте обновлённые данные и повторите действие.',
        )
      }
      throw error
    }
  }

  return (
    <section
      className="mt-(--spacing-size4xl) grid gap-(--spacing-size-m)"
      aria-label="Действия диспетчера"
    >
      <div className="flex justify-between">
        <p className="text-(length:--font-size-action-small) text-(--text-secondary)">
          Текущий этап
        </p>
        <h2 className="text-(--font-size-detail) font-semibold">
          {detail.case.current_step.title}
        </h2>
      </div>
      <div className="flex flex-col justify-between">
        <p className="text-(length:--font-size-action-small) text-(--text-secondary)">
          {detail.case.case_type.name} ·{' '}
          {problemLabel ?? 'Тип проблемы не указан'}
        </p>
        {workflow?.clarification && (
          <p className="text-(length:--font-size-action-small) text-(--text-secondary)">
            {workflow.clarification.answer
              ? 'Житель ответил на уточнение'
              : 'Ожидаем ответ жителя'}
          </p>
        )}
        {workflow?.return_reason && (
          <p
            role="status"
            className="text-(length:--font-size-action-small) text-(--app-attention-fg)"
          >
            {getWorkflowReturnReasonMessage(workflow.return_reason)}
          </p>
        )}
      </div>
      <div className="grid gap-(--spacing-size-m)">
        {detail.transitions.length === 0 ? (
          <Button stretched disabled>
            {detail.next_action.label}
          </Button>
        ) : (
          detail.transitions.map((transition) => (
            <Button
              key={transition.key}
              stretched
              disabled={preparing || action.isPending}
              loading={preparing}
              onClick={() => prepare('advance', transition.key)}
            >
              {transition.label}
            </Button>
          ))
        )}
        {canClarify && (
          <Button
            stretched
            variant="secondary"
            disabled={preparing || action.isPending}
            onClick={() => prepare('clarification')}
          >
            {workflow?.available_action_labels.request_clarification}
          </Button>
        )}
      </div>
      {detail.assigned_contractor && (
        <div className="flex flex-wrap gap-x-(--spacing-size-m) text-(length:--font-size-action-small) text-(--text-secondary)">
          <span>Исполнитель: {detail.assigned_contractor.name}</span>
          <a
            href={`tel:${detail.assigned_contractor.phone}`}
            className="text-(--app-accent-text) underline"
          >
            {detail.assigned_contractor.phone}
          </a>
          {detail.assigned_contractor.max_url?.startsWith('https://') && (
            <a
              href={detail.assigned_contractor.max_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--app-accent-text) underline"
            >
              Написать в MAX
            </a>
          )}
        </div>
      )}
      <DispatchActionDetails detail={detail} onPrepare={prepare} />
      {prepareError && (
        <p role="alert" className="text-(--text-negative)">
          {prepareError}
        </p>
      )}
      {action.isError && !form && !preparing && !prepareError && (
        <p role="alert" className="text-(--text-negative)">
          {actionError}
        </p>
      )}
      {form && (
        <ActionModal
          key={`${form.kind}:${form.action}:${form.expected_workflow_version}:${form.expected_classification_version}`}
          form={form}
          pending={action.isPending}
          errorMessage={action.isError ? actionError : undefined}
          onClose={() => setForm(null)}
          onSubmit={(values) => submitAction(form, values)}
        />
      )}
    </section>
  )
}
