<template>
  <CollapsibleSection title="费用归属及分摊" :subtitle="`(分摊金额: ${formatMoney(subsidyTotal)})`">
    <div class="alloc-table-wrap">
      <el-table :data="allocations" border class="detail-table alloc-table">
        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column min-width="200">
          <template #header>
            <span class="col-required">费用归属</span>
          </template>
          <template #default="{ row, $index }">
            <el-select
              :model-value="row.reimCompanyId"
              placeholder="请选择"
              filterable
              clearable
              :disabled="readonly"
              style="width: 100%"
              @update:model-value="(v: string) => onCompanyChange($index, v)"
            >
              <el-option
                v-for="item in companies"
                :key="item.reimCompanyId"
                :label="item.reimCompanyName"
                :value="item.reimCompanyId"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="项目" min-width="200">
          <template #default="{ row, $index }">
            <el-select
              :model-value="row.projectId"
              placeholder="请选择"
              filterable
              clearable
              :disabled="readonly"
              style="width: 100%"
              @update:model-value="(v: string) => onProjectChange($index, v)"
            >
              <el-option
                v-for="item in projects"
                :key="item.projectId"
                :label="item.projectName"
                :value="item.projectId"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column width="150" align="right">
          <template #header>
            <span class="ratio-header">
              <span class="col-required">分摊比例</span>
              <el-icon
                v-if="!readonly"
                class="refresh-icon"
                title="均摊"
                @click.stop="emit('equalize')"
              >
                <Refresh />
              </el-icon>
            </span>
          </template>
          <template #default="{ row, $index }">
            <div class="ratio-input-wrap">
              <el-input-number
                :model-value="Math.round(row.ratio * 10000) / 100"
                :min="0"
                :precision="2"
                :controls="false"
                :disabled="readonly || $index === 0"
                class="ratio-input"
                @update:model-value="(v: number | undefined) => emit('update-ratio', $index, v ?? 0)"
                @blur="onRatioBlur($index)"
              />
              <span class="ratio-suffix">%</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column width="140" align="right">
          <template #header>
            <span class="col-required">分摊金额</span>
          </template>
          <template #default="{ row }">
            <div class="amount-input-wrap">
              <el-input-number
                :model-value="row.amount"
                :min="0"
                :precision="2"
                :controls="false"
                disabled
                class="amount-input"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column v-if="!readonly" label="操作" width="70" align="center">
          <template #default="{ row }">
            <el-tooltip content="删除" placement="top">
              <el-button link class="action-icon-btn" @click="emit('remove-row', row.id)">
                <el-icon :size="18"><Delete /></el-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!readonly" class="add-row-bar">
        <button type="button" class="add-row-btn" @click="emit('add-row')">
          <el-icon><CirclePlus /></el-icon>
          <span>添加一行</span>
        </button>
      </div>

      <div class="alloc-summary-row">
        <span class="summary-label">合计</span>
        <span class="cell-ratio summary-highlight">{{ formatPercent(totalRatio) }}</span>
        <span class="cell-amount summary-highlight">CNY {{ formatMoney(totalAmount) }}</span>
        <span class="cell-action" />
      </div>
    </div>
  </CollapsibleSection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CirclePlus, Delete, Refresh } from '@element-plus/icons-vue'
import CollapsibleSection from '@/components/reimbursement/common/CollapsibleSection.vue'
import { MOCK_COMPANIES, MOCK_PROJECTS } from '@/data/masterData'
import type { AllocationRecord } from '@/types/reimbursement'
import { roundRatio, sumMoney } from '@/utils/money'
import { formatMoney, formatPercent } from '@/utils/subsidy'

const props = defineProps<{
  allocations: AllocationRecord[]
  subsidyTotal: number
  readonly?: boolean
}>()

const emit = defineEmits<{
  'add-row': []
  'remove-row': [id: string]
  equalize: []
  'update-ratio': [index: number, percent: number]
  'validate-ratio-blur': [index: number]
  'update-row': [index: number, row: AllocationRecord]
}>()

function onRatioBlur(index: number) {
  if (index === 0) return
  emit('validate-ratio-blur', index)
}

const companies = MOCK_COMPANIES
const projects = MOCK_PROJECTS

const totalRatio = computed(() =>
  roundRatio(props.allocations.reduce((s, r) => s + r.ratio, 0)),
)

const totalAmount = computed(() =>
  sumMoney(props.allocations.map((r) => r.amount)),
)

function onCompanyChange(index: number, companyId: string) {
  if (props.readonly) return
  const company = companies.find((c) => c.reimCompanyId === companyId)
  if (!company) return
  const row = {
    ...props.allocations[index],
    reimCompanyId: company.reimCompanyId,
    reimCompanyName: company.reimCompanyName,
  }
  emit('update-row', index, row)
}

function onProjectChange(index: number, projectId: string) {
  if (props.readonly) return
  const project = projects.find((p) => p.projectId === projectId)
  if (!project) return
  const row = {
    ...props.allocations[index],
    projectId: project.projectId,
    projectName: project.projectName,
  }
  emit('update-row', index, row)
}
</script>

<style scoped>
.col-required::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

.ratio-header {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.refresh-icon {
  font-size: 14px;
  color: #1890ff;
  cursor: pointer;
  vertical-align: middle;
}

.refresh-icon:hover {
  opacity: 0.85;
}

.ratio-input-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  gap: 4px;
}

.ratio-input {
  width: 90px;
}

.ratio-input :deep(.el-input__inner) {
  text-align: right;
}

.ratio-suffix {
  color: #606266;
  font-size: 14px;
}

.amount-input-wrap {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.amount-input {
  width: 110px;
}

.amount-input :deep(.el-input__inner) {
  text-align: right;
}

.action-icon-btn {
  padding: 4px;
  color: #1890ff;
}

.action-icon-btn:hover {
  opacity: 0.85;
}

.alloc-table-wrap {
  border: 1px solid var(--el-table-border-color);
  border-radius: 0;
}

.alloc-table-wrap :deep(.alloc-table) {
  margin-bottom: 0;
}

.alloc-summary-row {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #fff7e6;
  border-top: 1px solid #ffe7ba;
  font-size: 14px;
  font-weight: 500;
}

.summary-label {
  flex: 1;
  min-width: 0;
  color: #303133;
}

.cell-ratio {
  width: 150px;
  flex-shrink: 0;
  text-align: right;
  padding-right: 12px;
}

.cell-amount {
  width: 140px;
  flex-shrink: 0;
  text-align: right;
  padding-right: 12px;
}

.cell-action {
  width: 70px;
  flex-shrink: 0;
}

.summary-highlight {
  color: #e6a23c;
}

.add-row-bar {
  display: flex;
  justify-content: center;
  padding: 10px 0;
  border-top: 1px solid var(--el-table-border-color);
  background: #fff;
}

.add-row-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: none;
  color: #1890ff;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
}

.add-row-btn:hover {
  opacity: 0.85;
}
</style>
