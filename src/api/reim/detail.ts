import { getCalendar, listSubsidiesByReimId } from '@/api/reim/calendar'
import { getReimDetail } from '@/api/reim/main'
import { listSplitsByReimId } from '@/api/reim/split'
import { listTripsByReimId } from '@/api/reim/trip'
import type { ReimbursementForm } from '@/types/reimbursement'
import {
  toAllocationRecord,
  toCalendarDayItem,
  toReimbursementForm,
  toSubsidyRecord,
  toTripRecord,
} from '@/utils/reimbursementApiMapper'

/** 加载报销单完整详情（主单 + 行程 + 补助日历 + 分摊） */
export async function fetchReimbursementDetail(
  id: string,
): Promise<ReimbursementForm | null> {
  const main = await getReimDetail(id)
  if (!main?.id) return null

  const [tripVOs, subsidyVOs, splitVOs] = await Promise.all([
    listTripsByReimId(id),
    listSubsidiesByReimId(id),
    listSplitsByReimId(id),
  ])

  const trips = tripVOs.map(toTripRecord)
  const tripMap = new Map(trips.map((t) => [t.id, t]))

  const subsidies = await Promise.all(
    subsidyVOs.map(async (vo) => {
      const calendarRows = await getCalendar(vo.id)
      const calendar = calendarRows.map(toCalendarDayItem)
      return toSubsidyRecord(vo, tripMap.get(vo.tripId), calendar)
    }),
  )

  const allocations = splitVOs
    .sort((a, b) => (a.sortNo ?? 0) - (b.sortNo ?? 0))
    .map(toAllocationRecord)

  return toReimbursementForm(main, trips, subsidies, allocations)
}
