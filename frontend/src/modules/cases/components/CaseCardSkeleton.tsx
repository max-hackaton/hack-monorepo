import { Skeleton } from '@/components/Skeleton'

type CaseCardSkeletonProps = {
  footer?: 'confirm' | 'progress'
}

export const CaseCardSkeleton = ({ footer }: CaseCardSkeletonProps) => (
  <div className="rounded-(--app-radius-card) border border-(--divider-primary) p-(--app-card-padding)">
    <div className="mb-(--spacing-size-l) flex items-center justify-between gap-(--spacing-size-m)">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-5 w-10 shrink-0" />
    </div>
    <div className="flex items-start gap-(--spacing-size-m)">
      <Skeleton className="size-10 shrink-0 rounded-(--app-radius-control)" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="mt-(--spacing-size-s) h-4 w-2/3" />
      </div>
    </div>
    <div
      aria-hidden="true"
      className="my-(--spacing-size-xl) border-t border-(--divider-primary)"
    />
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-(--spacing-size-m)">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-6 w-36 max-w-full justify-self-end rounded-full" />
    </div>
    {footer === 'confirm' && (
      <Skeleton className="mt-(--spacing-size-xl) h-12 w-full rounded-(--app-radius-control)" />
    )}
    {footer === 'progress' && (
      <Skeleton className="mt-(--spacing-size-xl) h-1.5 w-full rounded-full" />
    )}
  </div>
)
