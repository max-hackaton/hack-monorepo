const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'medium',
  timeStyle: 'short',
})
const compactDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatCaseDate(value: string) {
  return dateFormatter.format(new Date(value))
}

export function formatCompactCaseDate(value: string) {
  return compactDateFormatter.format(new Date(value))
}
