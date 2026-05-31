/** 单据状态 */
export const DocumentStatus = {
  Draft: 0,
  Completed: 1,
  Voided: 2,
} as const

export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus]

export interface ReimCompany {
  reimCompanyId: string
  reimCompanyNo: string
  reimCompanyName: string
}

export interface ReimDepartment {
  reimDepartmentId: string
  reimDepartmentNo: string
  reimDepartmentName: string
}

export interface Employee {
  reimburserId: string
  reimburserNo: string
  reimburserName: string
  /** 所属报销部门，选择报销人时联动带出 */
  reimDepartmentId: string
}

export interface BusinessType {
  businessTypeId: string
  businessTypeNo: string
  businessTypeName: string
  thereSubordinateNode: string
  superiorId: string
}

export interface City {
  cityNo: string
  cityName: string
  cityType: string
}

export interface Project {
  projectId: string
  projectNo: string
  projectName: string
}

/** 列表查询条件 */
export interface ReimbursementQuery {
  reimNo?: string
  title?: string
  reason?: string
  reimCompanyId?: string
  reimDepartmentId?: string
  reimburserId?: string
  businessTypeId?: string
}

/** 列表行 */
export interface ReimbursementListItem {
  id: string
  reimNo: string
  documentType: string
  status: DocumentStatus
  reimburserId: string
  reimburserName: string
  reimburserNo: string
  reimDepartmentId: string
  reimDepartmentName: string
  reimDepartmentNo: string
  reimCompanyId: string
  reimCompanyName: string
  businessTypeId: string
  businessTypeName: string
  title: string
  reason: string
  subsidyAmount: number
  createdAt: string
}

/** 补录行程 */
export interface TripRecord {
  id: string
  reimburserId: string
  reimburserName: string
  reimburserNo: string
  departCityNo: string
  departCityName: string
  arriveCityNo: string
  arriveCityName: string
  departDate: string
  arriveDate: string
  description: string
}

/** 补助日历单日 */
export interface SubsidyDayItem {
  /** 后端日历记录 ID，保存补助日历时必传 */
  id?: string
  date: string
  weekday: string
  cityNo: string
  cityName: string
  mealChecked: boolean
  transportChecked: boolean
  communicationChecked: boolean
  mealStandard: number
  transportStandard: number
  communicationStandard: number
  mealAmount: number
  transportAmount: number
  communicationAmount: number
}

/** 补助信息行 */
export interface SubsidyRecord {
  id: string
  tripId: string
  reimburserId: string
  reimburserName: string
  tripDateRange: string
  subsidyDays: number
  route: string
  subsidyCityName: string
  applyAmount: number
  subsidyAmount: number
  businessTypeId: string
  businessTypeName: string
  departDate: string
  arriveDate: string
  departCityName: string
  arriveCityName: string
  calendar: SubsidyDayItem[]
}

/** 费用分摊行 */
export interface AllocationRecord {
  id: string
  reimCompanyId: string
  reimCompanyName: string
  projectId: string
  projectName: string
  ratio: number
  amount: number
}

/** 报销单完整表单 */
export interface ReimbursementForm {
  id?: string
  reimNo?: string
  /** 乐观锁版本号，更新/提交时必传 */
  version?: number
  status: DocumentStatus
  documentDate: string
  title: string
  reason: string
  reimburserId: string
  reimburserName: string
  reimburserNo: string
  reimDepartmentId: string
  reimDepartmentName: string
  reimDepartmentNo: string
  reimCompanyId: string
  reimCompanyName: string
  businessTypeId: string
  businessTypeName: string
  trips: TripRecord[]
  subsidies: SubsidyRecord[]
  allocations: AllocationRecord[]
  remark: string
}

export type SubsidyField = 'meal' | 'transport' | 'communication'
