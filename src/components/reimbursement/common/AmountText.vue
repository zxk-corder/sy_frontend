<template>
  <span class="amount-text">{{ formatted }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatMoney } from '@/utils/subsidy'

const props = defineProps<{
  value: number
}>()

const formatted = computed(() => formatMoney(props.value))
</script>

<style scoped>
.amount-text {
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}
</style>
