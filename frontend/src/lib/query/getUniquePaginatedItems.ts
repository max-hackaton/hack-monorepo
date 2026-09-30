export function getUniquePaginatedItems<TPage, TItem extends { id: string }>(
  pages: readonly TPage[] | undefined,
  getItems: (page: TPage) => readonly TItem[],
): TItem[] {
  const items = new Map<string, TItem>()

  for (const page of pages ?? []) {
    for (const item of getItems(page)) {
      items.set(item.id, item)
    }
  }

  return Array.from(items.values())
}
