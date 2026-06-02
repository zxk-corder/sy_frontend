<template>
  <div v-loading="pageLoading" class="detail-page reimbursement-detail">
    <DocumentHeader :document-date="form.documentDate" />

    <div class="detail-card">
      <div class="detail-sections">
        <BasicInfoSection
          :form="form"
          :readonly="isReadOnly"
          @update-reimburser="onUpdateReimburser"
          @update-department="onUpdateDepartment"
          @update-company="onUpdateCompany"
          @update-business-type="onUpdateBusinessType"
        />

        <TripSection
          :trips="form.trips"
          :readonly="isReadOnly"
          @add="onAddTrip"
          @update="onUpdateTrip"
          @remove="onRemoveTrip"
        />

        <SubsidySection
          :subsidies="form.subsidies"
          :readonly="isReadOnly"
          @update="onUpdateSubsidy"
        />

        <ExpenseSummarySection :summary="expenseSummary" />

        <AllocationSection
          :allocations="form.allocations"
          :subsidy-total="subsidyTotal"
          :readonly="isReadOnly"
          @add-row="onAddAllocationRow"
          @remove-row="onRemoveAllocation"
          @equalize="onEqualizeAllocations"
          @update-ratio="onUpdateAllocationRatio"
          @validate-ratio-blur="onValidateAllocationRatioBlur"
          @update-amount="onUpdateAllocationAmount"
          @validate-amount-blur="onValidateAllocationAmountBlur"
          @update-row="onUpdateAllocationRow"
        />

        <RemarkSection v-model:remark="form.remark" :readonly="isReadOnly" />
      </div>
    </div>

    <DocumentFooter
      :readonly="isReadOnly"
      @close="handleClose"
      @save="handleSave"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import AllocationSection from '@/components/reimbursement/detail/AllocationSection.vue'
import BasicInfoSection from '@/components/reimbursement/detail/BasicInfoSection.vue'
import DocumentFooter from '@/components/reimbursement/detail/DocumentFooter.vue'
import DocumentHeader from '@/components/reimbursement/detail/DocumentHeader.vue'
import ExpenseSummarySection from '@/components/reimbursement/detail/ExpenseSummarySection.vue'
import RemarkSection from '@/components/reimbursement/detail/RemarkSection.vue'
import SubsidySection from '@/components/reimbursement/detail/SubsidySection.vue'
import TripSection from '@/components/reimbursement/detail/TripSection.vue'
import { fetchReimbursementDetail } from '@/api/reim/detail'
import {
  getReimDetail,
  saveReim,
  saveReimCreate,
  submitReim,
} from '@/api/reim/main'
import { saveSubsidyCalendar } from '@/api/reim/calendar'
import { calcSplitRatio } from '@/api/reim/split'
import { deleteTrip, listTripsByReimId, saveTrip } from '@/api/reim/trip'
import { useReimbursementForm } from '@/composables/useReimbursementForm'
import type { AllocationRecord, SubsidyRecord, TripRecord } from '@/types/reimbursement'
import { cloneReimbursementFormForCopy } from '@/utils/reimbursementCopy'
import {
  isNewReimbursement,
  toAllocationRecord,
  toCreateSaveParams,
  toSaveParams,
  toSaveSubsidyParams,
  toSplitParams,
  toTripParams,
  toTripRecord,
} from '@/utils/reimbursementApiMapper'
import {
  canSubmitReimbursement,
  isReimbursementReadOnly,
} from '@/utils/reimbursementStatus'
import { validateReimbursementForm } from '@/utils/validation'
import '@/styles/reimbursement-detail.css'

const route = useRoute()
const router = useRouter()
const pageLoading = ref(false)
/** 编辑页本地删除、尚未调接口的已落库行程 id */
const pendingDeletedTripIds = ref<string[]>([])

const {
  form,
  subsidyTotal,
  expenseSummary,
  addTrip,
  updateTrip,
  removeTrip,
  updateSubsidy,
  addAllocationRow,
  removeAllocationRow,
  equalizeAllocations,
  updateAllocationRatio,
  validateAllocationRatioOnBlur,
  updateAllocationAmount,
  validateAllocationAmountOnBlur,
  setReimburser,
  setDepartment,
  setCompany,
  setBusinessType,
  resetForm,
  loadForm,
} = useReimbursementForm()

const isReadOnly = computed(() => isReimbursementReadOnly(form.value.status))

function onUpdateReimburser(id: string) {
  if (isReadOnly.value) return
  setReimburser(id)
}

function onUpdateDepartment(id: string) {
  if (isReadOnly.value) return
  setDepartment(id)
}

function onUpdateCompany(id: string) {
  if (isReadOnly.value) return
  setCompany(id)
}

function onUpdateBusinessType(id: string) {
  if (isReadOnly.value) return
  setBusinessType(id)
}

function isLocalId(id: string) {
  return id.startsWith('trip_') || id.startsWith('sub_') || id.startsWith('alloc_')
}

function resetPendingDeletedTrips() {
  pendingDeletedTripIds.value = []
}

