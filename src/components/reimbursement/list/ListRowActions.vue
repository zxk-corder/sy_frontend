<template>
  <div class="row-actions">
    <el-tooltip :content="submitTooltip" placement="top">
      <el-button
        link
        class="action-btn"
        :disabled="!submittable"
        @click="submittable && emit('submit')"
      >
        <img :src="uploadIcon" alt="提交" class="action-icon" />
      </el-button>
    </el-tooltip>

    <el-tooltip content="编辑" placement="top">
      <el-button
        link
        class="action-btn"
        :disabled="!editable"
        @click="editable && emit('edit')"
        style="margin-left:0"
      >
        <img :src="editIcon" alt="编辑" class="action-icon" />
      </el-button>
    </el-tooltip>

    <el-dropdown
      trigger="hover"
      :show-timeout="0"
      :hide-timeout="150"
      placement="bottom"
      @command="onCommand"
    >
      <span class="more-trigger">
        <img :src="moreIcon" alt="更多" class="action-icon" />
      </span>
      <template #dropdown>
        <el-dropdown-menu class="more-dropdown-menu">
          <el-dropdown-item command="delete">删除</el-dropdown-item>
          <el-dropdown-item command="push">手工推送</el-dropdown-item>
          <el-dropdown-item command="copy">复制</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import editIcon from '@/assets/operation_icon/edit.svg'
import moreIcon from '@/assets/operation_icon/more.svg'
import uploadIcon from '@/assets/operation_icon/upload.svg'

const props = defineProps<{
  editable: boolean
  submittable: boolean
}>()

const emit = defineEmits<{
  submit: []
  edit: []
  delete: []
  push: []
  copy: []
}>()

const submitTooltip = computed(() =>
  props.submittable ? '提交' : '仅草稿状态可提交',
)

function onCommand(command: string) {
  if (command === 'delete') emit('delete')
  else if (command === 'push') emit('push')
  else if (command === 'copy') emit('copy')
}
</script>

<style scoped>
.row-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  padding: 4px;
  line-height: 0;
}

.action-btn:disabled {
  opacity: 0.4;
}

.action-icon {
  display: block;
  width: 18px;
  height: 18px;
}

.more-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  line-height: 0;
  cursor: pointer;
  vertical-align: middle;
  outline: none;
}

:deep(.el-dropdown) {
  line-height: 0;
}

:deep(.el-dropdown .el-icon--right),
:deep(.el-dropdown .el-dropdown__icon) {
  display: none;
}

:deep(.more-dropdown-menu .el-dropdown-menu__item) {
  min-width: 100px;
  justify-content: center;
  font-size: 14px;
}
</style>
