<template>
  <span class="image-picker-wrap">
    <el-button size="small" @click.stop="open">
      <AppIcon name="folder" :size="12" />
      <span>素材库</span>
    </el-button>

    <el-dialog v-model="visible" title="素材库" width="720px" :close-on-click-modal="false">
      <div class="picker-toolbar">
        <el-select v-model="filterCategory" placeholder="全部分类" clearable size="small" style="width:140px" @change="load">
          <el-option v-for="cat in categories" :key="cat.value" :label="cat.label" :value="cat.value" />
        </el-select>
      </div>

      <div class="picker-grid" v-loading="loading">
        <div
          v-for="img in list"
          :key="img.imageId"
          class="picker-item"
          :class="{ selected: selectedId === img.imageId }"
          @click="selectedId = img.imageId; selectedUrl = img.url"
        >
          <img :src="img.url" :alt="img.fileName" />
          <span class="picker-item-name">{{ img.fileName }}</span>
        </div>
        <div v-if="!loading && list.length === 0" class="picker-empty">
          暂无素材，请先在「系统设置 → 素材库」中上传
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
import { getImageResources } from '@/api/settings'
import type { ImageResource } from '@/types'

const emit = defineEmits<{
  (e: 'select', url: string): void
}>()

const categories = [
  { label: '乡村', value: 'village' },
  { label: '景点', value: 'spot' },
  { label: '剧本', value: 'script' },
  { label: '场景', value: 'scene' },
  { label: 'NPC', value: 'npc' },
  { label: 'AI生成', value: 'ai_generated' },
  { label: '其他', value: 'other' },
]

const visible = ref(false)
const loading = ref(false)
const list = ref<ImageResource[]>([])
const page = ref(1)
const pageSize = 20
const total = ref(0)
const filterCategory = ref<string | undefined>(undefined)
const selectedId = ref('')
const selectedUrl = ref('')

async function load() {
  loading.value = true
  try {
    const res = await getImageResources({ page: page.value, pageSize, category: filterCategory.value })
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
.image-picker-wrap {
  display: inline-flex;
  align-items: center;
}

.picker-toolbar {
  margin-bottom: 12px;
}

.picker-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 120px;
  max-height: 360px;
  overflow-y: auto;
}

.picker-item {
  width: 120px;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
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

.picker-item img {
  width: 100%;
  height: 80px;
  object-fit: cover;
  display: block;
}

.picker-item-name {
  display: block;
  font-size: 11px;
  color: var(--ink-500);
  padding: 4px 6px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
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
