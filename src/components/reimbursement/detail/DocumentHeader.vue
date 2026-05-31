<template>
  <header class="doc-header">
    <div class="doc-header-inner">
      <h1 class="doc-title">差旅费用报销单</h1>
      <span class="doc-date">提单日期 {{ documentDate }}</span>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  documentDate: string
}>()
</script>

<style scoped>
.doc-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.doc-header-inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1200px;
  height: 56px;
  margin: 0 auto;
  padding: 0 16px;
  box-sizing: border-box;
}

.doc-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #303133;
  line-height: 1.4;
}

.doc-date {
  position: absolute;
  right: 16px;
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}
</style>
