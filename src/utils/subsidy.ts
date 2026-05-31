import {
  COMMUNICATION_STANDARD,
  MEAL_STANDARD,
  TRANSPORT_STANDARD,
} from '@/constants/reimbursement'
import { MOCK_CITIES } from '@/data/masterData'
import type { SubsidyDayItem, TripRecord } from '@/types/reimbursement'
import { getDateRange, getWeekdayLabel } from '@/utils/date'
import { formatMoney, roundMoney, sumMoney } from '@/utils/money'

export { formatMoney }

export function getCityType(cityNo: string): string {
  return MOCK_CITIES.find((c) => c.cityNo === cityNo)?.cityType ?? '3'
}

export function getMealStandard(cityNo: string): number {
  const cityType = getCityType(cityNo)
  return MEAL_STANDARD[cityType] ?? 50
}

export function createSubsidyCalendar(
  trip: TripRecord,
): SubsidyDayItem[] {
  const dates = getDateRange(trip.departDate, trip.arriveDate)
  return dates.map((date) => {
    const mealStandard = getMealStandard(trip.arriveCityNo)
    return {
      date,
      weekday: getWeekdayLabel(date),
      cityNo: trip.arriveCityNo,
      cityName: trip.arriveCityName,
      mealChecked: true,
      transportChecked: true,
      communicationChecked: true,
      mealStandard,
      transportStandard: TRANSPORT_STANDARD,
      communicationStandard: COMMUNICATION_STANDARD,
      mealAmount: mealStandard,
      transportAmount: TRANSPORT_STANDARD,
      communicationAmount: COMMUNICATION_STANDARD,
    }
  })
}

export function calcDayApplyAmount(day: SubsidyDayItem): number {
  const parts: number[] = []
  if (day.mealChecked) parts.push(day.mealStandard)
  if (day.transportChecked) parts.push(day.transportStandard)
  if (day.communicationChecked) parts.push(day.communicationStandard)
  return sumMoney(parts)
}

export function calcDaySubsidyAmount(day: SubsidyDayItem): number {
  const parts: number[] = []
  if (day.mealChecked) parts.push(day.mealAmount)
  if (day.transportChecked) parts.push(day.transportAmount)
  if (day.communicationChecked) parts.push(day.communicationAmount)
  return sumMoney(parts)
}

export function calcCalendarTotals(calendar: SubsidyDayItem[]) {
  const applyParts: number[] = []
  const subsidyParts: number[] = []
  const mealParts: number[] = []
  const transportParts: number[] = []
  const communicationParts: number[] = []

  for (const day of calendar) {
    applyParts.push(calcDayApplyAmount(day))
    subsidyParts.push(calcDaySubsidyAmount(day))
    if (day.mealChecked) mealParts.push(roundMoney(day.mealAmount))
    if (day.transportChecked) transportParts.push(roundMoney(day.transportAmount))
    if (day.communicationChecked) {
      communicationParts.push(roundMoney(day.communicationAmount))
    }
  }

  return {
    applyAmount: sumMoney(applyParts),
    subsidyAmount: sumMoney(subsidyParts),
    mealTotal: sumMoney(mealParts),
    transportTotal: sumMoney(transportParts),
    communicationTotal: sumMoney(communicationParts),
  }
}

export function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(2)}%`
}
