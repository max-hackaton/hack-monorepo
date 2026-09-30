const pluralRules = new Intl.PluralRules('ru')

export function formatActiveCaseCount(count: number) {
  const form = pluralRules.select(count)

  if (form === 'one') return `${count} активная проблема`
  if (form === 'few') return `${count} активные проблемы`

  return `${count} активных проблем`
}
