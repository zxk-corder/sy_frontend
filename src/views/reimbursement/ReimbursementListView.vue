<template>
  <div class="list-page">
    <ReimbursementQueryForm
      :query="query"
      :exporting="exporting"
      @search="search"
      @reset="resetQuery"
      @create="goCreate"
      @export="handleExport"
    />
    <ReimbursementTable
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="page"
      :page-size="pageSize"
      @submit="handleSubmit"
      @view="goDetail"
      @edit="goDetail"
      @delete="handleDelete"
      @push="handlePush"
      @copy="handleCopy"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { cancelReim, getReimDetail, submitReim } from '@/api/reim/main'
import ReimbursementQueryForm from '@/components/reimbursement/list/ReimbursementQueryForm.vue'
import ReimbursementTable from '@/components/reimbursement/list/ReimbursementTable.vue'
import { useReimbursementList } from '@/composables/useReimbursementList'
import {
  DocumentStatus,
  type ReimbursementListItem,
} from '@/types/reimbursement'
import { canSubmitReimbursement } from '@/utils/reimbursementStatus'
import { runReimbursementListExport } from '@/utils/reimbursementExport'

const router = useRouter()
const exporting = ref(false)
const {
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
} = useReimbursementList()

onMounted(() => {
  fetchList()
})

function goCreate() {
  router.push({ name: 'reimbursement-create' })
}

async function handleExport() {
  if (exporting.value) return
  exporting.value = true
  try {
    await runReimbursementListExport(query.value)
  } catch (error) {
    if (error instanceof Error && error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    exporting.value = false
  }
}

function goDetail(id: string) {
  router.push({ name: 'reimbursement-detail', params: { id } })
}

async function handleSubmit(row: ReimbursementListItem) {
  if (!canSubmitReimbursement(row.status)) {
    ElMessage.warning('只有草稿状态的报销单可以提交')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认提交报销单「${row.reimNo}」吗？提交后将不可修改。`,
      '提交确认',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      },
    )
  } catch {
    return
  }

  try {
    const main = await getReimDetail(row.id)
    if (!canSubmitReimbursement(main.reimStatus as DocumentStatus)) {
      ElMessage.warning('报销单状态已变更，请刷新列表后重试')
      await fetchList()
      return
    }
    await submitReim({
      id: row.id,
      version: main.version ?? 0,
    })
    ElMessage.success('提交成功')
    await fetchList()
  } catch {
    /* 错误已由 request 拦截器提示 */
  }
}

async function handleDelete(id: string) {
  try {
    await ElMessageBox.confirm('确定作废该报销单吗？', '确认作废', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }

  try {
    await cancelReim(id)
    ElMessage.success('作废成功')
    await fetchList()
  } catch {
    /* 错误已由 request 拦截器提示 */
  }
}

function handlePush(_id: string) {
  ElMessage.info('手工推送功能待对接 BPM 接口')
}

function handleCopy(id: string) {
  router.push({ name: 'reimbursement-create', query: { copyFrom: id } })
}
</script>

<style scoped>
.list-page {
  max-width: 100%;
  margin: 0 auto;
}
</style>
