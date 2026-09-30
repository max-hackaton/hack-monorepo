import { useQuery } from '@tanstack/react-query'
import { getDispatchTypes } from '../endpoints'
import { useAccessError } from './useAccessError'

export const useDispatchTypes = () => {
  const query = useQuery({
    queryKey: ['dispatch', 'types'],
    queryFn: getDispatchTypes,
    retry: false,
  })
  useAccessError(query.error)
  return query
}
