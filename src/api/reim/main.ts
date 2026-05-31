import request from '@/api/request'
import type {
  ExportTaskResult,
  IdResult,
  PageResult,
  ReimMainDetail,
  ReimMainVO,
  ReimPageQueryParams,
  ReimSaveParams,
  ReimSubmitParams,
} from '@/api/types/reim'

const PREFIX = '/fccapi'

/** 分页查询报销单列表 */
export function queryReimPageList(params: ReimPageQueryParams) {
  return request.post<PageResult<ReimMainVO>>(`${PREFIX}/REIM_QueryPageList`, params)
}

/** 查询报销单详情（主单） */
export function getReimDetail(id: string) {
  return request.get<ReimMainDetail>(`${PREFIX}/REIM_GetDetail`, { params: { id } })
}

/** 保存报销单（新增/更新） */
export function saveReim(data: ReimSaveParams) {
  return request.post<IdResult>(`${PREFIX}/REIM_Save`, data)
}

/** 新增报销单：请求体不包含 id、version */
export function saveReimCreate(data: ReimSaveParams) {
  const payload = { ...data }
  delete payload.id
  delete payload.version
  return request.post<IdResult>(`${PREFIX}/REIM_Save`, payload)
}

/** 提交报销单 */
export function submitReim(data: ReimSubmitParams) {
  return request.post<void>(`${PREFIX}/REIM_Submit`, data)
}

/** 作废报销单 */
export function cancelReim(id: string) {
  return request.post<void>(`${PREFIX}/REIM_Cancel`, { id })
}

/** 更新报销单状态 */
export function updateReimStatus(id: string, status: number) {
  return request.post<void>(`${PREFIX}/REIM_UpdateStatus`, { id, status })
}

/** 发起异步导出 */
export function exportReimAsync(query?: Partial<ReimPageQueryParams>) {
  return request.post<ExportTaskResult>(`${PREFIX}/REIM_ExportAsync`, query ?? {})
}

/** 查询导出任务状态 */
export function getExportStatus(taskId: string) {
  return request.get<Record<string, unknown>>(`${PREFIX}/REIM_ExportStatus`, {
    params: { taskId },
  })
}
