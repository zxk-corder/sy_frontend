<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="800px"
    class="trip-dialog"
    destroy-on-close
    :close-on-click-modal="false"
    @closed="onClosed"
  >
    <div class="trip-tip">
      <el-icon class="trip-tip-icon"><WarningFilled /></el-icon>
      <div class="trip-tip-text">
        <p>{{ TRIP_DIALOG_TIP_MAIN }}</p>
        <p>{{ TRIP_DIALOG_TIP_SUB }}</p>
      </div>
    </div>

    <el-form
      ref="formRef"
      :model="model"
      :rules="rules"
      label-width="120px"
      label-position="right"
      require-asterisk-position="right"
      class="trip-form"
    >
      <el-form-item label="出行人" prop="reimburserId">
        <el-select
          v-model="model.reimburserId"
          placeholder="请选择出行人"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="item in employees"
            :key="item.reimburserId"
            :label="item.reimburserName"
            :value="item.reimburserId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="出发城市" prop="departCityNo">
        <el-select
          v-model="model.departCityNo"
          placeholder="请选择出发城市"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="item in cities"
            :key="item.cityNo"
            :label="item.cityName"
            :value="item.cityNo"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="到达城市" prop="arriveCityNo">
        <el-select
          v-model="model.arriveCityNo"
          placeholder="请选择到达城市"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="item in cities"
            :key="item.cityNo"
            :label="item.cityName"
            :value="item.cityNo"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="出发到达日期" prop="dateRange">
        <el-date-picker
          v-model="model.dateRange"
          unlink-panels
          class="trip-datetime-picker"
          type="datetimerange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          :default-time="defaultRangeTime"
          :disabled-date="disabledTripDate"
          @change="onDateRangeChange"
        />
      </el-form-item>

      <el-form-item label="行程说明" prop="description">
        <el-input
          v-model="model.description"
          type="textarea"
          :rows="4"
          maxlength="500"
          placeholder="行程说明"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button class="btn-cancel" @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { TRIP_DIALOG_TIP_MAIN, TRIP_DIALOG_TIP_SUB } from '@/constants/reimbursement'
import { MOCK_CITIES, MOCK_EMPLOYEES } from '@/data/masterData'
import type { TripRecord } from '@/types/reimbursement'
import { formatDate, todayString } from '@/utils/date'
import { generateId } from '@/utils/id'

const props = defineProps<{
  modelValue: boolean
  trip?: TripRecord | null
  mode?: 'add' | 'edit' | 'copy'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [trip: TripRecord]
}>()

const employees = MOCK_EMPLOYEES
const cities = MOCK_CITIES
const formRef = ref<FormInstance>()
/** 上一次合法的出发到达区间（用于面板确认校验失败时回退） */
const lastValidDateRange = ref<[string, string] | null>(null)
const today = todayString()
const defaultRangeTime: [Date, Date] = [
  new Date(2000, 0, 1, 0, 0, 0),
  new Date(2000, 0, 1, 0, 0, 0),
]

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const dialogTitle = computed(() => {
  if (props.mode === 'edit') return '编辑补录行程'
  // 新增、复制均使用补录行程原型页标题
  return '补录行程'
})

interface TripFormModel {
  reimburserId: string
  departCityNo: string
  arriveCityNo: string
  dateRange: [string, string] | null
  description: string
}

const model = reactive<TripFormModel>({
  reimburserId: '',
  departCityNo: '',
  arriveCityNo: '',
  dateRange: null,
  description: '',
})

const rules: FormRules = {
  reimburserId: [{ required: true, message: '请选择出行人', trigger: 'change' }],
  departCityNo: [{ required: true, message: '请选择出发城市', trigger: 'change' }],
  arriveCityNo: [{ required: true, message: '请选择到达城市', trigger: 'change' }],
  dateRange: [
    { required: true, message: '请选择出发到达日期', trigger: 'change' },
    {
      validator: (_rule, value, callback) => {
        const err = validateTripDateRange(value as [string, string] | null)
        if (err) callback(new Error(err))
        else callback()
      },
      trigger: 'change',
    },
  ],
  description: [{ required: true, message: '请输入行程说明', trigger: 'blur' }],
}

/** 不可选择今天之后的日期 */
function disabledTripDate(date: Date) {
  return formatDate(date) > today
}

function validateTripDateRange(range: [string, string] | null): string | null {
  if (!range || range.length !== 2) return null
  const [start, end] = range
  const departDate = start.slice(0, 10)
  const arriveDate = end.slice(0, 10)
  if (departDate > today || arriveDate > today) {
    return '日期不能晚于当前日期'
  }
  if (end < start) {
    return '到达日期不能早于出发日期'
  }
  return null
}

