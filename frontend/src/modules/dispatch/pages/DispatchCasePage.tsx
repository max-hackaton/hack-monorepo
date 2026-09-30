import { useSearch } from '@tanstack/react-router'

import { CaseDetailView } from '@/modules/cases'
import { useDispatchCase } from '../api/hooks/useDispatchCase'
import { useDispatchEvents } from '../api/hooks/useDispatchEvents'
import { DispatchActions } from '../components/DispatchActions'
import { getDispatchFeedSearch } from '../helpers/getDispatchFeedSearch'

export const DispatchCasePage = ({ id }: { id: string }) => {
  const search = useSearch({ from: '/cases/$id' })
  const detail = useDispatchCase(id)
  const events = useDispatchEvents(id, detail.isSuccess)
  return (
    <CaseDetailView
      detail={{ ...detail, data: detail.data?.case }}
      events={events}
      dispatcher
      dispatchFeedSearch={getDispatchFeedSearch(search)}
    >
      {detail.data && <DispatchActions key={id} detail={detail.data} />}
    </CaseDetailView>
  )
}
