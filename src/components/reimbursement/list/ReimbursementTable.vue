<template>
  <div class="table-wrap">
    <el-table
      v-loading="loading"
      :data="data"
      border
      stripe
      size="small"
      table-layout="fixed"
      class="list-table"
    >
      <el-table-column label="" width="44" align="center">
        <template #header>
          <div class="index-list-icon-header">
            <img :src="listIcon" alt="列表" class="index-list-icon" />
          </div>
        </template>
        <template #default="{ $index }">
          {{ indexMethod($index) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="96" align="center">
        <template #default="{ row }: { row: ReimbursementListItem }">
          <ListRowActions
            :editable="canSubmitReimbursement(row.status)"
            :submittable="canSubmitReimbursement(row.status)"
            @submit="emit('submit', row)"
            @edit="emit('edit', row.id)"
            @delete="emit('delete', row.id)"
            @push="emit('push', row.id)"
            @copy="emit('copy', row.id)"
          />
        </template>
      </el-table-column>
      <el-table-column label="报销单号" width="158" show-overflow-tooltip>
        <template #default="{ row }">
          <el-button link type="primary" class="cell-link" @click="emit('view', row.id)">
            {{ row.reimNo }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="单据状态" width="76" align="center">
        <template #default="{ row }: { row: ReimbursementListItem }">
          <el-tag :type="statusMeta(row.status).type" size="small">
            {{ statusMeta(row.status).label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="documentType"
        label="单据类型"
        width="92"
        show-overflow-tooltip
      />
      <el-table-column label="报销人" min-width="62" show-overflow-tooltip>
        <template #default="{ row }">
          {{ formatListReimburser(row.reimburserName, row.reimburserNo) }}
        </template>
      </el-table-column>
      <el-table-column label="报销部门" min-width="80" show-overflow-tooltip>
        <template #default="{ row }">
          {{ formatListDepartment(row.reimDepartmentName, row.reimDepartmentNo) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="reimCompanyName"
        label="费用归属公司"
        min-width="88"
        show-overflow-tooltip
      />
      <el-table-column
        prop="businessTypeName"
        label="业务类型"
        width="80"
        show-overflow-tooltip
      />
      <el-table-column label="报销标题" min-width="96" show-overflow-tooltip>
        <template #default="{ row }">
          <el-button link type="primary" class="cell-link" @click="emit('view', row.id)">
            {{ row.title }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        prop="reason"
        label="报销事由"
        min-width="88"
        show-overflow-tooltip
      />
      <el-table-column label="补助金额" width="96" align="right">
        <template #default="{ row }">
          <AmountText :value="row.subsidyAmount" />
        </template>
      </el-table-column>
      <el-table-column
        prop="createdAt"
        label="创建时间"
        width="108"
        show-overflow-tooltip
      />
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="currentPageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="emit('page-change', $event)"
        @size-change="emit('size-change', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import listIcon from '@/assets/operation_icon/list.svg'
import AmountText from '@/components/reimbursement/common/AmountText.vue'
import ListRowActions from '@/components/reimbursement/list/ListRowActions.vue'
import { DOCUMENT_STATUS_MAP } from '@/constants/reimbursement'
import type { ReimbursementListItem } from '@/types/reimbursement'
import {
  formatListDepartment,
  formatListReimburser,
} from '@/utils/reimbursementListFormat'
import { canSubmitReimbursement } from '@/utils/reimbursementStatus'

const props = defineProps<{
  data: ReimbursementListItem[]
  loading?: boolean
  total: number
  page: number
  pageSize: number
}>()

const emit = defineEmits<{
  submit: [row: ReimbursementListItem]
  view: [id: string]
  edit: [id: string]
  delete: [id: string]
  push: [id: string]
  copy: [id: string]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const currentPage = computed({
  get: () => props.page,
  set: (v) => emit('page-change', v),
})

const currentPageSize = computed({
  get: () => props.pageSize,
  set: (v) => emit('size-change', v),
})

function statusMeta(status: ReimbursementListItem['status']) {
  return DOCUMENT_STATUS_MAP[status]
}

function indexMethod(index: number) {
  return (props.page - 1) * props.pageSize + index + 1
}
</script>

<style scoped>
.table-wrap {
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  max-width: 100%;
  overflow: hidden;
}

.list-table {
  width: 100%;
}

.list-table :deep(.el-table__cell .cell) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-table :deep(.cell-link) {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

.list-table :deep(.cell-link > span) {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.table-wrap :deep(.el-table__header th:first-child .cell) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.index-list-icon-header {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.index-list-icon {
  display: block;
  width: 18px;
  height: 18px;
}
</style>
