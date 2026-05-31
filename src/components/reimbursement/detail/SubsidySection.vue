<template>
  <CollapsibleSection title="补助信息" :subtitle="headerSummary">
    <div class="subsidy-tip">
      <el-icon class="subsidy-tip-icon"><InfoFilled /></el-icon>
      <span class="subsidy-tip-text">{{ SUBSIDY_SECTION_TIP_TEXT }}</span>
    </div>

    <el-table :data="subsidies" border class="detail-table" empty-text="请先添加补录行程">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="reimburserName" label="出行人" width="100" />
      <el-table-column label="出差日期" min-width="220">
        <template #default="{ row }">
          {{ formatTripDate(row) }}
        </template>
      </el-table-column>
      <el-table-column prop="subsidyDays" label="补助天数" width="90" align="center" />
      <el-table-column prop="route" label="行程" min-width="120" />
      <el-table-column prop="subsidyCityName" label="补助城市" width="100" />
      <el-table-column label="申请金额" width="110" align="right">
        <template #default="{ row }">
          <AmountText :value="row.applyAmount" />
        </template>
      </el-table-column>
      <el-table-column label="补助金额" width="110" align="right">
        <template #default="{ row }">
          <AmountText :value="row.subsidyAmount" />
        </template>
      </el-table-column>
      <el-table-column
        v-if="!readonly"
        label="操作"
        width="70"
        align="center"
        fixed="right"
      >
        <template #default="{ row }">
          <el-tooltip content="编辑" placement="top">
            <el-button link class="action-icon-btn" @click="openCalendar(row)">
              <el-icon :size="18"><EditPen /></el-icon>
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <SubsidyCalendarDialog
      v-model="dialogVisible"
      :subsidy="editingSubsidy"
      @save="emit('update', $event)"
    />
  </CollapsibleSection>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { EditPen, InfoFilled } from '@element-plus/icons-vue'
import AmountText from '@/components/reimbursement/common/AmountText.vue'
import CollapsibleSection from '@/components/reimbursement/common/CollapsibleSection.vue'
import SubsidyCalendarDialog from '@/components/reimbursement/detail/SubsidyCalendarDialog.vue'
import { SUBSIDY_SECTION_TIP_TEXT } from '@/constants/reimbursement'
import type { SubsidyRecord } from '@/types/reimbursement'
import { sumMoney } from '@/utils/money'
import { formatMoney } from '@/utils/subsidy'

const props = defineProps<{
  subsidies: SubsidyRecord[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  update: [subsidy: SubsidyRecord]
}>()

const dialogVisible = ref(false)
const editingSubsidy = ref<SubsidyRecord | null>(null)

const headerSummary = computed(() => {
  if (props.subsidies.length === 0) return '0.00'
  const total = sumMoney(props.subsidies.map((item) => item.subsidyAmount))
  const first = props.subsidies[0]
  const days = props.subsidies.reduce((s, item) => s + item.subsidyDays, 0)
  return `${formatMoney(total)} (${first.reimburserName}:${days}天)`
})

function formatTripDate(row: SubsidyRecord) {
  return `${row.departDate} 至 ${row.arriveDate}`
}

function openCalendar(row: SubsidyRecord) {
  if (props.readonly) return
  editingSubsidy.value = row
  dialogVisible.value = true
}
</script>

<style scoped>
.subsidy-tip {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
  padding: 12px 16px;
  background: #fdf6ec;
  border: 1px solid #faecd8;
  border-radius: 4px;
}

.subsidy-tip-icon {
  flex-shrink: 0;
  margin-top: 2px;
  font-size: 16px;
  color: #e6a23c;
}

.subsidy-tip-text {
  flex: 1;
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}

.action-icon-btn {
  padding: 4px;
  color: #1890ff;
}

.action-icon-btn:hover {
  opacity: 0.85;
}
</style>
