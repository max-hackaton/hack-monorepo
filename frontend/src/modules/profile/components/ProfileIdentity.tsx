import { Avatar, Typography } from '@maxhub/max-ui'

import { useMaxSession } from '@/modules/auth'
import type { SessionRole } from '@/modules/auth/types'

export const ProfileIdentity = ({ role }: { role: SessionRole }) => {
  const { first_name, last_name, photo_url } = useMaxSession()
  const firstName = first_name?.trim() ?? ''
  const lastName = last_name?.trim() ?? ''
  const name =
    [firstName, lastName].filter(Boolean).join(' ') || 'Пользователь MAX'
  const initials =
    [firstName, lastName]
      .filter(Boolean)
      .map((part) => part[0].toLocaleUpperCase('ru'))
      .join('') || 'П'

  return (
    <section
      className="mb-(--spacing-size4xl) flex items-center gap-(--spacing-size2xl) rounded-(--app-radius-card) border border-(--divider-primary) bg-(--background-card) p-(--app-card-padding)"
      aria-label="Данные профиля"
    >
      <Avatar.Container size={64} aria-label={name}>
        {photo_url ? (
          <Avatar.Image src={photo_url} alt={name} />
        ) : (
          <Avatar.Text>{initials}</Avatar.Text>
        )}
      </Avatar.Container>
      <div className="min-w-0">
        <Typography.Title variant="medium-strong" asChild>
          <h2 className="wrap-break-word">{name}</h2>
        </Typography.Title>
        <Typography.Body
          variant="small"
          className="mt-(--spacing-size-xs) text-(--text-secondary)"
        >
          {role === 'dispatcher' ? 'Диспетчер' : 'Житель'}
        </Typography.Body>
      </div>
    </section>
  )
}
