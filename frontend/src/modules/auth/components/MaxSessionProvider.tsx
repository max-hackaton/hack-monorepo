import { createContext, useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { ApiError } from '@/lib/api/httpClient'
import { LoginPage } from '../pages/LoginPage'
import { LoadingPage } from '../pages/LoadingPage'
import { OpenInMaxPage } from '../pages/OpenInMaxPage'
import { SessionErrorPage } from '../pages/SessionErrorPage'
import { deleteSession } from '../api/endpoints'
import type {
  GetDispatchAccessResponse,
  GetSessionResponse,
} from '../api/endpoints'
import { useSelectRoleMutation } from '../api/hooks/useSelectRoleMutation'
import { useAuthSession } from '../hooks/useAuthSession'
import type { SessionRole } from '../types'
import { SessionContent } from './SessionContent'

export const MaxContext = createContext<GetSessionResponse | undefined>(
  undefined,
)

export const DispatchCompaniesContext = createContext<
  GetDispatchAccessResponse['companies']
>([])

export const SessionControlsContext = createContext<
  SessionControls | undefined
>(undefined)

type SessionControls = {
  role: SessionRole
  logout: () => void
  isLoggingOut: boolean
  logoutError: boolean
}

export const MaxSessionProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [afterLogout, setAfterLogout] = useState(false)
  const logout = useMutation({
    mutationFn: deleteSession,
    onMutate: () => queryClient.cancelQueries(),
    onSuccess: () => {
      queryClient.clear()
      setAfterLogout(true)
      navigate({ to: '/', replace: true })
    },
  })
  const state = useAuthSession(afterLogout, !logout.isPending)
  const selectRole = useSelectRoleMutation()

  useEffect(() => {
    if (afterLogout && state.status === 'authenticated') setAfterLogout(false)
  }, [afterLogout, state.status])

  if (state.status === 'loading') return <LoadingPage />
  if (state.status === 'openInMax') return <OpenInMaxPage />
  if (state.status === 'error')
    return <SessionErrorPage onRetry={state.retry} />

  const role = state.session.active_role
  if (role === null) {
    const forbidden =
      selectRole.error instanceof ApiError && selectRole.error.status === 403
    return (
      <LoginPage
        onSelect={(next) => selectRole.mutate({ role: next })}
        isPending={selectRole.isPending}
        error={
          selectRole.isError
            ? forbidden
              ? 'Нет доступа к диспетчерской. Попросите управляющую организацию добавить вас в список сотрудников.'
              : 'Не удалось выбрать режим. Проверьте соединение и попробуйте ещё раз.'
            : undefined
        }
      />
    )
  }

  return (
    <SessionControlsContext
      value={{
        role,
        logout: () => {
          if (queryClient.isMutating() === 0) logout.mutate()
        },
        isLoggingOut: logout.isPending,
        logoutError: logout.isError,
      }}
    >
      <SessionContent
        key={role}
        role={role}
        state={state}
        onSelectResident={() => selectRole.mutate({ role: 'resident' })}
        switchError={selectRole.isError}
        switching={selectRole.isPending}
        loggingOut={logout.isPending}
      >
        {children}
      </SessionContent>
    </SessionControlsContext>
  )
}
