import { Button, CellList, CellSimple } from '@maxhub/max-ui'

import { AppHeader } from '@/components/AppHeader'
import { AppName } from '@/components/AppName'
import { AppPageContainer } from '@/components/AppPageContainer'
import type { SessionRole } from '../types'

export const LoginPage = ({
  onSelect,
  isPending,
  error,
}: {
  onSelect: (role: SessionRole) => void
  isPending: boolean
  error?: string
}) => (
  <AppPageContainer>
    <AppHeader title={<AppName />} subtitle="Выберите режим" />
    <CellList mode="island">
      <CellSimple
        title="Житель"
        subtitle="Сообщайте о проблемах дома и следите за их решением."
      />
      <div className="px-(--spacing-size2xl) pb-(--spacing-size2xl)">
        <Button
          stretched
          loading={isPending}
          disabled={isPending}
          onClick={() => onSelect('resident')}
        >
          Продолжить как житель
        </Button>
      </div>
    </CellList>
    <div className="mt-(--spacing-size2xl)">
      <CellList mode="island">
        <CellSimple
          title="Диспетчер"
          subtitle="Разбирайте заявки дома и назначайте исполнителей."
        />
        <div className="px-(--spacing-size2xl) pb-(--spacing-size2xl)">
          <Button
            stretched
            variant="secondary"
            loading={isPending}
            disabled={isPending}
            onClick={() => onSelect('dispatcher')}
          >
            Открыть диспетчерскую
          </Button>
        </div>
      </CellList>
    </div>
    {error && (
      <p role="alert" className="mt-(--spacing-size-m) text-(--text-negative)">
        {error}
      </p>
    )}
  </AppPageContainer>
)
