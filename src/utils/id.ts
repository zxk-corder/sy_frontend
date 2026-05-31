let seq = 0

export function generateId(prefix = 'id'): string {
  seq += 1
  return `${prefix}_${Date.now()}_${seq}`
}
