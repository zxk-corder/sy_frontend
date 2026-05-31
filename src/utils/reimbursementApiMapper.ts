import type {
  ReimCalendarVO,
  ReimMainDetail,
  ReimMainVO,
  ReimPageQueryParams,
  ReimSaveParams,
  ReimSplitParams,
  ReimSplitVO,
  ReimSubsidyVO,
  ReimTripParams,
  ReimTripVO,
  SaveSubsidyParams,
} from '@/api/types/reim'
import { DocumentStatus } from '@/types/reimbursement'
import type {
  AllocationRecord,
  ReimbursementForm,
  ReimbursementListItem,
  ReimbursementQuery,
  SubsidyDayItem,
  SubsidyRecord,
  TripRecord,
} from '@/types/reimbursement'
import { todayString } from '@/utils/date'

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function formatDateTime(value?: string): string {
  if (!value) return ''
  return value.length >= 10 ? value.slice(0, 10) : value
}

/** 前端本地生成的临时 ID（非后端主键） */
function isLocalGeneratedId(id: string) {
  return id.startsWith('trip_') || id.startsWith('sub_') || id.startsWith('alloc_')
}

/** 是否为新增报销单（尚未落库、无后端主键） */
export function isNewReimbursement(form: ReimbursementForm): boolean {
  return !form.id || form.id.trim() === ''
}

/** 列表查询条件：前端 → 后端 */
export function toPageQueryParams(
  query: ReimbursementQuery,
  page: number,
  pageSize: number,
): ReimPageQueryParams {
  return {
    current: page,
    size: pageSize,
    reimNo: query.reimNo,
    reimTitle: query.title,
    businessTripReason: query.reason,
    companyId: query.reimCompanyId,
    departmentId: query.reimDepartmentId,
    reimburserId: query.reimburserId,
    businessTypeId: query.businessTypeId,
  }
}

/** 列表行：后端 VO → 前端 */
export function toListItem(vo: ReimMainVO): ReimbursementListItem {
  return {
    id: vo.id,
    reimNo: vo.reimNo,
    documentType: '差旅报销单',
    status: vo.reimStatus as DocumentStatus,
    reimburserId: vo.reimburserId,
    reimburserName: vo.reimburserName,
    reimburserNo: vo.reimburserNo,
    reimDepartmentId: vo.reimDepartmentId,
    reimDepartmentName: vo.reimDepartmentName,
    reimDepartmentNo: vo.reimDepartmentNo,
    reimCompanyId: vo.reimCompanyId,
    reimCompanyName: vo.reimCompanyName,
    businessTypeId: vo.businessTypeId,
    businessTypeName: vo.businessTypeName,
    title: vo.reimbursementTitle,
    reason: vo.businessTripReason,
    subsidyAmount: toNumber(vo.subsidyTotal),
    createdAt: formatDateTime(vo.creationTime),
  }
}

export function toTripRecord(vo: ReimTripVO): TripRecord {
  return {
    id: vo.id,
    reimburserId: vo.travelerId,
    reimburserName: vo.travelerName,
    reimburserNo: vo.travelerNo ?? '',
    departCityNo: vo.departureCityId,
    departCityName: vo.departureCityName ?? '',
    arriveCityNo: vo.arriveCityId,
    arriveCityName: vo.arriveCityName ?? '',
    departDate: formatDateTime(vo.departureDate),
    arriveDate: formatDateTime(vo.arriveDate),
    description: vo.tripDesc ?? '',
  }
}

export function toTripParams(trip: TripRecord, reimId: string): ReimTripParams {
  return {
    id: trip.id && !isLocalGeneratedId(trip.id) ? trip.id : undefined,
    reimId,
    travelerId: trip.reimburserId,
    travelerNo: trip.reimburserNo,
    travelerName: trip.reimburserName,
    departureCityId: trip.departCityNo,
    departureCityName: trip.departCityName,
    arriveCityId: trip.arriveCityNo,
    arriveCityName: trip.arriveCityName,
    departureDate: trip.departDate,
    arriveDate: trip.arriveDate,
    tripDesc: trip.description,
  }
}

