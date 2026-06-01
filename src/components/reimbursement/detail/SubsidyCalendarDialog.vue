<template>
  <el-dialog
    v-model="visible"
    title="补助日历"
    width="1000px"
    class="subsidy-calendar-dialog"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <div v-if="subsidy" class="calendar-layout">
      <!-- 顶栏：出差类型 | 出差补助 | 全选 同一行 -->
      <div class="calendar-top-bar">
        <div class="calendar-top-left">
          <span class="trip-type-label">出差类型</span>
          <span class="trip-type-value">{{ subsidy.businessTypeName }}</span>
        </div>
        <span class="calendar-top-title">出差补助</span>
        <el-checkbox
          class="calendar-top-checkall"
          :model-value="isAllChecked"
          :indeterminate="isAllIndeterminate"
          @change="toggleAll"
        >
          全选
        </el-checkbox>
      </div>

      <div class="calendar-body">
        <!-- 左侧：上下两块带边框 -->
        <aside class="calendar-aside">
          <div class="aside-panel aside-panel--trip">
            <div class="trip-timeline">
              <div class="trip-timeline-row">
                <span class="trip-timeline-label">开始日期</span>
                <div class="trip-timeline-axis">
                  <span class="trip-timeline-dot" />
                  <span class="trip-timeline-vline" />
                </div>
                <span class="trip-timeline-date">{{ subsidy.departDate }}</span>
              </div>

              <div class="trip-timeline-bar">
                <span class="trip-timeline-bar-label">行程天数</span>
                <span class="trip-timeline-bar-route">
                  {{ subsidy.departCityName }} - {{ subsidy.arriveCityName }}
                </span>
                <span class="trip-timeline-bar-days">{{ subsidy.subsidyDays }}天</span>
              </div>

              <div class="trip-timeline-row">
                <span class="trip-timeline-label">结束日期</span>
                <div class="trip-timeline-axis">
                  <span class="trip-timeline-vline" />
                  <span class="trip-timeline-dot" />
                </div>
                <span class="trip-timeline-date">{{ subsidy.arriveDate }}</span>
              </div>
            </div>
          </div>

          <div class="aside-panel aside-panel--summary">
            <div class="amount-summary-item">
              <span class="amount-summary-label">补助金额</span>
              <span class="amount-summary-currency">CNY</span>
              <span class="amount-summary-value">{{ formatMoney(subsidyTotal) }}</span>
            </div>
            <div class="amount-summary-item">
              <span class="amount-summary-label">标准总额</span>
              <span class="amount-summary-currency">CNY</span>
              <span class="amount-summary-value">{{ formatMoney(standardTotal) }}</span>
            </div>
            <div class="amount-summary-item">
              <span class="amount-summary-label">补助金额</span>
              <span class="amount-summary-currency">CNY</span>
              <span class="amount-summary-value">{{ formatMoney(subsidyTotal) }}</span>
            </div>
          </div>
        </aside>

        <!-- 右侧：仅表格有边框 -->
        <main class="calendar-main">
          <div class="calendar-table-wrap">
            <table class="calendar-table">
            <thead>
              <tr>
                <th class="col-date">出差日期</th>
                <th class="col-city">补助城市</th>
                <th v-for="field in subsidyFields" :key="field.key" class="col-subsidy">
                  <div class="th-subsidy">
                    <span class="th-subsidy-label">{{ field.label }}</span>
                    <el-checkbox
                      :model-value="isRowAllChecked(field.key)"
                      :indeterminate="isRowIndeterminate(field.key)"
                      @change="(v: boolean) => toggleRow(field.key, v)"
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(day, rowIdx) in localCalendar" :key="day.date">
                <td class="col-date">
                  <div class="date-cell">
                    <div class="date-cell-main">
                      <div class="date-cell-date">{{ day.date }}</div>
                      <div class="date-cell-weekday-row">
                        <span class="date-cell-weekday">{{ day.weekday }}</span>
                        <el-checkbox
                          :model-value="isDayAllChecked(rowIdx)"
                          :indeterminate="isDayIndeterminate(rowIdx)"
                          @change="(v: boolean) => toggleDay(rowIdx, v)"
                        />
                      </div>
                    </div>
                    <el-icon class="date-cell-pin"><Location /></el-icon>
                  </div>
                </td>
                <td class="col-city">{{ day.cityName }}</td>
                <td v-for="field in subsidyFields" :key="`${day.date}-${field.key}`" class="col-subsidy">
                  <div class="subsidy-cell">
                    <div class="subsidy-standard">
                      CNY {{ formatMoney(getStandard(day, field.key)) }} / 天
                    </div>
                    <div class="subsidy-input-wrap">
                      <el-checkbox
                        :model-value="getChecked(day, field.key)"
                        @change="(v: boolean) => setChecked(rowIdx, field.key, v)"
                      />
                      <el-input-number
                        :model-value="getAmount(day, field.key)"
                        :precision="2"
                        :controls="false"
                        :disabled="!getChecked(day, field.key)"
                        class="subsidy-input"
                        @update:model-value="(v: number | undefined) => onAmountInput(rowIdx, field.key, v)"
                        @blur="validateAmountOnBlur(rowIdx, field.key)"
                      />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button class="btn-footer btn-cancel" @click="visible = false">取消</el-button>
        <el-button type="primary" class="btn-footer" @click="handleSave">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Location } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { SubsidyDayItem, SubsidyRecord, SubsidyField } from '@/types/reimbursement'
