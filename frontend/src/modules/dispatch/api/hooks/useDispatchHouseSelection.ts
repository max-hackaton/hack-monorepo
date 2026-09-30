import { useQuery } from '@tanstack/react-query'
import { useMaxSession } from '@/modules/auth'
import { getDispatchHouseSelection } from '../endpoints'
import { useAccessError } from './useAccessError'

export const useDispatchHouseSelection = () => {
  const { id } = useMaxSession()
  const query = useQuery({
    queryKey: ['dispatch', id, 'house-selection'],
    queryFn: ({ signal }) => getDispatchHouseSelection(signal),
    retry: false,
  })
  useAccessError(query.error)
  return query
}
