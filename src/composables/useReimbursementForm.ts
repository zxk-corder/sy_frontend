import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentStatus } from '@/types/reimbursement'
import type { ReimbursementForm, SubsidyRecord, TripRecord } from '@/types/reimbursement'
import {
  MOCK_BUSINESS_TYPES,
  MOCK_COMPANIES,
  MOCK_DEPARTMENTS,
  MOCK_EMPLOYEES,
} from '@/data/masterData'
import { todayString } from '@/utils/date'
import { generateId } from '@/utils/id'
import {
  createSubsidyCalendar,
  calcCalendarTotals,
} from '@/utils/subsidy'
import {
  applyAllocationRatioUpdate,
  equalizeAllocation,
  recalcFirstRowRatio,
  syncAllocationAmounts,
} from '@/utils/allocation'
import { getDaysBetween } from '@/utils/date'
import { moneyEquals, roundMoney, roundRatio, sumMoney } from '@/utils/money'
import type { SubsidyDayItem } from '@/types/reimbursement'

function createEmptyForm(): ReimbursementForm {
  return {
    status: DocumentStatus.Draft,
    documentDate: todayString(),
    title: '',
    reason: '',
    reimburserId: '',
    reimburserName: '',
    reimburserNo: '',
    reimDepartmentId: '',
    reimDepartmentName: '',
    reimDepartmentNo: '',
    reimCompanyId: '',
    reimCompanyName: '',
    businessTypeId: '',
    businessTypeName: '',
    trips: [],
    subsidies: [],
    allocations: [
      {
        id: generateId('alloc'),
        reimCompanyId: '',
        reimCompanyName: '',
        projectId: '',
        projectName: '',
        ratio: 1,
        amount: 0,
      },
    ],
    remark: '',
  }
}

