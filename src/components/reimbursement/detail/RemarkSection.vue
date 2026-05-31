<template>
  <CollapsibleSection title="备注信息">
    <template v-if="!readonly" #extra>
      <span class="delete-remark" :class="{ disabled: !remark }" @click="remark && confirmClear()">
        <el-icon><Delete /></el-icon>
        删除备注
      </span>
    </template>
    <el-input
      :model-value="remark"
      type="textarea"
      :rows="4"
      maxlength="1000"
      placeholder="请输入"
      :disabled="readonly"
      @update:model-value="emit('update:remark', $event)"
    />
  </CollapsibleSection>
</template>

<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import CollapsibleSection from '@/components/reimbursement/common/CollapsibleSection.vue'

const props = defineProps<{
  remark: string
  readonly?: boolean
}>()

const emit = defineEmits<{
  'update:remark': [value: string]
}>()

async function confirmClear() {
  if (props.readonly) return
  await ElMessageBox.confirm('确定清空备注信息吗？', '确认删除', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  })
  emit('update:remark', '')
}
</script>

<style scoped>
.delete-remark {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #1890ff;
  font-size: 14px;
  cursor: pointer;
}

.delete-remark.disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.delete-remark:not(.disabled):hover {
  opacity: 0.85;
}
</style>
