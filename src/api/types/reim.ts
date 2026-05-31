/** 后端接口 DTO / 实体类型（与 Java 字段对齐） */

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export interface ReimPageQueryParams {
  current: number
  size: number
  reimNo?: string
  reimTitle?: string
  businessTripReason?: string
  companyId?: string
  departmentId?: string
  reimburserId?: string
  businessTypeId?: string
}

export interface ReimMainVO {
  id: string
  reimNo: string
  reimStatus: number
  reimbursementTitle: string
  businessTripReason: string
  reimburserId: string
  reimburserNo: string
  reimburserName: string
  reimDepartmentId: string
  reimDepartmentNo: string
  reimDepartmentName: string
  reimCompanyId: string
  reimCompanyNo: string
  reimCompanyName: string
  businessTypeId: string
  businessTypeNo: string
  businessTypeName: string
  subsidyTotal: number
  mealAllowance: number
  transportationAllowance: number
  phoneAllowance: number
  remarks: string
  creationTime?: string
  updateTime?: string
}

export interface ReimMainDetail extends ReimMainVO {
  version?: number
  payeeIdCard?: string
  payeeBankAccount?: string
}

export interface ReimSaveParams {
  id?: string
  version?: number
  reimbursementTitle: string
  businessTripReason: string
  reimburserId: string
  reimburserNo?: string
  reimburserName: string
  reimDepartmentId?: string
  reimDepartmentNo?: string
  reimDepartmentName?: string
  reimCompanyId: string
  reimCompanyNo?: string
  reimCompanyName?: string
  businessTypeId?: string
  businessTypeNo?: string
  businessTypeName?: string
  subsidyTotal?: number
  mealAllowance?: number
  transportationAllowance?: number
  phoneAllowance?: number
  remarks?: string
  tripList?: ReimTripParams[]
  splitList?: ReimSplitParams[]
}

export interface ReimSubmitParams {
  id: string
  version: number
}

export interface ReimTripVO {
  id: string
  reimId: string
  travelerId: string
  travelerNo?: string
  travelerName: string
  departureCityId: string
  departureCityName?: string
  arriveCityId: string
  arriveCityName?: string
  arriveCityLevel?: string
  departureDate: string
  arriveDate: string
  tripDays?: number
  tripDesc?: string
}

export interface ReimSplitVO {
  id: string
  reimId: string
  sortNo?: number
  companyId: string
  companyName?: string
  projectId: string
  projectName?: string
  splitRatio: number
  splitAmount: number
}

export interface ReimTripParams {
  id?: string
  reimId?: string
  travelerId: string
  travelerNo?: string
  travelerName: string
  departureCityId: string
  departureCityName?: string
  arriveCityId: string
  arriveCityName?: string
  arriveCityLevel?: string
  departureDate: string
  arriveDate: string
  tripDays?: number
  tripDesc?: string
}

export interface ReimSplitParams {
  id?: string
  reimId?: string
  sortNo?: number
  companyId: string
  companyName?: string
  projectId: string
  projectName?: string
  splitRatio: number
  splitAmount: number
}

export interface ReimSubsidyVO {
  id: string
  reimId: string
  tripId: string
  travelerId: string
  travelerName: string
  tripStartDate: string
  tripEndDate: string
  subsidyDays: number
  subsidyCityId: string
  subsidyCityName: string
  applyAmount: number
  subsidyAmount: number
  mealSubsidy: number
  transportSubsidy: number
  phoneSubsidy: number
}

export interface ReimCalendarVO {
  id: string
  reimId: string
  subsidyId: string
  tripDate: string
  weekDay: string
  subsidyCityId: string
  subsidyCityName: string
  mealChecked: number
  mealStandard: number
  mealAmount: number
  transportChecked: number
  transportStandard: number
  transportAmount: number
  phoneChecked: number
  phoneStandard: number
  phoneAmount: number
}

export interface SaveSubsidyParams {
  subsidyId: string
  calendarList: Array<{
    id: string
    mealChecked: number
    mealAmount?: number
    transportChecked: number
    transportAmount?: number
    phoneChecked: number
    phoneAmount?: number
  }>
}

export interface IdResult {
  id: string
}

export interface TripSaveResult {
  tripId: string
  subsidyId: string
}

export interface ExportTaskResult {
  taskId: string
  status: string
}