const isCreateRoute = () => isNewReimbursement(form.value)

async function flushPendingDeletedTrips() {
  for (const tripId of pendingDeletedTripIds.value) {
    await deleteTrip(tripId)
  }
  pendingDeletedTripIds.value = []
}

/** 将表单中的行程、补助日历落库（关闭/提交时调用） */
async function persistLocalTripsAndSubsidies(reimId: string) {
  for (const trip of form.value.trips) {
    const localTripId = trip.id
    const persistedTripId =
      trip.id && !isLocalId(trip.id) ? trip.id : undefined
    const { tripId, subsidyId } = await saveTrip(
      toTripParams({ ...trip, id: persistedTripId ?? '' }, reimId),
    )
    trip.id = tripId
    const subsidy = form.value.subsidies.find((s) => s.tripId === localTripId)
    if (subsidy && subsidyId) {
      subsidy.id = subsidyId
      subsidy.tripId = tripId
      await saveSubsidyCalendar(toSaveSubsidyParams({ ...subsidy, id: subsidyId }))
    }
  }
}

async function initPage() {
  const id = route.params.id as string | undefined
  const copyFrom = route.query.copyFrom as string | undefined

  pageLoading.value = true
  try {
    if (!id) {
      if (copyFrom) {
        const source = await fetchReimbursementDetail(copyFrom)
        if (source) {
          loadForm(cloneReimbursementFormForCopy(source))
          resetPendingDeletedTrips()
        } else {
          ElMessage.warning('未找到要复制的报销单')
          resetForm()
        }
      } else {
        resetForm()
        resetPendingDeletedTrips()
      }
      return
    }

    const detail = await fetchReimbursementDetail(id)
    if (detail) {
      loadForm(detail)
      resetPendingDeletedTrips()
    } else {
      ElMessage.warning('未找到该报销单')
      router.replace({ name: 'reimbursement-list' })
    }
  } catch {
    if (id) {
      ElMessage.warning('加载报销单失败')
      router.replace({ name: 'reimbursement-list' })
    }
  } finally {
    pageLoading.value = false
  }
}

onMounted(initPage)

watch(
  () => [route.params.id, route.query.copyFrom],
  () => initPage(),
)

function onAddTrip(trip: TripRecord) {
  if (isReadOnly.value) return
  addTrip(trip)
  ElMessage.success('添加成功')
}

function onUpdateTrip(trip: TripRecord) {
  if (isReadOnly.value) return
  updateTrip(trip)
  ElMessage.success('更新成功')
}

function onRemoveTrip(tripId: string) {
  if (isReadOnly.value) return
  if (tripId && !isLocalId(tripId) && !pendingDeletedTripIds.value.includes(tripId)) {
    pendingDeletedTripIds.value.push(tripId)
  }
  removeTrip(tripId)
  ElMessage.success('删除成功')
}

function onUpdateSubsidy(subsidy: SubsidyRecord) {
  if (isReadOnly.value) return
  updateSubsidy(subsidy)
}

async function syncSplitFromServer() {
  if (!form.value.id || isCreateRoute()) return
  const splitList = form.value.allocations.map((row, index) =>
    toSplitParams(row, form.value.id!, index + 1),
  )
  const result = await calcSplitRatio(form.value.id, splitList)
  form.value.allocations = result.map(toAllocationRecord)
}

function onAddAllocationRow() {
  if (isReadOnly.value) return
  addAllocationRow()
}

function onEqualizeAllocations() {
  if (isReadOnly.value) return
  equalizeAllocations()
}

function onUpdateAllocationRatio(index: number, percent: number) {
  if (isReadOnly.value) return
  updateAllocationRatio(index, percent)
}

function onUpdateAllocationAmount(index: number, amount: number) {
  if (isReadOnly.value) return
  updateAllocationAmount(index, amount)
}

async function onValidateAllocationRatioBlur(index: number) {
  if (isReadOnly.value) return
  validateAllocationRatioOnBlur(index)
  if (form.value.id) {
    try {
      await syncSplitFromServer()
    } catch {
      /* 本地校验结果已保留 */
    }
  }
}

async function onValidateAllocationAmountBlur(index: number) {
  if (isReadOnly.value) return
  validateAllocationAmountOnBlur(index)
  if (form.value.id) {
    try {
      await syncSplitFromServer()
    } catch {
      /* 本地校验结果已保留 */
    }
  }
}

