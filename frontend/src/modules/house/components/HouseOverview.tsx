import { Button, Typography, useColorScheme } from '@maxhub/max-ui'
import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { Skeleton } from '@/components/Skeleton'

import { formatActiveCaseCount } from '../helpers/formatActiveCaseCount'

export const HouseOverview = ({
  activeCaseCount,
}: {
  activeCaseCount?: number
}) => {
  const colorScheme = useColorScheme()

  return (
    <section
      className="mb-(--app-section-gap) rounded-(--app-radius-promo) bg-(--app-accent-strong) p-(--spacing-size3xl) text-(--text-primary-inverse-static)"
      aria-labelledby="house-overview"
    >
      <Typography.Body variant="small" asChild>
        <p id="house-overview" className="opacity-80">
          Сейчас в доме
        </p>
      </Typography.Body>
      <Typography.Headline variant="large-strong" asChild>
        <p className="mt-(--spacing-size-s) mb-(--spacing-size2xl) min-h-8 leading-tight">
          {activeCaseCount === undefined ? (
            <span role="status" aria-label="Загрузка числа активных проблем">
              <Skeleton tone="inverse" className="h-8 w-52" />
            </span>
          ) : (
            formatActiveCaseCount(activeCaseCount)
          )}
        </p>
      </Typography.Headline>
      <Button
        asChild
        stretched
        variant={colorScheme === 'light' ? 'primary' : 'secondary'}
        iconAfter={<Plus size={20} strokeWidth={2} aria-hidden="true" />}
        className="justify-between"
      >
        <Link to="/cases/new">Сообщить о проблеме</Link>
      </Button>
    </section>
  )
}
