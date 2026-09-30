import { Button, CellList, CellSimple } from '@maxhub/max-ui'

import { ApiError } from '@/lib/api/httpClient'

type CaseDetailErrorProps = {
  error: unknown
  onRetry: () => void
}

export const CaseDetailError = ({ error, onRetry }: CaseDetailErrorProps) => (
  <CellList mode="island">
    <CellSimple
      title={
        error instanceof ApiError && error.status === 404
          ? 'Заявка не найдена или недоступна'
          : 'Не удалось загрузить заявку'
      }
    />
    <div className="px-(--spacing-size2xl) pb-(--spacing-size2xl)">
      <Button type="button" stretched variant="secondary" onClick={onRetry}>
        Повторить
      </Button>
    </div>
  </CellList>
)