async function onRemoveAllocation(id: string) {
  if (isReadOnly.value) return
  if (form.value.allocations.length <= 1) {
    ElMessage.warning('至少保留一条分摊信息')
    return
  }

  try {
    await ElMessageBox.confirm('确认删除该分摊行吗？', '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }

  removeAllocationRow(id)
}

function onUpdateAllocationRow(index: number, row: AllocationRecord) {
  if (isReadOnly.value) return
  const rows = [...form.value.allocations]
  rows[index] = row
  form.value.allocations = rows
}

/** 保存草稿：行程/补助在此时统一落库 */
async function saveDraft() {
  if (isNewReimbursement(form.value)) {
    const { id } = await saveReimCreate(toCreateSaveParams(form.value))
    form.value.id = id
    const main = await getReimDetail(id)
    form.value.version = main.version ?? 0
    if (main.reimNo) form.value.reimNo = main.reimNo
    if (form.value.trips.length > 0) {
      // 后端已批量保存行程，获取实际ID后仅生成补助
      const savedTrips = await listTripsByReimId(id)
      const tripIdMap = new Map<string, string>()
      savedTrips.forEach((vo, idx) => {
        const localId = form.value.trips[idx]?.id
        if (localId) tripIdMap.set(localId, vo.id)
      })
      form.value.trips = savedTrips.map(toTripRecord)
      // 同步补助记录的 tripId 映射
      form.value.subsidies = form.value.subsidies.map((sub) => {
        const newTripId = tripIdMap.get(sub.tripId)
        return newTripId ? { ...sub, tripId: newTripId } : sub
      })
      // 通过 saveTrip（更新模式）生成补助
      await persistLocalTripsAndSubsidies(id)
    }
    return
  }

  if (!form.value.id) {
    throw new Error('缺少报销单ID')
  }

  const reimId = form.value.id
  await flushPendingDeletedTrips()

  if (form.value.trips.length > 0) {
    await persistLocalTripsAndSubsidies(reimId)
  }
  
  await saveReim(toSaveParams(form.value, { includeTripList: false }))

  const main = await getReimDetail(reimId)
  form.value.version = main.version ?? 0
}

async function handleClose() {
  if (isReadOnly.value) {
    router.push({ name: 'reimbursement-list' })
    return
  }

  try {
    await ElMessageBox.confirm(
      '未保存的修改将会丢失，是否确定关闭？',
      '确认关闭',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      },
    )
  } catch {
    return
  }

  router.push({ name: 'reimbursement-list' })
}

async function handleSave() {
  if (isReadOnly.value) return

  pageLoading.value = true
  try {
    await saveDraft()
    ElMessage.success('保存成功')
    router.push({ name: 'reimbursement-list' })
  } catch {
    /* 失败时拦截器已提示，留在当前页 */
  } finally {
    pageLoading.value = false
  }
}
// 提交
async function handleSubmit() {
  if (!canSubmitReimbursement(form.value.status)) {
    ElMessage.warning('只有草稿状态的报销单可以提交')
    return
  }

  const errors = validateReimbursementForm(form.value)
  if (errors.length > 0) {
    ElMessage.error(errors[0])
    return
  }

  try {
    await ElMessageBox.confirm('确认提交该报销单吗？提交后将不可修改。', '提交确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }

  pageLoading.value = true
  try {
    if (isCreateRoute()) {
      await submitCreateReimbursement()
    } else {
      await submitEditReimbursement()
    }

    await ElMessageBox.alert('提交成功', '提示', {
      confirmButtonText: '确定',
      customClass: 'submit-success-msgbox',
    })
    router.push({ name: 'reimbursement-list' })
  } catch (error) {
    if (error instanceof Error && error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    pageLoading.value = false
  }
}

/** 新增页提交：主单+行程一起落库后统一生成补助再提交 */
async function submitCreateReimbursement() {
  const { id: reimId } = await saveReimCreate(toCreateSaveParams(form.value))
  // 获取后端批量保存的实际行程ID
  const savedTrips = await listTripsByReimId(reimId)
  const tripIdMap = new Map<string, string>()
  savedTrips.forEach((vo, idx) => {
    const localId = form.value.trips[idx]?.id
    if (localId) tripIdMap.set(localId, vo.id)
  })
  form.value.trips = savedTrips.map(toTripRecord)
  form.value.subsidies = form.value.subsidies.map((sub) => {
    const newTripId = tripIdMap.get(sub.tripId)
    return newTripId ? { ...sub, tripId: newTripId } : sub
  })
  await persistLocalTripsAndSubsidies(reimId)

  const main = await getReimDetail(reimId)
  await submitReim({
    id: reimId,
    version: main.version ?? 0,
  })
}

/** 编辑页提交：关闭时同样统一落库行程/补助 */
async function submitEditReimbursement() {
  const reimId = form.value.id!
  if (!reimId) {
    throw new Error('报销单未保存，无法提交')
  }

  await flushPendingDeletedTrips()
  await persistLocalTripsAndSubsidies(reimId)
  
  await saveReim(toSaveParams(form.value, { includeTripList: false }))

  const main = await getReimDetail(reimId)
  await submitReim({
    id: reimId,
    version: main.version ?? 0,
  })
}
</script>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f0f2f5;
}

.detail-card {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 16px 80px;
  box-sizing: border-box;
  font-size: 14px;
}

@media (min-width: 1232px) {
  .detail-card {
    width: 1200px;
  }
}

.detail-sections {
  background: #fff;
  padding-bottom: 18px;
}

.detail-sections :deep(.section) {
  margin-bottom: 0;
  padding-top: 18px;
}

.detail-sections :deep(.section + .section .section-header-main) {
  border-top: 1px solid #e8eef7;
}
</style>