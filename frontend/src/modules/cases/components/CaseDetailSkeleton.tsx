import { Skeleton } from '@/components/Skeleton'
import { CaseCardSkeleton } from './CaseCardSkeleton'

export const CaseDetailSkeleton = () => (
  <div role="status" aria-label="Загрузка заявки">
    <CaseCardSkeleton />
    <div className="mt-(--spacing-size3xl) space-y-(--spacing-size-m)">
      <Skeleton className="h-6 w-28" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="mt-(--spacing-size4xl) space-y-(--spacing-size-xl)">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-4/5" />
    </div>
  </div>
)
