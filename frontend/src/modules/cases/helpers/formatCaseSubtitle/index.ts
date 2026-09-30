import type { HomeCase } from '../../types'

const activityDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function formatCaseSubtitle(
  caseItem: Pick<HomeCase, 'location_details' | 'last_activity_at'>,
) {
  const activity = activityDateFormatter.format(
    new Date(caseItem.last_activity_at),
  )
  return [caseItem.location_details, activity].filter(Boolean).join(' · ')
}
