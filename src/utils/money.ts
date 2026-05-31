/** 元保留两位小数 */
export function roundMoney(yuan: number): number {
  return Math.round(yuan * 100) / 100
}

/** 元 → 分（整数，避免浮点累加误差） */
export function yuanToCents(yuan: number): number {
  return Math.round(roundMoney(yuan) * 100)
}

/** 分 → 元 */
export function centsToYuan(cents: number): number {
  return cents / 100
}

/** 多个金额求和（在「分」上累加） */
export function sumMoney(values: number[]): number {
  if (values.length === 0) return 0
  const cents = values.reduce((s, v) => s + yuanToCents(v), 0)
  return centsToYuan(cents)
}

/** 两金额相加 */
export function addMoney(a: number, b: number): number {
  return centsToYuan(yuanToCents(a) + yuanToCents(b))
}

/** 按「分」比较是否相等 */
export function moneyEquals(a: number, b: number): boolean {
  return yuanToCents(a) === yuanToCents(b)
}

/** 比例保留四位小数 */
export function roundRatio(ratio: number): number {
  return Math.round(ratio * 10000) / 10000
}

/**
 * 按各行比例分配总额；第一行 = 总额 − 其余各行之和（首行补差，与设计一致）
 */
export function splitAmountByRatio(totalYuan: number, ratios: number[]): number[] {
  const totalCents = yuanToCents(totalYuan)
  const n = ratios.length
  if (n === 0) return []
  if (totalCents === 0) return ratios.map(() => 0)
  if (n === 1) return [centsToYuan(totalCents)]

  const amounts: number[] = new Array(n).fill(0)
  let allocatedCents = 0

  for (let i = 1; i < n; i++) {
    const cents = Math.round(totalCents * ratios[i]!)
    amounts[i] = centsToYuan(cents)
    allocatedCents += cents
  }

  amounts[0] = centsToYuan(totalCents - allocatedCents)
  return amounts
}

export function formatMoney(value: number): string {
  return roundMoney(value).toFixed(2)
}
