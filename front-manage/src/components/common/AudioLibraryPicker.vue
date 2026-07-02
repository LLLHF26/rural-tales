<template>
  <span class="audio-picker-wrap">
    <el-button size="small" @click.stop="open">
      <AppIcon name="folder" :size="12" />
      <span>背景音库</span>
    </el-button>

    <el-dialog v-model="visible" title="背景音库" width="640px" :close-on-click-modal="false">
      <div class="picker-toolbar">
        <el-select v-model="filterCategory" placeholder="全部分类" clearable size="small" style="width:140px" @change="load">
          <el-option v-for="cat in categories" :key="cat.value" :label="cat.label" :value="cat.value" />
        </el-select>
      </div>

      <div class="picker-list" v-loading="loading">
        <div
          v-for="audio in list"
          :key="audio.audioId"
          class="picker-item"
          :class="{ selected: selectedId === audio.audioId }"
          @click="selectedId = audio.audioId; selectedUrl = audio.url"
        >
          <div class="picker-item-icon">
            <span class="audio-icon-text">&#9835;</span>
          </div>
          <div class="picker-item-info">
            <div class="picker-item-name">{{ audio.fileName }}</div>
            <div class="picker-item-meta">{{ audio.category }} · {{ formatFileSize(audio.fileSize) }}</div>
          </div>
          <audio v-if="previewId === audio.audioId" :src="audio.url" controls autoplay class="picker-item-player" />
          <el-button
            v-else
            size="small"
            circle
            class="picker-item-play"
            @click.stop="previewId = audio.audioId"
          >
            <span style="font-size:10px">&#9654;</span>
          </el-button>
        </div>
        <div v-if="!loading && list.length === 0" class="picker-empty">
          暂无音频，请先在「系统设置 → 音频库」中上传
        </div>
      </div>

      <div class="picker-pagination" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="prev, next"
          small
          @current-change="load"
        />
      </div>

      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedUrl" @click="confirm">确定</el-button>
      </template>
    </el-dialog>
  </span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getAudioResources } from '@/api/settings'
import type { AudioResource } from '@/types'

const emit = defineEmits<{
  (e: 'select', url: string): void
}>()

const categories = [
  { label: '场景背景音', value: 'scene_bgm' },
  { label: '悬疑', value: 'mystery' },
  { label: '历史', value: 'history' },
  { label: '家庭', value: 'family' },
  { label: '情侣', value: 'couple' },
  { label: '团队', value: 'team' },
  { label: '其他', value: 'other' },
]

const visible = ref(false)
const loading = ref(false)
const list = ref<AudioResource[]>([])
const page = ref(1)
const pageSize = 20
const total = ref(0)
const filterCategory = ref<string | undefined>(undefined)
const selectedId = ref('')
const selectedUrl = ref('')
const previewId = ref('')

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function load() {
  loading.value = true
  try {
    const res = await getAudioResources({ page: page.value, pageSize, category: filterCategory.value })
    if (res.data.code === 0) {
      list.value = res.data.data.list
      total.value = res.data.data.total
    }
  } catch { /* silent */ }
  finally { loading.value = false }
}

function open() {
  selectedId.value = ''
  selectedUrl.value = ''
  previewId.value = ''
  page.value = 1
  filterCategory.value = undefined
  load()
  visible.value = true
}

function confirm() {
  if (selectedUrl.value) {
    emit('select', selectedUrl.value)
  }
  visible.value = false
}
</script>

<style scoped>
.audio-picker-wrap {
  display: inline-flex;
  align-items: center;
}

.picker-toolbar {
  margin-bottom: 12px;
}

.picker-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 100px;
  max-height: 360px;
  overflow-y: auto;
}

.picker-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 8px 10px;
  transition: all 0.15s;
  background: var(--tea-50);
}

.picker-item:hover {
  border-color: var(--bamboo-400);
}

.picker-item.selected {
  border-color: var(--bamboo-500);
  box-shadow: 0 0 0 2px rgba(126, 184, 160, 0.3);
}

.picker-item-icon {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  background: var(--bamboo-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bamboo-600);
  flex-shrink: 0;
}

.audio-icon-text {
  font-size: 22px;
  line-height: 1;
}

.picker-item-info {
  flex: 1;
  min-width: 0;
}

.picker-item-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.picker-item-meta {
  font-size: 11px;
  color: var(--ink-500);
  margin-top: 2px;
}

.picker-item-player {
  width: 180px;
  height: 32px;
  flex-shrink: 0;
}

.picker-item-play {
  flex-shrink: 0;
}

.picker-empty {
  width: 100%;
  text-align: center;
  padding: 40px 0;
  color: var(--ink-400);
  font-size: 13px;
}

.picker-pagination {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}
</style>
