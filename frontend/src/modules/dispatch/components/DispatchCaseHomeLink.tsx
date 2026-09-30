import { Link, useSearch } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { getDispatchFeedSearch } from '../helpers/getDispatchFeedSearch'

type DispatchCaseHomeLinkProps = {
  className: string
  children: ReactNode
}

export const DispatchCaseHomeLink = ({
  className,
  children,
}: DispatchCaseHomeLinkProps) => {
  const search = useSearch({ from: '/cases/$id' })
  return (
    <Link to="/" search={getDispatchFeedSearch(search)} className={className}>
      {children}
    </Link>
  )
}
