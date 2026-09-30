import { api } from '@/lib/api/httpClient'
import type { paths } from '@/lib/api/openapi'

type Operation = paths['/api/dispatch/cases/{case_id}/action-form']['get']
export type DispatchActionForm =
  Operation['responses'][200]['content']['application/json']
export type DispatchActionIntent = Operation['parameters']['query']['intent']

export const getDispatchActionForm = (
  id: string,
  intent: DispatchActionIntent,
  expectedCurrentStepKey: string,
  expectedWorkflowVersion: number,
  expectedClassificationVersion: number,
  transitionKey?: string,
) =>
  api.get<DispatchActionForm>(
    `/api/dispatch/cases/${encodeURIComponent(id)}/action-form`,
    {
      params: {
        intent,
        expected_current_step_key: expectedCurrentStepKey,
        expected_workflow_version: expectedWorkflowVersion,
        expected_classification_version: expectedClassificationVersion,
        transition_key: transitionKey,
      },
    },
  )