export function useReimbursementForm() {
  const form = ref<ReimbursementForm>(createEmptyForm())

  const subsidyTotal = computed(() =>
    sumMoney(form.value.subsidies.map((item) => item.subsidyAmount)),
  )

  /** 按当前比例与补助总额重算各行分摊金额 */
  function syncAllocationAmountsFromRatios() {
    if (form.value.allocations.length === 0) return
    form.value.allocations = syncAllocationAmounts(
      recalcFirstRowRatio(form.value.allocations),
      subsidyTotal.value,
    )
  }

  watch(subsidyTotal, () => {
    syncAllocationAmountsFromRatios()
  })

  const expenseSummary = computed(() => {
    const mealParts: number[] = []
    const transportParts: number[] = []
    const communicationParts: number[] = []
    for (const sub of form.value.subsidies) {
      for (const day of sub.calendar) {
        if (day.mealChecked) mealParts.push(day.mealAmount)
        if (day.transportChecked) transportParts.push(day.transportAmount)
        if (day.communicationChecked) communicationParts.push(day.communicationAmount)
      }
    }
    return {
      total: subsidyTotal.value,
      meal: sumMoney(mealParts),
      transport: sumMoney(transportParts),
      communication: sumMoney(communicationParts),
    }
  })

  function syncAllocationFromSubsidy() {
    syncAllocationAmountsFromRatios()
  }

  function buildSubsidyFromTrip(trip: TripRecord): SubsidyRecord {
    const calendar = createSubsidyCalendar(trip)
    const totals = calcCalendarTotals(calendar)
    const days = getDaysBetween(trip.departDate, trip.arriveDate)
    const bt = MOCK_BUSINESS_TYPES.find((b) => b.businessTypeId === form.value.businessTypeId)

    return {
      id: generateId('sub'),
      tripId: trip.id,
      reimburserId: trip.reimburserId,
      reimburserName: trip.reimburserName,
      tripDateRange: `${trip.departDate} ~ ${trip.arriveDate}`,
      subsidyDays: days,
      route: `${trip.departCityName}-${trip.arriveCityName}`,
      subsidyCityName: trip.arriveCityName,
      applyAmount: totals.applyAmount,
      subsidyAmount: totals.subsidyAmount,
      businessTypeId: form.value.businessTypeId,
      businessTypeName: bt?.businessTypeName ?? form.value.businessTypeName,
      departDate: trip.departDate,
      arriveDate: trip.arriveDate,
      departCityName: trip.departCityName,
      arriveCityName: trip.arriveCityName,
      calendar,
    }
  }

  function addTrip(trip: TripRecord) {
    form.value.trips.push(trip)
    form.value.subsidies.push(buildSubsidyFromTrip(trip))
    syncAllocationFromSubsidy()
  }

  function updateTrip(trip: TripRecord) {
    const idx = form.value.trips.findIndex((t) => t.id === trip.id)
    if (idx >= 0) {
      form.value.trips[idx] = trip
      const subIdx = form.value.subsidies.findIndex((s) => s.tripId === trip.id)
      if (subIdx >= 0) {
        form.value.subsidies[subIdx] = buildSubsidyFromTrip(trip)
      }
      syncAllocationFromSubsidy()
    }
  }

  function removeTrip(tripId: string) {
    form.value.trips = form.value.trips.filter((t) => t.id !== tripId)
    form.value.subsidies = form.value.subsidies.filter((s) => s.tripId !== tripId)
    syncAllocationFromSubsidy()
  }

  function updateSubsidy(subsidy: SubsidyRecord) {
    const idx = form.value.subsidies.findIndex((s) => s.id === subsidy.id)
    if (idx >= 0) {
      const totals = calcCalendarTotals(subsidy.calendar)
      form.value.subsidies[idx] = {
        ...subsidy,
        applyAmount: totals.applyAmount,
        subsidyAmount: totals.subsidyAmount,
      }
      syncAllocationFromSubsidy()
    }
  }

  function addAllocationRow() {
    form.value.allocations.push({
      id: generateId('alloc'),
      reimCompanyId: '',
      reimCompanyName: '',
      projectId: '',
      projectName: '',
      ratio: 0,
      amount: 0,
    })
    form.value.allocations = recalcFirstRowRatio(form.value.allocations)
    syncAllocationFromSubsidy()
  }

  function removeAllocationRow(id: string) {
    if (form.value.allocations.length <= 1) return false
    form.value.allocations = form.value.allocations.filter((a) => a.id !== id)
    if (form.value.allocations.length === 1) {
      form.value.allocations[0].ratio = 1
    } else {
      form.value.allocations = recalcFirstRowRatio(form.value.allocations)
    }
    syncAllocationFromSubsidy()
    return true
  }

  function equalizeAllocations() {
    form.value.allocations = equalizeAllocation(
      form.value.allocations,
      subsidyTotal.value,
    )
  }

  function resetAllocationRatioToZero(index: number) {
    if (index <= 0) return
    form.value.allocations = applyAllocationRatioUpdate(
      form.value.allocations,
      index,
      0,
      subsidyTotal.value,
    )
  }

  /** 比例存小数 (0.5)；兼容误存为百分数 (50) */
  function normalizeRatioDecimal(ratio: number): number {
    if (!Number.isFinite(ratio)) return 0
    return ratio > 1 ? roundRatio(ratio / 100) : roundRatio(ratio)
  }

  function updateAllocationRatio(index: number, ratioPercent: number) {
    if (index === 0) return
    form.value.allocations = applyAllocationRatioUpdate(
      form.value.allocations,
      index,
      roundRatio(ratioPercent / 100),
      subsidyTotal.value,
    )
  }

  function validateAllocationRatioOnBlur(index: number) {
    if (index === 0) return
    const ratioDecimal = normalizeRatioDecimal(form.value.allocations[index].ratio)
    const ratioPercent = Math.round(ratioDecimal * 10000) / 100

    if (ratioPercent > 100) {
      ElMessage.warning({ message: '分摊比例不能大于100%', duration: 4000 })
      resetAllocationRatioToZero(index)
      return
    }

    const previewRows = [...form.value.allocations]
    previewRows[index] = { ...previewRows[index]!, ratio: ratioDecimal }
    const othersRatioSum = roundRatio(
      previewRows.slice(1).reduce((s, r) => s + (r.ratio || 0), 0),
    )
    if (othersRatioSum > 1) {
      ElMessage.warning({ message: '分摊比例合计不能大于100%', duration: 4000 })
      resetAllocationRatioToZero(index)
      return
    }

    let rows = applyAllocationRatioUpdate(
      form.value.allocations,
      index,
      ratioDecimal,
      subsidyTotal.value,
    )
    const totalAmount = sumMoney(rows.map((r) => r.amount))
    if (totalAmount > subsidyTotal.value && !moneyEquals(totalAmount, subsidyTotal.value)) {
      ElMessage.warning({
        message: '分摊金额合计不能大于补助总金额',
        duration: 4000,
      })
      resetAllocationRatioToZero(index)
      return
    }

    form.value.allocations = rows
  }

  function normalizeDayAmounts(day: SubsidyDayItem): SubsidyDayItem {
    return {
      ...day,
      mealAmount: roundMoney(day.mealAmount),
      transportAmount: roundMoney(day.transportAmount),
      communicationAmount: roundMoney(day.communicationAmount),
    }
  }

  function normalizeFormMoney(data: ReimbursementForm): ReimbursementForm {
    const subsidies = data.subsidies.map((sub) => {
      const calendar = sub.calendar.map(normalizeDayAmounts)
      const totals = calcCalendarTotals(calendar)
      return {
        ...sub,
        calendar,
        applyAmount: totals.applyAmount,
        subsidyAmount: totals.subsidyAmount,
      }
    })
    const total = sumMoney(subsidies.map((s) => s.subsidyAmount))
    const allocations = syncAllocationAmounts(
      recalcFirstRowRatio(data.allocations),
      total,
    )
    return { ...data, subsidies, allocations }
  }

  function setDepartment(deptId: string) {
    if (!deptId) {
      form.value.reimDepartmentId = ''
      form.value.reimDepartmentName = ''
      form.value.reimDepartmentNo = ''
      return
    }
    const dept = MOCK_DEPARTMENTS.find((d) => d.reimDepartmentId === deptId)
    if (dept) {
      form.value.reimDepartmentId = dept.reimDepartmentId
      form.value.reimDepartmentName = dept.reimDepartmentName
      form.value.reimDepartmentNo = dept.reimDepartmentNo
    }
  }

  function setReimburser(empId: string) {
    if (!empId) {
      form.value.reimburserId = ''
      form.value.reimburserName = ''
      form.value.reimburserNo = ''
      setDepartment('')
      return
    }
    const emp = MOCK_EMPLOYEES.find((e) => e.reimburserId === empId)
    if (!emp) return

    form.value.reimburserId = emp.reimburserId
    form.value.reimburserName = emp.reimburserName
    form.value.reimburserNo = emp.reimburserNo
    setDepartment(emp.reimDepartmentId)
  }

  function setCompany(companyId: string) {
    const company = MOCK_COMPANIES.find((c) => c.reimCompanyId === companyId)
    if (company) {
      form.value.reimCompanyId = company.reimCompanyId
      form.value.reimCompanyName = company.reimCompanyName
    }
  }

  function setBusinessType(typeId: string) {
    const bt = MOCK_BUSINESS_TYPES.find((b) => b.businessTypeId === typeId)
    if (bt) {
      form.value.businessTypeId = bt.businessTypeId
      form.value.businessTypeName = bt.businessTypeName
      form.value.subsidies = form.value.subsidies.map((s) => ({
        ...s,
        businessTypeId: bt.businessTypeId,
        businessTypeName: bt.businessTypeName,
      }))
    }
  }

  function resetForm() {
    form.value = createEmptyForm()
  }

  function loadForm(data: ReimbursementForm) {
    const cloned = JSON.parse(JSON.stringify(data)) as ReimbursementForm
    form.value = normalizeFormMoney(cloned)
  }

  return {
    form,
    subsidyTotal,
    expenseSummary,
    addTrip,
    updateTrip,
    removeTrip,
    updateSubsidy,
    addAllocationRow,
    removeAllocationRow,
    equalizeAllocations,
    updateAllocationRatio,
    validateAllocationRatioOnBlur,
    setReimburser,
    setDepartment,
    setCompany,
    setBusinessType,
    resetForm,
    loadForm,
    syncAllocationFromSubsidy,
  }
}