import { calcCalendarTotals, formatMoney } from '@/utils/subsidy'
import { roundMoney } from '@/utils/money'

const props = defineProps<{
  modelValue: boolean
  subsidy: SubsidyRecord | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [subsidy: SubsidyRecord]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const localCalendar = ref<SubsidyDayItem[]>([])

const subsidyFields = [
  { key: 'meal' as SubsidyField, label: '餐费补助' },
  { key: 'transport' as SubsidyField, label: '交通补助' },
  { key: 'communication' as SubsidyField, label: '通讯补助' },
]

watch(
  () => props.modelValue,
  (open) => {
    if (open && props.subsidy) {
      localCalendar.value = JSON.parse(JSON.stringify(props.subsidy.calendar))
    }
  },
)

const calendarTotals = computed(() => calcCalendarTotals(localCalendar.value))

/** 标准总额：勾选补助项的标准金额合计 */
const standardTotal = computed(() => calendarTotals.value.applyAmount)

/** 补助金额：勾选补助项的实际金额合计 */
const subsidyTotal = computed(() => calendarTotals.value.subsidyAmount)

function getChecked(day: SubsidyDayItem, field: SubsidyField): boolean {
  if (field === 'meal') return day.mealChecked
  if (field === 'transport') return day.transportChecked
  return day.communicationChecked
}

function getStandard(day: SubsidyDayItem, field: SubsidyField): number {
  if (field === 'meal') return day.mealStandard
  if (field === 'transport') return day.transportStandard
  return day.communicationStandard
}

function getAmount(day: SubsidyDayItem, field: SubsidyField): number {
  if (field === 'meal') return day.mealAmount
  if (field === 'transport') return day.transportAmount
  return day.communicationAmount
}

function setChecked(colIdx: number, field: SubsidyField, checked: boolean) {
  const day = localCalendar.value[colIdx]
  if (field === 'meal') {
    day.mealChecked = checked
    day.mealAmount = checked ? day.mealStandard : 0
  } else if (field === 'transport') {
    day.transportChecked = checked
    day.transportAmount = checked ? day.transportStandard : 0
  } else {
    day.communicationChecked = checked
    day.communicationAmount = checked ? day.communicationStandard : 0
  }
}

function assignAmount(day: SubsidyDayItem, field: SubsidyField, amount: number) {
  const val = roundMoney(amount)
  if (field === 'meal') day.mealAmount = val
  else if (field === 'transport') day.transportAmount = val
  else day.communicationAmount = val
}

function showAmountInvalidMessage(max: number, type: 'negative' | 'exceed') {
  const message =
    type === 'negative'
      ? '补助金额不能小于 0'
      : `补助金额不能超过标准金额 ${formatMoney(max)} 元`
  ElMessage.warning({ message, duration: 4000 })
}

/** 勾选时可输入，校验仅在失焦时进行 */
function onAmountInput(colIdx: number, field: SubsidyField, amount: number | undefined) {
  const day = localCalendar.value[colIdx]
  if (!getChecked(day, field)) return
  assignAmount(day, field, amount ?? 0)
}

/** 失焦校验：须为 [0, 标准金额]，否则置 0 并提示 */
function validateAmountOnBlur(colIdx: number, field: SubsidyField) {
  const day = localCalendar.value[colIdx]
  if (!getChecked(day, field)) return

  const max = getStandard(day, field)
  const amount = getAmount(day, field)

  if (Number.isNaN(amount) || amount < 0) {
    assignAmount(day, field, 0)
    showAmountInvalidMessage(max, 'negative')
    return
  }
  if (amount > max) {
    assignAmount(day, field, 0)
    showAmountInvalidMessage(max, 'exceed')
    return
  }

  assignAmount(day, field, amount)
}

function isDayAllChecked(colIdx: number): boolean {
  const day = localCalendar.value[colIdx]
  return day.mealChecked && day.transportChecked && day.communicationChecked
}

function isDayIndeterminate(colIdx: number): boolean {
  const day = localCalendar.value[colIdx]
  const count = [day.mealChecked, day.transportChecked, day.communicationChecked].filter(Boolean).length
  return count > 0 && count < 3
}

function toggleDay(colIdx: number, checked: boolean) {
  for (const field of subsidyFields) {
    setChecked(colIdx, field.key, checked)
  }
}

function isRowAllChecked(field: SubsidyField): boolean {
  return localCalendar.value.length > 0 && localCalendar.value.every((d) => getChecked(d, field))
}

function isRowIndeterminate(field: SubsidyField): boolean {
  const checkedCount = localCalendar.value.filter((d) => getChecked(d, field)).length
  return checkedCount > 0 && checkedCount < localCalendar.value.length
}

function toggleRow(field: SubsidyField, checked: boolean) {
  localCalendar.value.forEach((_, i) => setChecked(i, field, checked))
}

const isAllChecked = computed(
  () =>
    localCalendar.value.length > 0 &&
    localCalendar.value.every(
      (d) => d.mealChecked && d.transportChecked && d.communicationChecked,
    ),
)

const isAllIndeterminate = computed(() => {
  if (localCalendar.value.length === 0) return false
  const all = isAllChecked.value
  const any = localCalendar.value.some(
    (d) => d.mealChecked || d.transportChecked || d.communicationChecked,
  )
  return any && !all
})

function toggleAll(checked: boolean) {
  localCalendar.value.forEach((_, colIdx) => toggleDay(colIdx, checked))
}

function handleSave() {
  if (!props.subsidy) return
  const totals = calcCalendarTotals(localCalendar.value)
  emit('save', {
    ...props.subsidy,
    calendar: localCalendar.value,
    applyAmount: totals.applyAmount,
    subsidyAmount: totals.subsidyAmount,
  })
  visible.value = false
}
</script>

<style scoped>
.calendar-layout {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 顶栏：左-中-右同一行 */
.calendar-top-bar {
  display: flex;
  align-items: center;
  min-height: 32px;
  line-height: 32px;
}

.calendar-top-left {
  flex: 0 0 232px;
  font-size: 14px;
}

.trip-type-label {
  font-size: 16px;
  font-weight: 700;
  color: #606266;
  margin-right: 8px;
}

.trip-type-value {
  color: #f58220;
  font-weight: 500;
}

.calendar-top-title {
  flex: 1;
  margin-left: 12px;
  font-size: 16px;
  font-weight: 700;
  color: #303133;
}

.calendar-top-checkall {
  flex-shrink: 0;
  margin-left: auto;
}

.calendar-body {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

/* 左侧上下两块 */
.calendar-aside {
  flex: 0 0 232px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.aside-panel {
  border: 1px solid #dcdfe6;
  border-radius: 2px;
  padding: 10px 10px;
  background: #fff;
}

.aside-panel--trip {
  padding: 12px 10px;
}

.aside-panel--summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 12px;
}

/* 行程时间轴（对齐设计稿） */
.trip-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.trip-timeline-row {
  display: grid;
  grid-template-columns: 56px 18px minmax(0, 1fr);
  column-gap: 6px;
  align-items: center;
  min-height: 26px;
}

.trip-timeline-label {
  font-size: 14px;
  color: #303133;
  line-height: 1.2;
  white-space: nowrap;
}

.trip-timeline-axis {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 18px;
}

.trip-timeline-dot {
  position: relative;
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #008cd6;
}

.trip-timeline-dot::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #fff;
  transform: translate(-50%, -50%);
}

.trip-timeline-vline {
  width: 2px;
  height: 10px;
  background: #008cd6;
}

.trip-timeline-date {
  font-size: 14px;
  color: #303133;
  line-height: 1.2;
  white-space: nowrap;
}

.trip-timeline-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  height: 30px;
  margin: 2px 0;
  padding: 0 10px;
  background: #008cd6;
  color: #fff;
  font-size: 13px;
  line-height: 1;
  border-radius: 0;
}

.trip-timeline-bar-label,
.trip-timeline-bar-days {
  flex-shrink: 0;
  white-space: nowrap;
}

.trip-timeline-bar-route {
  flex: 1;
  min-width: 0;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.amount-summary-item {
  display: flex;
  align-items: baseline;
  line-height: 1.2;
}

.amount-summary-label {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  color: #303133;
}

.amount-summary-currency {
  flex-shrink: 0;
  width: 36px;
  font-size: 14px;
  color: #909399;
  text-align: left;
}

.amount-summary-value {
  flex-shrink: 0;
  min-width: 52px;
  font-size: 16px;
  font-weight: 500;
  color: #f58220;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* 右侧：仅表格外框 */
.calendar-main {
  flex: 1;
  min-width: 0;
}

.calendar-table-wrap {
  border: 1px solid #f0f0f0;
  border-radius: 0;
  overflow-x: auto;
  background: #fff;
}

.calendar-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 14px;
}

.calendar-table th,
.calendar-table td {
  border: 1px solid #f0f0f0;
  padding: 8px 10px;
  vertical-align: middle;
  background: #fff;
}

.calendar-table thead th {
  height: 40px;
  padding: 8px 10px;
  background: #fafafa;
  color: #303133;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.col-date {
  width: 148px;
  text-align: center;
}

.col-city {
  width: 72px;
  text-align: center;
  color: #303133;
}

.col-subsidy {
  width: 118px;
  text-align: center;
}

.th-subsidy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.th-subsidy-label {
  line-height: 1;
}

/* 出差日期列 */
.date-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding-right: 20px;
}

.date-cell-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.date-cell-date {
  font-size: 14px;
  color: #303133;
  line-height: 1.3;
}

.date-cell-weekday-row {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 6px;
}

.date-cell-weekday {
  font-size: 12px;
  color: #909399;
  line-height: 1;
}

.date-cell-pin {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  flex-shrink: 0;
  font-size: 16px;
  color: #c0c4cc;
}

/* 补助列 */
.subsidy-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 4px 0;
}