/** REIM_Save 级联保存行程：不传旧 id，避免逻辑删后 INSERT 主键冲突 */
export function toTripSaveParams(trip: TripRecord, reimId: string): ReimTripParams {
  return {
    reimId,
    travelerId: trip.reimburserId,
    travelerNo: trip.reimburserNo,
    travelerName: trip.reimburserName,
    departureCityId: trip.departCityNo,
    departureCityName: trip.departCityName,
    arriveCityId: trip.arriveCityNo,
    arriveCityName: trip.arriveCityName,
    departureDate: trip.departDate,
    arriveDate: trip.arriveDate,
    tripDesc: trip.description,
  }
}

export function toCalendarDayItem(vo: ReimCalendarVO): SubsidyDayItem {
  return {
    id: vo.id,
    date: formatDateTime(vo.tripDate),
    weekday: vo.weekDay,
    cityNo: vo.subsidyCityId,
    cityName: vo.subsidyCityName,
    mealChecked: vo.mealChecked === 1,
    transportChecked: vo.transportChecked === 1,
    communicationChecked: vo.phoneChecked === 1,
    mealStandard: toNumber(vo.mealStandard),
    transportStandard: toNumber(vo.transportStandard),
    communicationStandard: toNumber(vo.phoneStandard),
    mealAmount: toNumber(vo.mealAmount),
    transportAmount: toNumber(vo.transportAmount),
    communicationAmount: toNumber(vo.phoneAmount),
  }
}

export function toSubsidyRecord(
  vo: ReimSubsidyVO,
  trip?: TripRecord,
  calendar: SubsidyDayItem[] = [],
): SubsidyRecord {
  const departDate = formatDateTime(vo.tripStartDate)
  const arriveDate = formatDateTime(vo.tripEndDate)
  return {
    id: vo.id,
    tripId: vo.tripId,
    reimburserId: vo.travelerId,
    reimburserName: vo.travelerName,
    tripDateRange: `${departDate} ~ ${arriveDate}`,
    subsidyDays: vo.subsidyDays,
    route: trip ? `${trip.departCityName}-${trip.arriveCityName}` : '',
    subsidyCityName: vo.subsidyCityName,
    applyAmount: toNumber(vo.applyAmount),
    subsidyAmount: toNumber(vo.subsidyAmount),
    businessTypeId: '',
    businessTypeName: '',
    departDate,
    arriveDate,
    departCityName: trip?.departCityName ?? '',
    arriveCityName: trip?.arriveCityName ?? vo.subsidyCityName,
    calendar,
  }
}

export function toAllocationRecord(
  vo: ReimSplitVO | ReimSplitParams,
): AllocationRecord {
  return {
    id: vo.id ?? '',
    reimCompanyId: vo.companyId,
    reimCompanyName: vo.companyName ?? '',
    projectId: vo.projectId,
    projectName: vo.projectName ?? '',
    ratio: toNumber(vo.splitRatio),
    amount: toNumber(vo.splitAmount),
  }
}

export function toSplitParams(
  row: AllocationRecord,
  reimId: string,
  sortNo: number,
  isNew = false,
): ReimSplitParams {
  const params: ReimSplitParams = {
    sortNo,
    companyId: row.reimCompanyId,
    companyName: row.reimCompanyName,
    projectId: row.projectId,
    projectName: row.projectName,
    splitRatio: row.ratio,
    splitAmount: row.amount,
  }
  if (!isNew && reimId) {
    params.reimId = reimId
  }
  // REIM_Save 更新时后端为「逻辑删 + 再 INSERT」，不传旧 id，由后端生成新主键
  return params
}

