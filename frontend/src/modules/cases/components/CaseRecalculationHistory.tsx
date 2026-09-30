import type { CaseDetail } from '../api/endpoints'
import { formatCaseDate } from '../helpers/formatCaseDate'

type Requests = NonNullable<CaseDetail['workflow']>['recalculation_requests']
const transmissionLabels: Record<Requests[number]['status'], string> = {
  pending: 'Передача ожидает завершения',
  submitted: 'Передача принята (демо)',
  failed: 'Не удалось передать',
}

export const CaseRecalculationHistory = ({
  requests,
}: {
  requests: Requests
}) => {
  if (requests.length === 0) return null
  return (
    <section
      aria-label="Передачи на перерасчёт"
      className="grid gap-(--spacing-size-m)"
    >
      <h2 className="text-(--font-size-detail) font-semibold">Перерасчёт</h2>
      <p className="text-(length:--font-size-description) text-(--text-secondary)">
        Это демонстрация: данные не отправляются в систему УК/РКЦ.
      </p>
      <ol className="grid gap-(--spacing-size-xl)">
        {requests.map((request, index) => (
          <li
            key={request.id}
            className="grid gap-(--spacing-size-xs) wrap-anywhere"
          >
            <p>
              Попытка {index + 1}: {transmissionLabels[request.status]}
            </p>
            {request.external_id && (
              <p>Номер передачи: {request.external_id}</p>
            )}
            <time
              dateTime={request.submitted_at ?? request.created_at}
              className="text-(length:--font-size-description) text-(--text-secondary)"
            >
              {formatCaseDate(request.submitted_at ?? request.created_at)}
            </time>
            {request.transmission_error && (
              <p className="text-(--text-negative)">
                {request.transmission_error}
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
