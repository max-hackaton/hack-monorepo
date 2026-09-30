import { useQuery } from '@tanstack/react-query'
import { getDispatchType } from '../endpoints'
import { useAccessError } from './useAccessError'

export const useDispatchType = (key: string) => {
  const query = useQuery({
    queryKey: ['dispatch', 'types', key],
    queryFn: () => getDispatchType(key),
    enabled: Boolean(key),
    retry: false,
  })
  useAccessError(query.error)
  return query
}
