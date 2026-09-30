import type { CaseDetail } from '../../api/endpoints'

type ReturnReason = NonNullable<
  NonNullable<CaseDetail['workflow']>['return_reason']
>

const returnReasonMessages: Record<
  ReturnReason,
  Record<'dispatcher' | 'resident', string>
> = {
  repair_not_resolved: {
    dispatcher: 'Житель сообщил, что проблема не устранена',
    resident: 'Житель сообщил, что проблема не устранена',
  },
  recalculation_missing: {
    dispatcher: 'Житель не увидел перерасчёт',
    resident: 'Житель сообщил, что перерасчёт не отражён',
  },
  billing_failed: {
    dispatcher: 'Передать данные на перерасчёт не удалось',
    resident:
      'Передать данные на перерасчёт не удалось. Можно повторить отправку',
  },
}

export function getWorkflowReturnReasonMessage(
  reason: ReturnReason,
  role: 'dispatcher' | 'resident' = 'dispatcher',
) {
  return returnReasonMessages[reason][role]
}
