const WEEKDAY_LABELS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayString(): string {
  return formatDate(new Date())
}

export function getWeekdayLabel(dateStr: string): string {
  const d = new Date(dateStr)
  return WEEKDAY_LABELS[d.getDay()] ?? ''
}

/** 生成日期范围内所有日期（含首尾） */
export function getDateRange(start: string, end: string): string[] {
  const dates: string[] = []
  const cur = new Date(start)
  const last = new Date(end)
  while (cur <= last) {
    dates.push(formatDate(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

export function getDaysBetween(start: string, end: string): number {
  return getDateRange(start, end).length
}

/** 判断两个日期区间是否重叠 */
export function isDateRangeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): boolean {
  return start1 <= end2 && start2 <= end1
}
