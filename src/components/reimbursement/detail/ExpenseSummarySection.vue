<template>
  <CollapsibleSection title="费用合计">
    <div class="summary-row">
      <div class="summary-item">
        <span class="summary-label">补助总金额</span>
        <AmountText :value="summary.total" class="summary-value" />
      </div>
      <div class="summary-item">
        <span class="summary-label">餐费补助</span>
        <AmountText :value="summary.meal" class="summary-value" />
      </div>
      <div class="summary-item">
        <span class="summary-label">交通补助</span>
        <AmountText :value="summary.transport" class="summary-value" />
      </div>
      <div class="summary-item">
        <span class="summary-label">通讯补助</span>
        <AmountText :value="summary.communication" class="summary-value" />
      </div>
    </div>
  </CollapsibleSection>
</template>

<script setup lang="ts">
import AmountText from '@/components/reimbursement/common/AmountText.vue'
import CollapsibleSection from '@/components/reimbursement/common/CollapsibleSection.vue'

defineProps<{
  summary: {
    total: number
    meal: number
    transport: number
    communication: number
  }
}>()
</script>

<style scoped>
.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 8px 0;
}

.summary-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #303133;
}

.summary-label {
  color: #606266;
}

.summary-value {
  color: #303133;
  font-variant-numeric: tabular-nums;
}
</style>
