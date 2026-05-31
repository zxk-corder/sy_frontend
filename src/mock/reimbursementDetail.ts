import { DocumentStatus } from '@/types/reimbursement'
import { MOCK_REIMBURSEMENT_LIST } from '@/mock/reimbursementList'
import { MOCK_PROJECTS } from '@/mock/masterData'
import type {
  ReimbursementForm,
  ReimbursementListItem,
  SubsidyRecord,
  TripRecord,
} from '@/types/reimbursement'
import { generateId } from '@/utils/id'
import { getDaysBetween } from '@/utils/date'
import { sumMoney } from '@/utils/money'
import { createSubsidyCalendar, calcCalendarTotals } from '@/utils/subsidy'

/** 根据列表 id 生成示例行程（武汉→北京，3 天） */
function buildSampleTrip(item: ReimbursementListItem, index: number): TripRecord {
  const dayOffset = (Number(item.id) % 5) + 1
  const departDate = `2025-05-${String(10 + dayOffset).padStart(2, '0')}`
  const arriveDate = `2025-05-${String(12 + dayOffset).padStart(2, '0')}`
  return {
    id: `trip_${item.id}_${index}`,
    reimburserId: item.reimburserId,
    reimburserName: item.reimburserName,
    reimburserNo: item.reimburserNo,
    departCityNo: '10458',
    departCityName: '武汉',
    arriveCityNo: '10119',
    arriveCityName: '北京',
    departDate,
    arriveDate,
    description: `${item.title} - 补录行程${index + 1}`,
  }
}

function buildSubsidyFromTrip(trip: TripRecord, item: ReimbursementListItem): SubsidyRecord {
  const calendar = createSubsidyCalendar(trip)
  const totals = calcCalendarTotals(calendar)
  return {
    id: `sub_${trip.id}`,
    tripId: trip.id,
    reimburserId: trip.reimburserId,
    reimburserName: trip.reimburserName,
    tripDateRange: `${trip.departDate} ~ ${trip.arriveDate}`,
    subsidyDays: getDaysBetween(trip.departDate, trip.arriveDate),
    route: `${trip.departCityName}-${trip.arriveCityName}`,
    subsidyCityName: trip.arriveCityName,
    applyAmount: totals.applyAmount,
    subsidyAmount: totals.subsidyAmount,
    businessTypeId: item.businessTypeId,
    businessTypeName: item.businessTypeName,
    departDate: trip.departDate,
    arriveDate: trip.arriveDate,
    departCityName: trip.departCityName,
    arriveCityName: trip.arriveCityName,
    calendar,
  }
}

/** 将列表行转为详情表单（死数据） */
export function getReimbursementDetailById(id: string): ReimbursementForm | null {
  const item = MOCK_REIMBURSEMENT_LIST.find((r) => r.id === id)
  if (!item) return null

  const trips =
    item.subsidyAmount > 0
      ? [buildSampleTrip(item, 0)]
      : []

  const subsidies = trips.map((t) => buildSubsidyFromTrip(t, item))
  const subsidyTotal = sumMoney(subsidies.map((sub) => sub.subsidyAmount))
  const project = MOCK_PROJECTS[1]

  return {
    id: item.id,
    reimNo: item.reimNo,
    status: item.status,
    documentDate: item.createdAt,
    title: item.title,
    reason: item.reason,
    reimburserId: item.reimburserId,
    reimburserName: item.reimburserName,
    reimburserNo: item.reimburserNo,
    reimDepartmentId: item.reimDepartmentId,
    reimDepartmentName: item.reimDepartmentName,
    reimDepartmentNo: item.reimDepartmentNo,
    reimCompanyId: item.reimCompanyId,
    reimCompanyName: item.reimCompanyName,
    businessTypeId: item.businessTypeId,
    businessTypeName: item.businessTypeName,
    trips,
    subsidies,
    allocations: [
      {
        id: generateId('alloc'),
        reimCompanyId: item.reimCompanyId,
        reimCompanyName: item.reimCompanyName,
        projectId: project.projectId,
        projectName: project.projectName,
        ratio: 1,
        amount: subsidyTotal,
      },
    ],
    remark: item.status === DocumentStatus.Voided ? '该单据已作废。' : '',
  }
}
