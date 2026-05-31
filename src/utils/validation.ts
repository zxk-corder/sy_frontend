import type {
  AllocationRecord,
  ReimbursementForm,
  TripRecord,
} from '@/types/reimbursement'
import { isDateRangeOverlap } from '@/utils/date'
import { moneyEquals, roundRatio, sumMoney } from '@/utils/money'

export function checkTripOverlap(
  trips: TripRecord[],
  current: TripRecord,
  excludeId?: string,
): string | null {
  const samePersonTrips = trips.filter(
    (t) => t.reimburserId === current.reimburserId && t.id !== excludeId,
  )
  for (const t of samePersonTrips) {
    if (
      isDateRangeOverlap(
        t.departDate,
        t.arriveDate,
        current.departDate,
        current.arriveDate,
      )
    ) {
      return `出行人 ${current.reimburserName} 的行程日期与已有行程重叠`
    }
  }
  return null
}

export function validateReimbursementForm(form: ReimbursementForm): string[] {
  const errors: string[] = []

  if (!form.title?.trim()) errors.push('请填写报销标题')
  if (!form.reason?.trim()) errors.push('请填写出差事由')
  if (!form.reimburserId) errors.push('请选择报销人')
  if (!form.reimDepartmentId) errors.push('请选择报销部门')
  if (!form.reimCompanyId) errors.push('请选择费用归属公司')
  if (!form.businessTypeId) errors.push('请选择业务类型')
  if (form.title && form.title.length > 500) errors.push('报销标题不能超过500字')
  if (form.reason && form.reason.length > 500) errors.push('出差事由不能超过500字')

  if (form.trips.length === 0) errors.push('请至少添加一条补录行程')
  if (form.subsidies.length === 0) errors.push('请完善补助信息')

  for (let i = 0; i < form.trips.length; i++) {
    const trip = form.trips[i]!
    const overlap = checkTripOverlap(form.trips, trip, trip.id)
    if (overlap) {
      errors.push(overlap)
      break
    }
  }

  const ratioSum = roundRatio(
    form.allocations.reduce((s, a) => s + a.ratio, 0),
  )
  if (Math.abs(ratioSum - 1) > 0.0001) {
    errors.push('分摊比例合计必须为100%')
  }

  const subsidyTotal = sumMoney(
    form.subsidies.map((item) => item.subsidyAmount),
  )
  const allocAmountSum = sumMoney(form.allocations.map((a) => a.amount))
  if (!moneyEquals(allocAmountSum, subsidyTotal)) {
    errors.push('分摊金额合计必须等于补助总金额')
  }

  for (const alloc of form.allocations) {
    if (!alloc.reimCompanyId) errors.push('请选择费用归属')
    if (!alloc.projectId) errors.push('请选择项目')
  }

  if (form.remark && form.remark.length > 1000) {
    errors.push('备注不能超过1000字')
  }

  return errors
}

export function validateAllocationRows(rows: AllocationRecord[]): boolean {
  const othersSum = rows.slice(1).reduce((s, r) => s + r.ratio, 0)
  return othersSum <= 1
}
