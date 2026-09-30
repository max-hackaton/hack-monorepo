import { Button, CellList, CellSimple } from '@maxhub/max-ui'
import type { ReactNode } from 'react'

import { AppPageContainer } from '@/components/AppPageContainer'
import { ApiError } from '@/lib/api/httpClient'
import { useDispatchAccess } from '../hooks/useDispatchAccess'
import { LoadingPage } from '../pages/LoadingPage'
import type { AuthSessionState } from '../hooks/useAuthSession'
import type { SessionRole } from '../types'
import { DispatchCompaniesContext, MaxContext } from './MaxSessionProvider'

type SessionContentProps = {
  role: SessionRole
  state: AuthSessionState
  children: ReactNode
  onSelectResident: () => void
  switchError: boolean
  switching: boolean
  loggingOut: boolean
}

export const SessionContent = ({
  role,
  state,
  children,
  onSelectResident,
  switchError,
  switching,
  loggingOut,
}: SessionContentProps) => {
  const access = useDispatchAccess(state, !loggingOut && role === 'dispatcher')

  if (loggingOut || state.status === 'loading') return <LoadingPage />
  if (state.status !== 'authenticated') return <LoadingPage />
  if (role === 'dispatcher') {
    if (access.isPending) return <LoadingPage />
    if (access.isError || access.data.companies.length === 0) {
      const forbidden =
        (access.error instanceof ApiError && access.error.status === 403) ||
        access.isSuccess
      return (
        <AppPageContainer>
          <CellList mode="island">
            <CellSimple
              title={
                forbidden
                  ? 'Нет доступа к диспетчерской'
                  : 'Не удалось проверить доступ'
              }
              subtitle={
                forbidden
                  ? 'Попросите управляющую организацию добавить вас в список сотрудников.'
                  : 'Проверьте соединение и попробуйте ещё раз.'
              }
            />
            <div className="grid gap-(--spacing-size-m) px-(--spacing-size2xl) pb-(--spacing-size2xl)">
              {!forbidden && (
                <Button stretched onClick={() => access.refetch()}>
                  Повторить
                </Button>
              )}
              <Button
                stretched
                variant="secondary"
                loading={switching}
                disabled={switching}
                onClick={onSelectResident}
              >
                Продолжить как житель
              </Button>
              {switchError && (
                <p role="alert" className="text-(--text-negative)">
                  Не удалось сменить режим. Попробуйте ещё раз.
                </p>
              )}
            </div>
          </CellList>
        </AppPageContainer>
      )
    }
  }
  return (
    <MaxContext value={state.session}>
      <DispatchCompaniesContext
        value={role === 'dispatcher' ? (access.data?.companies ?? []) : []}
      >
        {children}
      </DispatchCompaniesContext>
    </MaxContext>
  )
}
