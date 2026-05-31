import { DocumentStatus } from '@/types/reimbursement'
import type { ReimbursementForm } from '@/types/reimbursement'
import { todayString } from '@/utils/date'
import { generateId } from '@/utils/id'

/** 复制报销单为新增草稿：回显业务数据，单据号/主键等按新单处理 */
export function cloneReimbursementFormForCopy(source: ReimbursementForm): ReimbursementForm {
  const cloned = JSON.parse(JSON.stringify(source)) as ReimbursementForm

  delete cloned.id
  delete cloned.reimNo
  cloned.status = DocumentStatus.Draft
  cloned.documentDate = todayString()

  const tripIdMap = new Map<string, string>()
  cloned.trips = cloned.trips.map((trip) => {
    const newId = generateId('trip')
    tripIdMap.set(trip.id, newId)
    return { ...trip, id: newId }
  })

  cloned.subsidies = cloned.subsidies.map((sub) => ({
    ...sub,
    id: generateId('sub'),
    tripId: tripIdMap.get(sub.tripId) ?? sub.tripId,
  }))

  cloned.allocations = cloned.allocations.map((alloc) => ({
    ...alloc,
    id: generateId('alloc'),
  }))

  return cloned
}
