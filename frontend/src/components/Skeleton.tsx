type SkeletonProps = {
  className?: string
  tone?: 'default' | 'inverse'
}

export const Skeleton = ({
  className = '',
  tone = 'default',
}: SkeletonProps) => (
  <span
    aria-hidden="true"
    className={`block rounded-(--app-radius-small) animate-pulse ${tone === 'inverse' ? 'bg-(--background-primary)/25' : 'bg-(--background-secondary)'} ${className}`}
  />
)
