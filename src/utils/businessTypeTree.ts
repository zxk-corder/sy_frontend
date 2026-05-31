import type { BusinessType } from '@/types/reimbursement'

export interface BusinessTypeTreeNode {
  value: string
  label: string
  children?: BusinessTypeTreeNode[]
}

export function buildBusinessTypeTree(types: BusinessType[]): BusinessTypeTreeNode[] {
  const map = new Map<string, BusinessTypeTreeNode>()
  const roots: BusinessTypeTreeNode[] = []

  for (const t of types) {
    map.set(t.businessTypeId, {
      value: t.businessTypeId,
      label: t.businessTypeName,
      children: t.thereSubordinateNode === '1' ? [] : undefined,
    })
  }

  for (const t of types) {
    const node = map.get(t.businessTypeId)!
    if (t.superiorId === 'none') {
      roots.push(node)
    } else {
      const parent = map.get(t.superiorId)
      if (parent?.children) {
        parent.children.push(node)
      }
    }
  }

  const prune = (nodes: BusinessTypeTreeNode[]) => {
    for (const n of nodes) {
      if (n.children?.length === 0) delete n.children
      else if (n.children) prune(n.children)
    }
  }
  prune(roots)
  return roots
}
