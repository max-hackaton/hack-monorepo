import { useMutation, useQueryClient } from '@tanstack/react-query'
import { revalidateSessionOnAccessError, useMaxSession } from '@/modules/auth'
import { ApiError } from '@/lib/api/httpClient'
import { updateDispatchHouseSelection } from '../endpoints'

export const useUpdateDispatchHouseSelection = () => {
  const { id } = useMaxSession()
  const client = useQueryClient()
  return useMutation({
    mutationFn: updateDispatchHouseSelection,
    onSuccess: async (selection) => {
      const queryKey = ['dispatch', id, 'house-selection']
      await client.cancelQueries({ queryKey })
      client.setQueryData(queryKey, selection)
      await client.invalidateQueries({ queryKey: ['dispatch', id, 'cases'] })
    },
    onError: (error) => {
      revalidateSessionOnAccessError(error, client)
      if (error instanceof ApiError && error.status === 403) {
        client.invalidateQueries({ queryKey: ['dispatch', id, 'houses'] })
        client.invalidateQueries({
          queryKey: ['dispatch', id, 'house-selection'],
        })
      }
    },
  })
}
