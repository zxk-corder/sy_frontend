import request from '@/api/request'
import type { ReimCalendarVO, ReimSubsidyVO, SaveSubsidyParams } from '@/api/types/reim'

const PREFIX = '/fccapi'

/** 按报销单 ID 查询补助信息列表 */
export function listSubsidiesByReimId(reimId: string) {
  return request.get<ReimSubsidyVO[]>(`${PREFIX}/REIM_ListSubsidies`, { params: { reimId } })
}

/** 获取补助日历 */
export function getCalendar(subsidyId: string) {
  return request.post<ReimCalendarVO[]>(`${PREFIX}/REIM_GetCalendar`, { subsidyId })
}

/** 保存补助日历 */
export function saveSubsidyCalendar(data: SaveSubsidyParams) {
  return request.post<void>(`${PREFIX}/REIM_SaveSubsidy`, data)
}
