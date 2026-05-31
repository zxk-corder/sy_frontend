import { DocumentStatus } from '@/types/reimbursement'

export const DOCUMENT_STATUS_MAP: Record<
  DocumentStatus,
  { label: string; type: 'info' | 'success' | 'danger' }
> = {
  [DocumentStatus.Draft]: { label: '草稿', type: 'info' },
  [DocumentStatus.Completed]: { label: '已完成', type: 'success' },
  [DocumentStatus.Voided]: { label: '已作废', type: 'danger' },
}

/** 餐费补助标准（元/天） */
export const MEAL_STANDARD: Record<string, number> = {
  '1': 100,
  '2': 80,
  '3': 50,
}

export const TRANSPORT_STANDARD = 40
export const COMMUNICATION_STANDARD = 40

export const TRIP_DIALOG_TIP_MAIN =
  '仅可补录未从申请单带入或未产生费用的行程信息'

export const TRIP_DIALOG_TIP_SUB =
  '跨天跨城行程填写说明：出发城市-到达城市：武汉-北京；出发日期-到达日期：1号-5号；1号~5号补助按北京匹配；'

export const SUBSIDY_SECTION_TIP_TEXT =
  '1、请根据实际出差日期选择补助 2、出差期间当日有用餐安排的请自行核减当日餐补 3、出差期间当日有用车的，请自行核减当日交补'

export const SUBSIDY_CALENDAR_TIP =
  '1、请根据实际出差日期选择补助；2、出差期间当日有用餐安排的请自行核减当日餐补；3、出差期间当日有用车的，请自行核减当日交补'

export const CONTENT_MAX_WIDTH = 1200
