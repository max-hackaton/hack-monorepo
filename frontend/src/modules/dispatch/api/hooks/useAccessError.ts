import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { revalidateSessionOnAccessError } from '@/modules/auth'

export const useAccessError = (error: unknown) => {
  const client = useQueryClient()
  useEffect(() => {
    revalidateSessionOnAccessError(error, client)
  }, [error, client])
}
