import { DocumentStatus, type DocumentStatus as DocumentStatusType } from '@/types/reimbursement'

/** 是否为草稿状态（仅草稿可保存更新、提交） */
export function isDraftStatus(status: DocumentStatusType): boolean {
  return status === DocumentStatus.Draft
}

/** 是否允许提交报销单 */
export function canSubmitReimbursement(status: DocumentStatusType): boolean {
  return isDraftStatus(status)
}

/** 详情页是否只读（已完成、已作废不可修改） */
export function isReimbursementReadOnly(status: DocumentStatusType): boolean {
  return !isDraftStatus(status)
}
