import { CellList, CellSimple, Typography } from '@maxhub/max-ui'
import type { ReactNode } from 'react'

import { CaseCardSkeleton } from './CaseCardSkeleton'

type CaseFeedProps = {
  children: ReactNode
  toolbar: ReactNode
  isPending: boolean
  isEmpty: boolean
  emptyTitle: string
  emptyDescription: string
  title?: string
  skeletonFooter?: 'confirm'
}

export const CaseFeed = ({
  children,
  toolbar,
  isPending,
  isEmpty,
  emptyTitle,
  emptyDescription,
  title = 'Лента дома',
  skeletonFooter,
}: CaseFeedProps) => (
  <section aria-labelledby="house-feed-title">
    {title && (
      <Typography.Title variant="medium-strong" asChild>
        <h2 id="house-feed-title" className="mb-(--spacing-size-xl)">
          {title}
        </h2>
      </Typography.Title>
    )}
    {toolbar}
    {isPending ? (
      <div
        className="grid gap-(--spacing-size-xl)"
        role="status"
        aria-label="Загрузка ленты"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <CaseCardSkeleton key={index} footer={skeletonFooter} />
        ))}
      </div>
    ) : isEmpty ? (
      <CellList mode="island">
        <CellSimple title={emptyTitle} subtitle={emptyDescription} />
      </CellList>
    ) : (
      <div className="grid gap-(--spacing-size-xl)">{children}</div>
    )}
  </section>
)
