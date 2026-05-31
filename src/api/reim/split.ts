import request from '@/api/request'
import type { ReimSplitParams } from '@/api/types/reim'
import type { ReimSplitVO } from '@/api/types/reim'

const PREFIX = '/fccapi'

/** 按报销单 ID 查询费用分摊列表 */
export function listSplitsByReimId(reimId: string) {
  return request.get<ReimSplitVO[]>(`${PREFIX}/REIM_ListSplits`, { params: { reimId } })
}

/** 重新计算分摊比例（倒挤法） */
export function calcSplitRatio(reimId: string, splitList: ReimSplitParams[]) {
  return request.post<ReimSplitParams[]>(`${PREFIX}/REIM_SplitCalc/${reimId}`, splitList)
}
