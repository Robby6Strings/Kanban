export const sortByOrder = <T extends { order: number }>(a: T, b: T) => {
  if (a.order < b.order) return -1
  if (a.order > b.order) return 1
  return 0
}
