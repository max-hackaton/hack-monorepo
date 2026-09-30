import { useCaseDetail } from '../api/hooks/useCaseDetail'
import { useCaseEvents } from '../api/hooks/useCaseEvents'
import { useConfirmCaseMutation } from '../api/hooks/useConfirmCaseMutation'
import { CaseResidentActions } from '../components/CaseResidentActions'
import { CaseDetailView } from '../components/CaseDetailView'

type CaseDetailPageProps = {
  houseId: string
  userId: string
  id: string
}

export const CaseDetailPage = ({
  houseId,
  userId,
  id,
}: CaseDetailPageProps) => {
  const detail = useCaseDetail(houseId, userId, id)
  const events = useCaseEvents(houseId, userId, id, detail.isSuccess)
  const confirmation = useConfirmCaseMutation(houseId, userId)
  return (
    <CaseDetailView detail={detail} events={events} confirmation={confirmation}>
      {detail.data?.is_creator && (
        <CaseResidentActions
          key={`${houseId}:${userId}:${id}`}
          detail={detail.data}
          houseId={houseId}
          userId={userId}
        />
      )}
    </CaseDetailView>
  )
}
