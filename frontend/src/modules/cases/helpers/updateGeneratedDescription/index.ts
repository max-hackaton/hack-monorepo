export function updateGeneratedDescription(
  current: string,
  previousGenerated: string,
  nextGenerated: string,
): string {
  return current === previousGenerated ? nextGenerated : current
}
