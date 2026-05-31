import { DocumentStatus } from '@/types/reimbursement'
import type { ReimbursementListItem } from '@/types/reimbursement'

const BASE_ITEMS: Omit<ReimbursementListItem, 'id' | 'reimNo'>[] = [
  {
    documentType: '差旅报销单',
    status: DocumentStatus.Draft,
    reimburserId: '13AB3A3F72409002',
    reimburserName: '徐年年',
    reimburserNo: '74541',
    reimDepartmentId: '13AB8D7B52A9B002',
    reimDepartmentName: '客户成功事业部',
    reimDepartmentNo: '072001',
    reimCompanyId: '1C61686865DA8000',
    reimCompanyName: '胜意科技武汉分公司',
    businessTypeId: '1B5FEB7DD4396000',
    businessTypeName: '项目出差',
    title: '武汉-北京项目出差报销',
    reason: '参与华北客户项目现场实施',
    subsidyAmount: 1280,
    createdAt: '2025-05-20',
  },
  {
    documentType: '差旅报销单',
    status: DocumentStatus.Completed,
    reimburserId: '13AB498CC6409002',
    reimburserName: '郑雨雪',
    reimburserNo: '74008',
    reimDepartmentId: '14515BB4BFB92003',
    reimDepartmentName: '企业费控事业部',
    reimDepartmentNo: '072003',
    reimCompanyId: '1C54557F1782E000',
    reimCompanyName: '胜意科技北京分公司',
    businessTypeId: '1A92E43082EFC000',
    businessTypeName: '市场拓展出差',
    title: '上海市场拓展差旅',
    reason: '参加行业展会及客户拜访',
    subsidyAmount: 2160,
    createdAt: '2025-05-18',
  },
  {
    documentType: '日常报销单',
    status: DocumentStatus.Voided,
    reimburserId: '13AB591FE8009002',
    reimburserName: '王成军',
    reimburserNo: '80681',
    reimDepartmentId: '14055D22BB808001',
    reimDepartmentName: '营销事业部',
    reimDepartmentNo: '072007',
    reimCompanyId: '19218A262C976000',
    reimCompanyName: '胜意科技上海分公司',
    businessTypeId: '13AB3A418F808001',
    businessTypeName: '个人团队培训',
    title: '杭州培训差旅（已作废）',
    reason: '团队培训出差',
    subsidyAmount: 560,
    createdAt: '2025-05-10',
  },
  {
    documentType: '日常报销单',
    status: DocumentStatus.Completed,
    reimburserId: '13AB4A56BB009002',
    reimburserName: '邹薇',
    reimburserNo: '21552',
    reimDepartmentId: '13BFD31C6029A002',
    reimDepartmentName: '企业消费事业部',
    reimDepartmentNo: '072002',
    reimCompanyId: '1C54557F1782E000',
    reimCompanyName: '胜意科技北京分公司',
    businessTypeId: '1B5FEB7DD4396000',
    businessTypeName: '项目出差',
    title: '日常办公用品采购',
    reason: '办公耗材采购报销',
    subsidyAmount: 0,
    createdAt: '2025-05-15',
  },
  {
    documentType: '差旅报销单',
    status: DocumentStatus.Draft,
    reimburserId: '13AB77281A408001',
    reimburserName: '潘展飞',
    reimburserNo: '89899',
    reimDepartmentId: '19206611C47A6000',
    reimDepartmentName: '集采事业部',
    reimDepartmentNo: '072004',
    reimCompanyId: '1717271D1DA15000',
    reimCompanyName: '胜意科技杭州分公司',
    businessTypeId: '1A92E43082EFC000',
    businessTypeName: '市场拓展出差',
    title: '杭州客户拜访差旅',
    reason: '华东区域客户维护',
    subsidyAmount: 880,
    createdAt: '2025-05-14',
  },
]

function buildMockList(): ReimbursementListItem[] {
  const list: ReimbursementListItem[] = []
  for (let i = 0; i < 39; i++) {
    const base = BASE_ITEMS[i % BASE_ITEMS.length]
    const seq = String(i + 1).padStart(3, '0')
    list.push({
      ...base,
      id: String(i + 1),
      reimNo: `RCBX20260515${seq}`,
      subsidyAmount: base.subsidyAmount + (i % 5) * 100,
    })
  }
  return list
}

export const MOCK_REIMBURSEMENT_LIST: ReimbursementListItem[] = buildMockList()
