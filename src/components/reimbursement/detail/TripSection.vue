<template>
  <CollapsibleSection title="补录行程">
    <template v-if="!readonly" #extra>
      <span class="link-action" @click="openDialog('add')">
        <el-icon><CirclePlus /></el-icon>
        补录行程
      </span>
    </template>

    <el-table :data="trips" border class="detail-table" empty-text="暂无行程，请点击补录行程">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="出行人员" min-width="150">
        <template #default="{ row }">
          {{ row.reimburserName }}/{{ row.reimburserNo }}
        </template>
      </el-table-column>
      <el-table-column label="出差日期" min-width="220">
        <template #default="{ row }">
          {{ row.departDate }} 至 {{ row.arriveDate }}
        </template>
      </el-table-column>
      <el-table-column label="行程" min-width="140">
        <template #default="{ row }">
          {{ row.departCityName }} - {{ row.arriveCityName }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="行程说明" min-width="160" show-overflow-tooltip />
      <el-table-column
        v-if="!readonly"
        label="操作"
        width="150"
        align="center"
        fixed="right"
      >
        <template #default="{ row }">
          <div class="trip-actions">
            <el-tooltip content="删除" placement="top">
              <el-button link class="action-icon-btn" @click="confirmDelete(row)">
                <el-icon :size="18"><Delete /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button link class="action-icon-btn" @click="openDialog('edit', row)">
                <el-icon :size="18"><EditPen /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="复制" placement="top">
              <el-button link class="action-icon-btn" @click="openDialog('copy', row)">
                <el-icon :size="18"><CopyDocument /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <TripDialog
      v-model="dialogVisible"
      :trip="editingTrip"
      :mode="dialogMode"
      @save="onSave"
    />
  </CollapsibleSection>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CopyDocument, Delete, EditPen, CirclePlus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CollapsibleSection from '@/components/reimbursement/common/CollapsibleSection.vue'
import TripDialog from '@/components/reimbursement/detail/TripDialog.vue'
import type { TripRecord } from '@/types/reimbursement'
import { checkTripOverlap } from '@/utils/validation'

const props = defineProps<{
  trips: TripRecord[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  add: [trip: TripRecord]
  update: [trip: TripRecord]
  remove: [tripId: string]
}>()

const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'copy'>('add')
const editingTrip = ref<TripRecord | null>(null)

function openDialog(mode: 'add' | 'edit' | 'copy', trip?: TripRecord) {
  if (props.readonly) return
  dialogMode.value = mode
  if (mode === 'add') {
    editingTrip.value = null
  } else if (mode === 'copy' && trip) {
    // 复制：预填当前行，保存时生成新 id
    editingTrip.value = { ...trip, id: '' }
  } else if (trip) {
    editingTrip.value = { ...trip }
  } else {
    editingTrip.value = null
  }
  dialogVisible.value = true
}

function onSave(trip: TripRecord) {
  const isEdit = dialogMode.value === 'edit'
  const overlap = checkTripOverlap(props.trips, trip, isEdit ? trip.id : undefined)
  if (overlap) {
    ElMessage.error(overlap)
    return
  }
  if (isEdit) {
    emit('update', trip)
  } else {
    // 新增、复制均插入新行程
    emit('add', trip)
  }
  dialogVisible.value = false
}

async function confirmDelete(trip: TripRecord) {
  if (props.readonly) return
  await ElMessageBox.confirm('确定删除该补录行程吗？', '确认删除', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  })
  emit('remove', trip.id)
}
</script>

<style scoped>
.link-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #1890ff;
  font-size: 14px;
  cursor: pointer;
}

.link-action:hover {
  opacity: 0.85;
}

.trip-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.action-icon-btn {
  padding: 4px;
  color: #1890ff;
}

.action-icon-btn:hover {
  opacity: 0.85;
}
</style>
