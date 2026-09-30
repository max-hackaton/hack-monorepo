import { Button } from '@maxhub/max-ui'
import { useIsMutating } from '@tanstack/react-query'

import { useSessionControls } from '../hooks/useSessionControls'

export const LogoutButton = () => {
  const { logout, isLoggingOut, logoutError } = useSessionControls()
  const pendingMutations = useIsMutating()
  return (
    <div className="mt-(--spacing-size4xl)">
      <Button
        stretched
        variant="secondary"
        onClick={logout}
        loading={isLoggingOut}
        disabled={isLoggingOut || pendingMutations > 0}
      >
        Выйти
      </Button>
      {logoutError && (
        <p role="alert" className="mt-(--spacing-size-m)">
          Не удалось выйти. Проверьте соединение и попробуйте ещё раз.
        </p>
      )}
    </div>
  )
}
