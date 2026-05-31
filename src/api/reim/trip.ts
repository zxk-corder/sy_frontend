import request from '@/api/request'
import type { ReimTripParams, TripSaveResult } from '@/api/types/reim'
import type { ReimTripVO } from '@/api/types/reim'

const PREFIX = '/fccapi'

/** 按报销单 ID 查询补录行程列表 */
export function listTripsByReimId(reimId: string) {
  return request.get<ReimTripVO[]>(`${PREFIX}/REIM_ListTrips`, { params: { reimId } })
}

/** 保存补录行程 */
export function saveTrip(data: ReimTripParams) {
  return request.post<TripSaveResult>(`${PREFIX}/REIM_SaveTrip`, data)
}

/** 删除补录行程 */
export function deleteTrip(tripId: string) {
  return request.post<void>(`${PREFIX}/REIM_DeleteTrip`, null, { params: { tripId } })
}
