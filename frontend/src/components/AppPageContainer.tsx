import { Container } from '@maxhub/max-ui'
import type { ReactNode } from 'react'

type AppPageContainerProps = {
  children: ReactNode
}

export const AppPageContainer = ({ children }: AppPageContainerProps) => (
  <Container className="mx-auto min-h-dvh w-full max-w-(--app-page-width) bg-(--background-surface) px-(--app-page-gutter) pt-(--spacing-size3xl) pb-[calc(7rem+env(safe-area-inset-bottom))] text-(--text-primary)">
    {children}
  </Container>
)
