/** 列表「报销人」：有姓名/工号才展示，避免出现空 [] */
export function formatListReimburser(name?: string, no?: string): string {
  const n = name?.trim() ?? ''
  const num = no?.trim() ?? ''
  if (n && num) return `${n}[${num}]`
  if (n) return n
  if (num) return num
  return ''
}

/** 列表「报销部门」：有编号/名称才展示，避免出现空 [] */
export function formatListDepartment(name?: string, no?: string): string {
  const n = name?.trim() ?? ''
  const num = no?.trim() ?? ''
  if (num && n) return `[${num}]${n}`
  if (n) return n
  if (num) return num
  return ''
}
