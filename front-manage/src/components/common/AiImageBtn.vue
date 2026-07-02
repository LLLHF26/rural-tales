<template>
  <el-popover
    v-model:visible="visible"
    placement="bottom-start"
    :width="280"
    trigger="click"
    :show-arrow="false"
  >
    <template #reference>
      <el-button size="small" class="ai-btn" :loading="generating" @click.stop>
        <AppIcon name="wand" :size="12" />
        <span>AI</span>
      </el-button>
    </template>
    <div class="ai-pop">
      <div class="ai-pop-title">AI 生成图片</div>
      <el-input
        v-model="prompt"
        type="textarea"
        :rows="3"
        :placeholder="placeholder"
        maxlength="300"
        show-word-limit
      />
      <div class="ai-pop-actions">
        <el-button size="small" @click="visible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="generating" @click="doGenerate">生成</el-button>
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { generateImage } from '@/api/ai'

withDefaults(defineProps<{
  placeholder?: string
}>(), {
  placeholder: '描述你想要的图片...'
})

const emit = defineEmits<{
  (e: 'generated', url: string): void
}>()

const visible = ref(false)
const generating = ref(false)
const prompt = ref('')

async function doGenerate() {
  if (!prompt.value.trim()) return
  generating.value = true
  try {
    const res = await generateImage({ prompt: prompt.value })
    if (res.data.code === 0 && res.data.data?.url) {
      emit('generated', res.data.data.url)
      ElMessage.success('AI 图片已生成')
      visible.value = false
      prompt.value = ''
    } else {
      ElMessage.error(res.data.message || '生成失败')
    }
  } catch {
    ElMessage.error('生成失败')
  } finally {
    generating.value = false
  }
}
</script>

<style scoped>
.ai-btn {
  color: var(--accent-gold) !important;
  border-color: var(--accent-gold) !important;
  background: transparent !important;
  padding: 5px 10px;
}
.ai-btn:hover {
  background: rgba(212, 175, 55, 0.08) !important;
}

.ai-pop-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-700);
  margin-bottom: 8px;
}

.ai-pop-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}
</style>