export function toSaveParams(
  form: ReimbursementForm,
  options?: { includeTripList?: boolean },
): ReimSaveParams {
  const includeTripList = options?.includeTripList ?? true
  const meal = form.subsidies.reduce((sum, s) => {
    return (
      sum +
      s.calendar.reduce((d, day) => d + (day.mealChecked ? day.mealAmount : 0), 0)
    )
  }, 0)
  const transport = form.subsidies.reduce((sum, s) => {
    return (
      sum +
      s.calendar.reduce((d, day) => d + (day.transportChecked ? day.transportAmount : 0), 0)
    )
  }, 0)
  const phone = form.subsidies.reduce((sum, s) => {
    return (
      sum +
      s.calendar.reduce(
        (d, day) => d + (day.communicationChecked ? day.communicationAmount : 0),
        0,
      )
    )
  }, 0)
  const subsidyTotal = form.subsidies.reduce((s, item) => s + item.subsidyAmount, 0)
  const isNew = isNewReimbursement(form)

  const params: ReimSaveParams = {
    reimbursementTitle: form.title,
    businessTripReason: form.reason,
    reimburserId: form.reimburserId,
    reimburserNo: form.reimburserNo,
    reimburserName: form.reimburserName,
    reimDepartmentId: form.reimDepartmentId,
    reimDepartmentNo: form.reimDepartmentNo,
    reimDepartmentName: form.reimDepartmentName,
    reimCompanyId: form.reimCompanyId,
    reimCompanyName: form.reimCompanyName,
    businessTypeId: form.businessTypeId,
    businessTypeName: form.businessTypeName,
    subsidyTotal,
    mealAllowance: meal,
    transportationAllowance: transport,
    phoneAllowance: phone,
    remarks: form.remark,
    splitList: form.allocations.map((row, index) =>
      toSplitParams(row, form.id ?? '', index + 1, isNew),
    ),
  }

  if (includeTripList && form.trips.length > 0) {
    params.tripList = form.trips.map((trip) => toTripSaveParams(trip, form.id ?? ''))
  }

  // 新增时不传 id、version，由后端生成主键
  if (!isNew) {
    params.id = form.id
    if (form.version !== undefined) {
      params.version = form.version
    }
  }

  return params
}

/** 新增保存专用：包含行程列表，后端统一校验并落库 */
export function toCreateSaveParams(form: ReimbursementForm): ReimSaveParams {
  const params = toSaveParams({
    ...form,
    id: undefined,
    version: undefined,
  })
  delete params.id
  delete params.version
  return params
}

export function toSaveSubsidyParams(subsidy: SubsidyRecord): SaveSubsidyParams {
  return {
    subsidyId: subsidy.id,
    calendarList: subsidy.calendar.map((day) => ({
      id: day.id ?? '',
      mealChecked: day.mealChecked ? 1 : 0,
      mealAmount: day.mealAmount,
      transportChecked: day.transportChecked ? 1 : 0,
      transportAmount: day.transportAmount,
      phoneChecked: day.communicationChecked ? 1 : 0,
      phoneAmount: day.communicationAmount,
    })),
  }
}

/** 主单 + 子表组装为详情表单 */
export function toReimbursementForm(
  main: ReimMainDetail,
  trips: TripRecord[],
  subsidies: SubsidyRecord[],
  allocations: AllocationRecord[],
): ReimbursementForm {
  const subsidiesWithBiz = subsidies.map((s) => ({
    ...s,
    businessTypeId: main.businessTypeId,
    businessTypeName: main.businessTypeName,
  }))

  return {
    id: main.id,
    reimNo: main.reimNo,
    version: main.version,
    status: main.reimStatus as DocumentStatus,
    documentDate: formatDateTime(main.creationTime) || todayString(),
    title: main.reimbursementTitle,
    reason: main.businessTripReason,
    reimburserId: main.reimburserId,
    reimburserName: main.reimburserName,
    reimburserNo: main.reimburserNo,
    reimDepartmentId: main.reimDepartmentId,
    reimDepartmentName: main.reimDepartmentName,
    reimDepartmentNo: main.reimDepartmentNo,
    reimCompanyId: main.reimCompanyId,
    reimCompanyName: main.reimCompanyName,
    businessTypeId: main.businessTypeId,
    businessTypeName: main.businessTypeName,
    trips,
    subsidies: subsidiesWithBiz,
    allocations: allocations.length
      ? allocations
      : [
          {
            id: '',
            reimCompanyId: main.reimCompanyId,
            reimCompanyName: main.reimCompanyName,
            projectId: '',
            projectName: '',
            ratio: 1,
            amount: toNumber(main.subsidyTotal),
          },
        ],
    remark: main.remarks ?? '',
  }
}
