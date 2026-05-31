<template>
  <footer class="doc-footer">
    <el-button class="btn-close" @click="emit('close')">关闭</el-button>
    <template v-if="!readonly">
      <el-button class="btn-save" @click="emit('save')">保存</el-button>
      <el-button type="primary" class="btn-submit" @click="emit('submit')">
        提交
      </el-button>
    </template>
  </footer>
</template>

<script setup lang="ts">
defineProps<{
  readonly?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: []
  submit: []
}>()
</script>

<style scoped>
.doc-footer {
  position: sticky;
  bottom: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 14px 24px;
  background: #fff;
  border-top: 1px solid #e8e8e8;
}

.btn-close,
.btn-save,
.btn-submit {
  min-width: 88px;
  font-size: 14px;
}

.btn-close {
  color: #1890ff;
  border-color: #1890ff;
  background: #fff;
}
</style>
