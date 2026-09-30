import { Typography } from '@maxhub/max-ui'
import type { ReactNode } from 'react'

type AppHeaderProps = {
  title: ReactNode
  subtitle?: string
  action?: ReactNode
}

export const AppHeader = ({ title, subtitle, action }: AppHeaderProps) => (
  <header className="mb-(--spacing-size4xl)">
    <div className="flex min-w-0 items-start justify-between gap-(--spacing-size-m)">
      <div className="min-w-0">
        <Typography.Headline variant="large-strong" asChild>
          <h1>{title}</h1>
        </Typography.Headline>
        {subtitle && (
          <Typography.Body variant="small" className="mt-(--spacing-size-xs)">
            {subtitle}
          </Typography.Body>
        )}
      </div>
      {action}
    </div>
  </header>
)
