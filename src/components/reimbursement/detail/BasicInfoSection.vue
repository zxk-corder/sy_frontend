<template>
  <CollapsibleSection title="基础信息">
    <el-form :model="form" label-width="110px" class="basic-form">
      <el-row :gutter="24">
        <!-- 第1行：报销标题 整行 -->
        <el-col :span="24">
          <el-form-item label="报销标题">
            <el-input
              v-model="form.title"
              placeholder="请输入报销标题"
              maxlength="500"
              :disabled="readonly"
            />
          </el-form-item>
        </el-col>

        <!-- 第2行：报销人、报销部门、费用归属公司 三列 -->
        <el-col :span="8">
          <el-form-item label="报销人">
            <el-select
              :model-value="form.reimburserId"
              placeholder="请选择报销人"
              filterable
              clearable
              :disabled="readonly"
              style="width: 100%"
              @update:model-value="emit('update-reimburser', $event)"
            >
              <el-option
                v-for="item in employees"
                :key="item.reimburserId"
                :label="item.reimburserName"
                :value="item.reimburserId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="报销部门">
            <el-select
              :model-value="form.reimDepartmentId"
              placeholder="请选择报销部门"
              filterable
              clearable
              :disabled="readonly"
              style="width: 100%"
              @update:model-value="emit('update-department', $event)"
            >
              <el-option
                v-for="item in departments"
                :key="item.reimDepartmentId"
                :label="item.reimDepartmentName"
                :value="item.reimDepartmentId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="费用归属公司" required>
            <el-select
              :model-value="form.reimCompanyId"
              placeholder="请选择费用归属公司"
              filterable
              clearable
              :disabled="readonly"
              style="width: 100%"
              @update:model-value="emit('update-company', $event)"
            >
              <el-option
                v-for="item in companies"
                :key="item.reimCompanyId"
                :label="item.reimCompanyName"
                :value="item.reimCompanyId"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 第3行：业务类型 占一列 -->
        <el-col :span="8">
          <el-form-item label="业务类型" required>
            <el-tree-select
              :model-value="form.businessTypeId"
              :data="businessTypeTree"
              placeholder="请选择业务类型"
              check-strictly
              filterable
              clearable
              :disabled="readonly"
              :render-after-expand="false"
              style="width: 100%"
              @update:model-value="emit('update-business-type', $event)"
            />
          </el-form-item>
        </el-col>

        <!-- 第4行：出差事由 整行 -->
        <el-col :span="24">
          <el-form-item label="出差事由">
            <el-input
              v-model="form.reason"
              type="textarea"
              :rows="3"
              placeholder="请输入"
              maxlength="500"
              :disabled="readonly"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </CollapsibleSection>
</template>

<script setup lang="ts">
import CollapsibleSection from '@/components/reimbursement/common/CollapsibleSection.vue'
import { MOCK_BUSINESS_TYPES, MOCK_COMPANIES, MOCK_DEPARTMENTS, MOCK_EMPLOYEES } from '@/data/masterData'
import type { ReimbursementForm } from '@/types/reimbursement'
import { buildBusinessTypeTree } from '@/utils/businessTypeTree'

defineProps<{
  form: ReimbursementForm
  readonly?: boolean
}>()

const emit = defineEmits<{
  'update-reimburser': [id: string]
  'update-department': [id: string]
  'update-company': [id: string]
  'update-business-type': [id: string]
}>()

const companies = MOCK_COMPANIES
const departments = MOCK_DEPARTMENTS
const employees = MOCK_EMPLOYEES
const businessTypeTree = buildBusinessTypeTree(MOCK_BUSINESS_TYPES)
</script>

<style scoped>

.basic-form :deep(.el-form-item__label) {
  color: #606266;
}

.basic-form :deep(.el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label::before) {
  color: #f56c6c;
  margin-right: 4px;
}
</style>
