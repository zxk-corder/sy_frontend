<template>
  <section class="section">
    <div class="section-header">
      <div class="section-header-main">
        <span class="section-bar" />
        <span class="section-title">{{ title }}</span>
        <div v-if="subtitle" class="section-subtitle">{{ subtitle }}</div>
        <div class="section-header-right">
          <div class="section-extra">
            <slot name="extra" />
          </div>
          <button
            type="button"
            class="toggle-icon"
            :aria-expanded="!collapsed"
            :aria-label="collapsed ? '展开' : '收起'"
            @click="collapsed = !collapsed"
          >
            <el-icon v-if="!collapsed" :size="16"><ArrowUp /></el-icon>
            <el-icon v-else :size="16"><ArrowDown /></el-icon>
          </button>
        </div>
      </div>
    </div>
    <el-collapse-transition>
      <div v-show="!collapsed" class="section-body">
        <slot />
      </div>
    </el-collapse-transition>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'

defineProps<{
  title: string
  subtitle?: string
}>()

const collapsed = ref(false)
</script>

<style scoped>
.section {
  background: #fff;
}

/* 左右留白为白色，与正文区一致 */
.section-header {
  padding: 0 20px;
  background: #fff;
}

/* 灰色标题条：仅中间区域，蓝条紧贴标题左侧 */
.section-header-main {
  display: flex;
  align-items: center;
  height: 36px;
  box-sizing: border-box;
  background: rgb(242, 243, 246);
  border-bottom: 1px solid #e8eef7;
}

.section-bar {
  flex-shrink: 0;
  align-self: stretch;
  width: 4px;
  background: #1890ff;
}

.section-title {
  margin-left: 12px;
  font-size: 16px;
  font-weight: 700;
  line-height: 36px;
  color: #303133;
}

.section-subtitle {
  margin-left: 12px;
  font-size: 14px;
  line-height: 36px;
  color: #606266;
}

.section-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  padding-right: 12px;
}

.section-extra {
  display: flex;
  align-items: center;
}

.toggle-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  background: none;
  color: #606266;
  flex-shrink: 0;
  cursor: pointer;
  line-height: 1;
}

.toggle-icon:hover {
  opacity: 0.85;
}

.section-body {
  padding: 20px;
  font-size: 14px;
}
</style>
