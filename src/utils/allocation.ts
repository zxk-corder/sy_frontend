import type { AllocationRecord } from '@/types/reimbursement'
import {
  centsToYuan,
  roundMoney,
  roundRatio,
  splitAmountByRatio,
  sumMoney,
  yuanToCents,
} from '@/utils/money'

function applyAmounts(
  rows: AllocationRecord[],
  ratios: number[],
  amounts: number[],
): AllocationRecord[] {
  return rows.map((row, index) => ({
    ...row,
    ratio: ratios[index]!,
    amount: amounts[index]!,
  }))
}

/** 均摊比例与金额（第一行承担比例与金额补差） */
export function equalizeAllocation(
  rows: AllocationRecord[],
  totalAmount: number,
): AllocationRecord[] {
  const n = rows.length
  if (n === 0) return rows

  const baseRatio = Math.floor(10000 / n) / 10000
  const remainder = roundRatio(1 - baseRatio * (n - 1))
  const ratios = rows.map((_, index) => (index === 0 ? remainder : baseRatio))
  const amounts = splitAmountByRatio(totalAmount, ratios)

  return applyAmounts(rows, ratios, amounts)
}

/** 根据第2+行比例重算第1行 */
export function recalcFirstRowRatio(rows: AllocationRecord[]): AllocationRecord[] {
  if (rows.length <= 1) {
    return rows.map((r, i) =>
      i === 0 ? { ...r, ratio: 1, amount: r.amount } : r,
    )
  }

  const othersSum = roundRatio(
    rows.slice(1).reduce((s, r) => s + (r.ratio || 0), 0),
  )
  if (othersSum > 1) {
    return rows.map((r, i) => (i > 0 ? { ...r, ratio: 0 } : r))
  }

  const firstRatio = roundRatio(1 - othersSum)
  return rows.map((r, i) => (i === 0 ? { ...r, ratio: firstRatio } : r))
}

/** 根据比例更新各行金额（第一行金额补差） */
export function syncAllocationAmounts(
  rows: AllocationRecord[],
  totalAmount: number,
): AllocationRecord[] {
  if (rows.length === 0) return rows
  const ratios = rows.map((r) => r.ratio)
  const amounts = splitAmountByRatio(totalAmount, ratios)
  return rows.map((row, index) => ({
    ...row,
    amount: amounts[index]!,
  }))
}

/** 按总额与比例计算单行分摊金额（分上取整） */
export function amountFromRatio(totalAmount: number, ratio: number): number {
  const totalCents = yuanToCents(totalAmount)
  if (totalCents === 0) return 0
  return centsToYuan(Math.round(totalCents * roundRatio(ratio)))
}

/**
 * 修改第 2+ 行比例：重算该行金额 + 第 1 行比例与金额（其余行不变）
 */
export function applyAllocationRatioUpdate(
  rows: AllocationRecord[],
  index: number,
  ratio: number,
  totalAmount: number,
): AllocationRecord[] {
  if (index <= 0 || index >= rows.length) return rows

  const total = roundMoney(totalAmount)
  const ratioDecimal = roundRatio(ratio)

  const next = [...rows]
  next[index] = {
    ...next[index]!,
    ratio: ratioDecimal,
    amount: amountFromRatio(total, ratioDecimal),
  }

  const withRatio = recalcFirstRowRatio(next)
  return recalcFirstRowAmount(withRatio, total)
}

/** 根据第 2+ 行金额重算第一行分摊金额 */
export function recalcFirstRowAmount(
  rows: AllocationRecord[],
  totalAmount: number,
): AllocationRecord[] {
  if (rows.length === 0) return rows

  const totalCents = yuanToCents(totalAmount)
  if (rows.length === 1) {
    return [{ ...rows[0]!, amount: centsToYuan(totalCents) }]
  }

  const othersCents = rows
    .slice(1)
    .reduce((s, r) => s + yuanToCents(r.amount), 0)
  const firstAmount = centsToYuan(totalCents - othersCents)

  return rows.map((row, index) =>
    index === 0 ? { ...row, amount: firstAmount } : row,
  )
}

/** 修改第 2+ 行分摊金额后反算比例，并重算第一行 */
export function applyAllocationAmountUpdate(
  rows: AllocationRecord[],
  index: number,
  amount: number,
  totalAmount: number,
): AllocationRecord[] {
  if (index <= 0 || index >= rows.length) return rows

  const total = roundMoney(totalAmount)
  if (total <= 0) {
    const cleared = [...rows]
    cleared[index] = { ...cleared[index]!, amount: 0, ratio: 0 }
    return recalcFirstRowAmount(recalcFirstRowRatio(cleared), 0)
  }

  const othersAmount = sumMoney(
    rows.filter((_, i) => i > 0 && i !== index).map((r) => r.amount),
  )
  const maxAmount = centsToYuan(
    yuanToCents(total) - yuanToCents(othersAmount),
  )

  let newAmount = roundMoney(amount)
  if (newAmount > maxAmount) {
    newAmount = 0
  }

  let ratio = roundRatio(newAmount / total)
  const next = [...rows]
  next[index] = { ...next[index]!, amount: newAmount, ratio }

  const othersRatioSum = roundRatio(
    next.slice(1).reduce((s, r) => s + (r.ratio || 0), 0),
  )
  if (othersRatioSum > 1) {
    next[index] = { ...next[index]!, amount: 0, ratio: 0 }
  }

  const withRatio = recalcFirstRowRatio(next)
  return recalcFirstRowAmount(withRatio, total)
}
