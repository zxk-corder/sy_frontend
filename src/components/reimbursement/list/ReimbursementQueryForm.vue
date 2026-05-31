<template>
  <el-form :model="query" label-width="100px" class="query-form">
    <!-- 第一行：报销单号、标题、事由、费用归属公司 -->
    <el-row :gutter="16">
      <el-col :span="6">
        <el-form-item label="报销单号">
          <el-input v-model="query.reimNo" placeholder="请输入" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="标题">
          <el-input v-model="query.title" placeholder="请输入" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="事由">
          <el-input v-model="query.reason" placeholder="请输入" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="费用归属公司">
          <el-select v-model="query.reimCompanyId" placeholder="请选择" clearable filterable>
            <el-option
              v-for="item in companies"
              :key="item.reimCompanyId"
              :label="item.reimCompanyName"
              :value="item.reimCompanyId"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 第二行：报销部门、报销人、业务类型、操作按钮 -->
    <el-row :gutter="16" class="query-row-second">
      <el-col :span="6">
        <el-form-item label="报销部门">
          <el-select v-model="query.reimDepartmentId" placeholder="请选择" clearable filterable>
            <el-option
              v-for="item in departments"
              :key="item.reimDepartmentId"
              :label="item.reimDepartmentName"
              :value="item.reimDepartmentId"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="报销人">
          <el-select v-model="query.reimburserId" placeholder="请选择" clearable filterable>
            <el-option
              v-for="item in employees"
              :key="item.reimburserId"
              :label="`${item.reimburserName}（${item.reimburserNo}）`"
              :value="item.reimburserId"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="业务类型">
          <el-tree-select
            v-model="query.businessTypeId"
            :data="businessTypeTree"
            placeholder="请选择"
            clearable
            check-strictly
            filterable
            :render-after-expand="false"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label=" " class="query-actions-item">
          <div class="query-actions">
            <el-button @click="emit('create')">新增</el-button>
            <el-button @click="emit('reset')">清除</el-button>
            <el-button type="primary" @click="emit('search')">搜索</el-button>
          </div>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { MOCK_BUSINESS_TYPES, MOCK_COMPANIES, MOCK_DEPARTMENTS, MOCK_EMPLOYEES } from '@/data/masterData'
import type { ReimbursementQuery } from '@/types/reimbursement'
import { buildBusinessTypeTree } from '@/utils/businessTypeTree'

defineProps<{
  query: ReimbursementQuery
}>()

const emit = defineEmits<{
  search: []
  reset: []
  create: []
}>()

const companies = MOCK_COMPANIES
const departments = MOCK_DEPARTMENTS
const employees = MOCK_EMPLOYEES
const businessTypeTree = buildBusinessTypeTree(MOCK_BUSINESS_TYPES)
</script>

<style scoped>
.query-form {
  background: #fff;
  padding: 16px 16px 4px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.query-row-second {
  margin-top: 0;
}

.query-actions-item :deep(.el-form-item__content) {
  justify-content: flex-end;
}

.query-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
}
</style>