/** 用户点击日期面板「确定」时触发（change） */
async function onDateRangeChange(range: [string, string] | null) {
  if (!range || range.length !== 2) {
    if (!range) lastValidDateRange.value = null
    return
  }

  const [start, end] = range
  if (end < start) {
    ElMessage.warning('到达日期不能早于出发日期')
    await nextTick()
    model.dateRange = lastValidDateRange.value
      ? ([...lastValidDateRange.value] as [string, string])
      : null
    formRef.value?.validateField('dateRange').catch(() => {})
    return
  }

  const futureErr =
    start.slice(0, 10) > today || end.slice(0, 10) > today
      ? '日期不能晚于当前日期'
      : null
  if (futureErr) {
    ElMessage.warning(futureErr)
    await nextTick()
    model.dateRange = lastValidDateRange.value
      ? ([...lastValidDateRange.value] as [string, string])
      : null
    formRef.value?.validateField('dateRange').catch(() => {})
    return
  }

  lastValidDateRange.value = [range[0], range[1]]
  formRef.value?.validateField('dateRange').catch(() => {})
}

function parseDateFromRange(range: [string, string] | null) {
  if (!range || range.length !== 2) return { departDate: '', arriveDate: '' }
  return {
    departDate: range[0].slice(0, 10),
    arriveDate: range[1].slice(0, 10),
  }
}

function resetModel() {
  Object.assign(model, {
    reimburserId: '',
    departCityNo: '',
    arriveCityNo: '',
    dateRange: null,
    description: '',
  })
  lastValidDateRange.value = null
}

function fillFromTrip(trip: TripRecord) {
  const range: [string, string] = [
    `${trip.departDate} 00:00:00`,
    `${trip.arriveDate} 00:00:00`,
  ]
  Object.assign(model, {
    reimburserId: trip.reimburserId,
    departCityNo: trip.departCityNo,
    arriveCityNo: trip.arriveCityNo,
    dateRange: range,
    description: trip.description,
  })
  lastValidDateRange.value = [...range]
}

function syncFormFromProps() {
  if (!props.modelValue) return
  if (props.trip) {
    fillFromTrip(props.trip)
  } else {
    resetModel()
  }
}

watch(() => props.modelValue, syncFormFromProps)

watch(
  () => [props.trip, props.mode] as const,
  () => syncFormFromProps(),
)

function buildTripRecord(): TripRecord {
  const emp = employees.find((e) => e.reimburserId === model.reimburserId)!
  const depart = cities.find((c) => c.cityNo === model.departCityNo)!
  const arrive = cities.find((c) => c.cityNo === model.arriveCityNo)!
  const { departDate, arriveDate } = parseDateFromRange(model.dateRange)

  const isEdit = props.mode === 'edit' && !!props.trip?.id
  return {
    id: isEdit ? props.trip!.id : generateId('trip'),
    reimburserId: emp.reimburserId,
    reimburserName: emp.reimburserName,
    reimburserNo: emp.reimburserNo,
    departCityNo: depart.cityNo,
    departCityName: depart.cityName,
    arriveCityNo: arrive.cityNo,
    arriveCityName: arrive.cityName,
    departDate,
    arriveDate,
    description: model.description,
  }
}

async function handleSave() {
  if (!formRef.value) return
  await formRef.value.validate()

  const dateErr = validateTripDateRange(model.dateRange)
  if (dateErr) {
    ElMessage.error(dateErr)
    return
  }

  emit('save', buildTripRecord())
  visible.value = false
}

function onClosed() {
  formRef.value?.resetFields()
}
</script>

<style scoped>
.trip-tip {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  margin-bottom: 20px;
  background: #fdf6ec;
  border: 1px solid #faecd8;
  border-radius: 4px;
}

.trip-tip-icon {
  flex-shrink: 0;
  margin-top: 2px;
  font-size: 18px;
  color: #e6a23c;
}

.trip-tip-text {
  flex: 1;
  font-size: 13px;
  line-height: 1.6;
  color: #606266;
}

.trip-tip-text p {
  margin: 0;
}

.trip-tip-text p + p {
  margin-top: 4px;
}

.trip-form :deep(.el-form-item__label) {
  color: #606266;
}

.trip-form :deep(.el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label::before) {
  color: #f56c6c;
  margin-right: 4px;
}

/* datetimerange 内部日期/时间框加宽，避免日期被裁切 */
.trip-form :deep(.trip-datetime-picker) {
  width: 100% !important;
  max-width: 100%;
  box-sizing: border-box;
}

.trip-form :deep(.trip-datetime-picker .el-input__wrapper) {
  width: 100%;
  box-sizing: border-box;
}

.trip-form :deep(.trip-datetime-picker .el-range-input),
.trip-form :deep(.trip-datetime-picker input.el-input__inner) {
  width: auto !important;
  flex: 1 1 0;
  min-width: 128px;
  overflow: visible;
  text-overflow: clip;
}

.trip-form :deep(.trip-datetime-picker .el-range-separator) {
  flex-shrink: 0;
  padding: 0 6px;
  line-height: 32px;
}

.trip-form :deep(.trip-datetime-picker .el-range__icon),
.trip-form :deep(.trip-datetime-picker .el-range__close-icon) {
  flex-shrink: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  background: #fff;
}
</style>

<style>
.trip-dialog .el-dialog__header {
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.trip-dialog .el-dialog__title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.trip-dialog .el-dialog__body {
  padding: 20px;
}

.trip-dialog .el-dialog__footer {
  padding: 12px 20px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