.subsidy-standard {
  font-size: 13px;
  color: #ff7d00;
  line-height: 1.2;
  white-space: nowrap;
  text-align: center;
}

.subsidy-input-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.subsidy-input.el-input-number {
  width: 72px;
  line-height: normal;
}

.subsidy-input :deep(.el-input) {
  width: 72px;
}

.subsidy-input :deep(.el-input__wrapper) {
  padding: 1px 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  box-shadow: none !important;
}

.subsidy-input :deep(.el-input__wrapper:hover),
.subsidy-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #dcdfe6 inset !important;
}

.subsidy-input :deep(.el-input__inner) {
  height: 26px;
  line-height: 26px;
  font-size: 14px;
  color: #303133;
  text-align: center;
}

.subsidy-input.is-disabled :deep(.el-input__wrapper),
.subsidy-input :deep(.is-disabled .el-input__wrapper) {
  background-color: #f5f7fa;
}

.calendar-table :deep(.el-checkbox) {
  height: auto;
}

.calendar-table :deep(.el-checkbox__inner) {
  width: 14px;
  height: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.dialog-footer :deep(.btn-footer) {
  min-width: 88px;
  height: 32px;
  padding: 0 20px;
  font-size: 14px;
  box-sizing: border-box;
}

.btn-cancel {
  color: #1890ff;
  border-color: #1890ff;
  background: #fff;
}
</style>

<style>
.subsidy-calendar-dialog .el-dialog__header {
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.subsidy-calendar-dialog .el-dialog__title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.subsidy-calendar-dialog .el-dialog__body {
  padding: 20px;
}

.subsidy-calendar-dialog .el-dialog__footer {
  padding: 12px 20px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
