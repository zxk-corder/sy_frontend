import { ref } from 'vue'
import { queryReimPageList } from '@/api/reim/main'
import type { ReimbursementListItem, ReimbursementQuery } from '@/types/reimbursement'
import { toListItem, toPageQueryParams } from '@/utils/reimbursementApiMapper'

export function useReimbursementList() {
  const query = ref<ReimbursementQuery>({})
  const tableData = ref<ReimbursementListItem[]>([])
  const loading = ref(false)
  const page = ref(1)
  const pageSize = ref(10)
  const total = ref(0)

  async function fetchList() {
    loading.value = true
    try {
      const result = await queryReimPageList(
        toPageQueryParams(query.value, page.value, pageSize.value),
      )
      tableData.value = (result.records ?? []).map(toListItem)
      total.value = result.total ?? 0
    } catch {
      tableData.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  function search() {
    page.value = 1
    return fetchList()
  }

  function resetQuery() {
    query.value = {}
  }

  function handlePageChange(newPage: number) {
    page.value = newPage
    return fetchList()
  }

  function handleSizeChange(newSize: number) {
    pageSize.value = newSize
    page.value = 1
    return fetchList()
  }

  return {
    query,
    tableData,
    loading,
    page,
    pageSize,
    total,
    search,
    resetQuery,
    handlePageChange,
    handleSizeChange,
    fetchList,
  }
}
