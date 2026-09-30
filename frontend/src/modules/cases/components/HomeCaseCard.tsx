import { useConfirmCaseMutation } from '../api/hooks/useConfirmCaseMutation'
import { CaseCard } from './CaseCard'
import type { HomeCase } from '../types'

type HomeCaseCardProps = {
  caseItem: HomeCase
  houseId: string
  userId: string
}

export const HomeCaseCard = ({
  caseItem,
  houseId,
  userId,
}: HomeCaseCardProps) => {
  const { mutate, isPending, isError } = useConfirmCaseMutation(houseId, userId)

  return (
    <CaseCard
      caseItem={caseItem}
      onConfirm={() => mutate(caseItem.id)}
      confirming={isPending}
      confirmError={isError}
    />
  )
}
